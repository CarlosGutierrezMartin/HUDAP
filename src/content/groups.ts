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
  skin: '#bdb8ae',
  heart: '#e2584a',
  eyes: '#f4f1ea',
  brain: '#e8e4dc',
  lungs: '#d9d5cc',
  blood: '#cfc6b6',
};

export const ORGAN_ORDER: OrganKey[] = ['heart', 'eyes', 'brain', 'lungs', 'blood'];
