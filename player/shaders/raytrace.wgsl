/* raytrace.wgsl
 *
 * shader for performing voxel raytracing and generating the final image
 */

const EPSILON = 0.0001;

//-------------------------//

struct RenderParams
{
	invView : mat4x4f,
	invProj : mat4x4f,
	
	volumeSize : vec3u
}

//-------------------------//

@group(0) @binding(0) var u_outImage : texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> u_renderParams : RenderParams;

@group(0) @binding(2) var<storage, read> u_voxelBitmap : array<u32>;
@group(0) @binding(3) var<storage, read> u_voxelData : array<u32>;

//-------------------------//

struct IntersectAABBOut
{
	distances : vec2f,
	mask : vec3u
};

fn intersect_aabb(boxMin : vec3f, boxMax : vec3f, rayPos : vec3f, invRayDir : vec3f) -> IntersectAABBOut
{
	let tMin = (boxMin - rayPos) * invRayDir;
	let tMax = (boxMax - rayPos) * invRayDir;

	let t1 = min(tMin, tMax);
	let t2 = max(tMin, tMax);

	var tNear : f32;
	var mask : vec3u;
	if(t1.x > t1.y)
	{
		if(t1.x > t1.z)
		{
			tNear = t1.x;
			mask = vec3u(1, 0, 0);
		}
		else
		{
			tNear = t1.z;
			mask = vec3u(0, 0, 1);
		}
	}
	else
	{
		if(t1.y > t1.z)
		{
			tNear = t1.y;
			mask = vec3u(0, 1, 0);
		}
		else
		{
			tNear = t1.z;
			mask = vec3u(0, 0, 1);
		}
	}

	let tFar = min(min(t2.x, t2.y), t2.z);

	var retval : IntersectAABBOut;
	retval.distances = vec2f(tNear, tFar);
	retval.mask = mask;

	return retval;
}

//-------------------------//

fn in_bounds(pos : vec3u) -> bool
{
	return pos.x < u_renderParams.volumeSize.x && pos.y < u_renderParams.volumeSize.y && pos.z < u_renderParams.volumeSize.z;
}

fn voxel_exists(pos : vec3u) -> bool
{
	let idx = pos.x + u_renderParams.volumeSize.x * (pos.y + u_renderParams.volumeSize.y * pos.z);
	let arrIdx = idx / 32;
	let bitIdx = idx % 32;

	return (u_voxelBitmap[arrIdx] & (1u << bitIdx)) != 0;
}

fn get_voxel_color(pos : vec3u) -> vec3f
{
	let idx = pos.x + u_renderParams.volumeSize.x * (pos.y + u_renderParams.volumeSize.y * pos.z);
	let packedColor = u_voxelData[idx];

	let r = (packedColor >> 24) & 0xFF;
	let g = (packedColor >> 16) & 0xFF;
	let b = (packedColor >> 8) & 0xFF;

	return vec3f(f32(r) / 255.0, f32(g) / 255.0, f32(b) / 255.0);
}

struct IntersectVolumeOut
{
	hit : bool,
	mask : vec3u,
	color : vec3f
};

//simple DDA voxel traversal algorithm
//http://www.cse.yorku.ca/~amana/research/grid.pdf
//https://www.shadertoy.com/view/4dX3zl
fn intersect_volume(rayPos : vec3f, rayDir : vec3f, invRayDir : vec3f, initialMask : vec3u) -> IntersectVolumeOut
{
	let localRayPos = rayPos * vec3f(u_renderParams.volumeSize);

	var mapPos = vec3u(floor(localRayPos));
	let deltaDist = abs(invRayDir);
	let step = vec3i(sign(rayDir));
	var sideDist : vec3f = (sign(rayDir) * (vec3f(mapPos) - localRayPos) + (sign(rayDir) * 0.5) + 0.5) * deltaDist;
	var lastSideDist = vec3f(0.0);
	var mask = initialMask;

	var hit = false;
	while(in_bounds(mapPos))
	{
		if(voxel_exists(mapPos))
		{
			hit = true;
			break;
		}

		lastSideDist = sideDist;

		if(sideDist.x < sideDist.y)
		{
			if(sideDist.x < sideDist.z)
			{
				mask = vec3u(1, 0, 0);
				sideDist.x += deltaDist.x;
				mapPos.x += u32(step.x);
			}
			else
			{
				mask = vec3u(0, 0, 1);
				sideDist.z += deltaDist.z;
				mapPos.z += u32(step.z);
			}
		}
		else
		{
			if(sideDist.y < sideDist.z)
			{
				mask = vec3u(0, 1, 0);
				sideDist.y += deltaDist.y;
				mapPos.y += u32(step.y);
			}
			else
			{
				mask = vec3u(0, 0, 1);
				sideDist.z += deltaDist.z;
				mapPos.z += u32(step.z);
			}
		}
	}

	var retval : IntersectVolumeOut;
	retval.hit = hit;
	retval.mask = mask;

	if(hit)
	{
		retval.color = get_voxel_color(mapPos);
	}
	else
	{
		retval.color = vec3f(0.0);
	}

	return retval;
}

//-------------------------//

fn background_color(rayDir : vec3f) -> vec3f
{
	let a = rayDir.y * 0.5 + 0.5;
	return mix(vec3f(0.71, 0.85, 0.90), vec3f(0.00, 0.45, 0.74), a);
}

//-------------------------//

@compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id : vec3u, @builtin(num_workgroups) numWorkgroups : vec3u)
{
	//skip pixels out of texture bounds (happens due to workgroup size):
	//---------------
	let writePos = vec2u(id.x, id.y);
	let texSize = textureDimensions(u_outImage);
	if(writePos.x >= texSize.x || writePos.y >= texSize.y) //if image dims arent multiples of workgroup size some edge pixels must be discarded
	{
		return;
	}

	//generate ray pos + dir:
	//---------------
	let pixelCenter = vec2f(f32(writePos.x), f32(writePos.y)) + vec2f(0.5);
	let uv = pixelCenter / vec2f(f32(texSize.x), f32(texSize.y));
	let d = uv * 2.0 - 1.0;

	let rayPos4 = u_renderParams.invView * vec4f(0.0, 0.0, 0.0, 1.0);
	let rayTarget = u_renderParams.invProj * vec4f(d.x, d.y, 1.0, 1.0);

	let rayDir4 = u_renderParams.invView * vec4f(normalize(rayTarget.xyz), 0.0);

	let rayPos = rayPos4.xyz;
	let rayDir = normalize(rayDir4.xyz);
	let invRayDir = 1.0 / rayDir;

	//check for intersection with bounding cube:
	//---------------
	let maxSize = max(max(u_renderParams.volumeSize.x, u_renderParams.volumeSize.y), u_renderParams.volumeSize.z);
	let volumeMin = -vec3f(u_renderParams.volumeSize) / f32(maxSize);
	let volumeMax =  vec3f(u_renderParams.volumeSize) / f32(maxSize);

	let intersect = intersect_aabb(volumeMin, volumeMax, rayPos, invRayDir);
	let intersectDists = intersect.distances;
	let intersectMask = intersect.mask;

	var color : vec3f;
	if(intersectDists.x > intersectDists.y || intersectDists.y < 0.0)
	{
		color = background_color(rayDir);
	}
	else
	{
		var startRayPos = rayPos;
		if(intersectDists.x > 0.0)
		{
			startRayPos += rayDir * (intersectDists.x + EPSILON);
		}
		startRayPos -= volumeMin;
		startRayPos /= (volumeMax - volumeMin);

		let result = intersect_volume(startRayPos, rayDir, invRayDir, intersectMask);

		if(result.hit)
		{
			//let light = dot(vec3f(result.mask), vec3f(0.8, 1.0, 0.6));
			color = result.color;// * light;
		}
		else
		{
			color = background_color(rayDir);
		}
	}

	//write final color:
	//---------------
	textureStore(u_outImage, writePos, vec4f(color, 1.0));
}