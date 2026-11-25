// Copied from ../../src/scene/particleMaterial.ts, with a uFocusAmt uniform so focus can fade in a video.
import * as THREE from 'three';
import { GROUP_COLOR } from './groups';
import { ANCHORS } from './bodyGeometry';

const vertex = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aGroup;
  attribute vec3 aRand;
  attribute float aFlow;

  uniform float uTime;
  uniform float uIntro;
  uniform float uMotion;
  uniform float uBeat;
  uniform float uBreath;
  uniform float uFocus;
  uniform float uFocusAmt;
  uniform float uHover;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uMaxSize;
  uniform vec3 uColors[6];
  uniform vec3 uHeart;
  uniform vec3 uLungs;

  varying vec3 vColor;
  varying float vAlpha;

  float isGroup(float g, float target) { return 1.0 - step(0.5, abs(g - target)); }

  void main() {
    vec3 p = position;
    float g = aGroup;

    // Physiological motion: heart contraction and breathing.
    float heart = isGroup(g, 1.0);
    float lungs = isGroup(g, 4.0);
    float skin = isGroup(g, 0.0);
    p = mix(p, uHeart + (p - uHeart) * (1.0 + 0.09 * uBeat), heart * uMotion);
    p = mix(p, uLungs + (p - uLungs) * vec3(1.0 + 0.05 * uBreath, 1.0 + 0.03 * uBreath, 1.0 + 0.06 * uBreath), lungs * uMotion);
    // Chest wall rises slightly with breathing.
    float chest = skin * smoothstep(1.05, 1.25, p.y) * (1.0 - smoothstep(1.42, 1.5, p.y)) * step(0.0, p.z);
    p.z += chest * 0.006 * uBreath * uMotion;

    // Ambient drift.
    vec3 ph = aRand * 6.2831;
    p += uMotion * 0.0035 * vec3(sin(uTime * 0.7 + ph.x), sin(uTime * 0.55 + ph.y), cos(uTime * 0.6 + ph.z));

    // Intro assembly with a per-particle delay.
    float d = aRand.x * 0.45;
    float k = clamp((uIntro - d) / 0.55, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    p = mix(aScatter, p, k);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // Emphasis: focused or hovered group lights up, the rest recedes.
    float focused = isGroup(g, uFocus);
    float hovered = isGroup(g, uHover);
    float hasFocus = step(0.0, uFocus) * uFocusAmt;
    float emphasis = max(focused * uFocusAmt, hovered * 0.7);
    float recede = hasFocus * (1.0 - focused);

    float base = mix(1.0, 0.8, skin);
    float size = uSize * base * (1.0 + 0.25 * emphasis) * (0.75 + 0.5 * aRand.y);

    // Blood: pulses travelling along the vessels.
    float blood = isGroup(g, 5.0);
    float pulse = smoothstep(0.82, 1.0, fract(aFlow * 3.0 - uTime * 0.6 * uMotion));
    size *= 1.0 + blood * pulse * 0.9;

    // Clamp so close-ups stay crisp instead of blooming into solid blobs.
    gl_PointSize = min(size * uPixelRatio * (1.0 / -mv.z), uMaxSize);

    vec3 col = uColors[int(g + 0.5)];
    float alpha = 0.4 * skin + 0.55 * heart + 0.32 * isGroup(g, 2.0) + 0.17 * isGroup(g, 3.0) + 0.22 * lungs + 0.42 * blood;
    // Fade dense organs as the camera approaches, so additive blending does not saturate.
    alpha *= mix(1.0, smoothstep(0.25, 1.6, -mv.z), 1.0 - skin);
    alpha *= 1.0 + mix(1.4, 0.5, heart) * emphasis + blood * pulse * 0.8 + heart * uBeat * 0.6 * uMotion;
    alpha *= mix(1.0, mix(0.16, 0.2, skin), recede);
    alpha *= k;
    vColor = col;
    vAlpha = alpha;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.2, r);
    float core = smoothstep(0.22, 0.0, r);
    vec3 col = vColor + core * 0.12;
    gl_FragColor = vec4(col, vAlpha * (soft * 0.7 + core * 0.4));
  }
`;

export function createParticleMaterial(): THREE.ShaderMaterial {
  const order = ['skin', 'heart', 'eyes', 'brain', 'lungs', 'blood'] as const;
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uMotion: { value: 1 },
      uBeat: { value: 0 },
      uBreath: { value: 0 },
      uFocus: { value: -1 },
      uFocusAmt: { value: 0 },
      uHover: { value: -1 },
      uPixelRatio: { value: 1 },
      uSize: { value: 19 },
      uMaxSize: { value: 8 },
      uColors: { value: order.map((k) => new THREE.Color(GROUP_COLOR[k])) },
      uHeart: { value: ANCHORS.heart.clone() },
      uLungs: { value: ANCHORS.lungs.clone() },
    },
  });
}
