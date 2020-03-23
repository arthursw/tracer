export let shader = `#version 300 es

precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float alpha;
uniform float threshold;
uniform float threshold2;
uniform vec2 resolution;
uniform sampler2D tDiffuse;

vec2 sample_grad(vec2 vUv) {
    float t = texture(tDiffuse, vUv).x;
    float dx = texture(tDiffuse, vUv - vec2(1., 0.) / resolution).x - t;
    float dy = texture(tDiffuse, vUv - vec2(0., 1.) / resolution).x - t;
    return vec2(dx, dy);
}

void main()	{
    float dsum = 0., wsum = 0.;
    
    const float w[3] = float[3](1., 2., 1.);
    float h = 0.5;
    
    // for each texel in a 3x3 neighborhood centered on this one
    for (int i=0; i<3; ++i) {
        for (int j=0; j<3; ++j) {
            
            // offset to neighbor texel
            vec2 delta = h*(vec2(float(i),float(j))-1.);

            // fetch gradient & distance at neighbor
            vec2 grad = sample_grad(vUv + delta / resolution);
            
            float wij = w[i]*w[j];
            
            dsum += wij * dot(delta, grad);
            wsum += wij;     
               
        }
    }

    float t = texture(tDiffuse, vUv).x;
    float divergence = alpha * dsum / (wsum);
    divergence = t > 0.99 ? t : divergence;
    divergence = divergence < threshold ? 1.0 : 0.0;
	fragColor = vec4(divergence, divergence, divergence, 1.);
}`;
