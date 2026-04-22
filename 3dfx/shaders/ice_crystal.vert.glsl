// ice_crystal.vert.glsl — faceted crystal growth animation
varying vec2  vUv;
varying vec3  vNormal;
varying float vFresnel;
uniform float uTime;
uniform float uGrowth;  // 0..1 rise-in animation

void main() {
  vUv    = uv;
  vNormal = normalize(normalMatrix * normal);

  // Grow upward from ground
  vec3 pos = position;
  pos.y *= uGrowth;

  // Micro shimmer along shard edges
  float shimmer = sin(uTime * 8.0 + position.y * 12.0 + position.x * 5.0) * 0.012;
  pos.x += shimmer;
  pos.z += shimmer * 0.7;

  // Fresnel for rim light
  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vec3 viewDir  = normalize(cameraPosition - worldPos.xyz);
  vFresnel      = 1.0 - max(dot(vNormal, viewDir), 0.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
