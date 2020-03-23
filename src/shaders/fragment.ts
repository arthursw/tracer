export let shader = `#version 300 es
#define MAX_BUFFER_SIZE 1000

precision highp float;
	
uniform float time;
uniform sampler2D image;

in vec2 vUv;
out vec4 fragColor;

void main() {
	// float x = mod(vUv.x, 0.2) < 0.1 ? 1. : 0.;
	// float y = mod(vUv.y, 0.2) < 0.1 ? 1. : 0.;
    float t = texture(image, vUv).x;
	fragColor = vec4(t, t, t, 1.);
}`;
