/**
 * Synthetic ECG-like waveform (sum of Gaussians for P, Q, R, S and T waves).
 * It is an illustration of a normal sinus rhythm shape, NOT a recorded signal,
 * and the UI labels it as such.
 */
export const HEART_RATE_BPM = 64;
const PERIOD = 60 / HEART_RATE_BPM;

const WAVES = [
  { a: 0.11, mu: 0.18, s: 0.025 }, // P
  { a: -0.12, mu: 0.355, s: 0.009 }, // Q
  { a: 1.0, mu: 0.38, s: 0.011 }, // R
  { a: -0.22, mu: 0.405, s: 0.01 }, // S
  { a: 0.3, mu: 0.62, s: 0.045 }, // T
];

export function ecgPhase(tSeconds: number): number {
  return (tSeconds % PERIOD) / PERIOD;
}

export function ecgValue(tSeconds: number): number {
  const p = ecgPhase(tSeconds);
  let v = 0;
  for (const w of WAVES) {
    const d = (p - w.mu) / w.s;
    v += w.a * Math.exp(-0.5 * d * d);
  }
  return v;
}

/** Ventricular contraction envelope: peaks shortly after the R wave. */
export function contraction(tSeconds: number): number {
  const p = ecgPhase(tSeconds);
  const d = (p - 0.46) / 0.07;
  return Math.exp(-0.5 * d * d);
}

/** Breathing at ~14 breaths per minute, 0..1. */
export function breath(tSeconds: number): number {
  return 0.5 - 0.5 * Math.cos((tSeconds * 2 * Math.PI * 14) / 60);
}
