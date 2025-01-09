/* math.js
 *
 * contains various linear algebra functions needed for the player
 * 
 * TODO: this code is honestly a horrible mess since I just adapted it from my C math library
 * I should probably find a proper js lin alg library
 */

export const vec3 = {

create(x, y, z)
{
	return new Float32Array([x, y, z]);
},

add(v1, v2)
{
	let result = new Float32Array(3);

	result[0] = v1[0] + v2[0];
	result[1] = v1[1] + v2[1];
	result[2] = v1[2] + v2[2];

	return result;
},

sub(v1, v2)
{
	let result = new Float32Array(3);

	result[0] = v1[0] - v2[0];
	result[1] = v1[1] - v2[1];
	result[2] = v1[2] - v2[2];

	return result;
},

dot(v1, v2)
{
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
},

length(v)
{
	return Math.sqrt(vec3.dot(v, v));
},

normalize(v)
{
	let result = new Float32Array(3);

	let len = vec3.length(v);
	if(len > 0.0)
	{
		let invLen = 1.0 / len;
		result[0] = v[0] * invLen;
		result[1] = v[1] * invLen;
		result[2] = v[2] * invLen;
	}

	return result;
},

cross(v1, v2)
{
	let result = new Float32Array(3);

	result[0] = (v1[1] * v2[2]) - (v1[2] * v2[1]);
	result[1] = (v1[2] * v2[0]) - (v1[0] * v2[2]);
	result[2] = (v1[0] * v2[1]) - (v1[1] * v2[0]);

	return result;
}

}; //const vec3 =

export const mat4 = {

identity()
{
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
},

zeroes()
{
	return new Float32Array([
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, 0
	]);
},

mult(m1, m2)
{
	let result = new Float32Array(4 * 4);

	result[4 * 0 + 0] = m1[4 * 0 + 0] * m2[4 * 0 + 0] + m1[4 * 1 + 0] * m2[4 * 0 + 1] + m1[4 * 2 + 0] * m2[4 * 0 + 2] + m1[4 * 3 + 0] * m2[4 * 0 + 3];
	result[4 * 0 + 1] = m1[4 * 0 + 1] * m2[4 * 0 + 0] + m1[4 * 1 + 1] * m2[4 * 0 + 1] + m1[4 * 2 + 1] * m2[4 * 0 + 2] + m1[4 * 3 + 1] * m2[4 * 0 + 3];
	result[4 * 0 + 2] = m1[4 * 0 + 2] * m2[4 * 0 + 0] + m1[4 * 1 + 2] * m2[4 * 0 + 1] + m1[4 * 2 + 2] * m2[4 * 0 + 2] + m1[4 * 3 + 2] * m2[4 * 0 + 3];
	result[4 * 0 + 3] = m1[4 * 0 + 3] * m2[4 * 0 + 0] + m1[4 * 1 + 3] * m2[4 * 0 + 1] + m1[4 * 2 + 3] * m2[4 * 0 + 2] + m1[4 * 3 + 3] * m2[4 * 0 + 3];
	result[4 * 1 + 0] = m1[4 * 0 + 0] * m2[4 * 1 + 0] + m1[4 * 1 + 0] * m2[4 * 1 + 1] + m1[4 * 2 + 0] * m2[4 * 1 + 2] + m1[4 * 3 + 0] * m2[4 * 1 + 3];
	result[4 * 1 + 1] = m1[4 * 0 + 1] * m2[4 * 1 + 0] + m1[4 * 1 + 1] * m2[4 * 1 + 1] + m1[4 * 2 + 1] * m2[4 * 1 + 2] + m1[4 * 3 + 1] * m2[4 * 1 + 3];
	result[4 * 1 + 2] = m1[4 * 0 + 2] * m2[4 * 1 + 0] + m1[4 * 1 + 2] * m2[4 * 1 + 1] + m1[4 * 2 + 2] * m2[4 * 1 + 2] + m1[4 * 3 + 2] * m2[4 * 1 + 3];
	result[4 * 1 + 3] = m1[4 * 0 + 3] * m2[4 * 1 + 0] + m1[4 * 1 + 3] * m2[4 * 1 + 1] + m1[4 * 2 + 3] * m2[4 * 1 + 2] + m1[4 * 3 + 3] * m2[4 * 1 + 3];
	result[4 * 2 + 0] = m1[4 * 0 + 0] * m2[4 * 2 + 0] + m1[4 * 1 + 0] * m2[4 * 2 + 1] + m1[4 * 2 + 0] * m2[4 * 2 + 2] + m1[4 * 3 + 0] * m2[4 * 2 + 3];
	result[4 * 2 + 1] = m1[4 * 0 + 1] * m2[4 * 2 + 0] + m1[4 * 1 + 1] * m2[4 * 2 + 1] + m1[4 * 2 + 1] * m2[4 * 2 + 2] + m1[4 * 3 + 1] * m2[4 * 2 + 3];
	result[4 * 2 + 2] = m1[4 * 0 + 2] * m2[4 * 2 + 0] + m1[4 * 1 + 2] * m2[4 * 2 + 1] + m1[4 * 2 + 2] * m2[4 * 2 + 2] + m1[4 * 3 + 2] * m2[4 * 2 + 3];
	result[4 * 2 + 3] = m1[4 * 0 + 3] * m2[4 * 2 + 0] + m1[4 * 1 + 3] * m2[4 * 2 + 1] + m1[4 * 2 + 3] * m2[4 * 2 + 2] + m1[4 * 3 + 3] * m2[4 * 2 + 3];
	result[4 * 3 + 0] = m1[4 * 0 + 0] * m2[4 * 3 + 0] + m1[4 * 1 + 0] * m2[4 * 3 + 1] + m1[4 * 2 + 0] * m2[4 * 3 + 2] + m1[4 * 3 + 0] * m2[4 * 3 + 3];
	result[4 * 3 + 1] = m1[4 * 0 + 1] * m2[4 * 3 + 0] + m1[4 * 1 + 1] * m2[4 * 3 + 1] + m1[4 * 2 + 1] * m2[4 * 3 + 2] + m1[4 * 3 + 1] * m2[4 * 3 + 3];
	result[4 * 3 + 2] = m1[4 * 0 + 2] * m2[4 * 3 + 0] + m1[4 * 1 + 2] * m2[4 * 3 + 1] + m1[4 * 2 + 2] * m2[4 * 3 + 2] + m1[4 * 3 + 2] * m2[4 * 3 + 3];
	result[4 * 3 + 3] = m1[4 * 0 + 3] * m2[4 * 3 + 0] + m1[4 * 1 + 3] * m2[4 * 3 + 1] + m1[4 * 2 + 3] * m2[4 * 3 + 2] + m1[4 * 3 + 3] * m2[4 * 3 + 3];

	return result;
},

inverse(mat)
{
	//yikes...

	let result = new Float32Array(4 * 4);

	let tmp = new Float32Array(6);
	let a = mat[4 * 0 + 0], b = mat[4 * 0 + 1], c = mat[4 * 0 + 2], d = mat[4 * 0 + 3],
		e = mat[4 * 1 + 0], f = mat[4 * 1 + 1], g = mat[4 * 1 + 2], h = mat[4 * 1 + 3],
		i = mat[4 * 2 + 0], j = mat[4 * 2 + 1], k = mat[4 * 2 + 2], l = mat[4 * 2 + 3],
		m = mat[4 * 3 + 0], n = mat[4 * 3 + 1], o = mat[4 * 3 + 2], p = mat[4 * 3 + 3];

	tmp[0] = k * p - o * l; 
	tmp[1] = j * p - n * l; 
	tmp[2] = j * o - n * k;
	tmp[3] = i * p - m * l; 
	tmp[4] = i * o - m * k; 
	tmp[5] = i * n - m * j;

	result[4 * 0 + 0] =   f * tmp[0] - g * tmp[1] + h * tmp[2];
	result[4 * 1 + 0] = -(e * tmp[0] - g * tmp[3] + h * tmp[4]);
	result[4 * 2 + 0] =   e * tmp[1] - f * tmp[3] + h * tmp[5];
	result[4 * 3 + 0] = -(e * tmp[2] - f * tmp[4] + g * tmp[5]);

	result[4 * 0 + 1] = -(b * tmp[0] - c * tmp[1] + d * tmp[2]);
	result[4 * 1 + 1] =   a * tmp[0] - c * tmp[3] + d * tmp[4];
	result[4 * 2 + 1] = -(a * tmp[1] - b * tmp[3] + d * tmp[5]);
	result[4 * 3 + 1] =   a * tmp[2] - b * tmp[4] + c * tmp[5];

	tmp[0] = g * p - o * h;
	tmp[1] = f * p - n * h;
	tmp[2] = f * o - n * g;
	tmp[3] = e * p - m * h;
	tmp[4] = e * o - m * g;
	tmp[5] = e * n - m * f;

	result[4 * 0 + 2] =   b * tmp[0] - c * tmp[1] + d * tmp[2];
	result[4 * 1 + 2] = -(a * tmp[0] - c * tmp[3] + d * tmp[4]);
	result[4 * 2 + 2] =   a * tmp[1] - b * tmp[3] + d * tmp[5];
	result[4 * 3 + 2] = -(a * tmp[2] - b * tmp[4] + c * tmp[5]);

	tmp[0] = g * l - k * h;
	tmp[1] = f * l - j * h;
	tmp[2] = f * k - j * g;
	tmp[3] = e * l - i * h;
	tmp[4] = e * k - i * g;
	tmp[5] = e * j - i * f;

	result[4 * 0 + 3] = -(b * tmp[0] - c * tmp[1] + d * tmp[2]);
	result[4 * 1 + 3] =   a * tmp[0] - c * tmp[3] + d * tmp[4];
	result[4 * 2 + 3] = -(a * tmp[1] - b * tmp[3] + d * tmp[5]);
	result[4 * 3 + 3] =   a * tmp[2] - b * tmp[4] + c * tmp[5];

	let det = 1.0 / (a * result[4 * 0 + 0] + b * result[4 * 1 + 0]
				   + c * result[4 * 2 + 0] + d * result[4 * 3 + 0]);

	result[4 * 0 + 0] = result[4 * 0 + 0] * det;
	result[4 * 0 + 1] = result[4 * 0 + 1] * det;
	result[4 * 0 + 2] = result[4 * 0 + 2] * det;
	result[4 * 0 + 3] = result[4 * 0 + 3] * det;
	result[4 * 1 + 0] = result[4 * 1 + 0] * det;
	result[4 * 1 + 1] = result[4 * 1 + 1] * det;
	result[4 * 1 + 2] = result[4 * 1 + 2] * det;
	result[4 * 1 + 3] = result[4 * 1 + 3] * det;
	result[4 * 2 + 0] = result[4 * 2 + 0] * det;
	result[4 * 2 + 1] = result[4 * 2 + 1] * det;
	result[4 * 2 + 2] = result[4 * 2 + 2] * det;
	result[4 * 2 + 3] = result[4 * 2 + 3] * det;
	result[4 * 3 + 0] = result[4 * 3 + 0] * det;
	result[4 * 3 + 1] = result[4 * 3 + 1] * det;
	result[4 * 3 + 2] = result[4 * 3 + 2] * det;
	result[4 * 3 + 3] = result[4 * 3 + 3] * det;

	return result;
},

translate(pos)
{
	let result = mat4.identity();

	result[4 * 3 + 0] = pos[0];
	result[4 * 3 + 1] = pos[1];
	result[4 * 3 + 2] = pos[2];

	return result;
},

look(pos, dir, up)
{
	let r = vec3.normalize(vec3.cross(up, dir));
	let u = vec3.cross(dir, r);

	let RUD = mat4.identity();
	RUD[4 * 0 + 0] = r[0];
	RUD[4 * 1 + 0] = r[1];
	RUD[4 * 2 + 0] = r[2];
	RUD[4 * 0 + 1] = u[0];
	RUD[4 * 1 + 1] = u[1];
	RUD[4 * 2 + 1] = u[2];
	RUD[4 * 0 + 2] = dir[0];
	RUD[4 * 1 + 2] = dir[1];
	RUD[4 * 2 + 2] = dir[2];

	let oppPos = vec3.create(-pos[0], -pos[1], -pos[2]);
	let result = mat4.mult(RUD, mat4.translate(oppPos));

	return result;
},

lookat(pos, target, up)
{
	let dir = vec3.normalize(vec3.sub(pos, target));
	return mat4.look(pos, dir, up);
},

perspective(fov, aspect, near, far)
{
	let result = mat4.zeroes();

	let scale = Math.tan(fov * 0.5) * near;

	let right = aspect * scale;
	let left = -right;
	let top = scale;
	let bot = -top;

	result[4 * 0 + 0] = near / right;
	result[4 * 1 + 1] = near / top;
	result[4 * 2 + 2] = -(far + near) / (far - near);
	result[4 * 3 + 2] = -2.0 * far * near / (far - near);
	result[4 * 2 + 3] = -1.0;

	return result;
}

} //const mat4 =