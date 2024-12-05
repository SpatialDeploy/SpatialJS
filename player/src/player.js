/* player.js
 *
 * implementation of the voxel video player
 */

import { 
	init_raytracer, 
	render_raytracer, 
	resize_raytracer,
	cleanup_render_raytracer, 
} from "./raytracer.js";

import {vec3, mat4} from './math.js';	

//-------------------------//

const RESOLUTION_SCALE = 2; //multiplier on the canvas resolution to fix low-res problem

//-------------------------//

async function main()
{
	//add canvases to DOM:
	//-----------------	
	let canvas = document.createElement('canvas');
	canvas.id = 'canvas-webgpu';
	canvas.style = 'display: block; width: 100%; height: 100%;'; //this is what we render to, make fullscreen

	document.body.appendChild(canvas);

	//populate state object:
	//-----------------
	var testVideo;
	try
	{
		testVideo = await fetch_video_file('videos/ufc.json');
	}
	catch(e)
	{
		throw Error(`failed to fetch video file with error \"${e.message}\"`);
	}

	let startTime = 0; 
	let lastFrame = -1;
	let camera = camera_init();

	let state = {
		testVideo: testVideo,
		startTime: startTime,
		lastFrame: lastFrame,
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
}

//-------------------------//

async function render(state, raytraceState, timestamp) 
{
	//update video frame if necessary:
	//-----------------
	if(state.startTime == 0)
		state.startTime = timestamp;

	let curTime = timestamp - state.startTime;
	let frame = Math.floor((curTime / 1000) * state.testVideo.Framerate);
	frame = frame % state.testVideo.Framecount;

	if(state.lastFrame != frame)
	{
		if(state.nextFrame == undefined || state.nextFrame.num != frame)
			state.videoFrameBufs = get_video_frame_bufs(raytraceState.inst, state.testVideo, frame);
		else
			state.videoFrameBufs = await state.nextFrame.promise;

		const nextFrameNum = (frame + 1) % state.testVideo.Framecount;

		//TODO: get bufs for multiple frames at once
		//TODO: get bufs in separate worker thread, not just async

		state.lastFrame = frame;
		state.nextFrame = {
			num: nextFrameNum,
			promise: new Promise(function(resolve, reject) {
				resolve(get_video_frame_bufs(raytraceState.inst, state.testVideo, nextFrameNum));
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
function get_video_frame_bufs(inst, video, frame)
{
	//TODO: currently just procedurally generating a frame

	//extract size + other metadata:
	//-----------------
	let size = {
		width: video.Dimensions.x,
		height: video.Dimensions.z, //need to swap dimensions around, format array is flattened differently
		depth: video.Dimensions.y
	};

	//allocate bitmap and voxel buffer:
	//-----------------
	let bitmapSize = size.width * size.height * size.depth;
	bitmapSize = (bitmapSize + 31) & ~31; //align up to multiple of 32
	bitmapSize /= 32; //32 bits per uint32
	let bitmap = new Uint32Array(bitmapSize);

	let voxelDataSize = size.width * size.height * size.depth;
	let voxelData = new Uint32Array(voxelDataSize); //1 uint32 per voxel (RGB color, 8 bits per component)

	//populate bitmap and voxel buffer:
	//-----------------
	for(let z = 0; z < size.depth ; z++)
	for(let y = 0; y < size.height; y++)
	for(let x = 0; x < size.width ; x++)
	{
		let idx = x + size.width * (y + size.height * z);
		let readIdx = x + size.width * (z + size.depth * y);

		let voxel = video.Blocks[frame][readIdx];
		if(voxel !== null)
		{
			bitmap[Math.floor(idx / 32)] |= (1 << (idx % 32));

			const r = parseInt(voxel.slice(1, 3), 16);
			const g = parseInt(voxel.slice(3, 5), 16);
			const b = parseInt(voxel.slice(5, 7), 16);
			const packedColor = (r << 24) | (g << 16) | (b << 8);

			voxelData[idx] = packedColor;
		}
		else
			bitmap[Math.floor(idx / 32)] &= ~(1 << (idx % 32));
	}

	//upload buffers to WebGPU buffers:
	//-----------------
	let bitmapBuf = inst.device.createBuffer({
		label: 'voxel bitmap buf',
		size: bitmap.length * Uint32Array.BYTES_PER_ELEMENT,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});
	inst.device.queue.writeBuffer(bitmapBuf, 0, bitmap);

	let voxelDataBuf = inst.device.createBuffer({
		label: 'voxel data buf',
		size: voxelData.length * Uint32Array.BYTES_PER_ELEMENT,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
	});
	inst.device.queue.writeBuffer(voxelDataBuf, 0, voxelData);

	//return:
	//-----------------
	return {
		volumeSize: size,
		bitmapBuf: bitmapBuf,
		voxelDataBuf: voxelDataBuf
	};
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

//creates a webgl shader
function create_shader(gl, type, source) 
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    return shader;
}

//loads shader source code from a given url
async function fetch_shader_src(url)
{
	const response = await fetch(url);
	if(!response.ok)
		throw Error(`failed to load shader from ${url} with status ${response.statusText}`);

	return response.text();
}

//loads a voxel video file from a given url
async function fetch_video_file(url)
{
	const response = await fetch(url);
	if(!response.ok)
		throw Error(`failed to load json from ${url} with status ${response.statusText}`);

	return response.json();
}

//-------------------------//

//entry point:
main()
	.catch((error) => alert(`FATAL ERROR: ${error.message}`));