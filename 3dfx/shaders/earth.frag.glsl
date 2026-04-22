// earth.frag.glsl — layered rock with dirt base, stone mid, bright crack glow
varying vec2  vUv;
varying vec3  vWorldNormal;
varying float vHeight;
uniform float uTime;
uniform vec3  uColor1;   // #886644 dirt/rock
uniform vec3  uColor2;   // #ccaa66 lighter stone
uniform float uIntensity;

float hash(vec2 p) { return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }

float voronoi(vec2 p) {
  vec2  g = floor(p);
  float d = 1.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 b = g + vec2(x, y);
    vec2 r = b + vec2(hash(b), hash(b.yx)) - p;
    d = min(d, dot(r, r));
  }
  return sqrt(d);
}

void main() {
  // Rocky surface using voronoi cells (stone fracture pattern)
  float rock  = voronoi(vUv * 8.0);
  float rock2 = voronoi(vUv * 14.0 + vec2(3.7, 1.1));

  // Height-based colour — darker at base, lighter at tip
  float hfac = clamp(vHeight / 4.0, 0.0, 1.0);
  vec3  c    = mix(uColor1 * 0.6, uColor2, hfac);
  c          = mix(c, uColor2 * 1.3, rock * 0.3);
  c          = mix(c, uColor1 * 0.4, rock2 * 0.25);

  // Glowing crack lines — energy seeping through fractures
  float crack = 1.0 - smoothstep(0.0, 0.12, rock);
  vec3  glow  = mix(vec3(1.0, 0.7, 0.3), uColor2 * 2.0, hfac);
  c          += glow * crack * 0.8 * uIntensity;

  // Rim highlight (top edges catch light)
  float rim = max(dot(vWorldNormal, normalize(vec3(0.3, 1.0, 0.5))), 0.0);
  c        += uColor2 * pow(rim, 4.0) * 0.6;

  gl_FragColor = vec4(c, 1.0);
}
