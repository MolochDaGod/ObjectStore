// Grudge Studio — Lightning Fragment Shader
// Center-distance glow with rapid flicker for electric appearance

varying vec2 vUv;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

void main() {
  float centerDist = abs(vUv.x - 0.5) * 2.0;
  float glow = 1.0 - pow(centerDist, 0.5);
  glow *= 1.0 - vUv.y * 0.3;

  float flicker = 0.8 + 0.2 * sin(uTime * 50.0);
  glow *= flicker;

  vec3 color = mix(uColor2, uColor1, glow);
  float alpha = glow * 1.5;

  gl_FragColor = vec4(color, alpha);
}
