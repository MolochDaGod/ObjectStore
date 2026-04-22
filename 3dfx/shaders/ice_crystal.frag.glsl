// ice_crystal.frag.glsl — translucent prismatic crystal with internal caustics
varying vec2  vUv;
varying vec3  vNormal;
varying float vFresnel;
uniform float uTime;
uniform vec3  uColor1;   // #aaeeff
uniform vec3  uColor2;   // #ffffff
uniform float uIntensity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  // Caustic light bands scrolling through crystal
  float band  = sin(vUv.x * 18.0 + uTime * 1.5) * sin(vUv.y * 12.0 - uTime * 2.2);
  float band2 = sin((vUv.x + vUv.y) * 14.0 + uTime * 3.0) * 0.5 + 0.5;
  float caustic = (band * 0.5 + 0.5) * band2;

  // Prismatic colour shift
  vec3  prism = vec3(
    sin(vUv.x * 6.0 + uTime) * 0.5 + 0.5,
    sin(vUv.y * 4.0 + uTime * 1.3 + 1.0) * 0.5 + 0.5,
    1.0
  );

  vec3  c = mix(uColor1, uColor2, vFresnel);
  c       = mix(c, prism * uColor2, caustic * 0.35);

  // Rim light — bright icy edge
  float rim = pow(vFresnel, 3.0) * 2.0;
  c        += uColor2 * rim;

  // Specular hotspot
  float spec = pow(max(dot(vNormal, normalize(vec3(1.0,2.0,1.0))), 0.0), 64.0);
  c         += vec3(1.0) * spec * 2.5;

  float alpha = mix(0.55, 0.95, vFresnel) * uIntensity;

  gl_FragColor = vec4(c, clamp(alpha, 0.0, 1.0));
}
