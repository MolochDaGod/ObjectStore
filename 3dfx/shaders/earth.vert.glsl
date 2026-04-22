// earth.vert.glsl — rocky spire eruption with crumbling vertex displacement
varying vec2  vUv;
varying vec3  vWorldNormal;
varying float vHeight;
uniform float uTime;
uniform float uGrowth;  // 0..1

float hash3(vec3 p) {
  return fract(sin(dot(p, vec3(17.3, 41.7, 93.1))) * 43758.5453);
}

void main() {
  vUv          = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vHeight      = position.y;

  vec3 pos = position;

  // Rise animation — scale Y from ground
  pos.y *= uGrowth;

  // Jagged surface crumbling noise
  float n = hash3(floor(position * 4.0));
  float t = sin(uTime * 2.0 + n * 6.28) * 0.5 + 0.5;
  pos += normal * n * 0.06 * t;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
