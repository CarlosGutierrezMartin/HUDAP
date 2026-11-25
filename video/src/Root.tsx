import React from 'react';
import { Composition, Folder } from 'remotion';
import { HudapVideo } from './HudapVideo';
import { Brain } from './scenes/Brain';
import { Heart } from './scenes/Heart';
import { Intro } from './scenes/Intro';
import { Line } from './scenes/Line';
import { Notice } from './scenes/Notice';
import { Blood, Eyes, Lungs } from './scenes/OrganFigure';
import { Outro } from './scenes/Outro';
import { FPS, HEIGHT, sceneFrames, TOTAL_FRAMES, WIDTH } from './timeline';

const common = { fps: FPS, width: WIDTH, height: HEIGHT } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HudapLinkedIn" component={HudapVideo} durationInFrames={TOTAL_FRAMES} {...common} />
    <Folder name="Scenes">
      <Composition id="Intro" component={Intro} durationInFrames={sceneFrames('Intro')} {...common} />
      <Composition id="Heart" component={Heart} durationInFrames={sceneFrames('Heart')} {...common} />
      <Composition id="Eyes" component={Eyes} durationInFrames={sceneFrames('Eyes')} {...common} />
      <Composition id="Brain" component={Brain} durationInFrames={sceneFrames('Brain')} {...common} />
      <Composition id="Lungs" component={Lungs} durationInFrames={sceneFrames('Lungs')} {...common} />
      <Composition id="Blood" component={Blood} durationInFrames={sceneFrames('Blood')} {...common} />
      <Composition id="Line" component={Line} durationInFrames={sceneFrames('Line')} {...common} />
      <Composition id="Notice" component={Notice} durationInFrames={sceneFrames('Notice')} {...common} />
      <Composition id="Outro" component={Outro} durationInFrames={sceneFrames('Outro')} {...common} />
    </Folder>
  </>
);
