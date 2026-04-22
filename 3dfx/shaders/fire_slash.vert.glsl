// fire_slash.vert.glsl — Spline trail / slash plane deformation
varying vec2 vUv;
varying float vAlpha;
varying float vHeat;
uniform float uTime;
uniform float uArcAngle;  // sweep progress 0..1

void main() {
  vUv = uv;
  vec3 pos = position;

  // Turbulent warp along the slash axis
  float wave  = sin(uTime * 14.0 + position.x * 8.0) * 0.06;
  float wave2 = cos(uTime *  9.0 + position.y * 5.0) * 0.04;
  pos.z += wave + wave2;

  // Leading edge brighter / fade tail
  vAlpha = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.55, vUv.x);

  // Heat band — hotter near centre of slash width
  vHeat = 1.0 - abs(vUv.y - 0.5) * 2.0;
  vHeat = pow(vHeat, 1.5);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
