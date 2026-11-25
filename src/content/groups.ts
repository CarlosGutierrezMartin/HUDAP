export const GROUP = {
  skin: 0,
  heart: 1,
  eyes: 2,
  brain: 3,
  lungs: 4,
  blood: 5,
} as const;

export type GroupId = (typeof GROUP)[keyof typeof GROUP];
export type OrganKey = Exclude<keyof typeof GROUP, 'skin'>;

/**
 * Particle colours. The figure is monochrome bone; only the heart carries the signal colour,
 * and organs are told apart by density and light rather than hue.
 */
export const GROUP_COLOR: Record<keyof typeof GROUP, string> = {
  // Skin is a dim warm graphite so the organs read as the light sources.
  // Organs differ by luminance and a barely-there temperature shift, never by hue.
  skin: '#8a857d',
  heart: '#e2584a',
  eyes: '#e6e2d9',
  brain: '#d8cfc0',
  lungs: '#b2b8bd',
  blood: '#c2b49c',
};

export const ORGAN_ORDER: OrganKey[] = ['heart', 'eyes', 'brain', 'lungs', 'blood'];
