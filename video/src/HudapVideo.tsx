import React from 'react';
import { AbsoluteFill, interpolate, Series, useCurrentFrame } from 'remotion';
import { BodyLayer } from './BodyLayer';
import { Brain } from './scenes/Brain';
import { Heart } from './scenes/Heart';
import { Intro } from './scenes/Intro';
import { Line } from './scenes/Line';
import { Notice } from './scenes/Notice';
import { Blood, Eyes, Lungs } from './scenes/OrganFigure';
import { Outro } from './scenes/Outro';
import { C, EASE, FONT, PAD_X } from './theme';
import { sceneFrames, sceneStart } from './timeline';

/** Persistent brand, as in the site's top bar. */
const TopBar: React.FC = () => {
  const frame = useCurrentFrame();
  const outro = sceneStart('Outro');
  return (
    <div
      style={{
        position: 'absolute', top: 72, left: PAD_X, right: PAD_X,
        display: 'flex', alignItems: 'center', gap: 20,
        fontFamily: FONT, fontSize: 24, color: C.ink,
        opacity:
          interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE }) *
          // The outro shows the wordmark large, so the small one steps aside.
          interpolate(frame, [outro, outro + 12], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}
    >
      <span style={{ fontWeight: 700, letterSpacing: '0.22em' }}>HUDAP</span>
      <span style={{ width: 36, height: 1, background: C.hair2 }} />
      <span style={{ color: C.ink3 }}>Human Data Platform</span>
    </div>
  );
};

export const HudapVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <AbsoluteFill style={{ background: 'radial-gradient(52% 40% at 50% 32%, rgba(236,233,226,0.05), transparent 72%)' }} />
    <BodyLayer />
    {/* Scrim so text below the body always reads. */}
    <AbsoluteFill style={{ background: `linear-gradient(to bottom, transparent 46%, ${C.bg}d9 66%, ${C.bg} 86%)` }} />
    <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${C.bg} 0%, ${C.bg}b3 9%, transparent 20%)` }} />
    <TopBar />
    <Series>
      <Series.Sequence name="Intro" durationInFrames={sceneFrames('Intro')}>
        <Intro />
      </Series.Sequence>
      <Series.Sequence name="Heart" durationInFrames={sceneFrames('Heart')}>
        <Heart />
      </Series.Sequence>
      <Series.Sequence name="Eyes" durationInFrames={sceneFrames('Eyes')}>
        <Eyes />
      </Series.Sequence>
      <Series.Sequence name="Brain" durationInFrames={sceneFrames('Brain')}>
        <Brain />
      </Series.Sequence>
      <Series.Sequence name="Lungs" durationInFrames={sceneFrames('Lungs')}>
        <Lungs />
      </Series.Sequence>
      <Series.Sequence name="Blood" durationInFrames={sceneFrames('Blood')}>
        <Blood />
      </Series.Sequence>
      <Series.Sequence name="Line" durationInFrames={sceneFrames('Line')}>
        <Line />
      </Series.Sequence>
      <Series.Sequence name="Notice" durationInFrames={sceneFrames('Notice')}>
        <Notice />
      </Series.Sequence>
      <Series.Sequence name="Outro" durationInFrames={sceneFrames('Outro')}>
        <Outro />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
