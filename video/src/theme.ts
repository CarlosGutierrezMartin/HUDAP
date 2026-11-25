import { loadFont } from '@remotion/google-fonts/PlusJakartaSans';
import { Easing } from 'remotion';

const { fontFamily } = loadFont('normal', { weights: ['300', '400', '500', '700'], subsets: ['latin', 'latin-ext'] });

/** Same tokens as the website (src/styles.css). */
export const C = {
  bg: '#0c0c0d',
  ink: '#ece9e2',
  ink2: '#a9a6a0',
  ink3: '#6f6d69',
  hair: 'rgba(236, 233, 226, 0.12)',
  hair2: 'rgba(236, 233, 226, 0.22)',
  signal: '#e2584a',
};

export const FONT = fontFamily;

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_EXIT = Easing.bezier(0.4, 0, 1, 1);

/** Safe area for a 1080 px wide frame. */
export const PAD_X = 96;
export const PAD_Y = 110;
