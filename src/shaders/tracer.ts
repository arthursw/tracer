export let shader = `#version 300 es

precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 resolution;
uniform sampler2D image;

float colorToBlackAndWhite(vec4 c) {
	return 0.2126 * c.r + 0.7153 * c.g + 0.0721 * c.b;
}

void main()	{

    vec4 average = vec4(0.);
    const int no2 = 5;
    int blockSize = 2 * no2 + 1;
    float nPixelsInBlock = float( blockSize * blockSize);
    float C = 5.0 / 255.0;

    for (int xi = -no2 ; xi <= no2 ; xi++) {
      for (int yi = -no2 ; yi <= no2 ; yi++) {
        average += texture(image, vUv + ( vec2(xi, yi) / resolution ) );
      }
    }

    average /= nPixelsInBlock;

	vec4 t = texture(image, vUv);
    float bnw = colorToBlackAndWhite(t);
    float averageBnw = colorToBlackAndWhite(average);

    float thresholded = averageBnw - C < bnw ? 1. : 0.;

	fragColor = vec4(thresholded, thresholded, thresholded, 1.);
}`;
