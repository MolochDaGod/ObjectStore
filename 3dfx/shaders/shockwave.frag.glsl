// Grudge Studio — Shockwave Fragment Shader
// Renders a fading radial ring that expands with progress

varying vec2 vUv;
uniform vec3 uColor1;
uniform float uProgress;

void main() {
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vUv, center);
  float ring = smoothstep(0.4, 0.5, dist) * smoothstep(0.6, 0.5, dist);
  float alpha = ring * (1.0 - uProgress);

  gl_FragColor = vec4(uColor1, alpha);
}
