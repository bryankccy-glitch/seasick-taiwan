export const oceanVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uWaveHeight;
  uniform float uTurbulence;
  uniform vec2 uWind;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uScroll;
  uniform float uTransition;
  uniform float uDpr;
  uniform vec4 uRipples[RIPPLE_COUNT];
  varying float vHeight;
  varying float vDepth;
  varying float vEdge;
  varying float vInteraction;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), f.x),
               mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), f.x), f.y);
  }
  void main() {
    vec3 p = position;
    vec2 water = p.xz;
    float t = uPhase;
    float along = dot(water, uWind);
    float across = dot(water, vec2(-uWind.y, uWind.x));
    float swell = sin(along * .28 + t * .90) * .44;
    swell += sin(across * .42 - t * .67 + .8) * .24;
    swell += sin((water.x + water.y) * .19 + t * .46) * .20;
    float n = noise(water * .12 + vec2(t * .06, -t * .04)) - .5;
    #ifndef LOW_QUALITY
      n += (noise(water * .36 + n * 1.4 - t * .09) - .5) * .42;
      swell += sin(along * .85 + n * 2.4 + t * .92) * .06;
    #endif
    float base = (swell + n * uTurbulence * 1.8) * uWaveHeight * 2.15;
    float d = distance(water, uPointer);
    float interaction = -exp(-d * d * .32) * .22 * uPointerStrength;
    for (int i = 0; i < RIPPLE_COUNT; i++) {
      vec4 ripple = uRipples[i];
      float age = uTime - ripple.z;
      float radius = distance(water, ripple.xy);
      float front = radius - age * 5.2;
      float envelope = exp(-front * front * .9) * exp(-age * 2.1);
      float rippleVisible = step(0., age) * (1. - step(1.7, age));
      interaction += sin(front * 4.2) * envelope * ripple.w * .72 * rippleVisible;
    }
    p.y = (base + interaction) * (1. - uScroll * .7);
    p.y += sin(along * .24 - t) * uTransition * .18;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(76.0 / max(8., -mv.z), 1.8, 3.2) * uDpr;
    vHeight = base / max(.2, uWaveHeight);
    vDepth = -mv.z;
    vEdge = (1. - smoothstep(18., 24., abs(p.x))) *
            (1. - smoothstep(19., 25., abs(p.z + 6.)));
    vInteraction = min(.38, abs(interaction) * 1.4);
  }
`;

export const oceanFragmentShader = /* glsl */ `
  uniform float uRisk;
  uniform float uScroll;
  varying float vHeight;
  varying float vDepth;
  varying float vEdge;
  varying float vInteraction;
  void main() {
    // A tiny antialiased horizontal dash, without glow or a point texture.
    vec2 q = gl_PointCoord - .5;
    float dash = 1. - smoothstep(.30, .50, length(q * vec2(1., 1.65)));
    float crest = smoothstep(-.55, .65, vHeight);
    vec3 trough = vec3(.30, .56, .59);
    vec3 peak = mix(vec3(.72, .92, .85), vec3(.74, .86, .81), uRisk / 100.);
    vec3 color = mix(trough, peak, crest);
    float fog = 1. - smoothstep(32., 78., vDepth);
    float alpha = dash * vEdge * fog * min(.96, .66 + crest * .30 + vInteraction);
    gl_FragColor = vec4(color, alpha * (1. - uScroll));
  }
`;
