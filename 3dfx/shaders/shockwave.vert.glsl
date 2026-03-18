// Grudge Studio — Shockwave Vertex Shader
// Expands ring geometry outward based on progress uniform

varying vec2 vUv;
uniform float uProgress;

void main() {
  vUv = uv;
  vec3 pos = position;
  float scale = 1.0 + uProgress * 3.0;
  pos.xz *= scale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
