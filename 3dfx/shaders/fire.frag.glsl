// Grudge Studio — Fire Fragment Shader
// Uses fractal brownian motion noise for realistic flame rendering

varying vec2 vUv;
varying float vTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uIntensity;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  uv.y -= vTime * 0.5;

  float n = fbm(uv * 4.0 + vTime);
  float flame = 1.0 - vUv.y;
  flame = pow(flame, 1.5);
  flame *= n;
  flame *= smoothstep(0.0, 0.3, vUv.y);
  flame *= smoothstep(1.0, 0.7, abs(vUv.x - 0.5) * 2.0);

  vec3 color = mix(uColor2, uColor1, flame);
  float alpha = flame * uIntensity * 2.0;

  gl_FragColor = vec4(color, alpha);
}
