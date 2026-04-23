// Grudge 3DFX — Fragment shader snippet template
// Required uniforms for compatibility with the 3DFX viewer:
//   uniform float uTime;       // seconds elapsed in the effect loop
//   uniform vec3  uColor1;     // primary color
//   uniform vec3  uColor2;     // secondary color
//   uniform float uIntensity;  // 0..5 inspector slider
//
// Required varyings from a matching vertex shader:
//   varying vec2 vUv;

varying vec2 vUv;
uniform float uTime;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform float uIntensity;

float hash(vec2 p)  { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float fbm(vec2 p)   {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * hash(floor(p)); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  uv.y -= uTime * 0.5;
  float n     = fbm(uv * 4.0 + uTime);
  float flame = pow(1.0 - vUv.y, 1.5) * n;
  flame      *= smoothstep(0.0, 0.3, vUv.y);
  flame      *= smoothstep(1.0, 0.7, abs(vUv.x - 0.5) * 2.0);
  vec3 col    = mix(uColor2, uColor1, flame);
  gl_FragColor = vec4(col, flame * uIntensity * 2.0);
}
