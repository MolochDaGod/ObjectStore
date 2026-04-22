// fireball.frag.glsl — molten core with surface fire, limb darkening, corona
varying vec2  vUv;
varying vec3  vNormal;
varying float vDisplace;
uniform float uTime;
uniform vec3  uColor1;    // #ff4400
uniform vec3  uColor2;    // #ffcc00
uniform float uIntensity;

float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453);
    p  = p * 2.1 + vec3(0.5, 0.3, 0.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  // Fresnel — bright centre, fading edges
  vec3  viewDir = normalize(cameraPosition - vNormal);
  float fresnel = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
  fresnel       = pow(fresnel, 2.0);

  // Animated surface turbulence
  float n  = fbm(vNormal * 2.5 + uTime * 0.6);
  float n2 = fbm(vNormal * 5.0 - uTime * 0.4);

  // Core: white-hot → orange → dark red at rim
  vec3  white = vec3(1.0, 0.98, 0.85);
  vec3  c     = mix(white, uColor2, n * 0.7);
  c           = mix(c,     uColor1, n2 * 0.5 + fresnel * 0.4);

  // Limb darkening (darker at edges like a real star)
  float limb  = 1.0 - pow(fresnel, 0.8);
  c          *= limb;

  // Corona glow spike at rim
  float corona = pow(fresnel, 5.0) * 2.5;
  c           += uColor1 * corona;

  float alpha = (1.0 - fresnel * 0.5) * uIntensity;

  gl_FragColor = vec4(c, clamp(alpha, 0.0, 1.0));
}
