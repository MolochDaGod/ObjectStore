// Grudge Studio — Fire Vertex Shader
// Displaces vertices over time to simulate flickering flame motion

varying vec2 vUv;
varying float vTime;
uniform float uTime;

void main() {
  vUv = uv;
  vTime = uTime;
  vec3 pos = position;
  pos.y += sin(uTime * 3.0 + position.x * 5.0) * 0.1;
  pos.x += cos(uTime * 2.0 + position.y * 4.0) * 0.05;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
