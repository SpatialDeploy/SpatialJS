/* player.js
 *
 * implementation of the voxel video player
 */

import {vec3, mat4} from './math.js';	

//-------------------------//

const WORKGROUP_SIZE_X = 8;
const WORKGROUP_SIZE_Y = 8;

const BRICK_SIZE = 8;

const BYTES_PER_ROW_ALIGNMENT = 256;

//-------------------------//

export async function init_raytracer(canvas, width, height)
{
	//initialize webgpu:
	//-----------------
	var inst;
	try
	{
		inst = await init_webgpu(canvas);
	}
	catch(e)
	{
		throw Error(`failed to initialize WebGPU with error \"${e.message}\"`);
	}

	//initialize pipelines + resources:
	//-----------------
	var quadPipeline, raytracePipeline;
	var raytraceUniformBuf, finalTexture;

	try
	{
		quadPipeline = await create_quad_pipeline(inst);
		raytracePipeline = await create_raytrace_pipeline(inst);
	
		raytraceUniformBuf = create_raytrace_uniform_buf(inst);
		finalTexture = create_final_texture(inst, width, height);	
	}
	catch(e)
	{
		throw Error(`failed to create one or more WebGPU resources needed for raytracing with error \"${e.message}\"`);
	}

	//return state object:
	//-----------------
	return {
		inst: inst,

		width: width,
		height: height,

		raytracePipeline: raytracePipeline,
		quadPipeline: quadPipeline,
		raytraceUniformBuf: raytraceUniformBuf,
		finalTexture: finalTexture,
	};
}

export async function render_raytracer(state, videoFrameBufs, view, proj, timestamp)
{
	//create bind groups with new video bufs:
	//-----------------

	//TODO: look into perf of recreating bind groups (prob fine)

	const bindGroups = create_bind_groups(
		state.inst, 
		state.raytracePipeline.pipeline, 
		state.quadPipeline.pipeline, 
		state.finalTexture, 
		state.raytraceUniformBuf, 
		videoFrameBufs
	);

	//create command encoder:
	//-----------------
	const encoder = state.inst.device.createCommandEncoder({ label: 'render command encoder' });

	//update uniform buf:
	//-----------------
	const uniformBufData = new ArrayBuffer(state.raytraceUniformBuf.size);
	const uniformBufFloatData = new Float32Array(uniformBufData);
	const uniformBufUintData = new Uint32Array(uniformBufData);

	const invView = mat4.inverse(view);
	const invProj = mat4.inverse(proj);

	uniformBufFloatData.set(invView, 0);
	uniformBufFloatData.set(invProj, invView.length);

	let mapWidth = videoFrameBufs.volumeSize.width / BRICK_SIZE
	let mapHeight = videoFrameBufs.volumeSize.height / BRICK_SIZE
	let mapDepth = videoFrameBufs.volumeSize.depth / BRICK_SIZE
	uniformBufUintData.set(
		[mapWidth, mapHeight, mapDepth],
		invView.length + invProj.length
	);

	state.inst.device.queue.writeBuffer(state.raytraceUniformBuf, 0, uniformBufData); //TODO: try to map manually and copy from a staging buffer (couldn't get it to work before)

	//run raytrace compute shader:
	//-----------------
	let dispatchWidth  = (state.width  + (WORKGROUP_SIZE_X - 1)) & ~(WORKGROUP_SIZE_X - 1);
	let dispatchHeight = (state.height + (WORKGROUP_SIZE_Y - 1)) & ~(WORKGROUP_SIZE_Y - 1);
	dispatchWidth  /= WORKGROUP_SIZE_X;
	dispatchHeight /= WORKGROUP_SIZE_Y;

	const computePass = encoder.beginComputePass();
	computePass.setPipeline(state.raytracePipeline.pipeline);
	computePass.setBindGroup(0, bindGroups.raytraceGroup);
	computePass.dispatchWorkgroups(dispatchWidth, dispatchHeight);
	computePass.end();

	//present to screen:
	//-----------------
	state.quadPipeline.renderPass.colorAttachments[0].view = state.inst.context.getCurrentTexture().createView();

	const renderPass = encoder.beginRenderPass(state.quadPipeline.renderPass);
	renderPass.setPipeline(state.quadPipeline.pipeline);
	renderPass.setBindGroup(0, bindGroups.quadGroup);
	renderPass.setVertexBuffer(0, state.quadPipeline.vertexBuf);
	renderPass.setIndexBuffer(state.quadPipeline.indexBuf, 'uint32')
	renderPass.drawIndexed(6);
	renderPass.end();

	//submit commands to queue:
	//-----------------
	const commandBuffer = encoder.finish();
	state.inst.device.queue.submit([ commandBuffer ]);
}

export function resize_raytracer(state, width, height)
{
	state.finalTexture = create_final_texture(state.inst, width, height);

	state.width = width;
	state.height = height;
}

//-------------------------//

//initializes the webgpu context and device
async function init_webgpu(canvas)
{
	//ensure WebGPU is supported:
	//-----------------
	if(!navigator.gpu)
		throw Error("browser does not support WebGPU");

	//get GPUAdapter and GPUDevice:
	//-----------------
	const adapter = await navigator.gpu.requestAdapter();
	if(!adapter)
		throw Error("no GPU adapter found");

	const device = await adapter.requestDevice();
	if(!device)
		throw Error("no device found");

	device.lost.then((info) => {
		if(info.reason === 'destroyed') //we don't need to log an error if we destroyed the device ourselves
			return;

		throw Error(`WebGPU device was lost with info: ${info.message}`);
	});

	//configure context:
	//-----------------
	const context = canvas.getContext('webgpu');
	if(!context)
		throw Error("failed to get WebGPU context from canvas");

	const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
	context.configure({
		device: device,
		format: presentationFormat
	});

	//wrap everything into object and return:
	//-----------------
	return {
		adapter: adapter,
		device: device,
		canvas: canvas,
		context: context,
		presentationFormat: presentationFormat
	};
}

async function create_raytrace_pipeline(inst)
{
	//create shader module:
	//-----------------
	const shaderSrc = await fetch_shader_src("raytrace.wgsl")

	const module = inst.device.createShaderModule({
        label: 'raytrace shader',
        code: shaderSrc,
    });

	//create compute pipeline:
	//-----------------
	const pipeline = inst.device.createComputePipeline({
		label: 'raytrace pipeline',
		layout: 'auto',
		compute: {
			module
		}
	});

	//return:
	//-----------------
	return {
		pipeline: pipeline
	};
}

//creates all pipelines and resources for the quad renderer
async function create_quad_pipeline(inst)
{
	//create shader module:
	//-----------------
	const shaderSrc = await fetch_shader_src("quad.wgsl")

	const module = inst.device.createShaderModule({
        label: 'quad shader',
        code: shaderSrc,
    });

	//create render pipeline:
	//-----------------
	const pipeline = inst.device.createRenderPipeline({
        label: 'quad render pipeline',
        layout: 'auto', //automatically generate binding group
        vertex: {
			entryPoint: 'vs',
			module: module,
			buffers: [
				{
					arrayStride: (2 + 2) * 4, //2 component pos, 2 component uv, each 4 byte floats
					attributes: [
						{ shaderLocation: 0, offset: 0, format: 'float32x2' },
						{ shaderLocation: 1, offset: 2 * 4, format: 'float32x2' }
					]
				}
			]
        },
        fragment: {
			entryPoint: 'fs',
			module: module,
			targets: [{ format: inst.presentationFormat }],
        },
    });

	//create render pass:
	//-----------------
	const renderPassDescriptor = {
        label: 'quad render pass',
        colorAttachments: [
			{
				clearValue: [0.3, 0.3, 0.3, 1],
				loadOp: 'clear',
				storeOp: 'store',
			},
        ],
	};

	//create vertex + buffers:
	//-----------------
	const vertexData = new Float32Array([
		-1.0, -1.0, 0.0, 0.0,
		-1.0,  1.0, 0.0, 1.0,
		 1.0, -1.0, 1.0, 0.0,
		 1.0,  1.0, 1.0, 1.0
	]);

	const vertexBuf = inst.device.createBuffer({
		label: 'quad vertex buf',
		size: vertexData.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
	});
	inst.device.queue.writeBuffer(vertexBuf, 0, vertexData);

	const indexData = new Uint32Array([
		0, 1, 2,
		1, 2, 3
	]);

	const indexBuf = inst.device.createBuffer({
		label: 'quad index buf',
		size: indexData.byteLength,
		usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
	});
	inst.device.queue.writeBuffer(indexBuf, 0, indexData);

	//return:
	//-----------------
	return {
		pipeline: pipeline,
		renderPass: renderPassDescriptor,
		vertexBuf: vertexBuf,
		indexBuf: indexBuf
	};
}

function create_raytrace_uniform_buf(inst)
{
	let size = 2 * (4 * 4 * Float32Array.BYTES_PER_ELEMENT); //2 4x4 matrices of floats
	size += 4 * Uint32Array.BYTES_PER_ELEMENT; //3-component size vector (+ padding)

	const buf = inst.device.createBuffer({
		size: size,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
	});

	return buf
}

//creates the texture where the final image is written
function create_final_texture(inst, width, height)
{
	const tex = inst.device.createTexture({
		label: 'final texture',
		format: 'rgba8unorm',
		size: [width, height],
		usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING
	});

	const sampler = inst.device.createSampler();

	let bytesPerRow = width * 4; //rgba8unorm format, 4 bytes per pixel
	bytesPerRow = (bytesPerRow + (BYTES_PER_ROW_ALIGNMENT - 1)) & ~(BYTES_PER_ROW_ALIGNMENT - 1);

	const buf = inst.device.createBuffer({
		label: 'final texture buffer',
		size: height * bytesPerRow,
		usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
	})

	return {
		tex: tex,
		sampler: sampler,
		buf: buf,
		bufBytesPerRow: bytesPerRow
	};
}

//creates the bind groups for both shaders
function create_bind_groups(inst, raytracePipeline, quadPipeline, finalTexture, raytraceUniformBuf, videoFrameBufs)
{
	const textureView = finalTexture.tex.createView();

	const raytraceBindGroup = inst.device.createBindGroup({
		label: 'raytrace shader bind group',
		layout: raytracePipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: textureView },
			{ binding: 1, resource: { buffer: raytraceUniformBuf } },
			{ binding: 2, resource: { buffer: videoFrameBufs.mapBuf } },
			{ binding: 3, resource: { buffer: videoFrameBufs.brickBuf } }
		]
	});

	const quadBindGroup = inst.device.createBindGroup({
		label: 'quad shader bind group',
		layout: quadPipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: textureView },
			{ binding: 1, resource: finalTexture.sampler }
		]
	});

	return {
		quadGroup: quadBindGroup,
		raytraceGroup: raytraceBindGroup
	};
}

//-------------------------//

//loads shader source code from a given url
async function fetch_shader_src(url)
{
	const response = await fetch("shaders/" + url);
	if(!response.ok)
		throw Error(`failed to load shader from ${url} with status ${response.statusText}`);

	return response.text();
}