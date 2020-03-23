export let shader = `#version 300 es

precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform int windowSize;
uniform vec2 resolution;
uniform sampler2D tDiffuse;

void main()	{

  // Always round up windowSize to the next odd number (to compute the real block size)
  int windowSizeRounded = windowSize + (1 - windowSize % 2);
  int halfWindowSize = windowSize / 2;
  
  float maxDistance = float(2 * halfWindowSize * halfWindowSize);
  float minDistance = maxDistance;

  for (int xi = -halfWindowSize ; xi <= halfWindowSize ; xi++) {
    for (int yi = -halfWindowSize ; yi <= halfWindowSize ; yi++) {

      vec4 tij = texture(tDiffuse, vUv + ( vec2(xi, yi) / resolution ) );
      if(tij.x > 0.5) {
        float distance = float(xi * xi + yi * yi);
        if(distance < minDistance) {
          minDistance = distance;
        }
      }
    }
  }

  minDistance /= maxDistance;
  float d = pow(minDistance, 0.5);

	fragColor = vec4(d, d, d, 1.);
}`;
