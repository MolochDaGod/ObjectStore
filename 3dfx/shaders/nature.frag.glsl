// nature.frag.glsl — bioluminescent leaves, vine glow, pollen shimmer
varying vec2  vUv;
varying float vWind;
uniform float uTime;
uniform vec3  uColor1;   // #44cc66 green
uniform vec3  uColor2;   // #88ffaa light green
uniform float uIntensity;

float hash(vec2 p) { return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * hash(floor(p));
    p = p * 2.0 + vec2(0.3, 0.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  // Leaf cell pattern
  float cells = fbm(uv * 6.0 + uTime * 0.15);
  float vein  = 1.0 - smoothstep(0.0, 0.08, abs(cells - 0.5));

  // Bioluminescent glow — brighter veins
  vec3  c  = mix(uColor1 * 0.7, uColor2, cells);
  c       += uColor2 * vein * 0.9;

  // Pollen sparkle
  float pollen = step(0.96, hash(floor(uv * 22.0) + floor(uTime * 4.0) * 0.01));
  c           += vec3(1.0, 1.0, 0.6) * pollen * 2.5;

  // Wind shimmer brightens leaf edges
  c += uColor2 * vWind * 0.15;

  float alpha = (cells * 0.5 + 0.5) * uIntensity * (0.7 + vein * 0.3);
  alpha       = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(c, alpha);
}
