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
	/*if(uv.x > uv.y)
	{
		return vec4f(0.0, 0.0, 0.0, 1.0);
	}
	else
	{
		return vec4f(1.0);
	}*/

	var color = textureSample(u_image, u_imageSampler, uv).xyz;
	return vec4f(color, 1.0);

	//return vec4f(uv, 0.5, 1.0);
}