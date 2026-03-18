// Grudge Studio — Magic Vertex Shader
// Spiral displacement based on angular position for arcane circle effects

varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;
  float spiral = sin(uTime * 2.0 + atan(position.x, position.z) * 3.0) * 0.1;
  pos.y += spiral;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
