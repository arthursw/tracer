export let shader = `#version 300 es

precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 resolution;
uniform sampler2D image;

void main()	{
	float x = mod(gl_FragCoord.x, 20.) < 10. ? 1. : 0.;
	float y = mod(gl_FragCoord.y, 20.) < 10. ? 1. : 0.;
	vec4 t = texture(image, vUv);
	fragColor = vec4(x, y, t.r, 1.);
}`;
