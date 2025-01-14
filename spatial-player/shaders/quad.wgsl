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