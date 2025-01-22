//TODO: find an automatic way to copy the shaders into this file

export const RAYTRACER_SHADER_SRC = `
	/* raytrace.wgsl
	*
	* shader for performing voxel raytracing and generating the final image
	*/

	const EPSILON = 0.0001;

	const BRICK_SIZE = 8;
	const BRICK_BITMAP_LEN = (((BRICK_SIZE * BRICK_SIZE * BRICK_SIZE + 31) & (~31)) / 32);
	const BRICK_COLORS_LEN = (BRICK_SIZE * BRICK_SIZE * BRICK_SIZE);
	const BRICK_STRIDE = (BRICK_BITMAP_LEN + BRICK_COLORS_LEN);

	const EMPTY_BRICK = 0xFFFFFFFF;

	const BOUNDING_BOX_COLOR = vec4f(0.0, 0.0, 0.0, 1.0);

	//-------------------------//

	struct RenderParams
	{
		invView : mat4x4f,
		invProj : mat4x4f,
		
		mapSize : vec3u,
		boundingBoxWidth : f32,

		backroundColorTop : vec4f,
		backroundColorBot : vec4f,

		isEmpty : u32
	}

	//-------------------------//

	@group(0) @binding(0) var u_outTexture : texture_storage_2d<rgba8unorm, write>;
	@group(0) @binding(1) var<uniform> u_renderParams : RenderParams;

	@group(0) @binding(2) var<storage, read> u_map : array<u32>;
	@group(0) @binding(3) var<storage, read> u_bricks : array<u32>;

	//-------------------------//

	fn intersect_aabb(boxMin : vec3f, boxMax : vec3f, rayPos : vec3f, invRayDir : vec3f) -> vec2f
	{
		let tMin = (boxMin - rayPos) * invRayDir;
		let tMax = (boxMax - rayPos) * invRayDir;

		let t1 = min(tMin, tMax);
		let t2 = max(tMin, tMax);

		let tNear = max(max(t1.x, t1.y), t1.z);
		let tFar = min(min(t2.x, t2.y), t2.z);

		return vec2f(tNear, tFar);
	}

	fn background_color(rayDir : vec3f) -> vec4f
	{
		let a = rayDir.y * 0.5 + 0.5;
		return mix(u_renderParams.backroundColorBot, u_renderParams.backroundColorTop, a);
	}

	//-------------------------//

	fn in_brick_bounds(pos : vec3u) -> bool
	{
		return pos.x < BRICK_SIZE && pos.y < BRICK_SIZE && pos.z < BRICK_SIZE;
	}

	fn voxel_exists(brick : u32, pos : vec3u) -> bool
	{
		let idx = pos.x + BRICK_SIZE * (pos.y + BRICK_SIZE * pos.z);
		let arrIdx = idx / 32;
		let bitIdx = idx % 32;

		return (u_bricks[brick * BRICK_STRIDE + arrIdx] & u32(1 << bitIdx)) != 0;
	}

	fn get_voxel_color(brick : u32, pos : vec3u) -> vec3f
	{
		let idx = pos.x + BRICK_SIZE * (pos.y + BRICK_SIZE * pos.z);
		let packedColor = u_bricks[brick * BRICK_STRIDE + BRICK_BITMAP_LEN + idx];

		let r = (packedColor >> 24) & 0xFF;
		let g = (packedColor >> 16) & 0xFF;
		let b = (packedColor >> 8) & 0xFF;

		return vec3f(f32(r) / 255.0, f32(g) / 255.0, f32(b) / 255.0);
	}

	struct IntersectBrickOut
	{
		hit : bool,
		color : vec3f
	}

	fn intersect_brick(brick : u32, rayPosIn : vec3f, rayDir : vec3f, deltaDist : vec3f, step : vec3i) -> IntersectBrickOut
	{
		let rayPos = rayPosIn * vec3f(BRICK_SIZE, BRICK_SIZE, BRICK_SIZE);

		var pos = vec3u(floor(rayPos));
		var sideDist = (sign(rayDir) * (vec3f(pos) - rayPos) + (sign(rayDir) * 0.5) + 0.5) * deltaDist;

		var hit = false;
		while(in_brick_bounds(pos))
		{
			if(voxel_exists(brick, pos))
			{
				hit = true;
				break;
			}

			if(sideDist.x < sideDist.y)
			{
				if(sideDist.x < sideDist.z)
				{
					sideDist.x += deltaDist.x;
					pos.x += u32(step.x);
				}
				else
				{
					sideDist.z += deltaDist.z;
					pos.z += u32(step.z);
				}
			}
			else
			{
				if(sideDist.y < sideDist.z)
				{
					sideDist.y += deltaDist.y;
					pos.y += u32(step.y);
				}
				else
				{
					sideDist.z += deltaDist.z;
					pos.z += u32(step.z);
				}
			}
		}

		var retval : IntersectBrickOut;
		retval.hit = hit;

		if(hit)
		{
			retval.color = get_voxel_color(brick, pos);
		}
		else
		{
			retval.color = vec3f(0.0, 0.0, 0.0);
		}

		return retval;
	}

	fn hit_bounding_box_edge(rayPos : vec3f, rayDir : vec3f, distToBox : f32, boxSize : vec3f) -> bool
	{
		let oneMinusWidth = 1.0 - u_renderParams.boundingBoxWidth;

		if(distToBox < 0.0)
		{
			return false;
		}

		let hitPos = rayPos + rayDir * distToBox;
		let normHitPos = abs(hitPos / boxSize);

		return (normHitPos.x > oneMinusWidth && normHitPos.y > oneMinusWidth) ||
			(normHitPos.y > oneMinusWidth && normHitPos.z > oneMinusWidth) ||
			(normHitPos.z > oneMinusWidth && normHitPos.x > oneMinusWidth);
	}

	//-------------------------//

	fn in_map_bounds(pos : vec3u) -> bool
	{
		return pos.x < u_renderParams.mapSize.x && pos.y < u_renderParams.mapSize.y && pos.z < u_renderParams.mapSize.z;
	}

	fn get_brick(pos : vec3u) -> u32
	{
		let idx = pos.x + u_renderParams.mapSize.x * (pos.y + u_renderParams.mapSize.y * pos.z);
		return u_map[idx];
	}

	struct IntersectMapOut
	{
		hit : bool,
		color : vec3f
	}

	fn intersect_map(rayPosIn : vec3f, rayDir : vec3f, invRayDir : vec3f) -> IntersectMapOut
	{
		let rayPos = rayPosIn * vec3f(u_renderParams.mapSize);

		var mapPos = vec3u(floor(rayPos));
		let deltaDist = abs(invRayDir);
		let step = vec3i(sign(rayDir));
		var sideDist = (sign(rayDir) * (vec3f(mapPos) - rayPos) + (sign(rayDir) * 0.5) + 0.5) * deltaDist;
		var lastSideDist = vec3f(0.0, 0.0, 0.0);

		var brickHit : IntersectBrickOut;

		var hit = false;
		while(in_map_bounds(mapPos))
		{
			let brick = get_brick(mapPos);
			if(brick != EMPTY_BRICK)
			{
				var curRayPos = rayPos + rayDir * (min(min(lastSideDist.x, lastSideDist.y), lastSideDist.z) + EPSILON);
				curRayPos -= vec3f(mapPos);

				brickHit = intersect_brick(brick, curRayPos, rayDir, deltaDist, step);
				if(brickHit.hit)
				{
					hit = true;
					break;
				}
			}

			lastSideDist = sideDist;

			if(sideDist.x < sideDist.y)
			{
				if(sideDist.x < sideDist.z)
				{
					sideDist.x += deltaDist.x;
					mapPos.x += u32(step.x);
				}
				else
				{
					sideDist.z += deltaDist.z;
					mapPos.z += u32(step.z);
				}
			}
			else
			{
				if(sideDist.y < sideDist.z)
				{
					sideDist.y += deltaDist.y;
					mapPos.y += u32(step.y);
				}
				else
				{
					sideDist.z += deltaDist.z;
					mapPos.z += u32(step.z);
				}
			}
		}

		var retval : IntersectMapOut;
		retval.hit = hit;

		if(hit)
		{
			retval.color = brickHit.color;
		}
		else
		{
			retval.color = vec3f(0.0, 0.0, 0.0);
		}

		return retval;
	}

	//-------------------------//

	@compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id : vec3u, @builtin(num_workgroups) numWorkgroups : vec3u)
	{
		//skip pixels out of texture bounds (happens due to workgroup size):
		//---------------
		let writePos = vec2u(id.x, id.y);
		let texSize = textureDimensions(u_outTexture);
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
		let maxSize = max(max(u_renderParams.mapSize.x, u_renderParams.mapSize.y), u_renderParams.mapSize.z);
		let volumeMin = -vec3f(u_renderParams.mapSize) / f32(maxSize);
		let volumeMax =  vec3f(u_renderParams.mapSize) / f32(maxSize);

		let intersect = intersect_aabb(volumeMin, volumeMax, rayPos, invRayDir);

		//trace through volume:
		//---------------
		var color : vec4f;
		if(intersect.x > intersect.y || intersect.y < 0.0)
		{
			color = background_color(rayDir);
		}
		else if(hit_bounding_box_edge(rayPos, rayDir, intersect.x, volumeMax))
		{
			color = BOUNDING_BOX_COLOR;
		}
		else
		{
			var startRayPos = rayPos;
			if(intersect.x > 0.0)
			{
				startRayPos += rayDir * (intersect.x + EPSILON);
			}
			startRayPos -= volumeMin;
			startRayPos /= (volumeMax - volumeMin);

			var result : IntersectMapOut;
			if(u_renderParams.isEmpty != 0)
			{
				result.hit = false;
			}
			else
			{
				result = intersect_map(startRayPos, rayDir, invRayDir);
			}

			if(result.hit)
			{
				color = vec4f(result.color, 1.0);
			}
			else
			{
				if(hit_bounding_box_edge(rayPos, rayDir, intersect.y, volumeMax))
				{
					color = BOUNDING_BOX_COLOR;
				}
				else
				{
					color = background_color(rayDir);
				}
			}
		}

		//write final color:
		//---------------
		textureStore(u_outTexture, writePos, color);
	}
`

export const QUAD_SHADER_SRC = `
	/* quad.wgsl
	*
	* shaders for simply rendering a textured quad
	*/

	//-------------------------//

	struct VertIn
	{
		@location(0) pos : vec2f,
		@location(1) uv : vec2f
	}

	struct VertOut
	{
		@builtin(position) pos : vec4f,
		@location(0) uv : vec2f
	};

	//-------------------------//

	@group(0) @binding(0) var u_image : texture_2d<f32>;
	@group(0) @binding(1) var u_imageSampler : sampler;

	//-------------------------//

	@vertex fn vs(in : VertIn) -> VertOut
	{
		var out : VertOut;
		out.pos = vec4f(in.pos, 0.0, 1.0);
		out.uv = in.uv;

		return out;
	}

	@fragment fn fs(@location(0) uv: vec2f) -> @location(0) vec4f 
	{
		var color = textureSample(u_image, u_imageSampler, uv);
		return vec4f(color.rgb * color.a, color.a);
	}
`