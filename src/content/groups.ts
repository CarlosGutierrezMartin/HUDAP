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

/** Display colours, shared by the shader (linear RGB is derived at runtime) and the UI. */
export const GROUP_COLOR: Record<keyof typeof GROUP, string> = {
  skin: '#9fd9ff',
  heart: '#ff4f6d',
  eyes: '#4ff0cf',
  brain: '#b49bff',
  lungs: '#5fb2ff',
  blood: '#ffb347',
};

export const ORGAN_ORDER: OrganKey[] = ['heart', 'eyes', 'brain', 'lungs', 'blood'];
