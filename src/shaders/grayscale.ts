export let shader = `#version 300 es

precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 resolution;
uniform sampler2D tDiffuse;

float colorToGrayscale(vec4 c) {
	return 0.2126 * c.r + 0.7153 * c.g + 0.0721 * c.b;
}

void main()	{
	vec4 t = texture(tDiffuse, vUv);
    float grayscale = colorToGrayscale(t);
	fragColor = vec4(grayscale, grayscale, grayscale, 1.);
}`;
