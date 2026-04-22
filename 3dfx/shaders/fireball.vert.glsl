// fireball.vert.glsl — pulsing core sphere with heat-warp displacement
varying vec2  vUv;
varying vec3  vNormal;
varying float vDisplace;
uniform float uTime;

float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
        mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
        mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
}

void main() {
  vUv     = uv;
  vNormal = normal;

  // Displacement along normal — lumpy molten surface
  float n = noise3(position * 3.0 + uTime * 1.2);
  float d = n * 0.18 * (0.85 + 0.15 * sin(uTime * 5.0));
  vDisplace = d;

  vec3 pos = position + normal * d;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
