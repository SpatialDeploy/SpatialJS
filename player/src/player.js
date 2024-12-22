/* player.js
 *
 * implementation of the voxel video player
 */

import { 
	init_raytracer, 
	render_raytracer, 
	resize_raytracer,
} from "./raytracer.js";

import {vec3, mat4} from './math.js';
import SPLDecoder from './spl_decoder.js'

//-------------------------//

const RESOLUTION_SCALE = 2; //multiplier on the canvas resolution to fix low-res problem

//-------------------------//

async function main(root, videoPath)
{
	//load splv decoder module:
	//-----------------
	const DecoderModule = await SPLDecoder()

	//add canvases to DOM:
	//-----------------	
	let canvas = document.createElement('canvas');
	canvas.id = 'canvas_webgpu';
	canvas.style = 'display: block; width: 100%; height: 100%;'; //this is what we render to, make fullscreen

	const videoContainer = root.querySelector("#video_container");
	if(videoContainer == null)
	{
		console.warn('video container element was not found!')
		root.appendChild(canvas);
	}
	else
		videoContainer.appendChild(canvas);

	//get video controls elements:
	//-----------------
	const playButton = root.querySelector("#play_button");
	const videoScrubber = root.querySelector("#video_scrubber");

	//populate state object:
	//-----------------
	var videoDecoder; //NOTE: need to call videoDecoder.delete() to avoid memory leak!!!!!
	try
	{
		let video = await fetch_video_file(videoPath);
		videoDecoder = new DecoderModule.SPLVDecoder(new Uint8Array(video));
	}
	catch(e)
	{
		throw Error(`failed to instantiate video decoder with error \"${e.message}\"`);
	}

	let camera = camera_init();

	let state = {
		videoDecoder: videoDecoder,
		videoScrubber: videoScrubber,
		lastTime: 0,
		videoTime: 0,
		lastFrame: -1,
		playing: true,
		scrubbing: false,
		camera: camera
	};

	//initialize raytracer:
	//-----------------
	const raytraceState = await init_raytracer(canvas, canvas.width, canvas.height);

	//begin rendering:
	//-----------------
	requestAnimationFrame((timestamp) => {
		render(state, raytraceState, timestamp);
	});

	//set up canvas resize observer:
	//-----------------
    const observer = new ResizeObserver(entries => {		
		for (const entry of entries) 
		{
			let maxTexDim = raytraceState.inst.device.limits.maxTextureDimension2D;

			const width = entry.contentBoxSize[0].inlineSize * RESOLUTION_SCALE;
			const height = entry.contentBoxSize[0].blockSize * RESOLUTION_SCALE;

			const canvas = entry.target;
			canvas.width = Math.max(1, Math.min(width, maxTexDim));
			canvas.height = Math.max(1, Math.min(height, maxTexDim));

			resize_raytracer(raytraceState, canvas.width, canvas.height);
		}
	});
	observer.observe(canvas);

	//set up observers for camera controls:
	//-----------------    
    canvas.addEventListener('mousedown', (event) => {
		camera_mouse_down(state.camera, event);
    });
    
    window.addEventListener('mousemove', (event) => {		
		camera_mouse_moved(state.camera, event);
    });
    
    window.addEventListener('mouseup', (event) => {		
		camera_mouse_up(state.camera, event);
    });

	canvas.addEventListener('wheel', (event) => {		
		camera_scrolled(state.camera, event.deltaY);
		event.preventDefault();
	});

	//set up observers for video controls:
	//-----------------
	if(playButton == null)
		console.warn("play button element was not found!")
	else
	{
		playButton.addEventListener('click', function() {
			play_button_clicked(state, playButton);
		});
	}

	if(videoScrubber == null)
		console.warn("video scrubber element was not found!")
	else
	{
		videoScrubber.addEventListener('input', function() {
			video_scrubber_moved(state, videoScrubber);
		});

		videoScrubber.addEventListener('mousedown', function() {
			state.scrubbing = true;
		});

		videoScrubber.addEventListener('mouseup', function() {
			state.scrubbing = false;
		});
	}
}

//-------------------------//

async function render(state, raytraceState, timestamp) 
{
	//update timing:
	//-----------------
	if(state.lastTime == 0)
		state.lastTime = timestamp;

	let metadata = state.videoDecoder.get_metadata()

	let dt = timestamp - state.lastTime;
	state.lastTime = timestamp;
	if(state.playing && !state.scrubbing)
		state.videoTime += dt;

	//update video scrubber position:
	//-----------------
	if(!state.scrubbing && state.videoScrubber != null)
	{
		var progress = ((state.videoTime / 1000) / metadata.duration) % 1.0;
		progress *= 100.0

		state.videoScrubber.value = progress;
		state.videoScrubber.style.setProperty('--progress-width', `${progress}%`)
	}

	//get current frame:
	//-----------------
	let frame = Math.floor((state.videoTime / 1000) * metadata.framerate);
	frame = frame % metadata.framecount;

	if(state.lastFrame != frame)
	{
		if(state.nextFrame == undefined || state.nextFrame.num != frame)
			state.videoFrameBufs = get_video_frame_bufs(raytraceState.inst, state.videoDecoder, frame);
		else
			state.videoFrameBufs = await state.nextFrame.promise;

		const nextFrameNum = (frame + 1) % metadata.framecount;

		//TODO: get bufs for multiple frames at once
		//TODO: get bufs in separate worker thread, not just async

		state.lastFrame = frame;
		state.nextFrame = {
			num: nextFrameNum,
			promise: new Promise(function(resolve, reject) {
				resolve(get_video_frame_bufs(raytraceState.inst, state.videoDecoder, nextFrameNum));
			})
		};
	}

	//render:
	//-----------------
	const aspectRatio = raytraceState.width / raytraceState.height;
	const view = camera_get_view(state.camera);
	const proj = mat4.perspective(1.4, aspectRatio, 0.1, 100.0);

	render_raytracer(raytraceState, state.videoFrameBufs, view, proj, timestamp);

	requestAnimationFrame((timestamp) => {
		render(state, raytraceState, timestamp)
	});
}

//-------------------------//

//gets the frame of a video as buffers to render
function get_video_frame_bufs(inst, videoDecoder, frame)
{
	//extract size from metadata:
	//-----------------
	let metadata = videoDecoder.get_metadata()
	let size = {
		width: metadata.width,
		height: metadata.height, //need to swap dimensions around, format array is flattened differently
		depth: metadata.depth
	};

	//get frames from decoder:
	//-----------------
	let mapBuf = videoDecoder.get_map_buffer(frame)
	let brickBuf = videoDecoder.get_brick_buffer(frame)
	//console.log(brickBuf)

	//upload buffers to WebGPU buffers:
	//-----------------
	let mapBufGPU = inst.device.createBuffer({
		label: 'voxel map buf',
		size: mapBuf.length * Uint32Array.BYTES_PER_ELEMENT,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});
	inst.device.queue.writeBuffer(mapBufGPU, 0, mapBuf);

	let brickBufGPU = inst.device.createBuffer({
		label: 'voxel brick buf',
		size: brickBuf.length * Uint32Array.BYTES_PER_ELEMENT,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});
	inst.device.queue.writeBuffer(brickBufGPU, 0, brickBuf);

	//return:
	//-----------------
	return {
		volumeSize: size,
		mapBuf : mapBufGPU,
		brickBuf : brickBufGPU
	};
}

//-------------------------//

function play_button_clicked(state, playButton)
{
	if (state.playing) 
	{
		playButton.textContent = '▶️';
		state.playing = false;
	} 
	else 
	{
		playButton.textContent = '⏸️';
		state.playing = true;
	}
}

function video_scrubber_moved(state, videoScrubber)
{
	const progress = videoScrubber.value / 100.0;

	let metadata = state.videoDecoder.get_metadata()
	state.videoTime = metadata.duration * progress * 1000.0; //milliseconds

	videoScrubber.style.setProperty('--progress-width', `${videoScrubber.value}%`)
}

//-------------------------//

function camera_init()
{
	const radiusMin = 1.5;
	const radiusMax = 5.0;
	const sens = 0.015;
	const scrollSens = 0.001;

	const initialRadius = (radiusMin + radiusMax) / 2.0;
    const intialTheta = Math.PI / 4;
    const initialPhi = Math.PI / 4;

	const startX = 0;
	const startY = 0;
	const dragging = false;

	return {
		radiusMin: radiusMin,
		radiusMax: radiusMax,
		sens: sens,
		scrollSens: scrollSens,
		
		radius: initialRadius,
		theta: intialTheta,
		phi: initialPhi,

		startX: startX,
		startY: startY,
		dragging: dragging
	};
}

function camera_get_view(cam)
{
	const x = cam.radius * Math.sin(cam.theta) * Math.cos(cam.phi);
	const y = cam.radius * Math.sin(cam.phi);
	const z = cam.radius * Math.cos(cam.theta) * Math.cos(cam.phi);
  
	return mat4.lookat(vec3.create(x, y, z), vec3.create(0.0, 0.0, 0.0), vec3.create(0.0, 1.0, 0.0));
}

function camera_mouse_down(camera, event)
{
	camera.startX = event.clientX;
	camera.startY = event.clientY;
	camera.dragging = true;
}

function camera_mouse_up(camera, event)
{
	camera.dragging = false;
}

function camera_mouse_moved(camera, event)
{
	if(!camera.dragging)
		return;

	const deltaX = event.clientX - camera.startX;
	const deltaY = event.clientY - camera.startY;

	camera.theta -= deltaX * camera.sens;
	camera.phi += deltaY * camera.sens;

	camera.phi = Math.max(camera.phi, -Math.PI / 2);
	camera.phi = Math.min(camera.phi, Math.PI / 2);
	
	camera.startX = event.clientX;
	camera.startY = event.clientY;
}

function camera_scrolled(camera, deltaY)
{
	camera.radius += deltaY * camera.scrollSens;
	
	camera.radius = Math.max(camera.radius, camera.radiusMin);
	camera.radius = Math.min(camera.radius, camera.radiusMax);
}

//-------------------------//

//loads a voxel video file from a given url
async function fetch_video_file(url)
{
	const response = await fetch(url);
	if(!response.ok)
		throw Error(`failed to load json from ${url} with status ${response.statusText}`);

	return await response.arrayBuffer()
}

//-------------------------//

class SPLVPlayer extends HTMLElement 
{
    constructor() 
	{
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() 
	{
        this.render();
    }

    render() 
	{
        this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: inline-block;
					width: 100%;
					height: 100%;
            	}

				#canvas_webgpu {
					position: absolute;
					bottom: 0;
					top: 0;
					left: 0;
					right: 0;
				}

				#video_container {
					position: relative;
					width: 100%;
					height: 100%;
				}
				
				#video_controls {
					position: absolute;
					bottom: 0;
					left: 0;
					right: 0;
					display: flex;
					justify-content: center;
					align-items: center;
					gap: 20px;
					padding: 20px 0;
					background-blend-mode: darken;
					z-index: 10;
					background: 
						linear-gradient(
							rgba(0,0,0,0), 
							rgba(0,0,0,0.2)
						);
				}
				
				#play_button {
					font-size: 32px;
					cursor: pointer;
					user-select: none;
				}
				
				#video_scrubber {
					width: 70%;
					height: 15px;
					background: linear-gradient(to right, 
						#3498db 0%, 
						#3498db var(--progress-width, 0%), 
						#ccc var(--progress-width, 0%), 
						#ccc 100%
					);
					cursor: pointer;
					appearance: none;
					outline: none;
					opacity: 0.7;
					transition: opacity 0.2s;
				}
				
				#video_scrubber:hover {
					opacity: 1;
				}
				
				#video_scrubber::-webkit-slider-thumb {
					appearance: none;
					width: 17px;
					height: 17px;
					background: #ffffff;
					cursor: pointer;
					border-radius: 50%;
				}
			</style>

			<div id="video_container">
				<div id="video_controls">
					<div id="play_button">⏸️</div>
					<input type="range" id="video_scrubber" min="0" max="100" value="0">
				</div>
			</div>
        `;

		const src = this.getAttribute('src')
		if(src == null)
		{
			alert('FATAL ERROR: no source video specified');
			return;
		}

		main(this.shadowRoot, src)
			.catch((error) => alert(`FATAL ERROR: ${error.message}`));
    }
}

customElements.define('splv-player', SPLVPlayer);

export default SPLVPlayer;