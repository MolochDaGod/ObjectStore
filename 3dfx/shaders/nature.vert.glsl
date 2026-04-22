// nature.vert.glsl — swaying vines / leaf spirals
varying vec2  vUv;
varying float vWind;
uniform float uTime;
uniform float uGrowth;

void main() {
  vUv = uv;

  vec3 pos = position;
  pos.y *= uGrowth;

  // Wind sway increasing with height
  float sway  = sin(uTime * 1.8 + position.x * 2.5 + position.z * 1.3) * pos.y * 0.06;
  float sway2 = cos(uTime * 2.6 + position.z * 1.8) * pos.y * 0.03;
  pos.x += sway;
  pos.z += sway2;

  vWind = abs(sway) * 8.0;  // used for shimmer intensity

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
