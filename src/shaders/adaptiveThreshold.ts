export let shader = `#version 300 es

precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 resolution;
uniform float C;
uniform int windowSize;
uniform sampler2D tDiffuse;

void main()	{

  float average = 0.;

  // Always round up windowSize to the next odd number (to compute the real block size)
  int windowSizeRounded = windowSize + (1 - windowSize % 2);
  int nPixelsInWindow = windowSizeRounded * windowSizeRounded;
  int halfWindowSize = windowSize / 2;

  for (int xi = -halfWindowSize ; xi <= halfWindowSize ; xi++) {
    for (int yi = -halfWindowSize ; yi <= halfWindowSize ; yi++) {
      average += texture(tDiffuse, vUv + ( vec2(xi, yi) / resolution ) ).x;
    }
  }

  average /= float(nPixelsInWindow);

  float t = texture(tDiffuse, vUv).x;

  float thresholded = average - C < t ? 1. : 0.;

	fragColor = vec4(thresholded, thresholded, thresholded, 1.);
}`;
