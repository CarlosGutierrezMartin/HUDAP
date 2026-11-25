import type { OrganKey } from './body/groups';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1350;

/** Scene order and length in frames. The body layer and the text layer both read this. */
export const SCENES = [
  { id: 'Intro', frames: 165, focus: null },
  { id: 'Heart', frames: 270, focus: 'heart' },
  { id: 'Eyes', frames: 165, focus: 'eyes' },
  { id: 'Brain', frames: 165, focus: 'brain' },
  { id: 'Lungs', frames: 165, focus: 'lungs' },
  { id: 'Blood', frames: 165, focus: 'blood' },
  { id: 'Line', frames: 195, focus: null },
  { id: 'Notice', frames: 165, focus: 'heart' },
  { id: 'Outro', frames: 180, focus: null },
] as const satisfies readonly { id: string; frames: number; focus: OrganKey | null }[];

export type SceneId = (typeof SCENES)[number]['id'];

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.frames, 0);

export const sceneStart = (id: SceneId) => {
  let f = 0;
  for (const s of SCENES) {
    if (s.id === id) return f;
    f += s.frames;
  }
  throw new Error(`Unknown scene ${id}`);
};

export const sceneFrames = (id: SceneId) => SCENES.find((s) => s.id === id)!.frames;
