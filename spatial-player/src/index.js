/* player.js
 *
 * implementation of the voxel video player
 */

import { 
	init_raytracer, 
	render_raytracer, 
	resize_raytracer,
	BRICK_SIZE
} from "./raytracer.js";

import {vec3, mat4} from './math.js';
import SPLDecoder from './spl_decoder.js'

//-------------------------//

const RESOLUTION_SCALE = 2; //multiplier on the canvas resolution to fix low-res problem

//-------------------------//

async function main(root, attributes)
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
	const cameraState = camera_init();
	const raytraceState = await init_raytracer(canvas, canvas.width, canvas.height);
	
	let state = {
		spatialModule: DecoderModule,
		spatialState: null,

		raytraceState: raytraceState,
		cameraState: cameraState,
		renderParams: {
			showBoundingBox: attributes.showBoundingBox,
			topColor: attributes.topColor,
			botColor: attributes.botColor
		},
		videoFrameBufs: get_video_frame_bufs(raytraceState.inst, null, null),
		
		videoScrubber: videoScrubber,
		playing: true,
		scrubbing: false,
		lastTime: 0
	};

	//load initial spatial:
	//-----------------
	if(attributes.video != null)
		set_spatial(state, attributes.video);

	//begin rendering:
	//-----------------
	requestAnimationFrame((timestamp) => {
		render(state, timestamp);
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
		camera_mouse_down(state.cameraState, event);
	});
	
	window.addEventListener('mousemove', (event) => {		
		camera_mouse_moved(state.cameraState, event);
	});
	
	window.addEventListener('mouseup', (event) => {		
		camera_mouse_up(state.cameraState, event);
	});

	canvas.addEventListener('wheel', (event) => {		
		camera_scrolled(state.cameraState, event.deltaY);
		event.preventDefault();
	});

	canvas.addEventListener('touchstart', (event) => {
		camera_touch_start(state.cameraState, event);
	});
	
	window.addEventListener('touchmove', (event) => {
		camera_touch_moved(state.cameraState, event);
		event.preventDefault();
	}, { passive: false });
	
	window.addEventListener('touchend', (event) => {
		camera_touch_end(state.cameraState, event);
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

	//return video metadata to expose to api:
	//-----------------
	return state;
}

//-------------------------//

function get_spatial_metadata(state)
{
	return state.spatialState?.decoder.get_metadata();
}

function set_bounding_box(state, value)
{
	value = value || 'show';
	switch(value)
	{
	case 'show':
		state.renderParams.showBoundingBox = true;
		break;
	case 'hide':
		state.renderParams.showBoundingBox = false;
		break;
	default:
		console.warn('invalid bounding-box value. Valid options are: "show" or "hide"');
		break;
	}
}

function set_color(state, top, value)
{
	const colorStr = value || '0 0 0 0';
	const color = colorStr.split(' ').map(Number).map((x) => x / 255.0);

	if(top)
		state.renderParams.topColor = color;
	else
		state.renderParams.botColor = color;
}

function set_spatial(state, video)
{
	//free old resources:
	//-----------------
	if(state.spatialState != null)
	{
		const spatialState = state.spatialState;
		state.spatialState = null;

		spatialState.decoder.delete();
		state.spatialModule._free(spatialState.spatialPtr);
	}

	//set gpu buffers to empty:
	//-----------------
	state.videoFrameBufs = get_video_frame_bufs(state.raytraceState.inst, null, null);

	//allocate memory + create decoder:
	//-----------------
	var decoder = null;
	var spatialPtr = null;
	try
	{
		let videoLen = video.byteLength;

		spatialPtr = state.spatialModule._malloc(videoLen);
		let videoHeap = new Uint8Array(state.spatialModule.HEAPU8.buffer, spatialPtr, videoLen);
		videoHeap.set(new Uint8Array(video));

		decoder = new state.spatialModule.SPLVDecoder(spatialPtr, videoLen);
	}
	catch(e)
	{
		throw Error(`failed to instantiate video decoder with error \"${e.message}\"`);
	}

	//start decoding next frame:
	//-----------------
	decoder.start_decoding_frame(0);

	//set new spatial state + reset video time:
	//-----------------
	const spatialState = {
		decoder: decoder,
		spatialPtr: spatialPtr,
		decodingFrame: 0,
		curFrame: -1
	};

	state.spatialState = spatialState;
	state.videoTime = 0;
}

//-------------------------//

async function render(state, timestamp) 
{
	//update timing:
	//-----------------
	if(state.lastTime == 0)
		state.lastTime = timestamp;

	let metadata = state.spatialState?.decoder.get_metadata() || {
		framerate: 1,
		framecount: 1,
		duration: 1
	};

	let dt = timestamp - state.lastTime;
	state.lastTime = timestamp;
	if(state.playing && !state.scrubbing && state.spatialState != null)
		state.videoTime += dt;

	//update video scrubber position:
	//-----------------
	if(!state.scrubbing && state.videoScrubber != null)
	{
		var progress = ((state.videoTime / 1000) / metadata.duration) % 1.0;
		progress *= 100.0;

		state.videoScrubber.value = progress;
		state.videoScrubber.style.setProperty('--progress-width', `${progress}%`)
	}

	//get new frame buffer, if it exists:
	//-----------------
	if(state.spatialState != null)
	{
		const frame = state.spatialState.decoder.try_get_decoded_frame();
		if(frame.decoded)
		{
			state.videoFrameBufs = get_video_frame_bufs(state.raytraceState.inst, state.spatialState.decoder, frame);

			state.spatialState.curFrame = state.spatialState.decodingFrame;
			state.spatialState.decodingFrame = null;
		}
	}

	//start decoding next frame if needed:
	//-----------------
	let nextFrame = Math.floor((state.videoTime / 1000) * metadata.framerate);
	nextFrame = nextFrame % metadata.framecount;

	if(state.curFrame != nextFrame && state.spatialState != null && state.spatialState.decodingFrame == null)
	{
		//print any dropped frames (for testing)
		/*var droppedFrames = [];
		for(var i = (state.curFrame + 1) % metadata.framecount; i != nextFrame; i = (i + 1) % metadata.framecount)
			droppedFrames.push(i);
		
		if(droppedFrames.length == 1)
			console.warn("Dropped frame " + droppedFrames);
		else if(droppedFrames.length > 1)
			console.warn("Dropped frames " + droppedFrames);*/

		//start decoding next frame (runs in background thread)
		state.spatialState.decoder.start_decoding_frame(nextFrame);
		state.spatialState.decodingFrame = nextFrame;
	}

	//render:
	//-----------------
	const aspectRatio = state.raytraceState.width / state.raytraceState.height;
	const view = camera_get_view(state.cameraState);
	const proj = mat4.perspective(1.4, aspectRatio, 0.1, 100.0);

	render_raytracer(
		state.raytraceState, 
		state.videoFrameBufs, 
		view, proj, 
		state.renderParams, 
		timestamp
	);

	//request animation frame:
	//-----------------
	requestAnimationFrame((timestamp) => {
		render(state, timestamp)
	});
}

//-------------------------//

//gets the frame of a video as buffers to render
function get_video_frame_bufs(inst, videoDecoder, frame)
{
	//ensure not empty:
	//-----------------
	var empty;
	var mapBuf;
	var brickBuf;
	if(frame == null || frame.mapBuffer.length == 0 || frame.brickBuffer.length == 0)
	{
		empty = true;
		mapBuf = new Uint32Array([0]); //dummy buffers so webgpu doesnt yell at us
		brickBuf = new Uint32Array([0]);
	}
	else
	{
		empty = false;
		mapBuf = frame.mapBuffer;
		brickBuf = frame.brickBuffer;
	}

	//extract size from metadata:
	//-----------------
	let metadata = videoDecoder?.get_metadata() || {
		width: BRICK_SIZE,
		height: BRICK_SIZE,
		depth: BRICK_SIZE
	};
	let size = {
		width: metadata.width,
		height: metadata.height, //need to swap dimensions around, format array is flattened differently
		depth: metadata.depth
	};

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

	//cleanup + return:
	//-----------------
	if(frame != null && videoDecoder != null)
		videoDecoder.free_frame(frame);

	return {
		volumeSize: size,
		empty: empty,
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

	let metadata = state.spatialState?.decoder.get_metadata() || {
		duration: 1
	};
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

function camera_touch_start(camera, event) 
{
	if(event.touches.length === 1) 
	{
		camera.startX = event.touches[0].clientX;
		camera.startY = event.touches[0].clientY;
		camera.dragging = true;
	} 
	else if(event.touches.length === 2) 
	{
		camera.dragging = false;
		const touch1 = event.touches[0];
		const touch2 = event.touches[1];
		camera.pinchStartDistance = Math.hypot(
			touch2.clientX - touch1.clientX,
			touch2.clientY - touch1.clientY
		);
	}
}

function camera_touch_moved(camera, event) 
{
	if(event.touches.length === 1 && camera.dragging) 
	{
		// Handle single touch drag
		const touch = event.touches[0];
		const deltaX = touch.clientX - camera.startX;
		const deltaY = touch.clientY - camera.startY;
		
		camera.theta -= deltaX * camera.sens;
		camera.phi += deltaY * camera.sens;
		camera.phi = Math.max(camera.phi, -Math.PI / 2);
		camera.phi = Math.min(camera.phi, Math.PI / 2);
		
		camera.startX = touch.clientX;
		camera.startY = touch.clientY;
	} 
	else if(event.touches.length === 2) 
	{
		const touch1 = event.touches[0];
		const touch2 = event.touches[1];
		const currentDistance = Math.hypot(
			touch2.clientX - touch1.clientX,
			touch2.clientY - touch1.clientY
		);
		
		const deltaDistance = camera.pinchStartDistance - currentDistance;
		camera_scrolled(camera, deltaDistance);
		
		camera.pinchStartDistance = currentDistance;
	}
}

function camera_touch_end(camera, event) 
{
	if(event.touches.length === 0) 
	{
		camera.dragging = false;
	} 
	else if(event.touches.length === 1) 
	{
		camera.startX = event.touches[0].clientX;
		camera.startY = event.touches[0].clientY;
	}
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
	get_metadata()
	{
		if(this.state == null)
			return null;

		return get_spatial_metadata(this.state);
	}

	set_spatial(spatial)
	{
		if(this.state == null)
			throw "component not yet initialized";
		
		set_spatial(this.state, spatial);
		this._dispatch_spatial_load_event();
	}

	//-------------------------//

	constructor() 
	{
		super();
		this.attachShadow({ mode: 'open' });
	}

	static get observedAttributes()
	{
		return ['video-controls', 'bounding-box', 'top-color', 'bot-color'];
	}

	connectedCallback() 
	{
		this.render();
	}

	attributeChangedCallback(name, oldValue, newValue)
	{
		if(oldValue == newValue)
			return;

		switch(name)
		{
		case 'bounding-box':
			if(this.state == null)
				return;

			set_bounding_box(this.state, newValue);
			break;
		case 'top-color':
		case 'bot-color':
			if(this.state == null)
				return;

			set_color(this.state, name == 'top-color', newValue);
			break;
		case 'video-controls':
			this._set_video_controls(newValue);
			break;
		default:
			console.error('not yet implemented: ' + name);
		}
	}

	//-------------------------//

	async render() 
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

		//get attributes:
		//-----------------
		const src = this.getAttribute('src');
		var video = null;
		if(src != null)
		{
			video = await fetch_video_file(src);
		}

		const boundingBox = this.getAttribute('bounding-box');
		var showBoundingBox = false;
		if(boundingBox != null)
		{
			if(boundingBox == "show")
				showBoundingBox = true;
			else if(boundingBox != "hide")
				alert('WARNING: invalid option for \"bounding-box\", must either be \"show\" or \"hide\"');
		}

		const topColorStr = this.getAttribute('top-color') || '0 0 0 0';
		const topColor = topColorStr.split(' ').map(Number).map((x) => x / 255.0);

		const botColorStr = this.getAttribute('bot-color') || '0 0 0 0';
		const botColor = botColorStr.split(' ').map(Number).map((x) => x / 255.0);

        const videoControls = this.getAttribute('video-controls') || 'show';
        this._set_video_controls(videoControls);

		//start player:
		//-----------------
		const attributes = {
			video: video,
			showBoundingBox: showBoundingBox,
			topColor: topColor,
			botColor: botColor
		};

		main(this.shadowRoot, attributes)
			.catch((error) => alert(`FATAL ERROR: ${error.message}`))
			.then((state) => {
				this.state = state;
				this._dispatch_spatial_load_event();
			});
	}

	//-------------------------//

	_set_video_controls(value)
	{
		if(!this.shadowRoot)
			return;

		value = value || 'show';
	
		//get video controls:
		//-----------------
		const container = this.shadowRoot.querySelector('#video_container');
		if(!container)
		{
			console.warn('video container element was not found!');
			return;
		}

		const controls = this.shadowRoot.querySelector('#video_controls');
		if(!controls)
		{
			console.warn('video controls element was not found!');
			return;
		}
	
		//remove any existing event listeners:
		//-----------------
		container.removeEventListener('mouseenter', this._show_video_controls);
		container.removeEventListener('mouseleave', this._hide_video_controls);
		
		//set new style + event listeners:
		//-----------------
		switch (value) 
		{
			case 'show':
				controls.style.display = 'flex';
				controls.style.opacity = '1';
				break;
			case 'hide':
				controls.style.display = 'none';
				break;
			case 'hover':
				controls.style.display = 'flex';
				controls.style.opacity = '0';
				controls.style.transition = 'opacity 0.3s ease';
				
                this._show_video_controls = () => controls.style.opacity = '1';
                this._hide_video_controls = () => controls.style.opacity = '0';

				const container = this.shadowRoot.querySelector('#video_container');
				container.addEventListener('mouseenter', this._show_video_controls);
				container.addEventListener('mouseleave', this._hide_video_controls);
				break;
			default:
				console.warn('invalid video-controls value. Valid options are: "show", "hide", "hover"');
				controls.style.display = 'flex';
				controls.style.opacity = '1';
				break;
		}
	}

	_dispatch_spatial_load_event()
	{
		this.dispatchEvent(new CustomEvent('spatial-loaded', {
			bubbles: true,
			composed: true,
			detail: {}
		}));
	}
}

customElements.define('splv-player', SPLVPlayer);

export default SPLVPlayer;