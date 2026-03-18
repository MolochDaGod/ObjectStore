// Grudge Studio — Lightning Vertex Shader
// High-frequency sine wave displacement for jagged bolt appearance

varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;
  float wave = sin(uTime * 20.0 + position.y * 10.0) * 0.1;
  pos.x += wave * (1.0 - vUv.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
