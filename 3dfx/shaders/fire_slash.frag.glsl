// fire_slash.frag.glsl — fire slash trail with heat core and ember sparks
varying vec2 vUv;
varying float vAlpha;
varying float vHeat;
uniform float uTime;
uniform vec3  uColor1;   // primary  e.g. #ff5500
uniform vec3  uColor2;   // secondary e.g. #ffaa00
uniform float uIntensity;

// Pseudo-random
float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

// FBM turbulence
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    p  = p * 2.17 + vec2(0.1, 0.3);
    a *= 0.48;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  // Scroll fire noise upward
  uv.y -= uTime * 0.55;
  uv.x += sin(uTime * 3.0 + vUv.y * 6.0) * 0.04;

  float n  = fbm(uv * 3.5);
  float n2 = fbm(uv * 6.0 + vec2(uTime * 0.3, 0.0));

  // Shape: hot core white → orange → dark edge
  float core    = vHeat * n * 1.4;
  core          = clamp(core, 0.0, 1.0);
  float edge    = 1.0 - abs(vUv.y - 0.5) * 2.2;
  edge          = pow(max(edge, 0.0), 1.2);

  vec3 white  = vec3(1.0, 0.95, 0.8);
  vec3 c      = mix(uColor2, uColor1, n);
  c           = mix(c, white, core * edge * 0.7);

  // Ember sparks — random bright specks
  float spark = step(0.97, rand(floor(uv * 18.0) + floor(uTime * 6.0)));
  c += spark * white * 1.5;

  float alpha = vAlpha * edge * (n * 0.6 + 0.4) * uIntensity;
  alpha      *= (1.0 - n2 * 0.3);
  alpha       = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(c, alpha);
}
