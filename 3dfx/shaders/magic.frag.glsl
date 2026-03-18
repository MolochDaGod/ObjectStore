// Grudge Studio — Magic Fragment Shader
// Spiral glow pattern with radial falloff for arcane spell rendering

varying vec2 vUv;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

void main() {
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vUv, center);

  float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
  float spiral = sin(angle * 5.0 - uTime * 3.0 + dist * 10.0);
  spiral = smoothstep(0.0, 1.0, spiral);

  float glow = 1.0 - dist;
  glow = pow(glow, 2.0);

  vec3 color = mix(uColor2, uColor1, spiral * glow);
  float alpha = glow * 1.5;

  gl_FragColor = vec4(color, alpha);
}
