import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { ecgValue } from '../body/ecg';
import { C, FONT, PAD_X } from '../theme';
import { Bottom, CountUp, Figure, Label, OrganRow, Reveal, SourceLine } from '../ui';

const SWAP = 132; // frame where the second figure replaces the first

/** Synthetic sinus-rhythm trace, the same model the site draws. Labelled as illustrative. */
const EcgStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const w = width - PAD_X * 2;
  const h = 110;
  const windowS = 3;
  const t = frame / fps;
  const n = 360;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * w;
    const ts = t - windowS + (i / n) * windowS;
    const y = h * 0.72 - ecgValue(Math.max(0, ts)) * h * 0.62;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return (
    <div style={{ width: w, fontFamily: FONT, position: 'relative' }}>
      <div style={{ position: 'absolute', right: 0, bottom: -30, fontSize: 22, color: C.ink3 }}>Illustrative waveform</div>
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="fade" x1="0" x2="1">
            <stop offset="0" stopColor={C.signal} stopOpacity="0" />
            <stop offset="0.35" stopColor={C.signal} stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#fade)" strokeWidth={3} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const Heart: React.FC = () => {
  return (
    <>
      <Reveal name="ECG" at={20} style={{ position: 'absolute', top: 150, left: PAD_X }}>
        <EcgStrip />
      </Reveal>
      <Bottom>
        <Reveal name="Organ" at={14}>
          <OrganRow n="01" name="Heart" status="Atrial fibrillation screening" />
        </Reveal>
        <div style={{ display: 'grid' }}>
          <div style={{ gridArea: '1 / 1', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Reveal name="Figure A" at={34} until={SWAP}>
              <Figure>
                <CountUp to={419297} at={34} dur={48} />
              </Figure>
            </Reveal>
            <Reveal name="Label A" at={46} until={SWAP}>
              <Label>people enrolled remotely in the Apple Heart Study of a smartwatch pulse check</Label>
            </Reveal>
          </div>
          <div style={{ gridArea: '1 / 1', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Reveal name="Figure B" at={SWAP + 6}>
              <Figure>
                <CountUp to={0.84} decimals={2} at={SWAP + 6} dur={36} />
              </Figure>
            </Reveal>
            <Reveal name="Label B" at={SWAP + 16}>
              <Label>positive predictive value of an irregular pulse notification, checked against an ECG patch</Label>
            </Reveal>
          </div>
        </div>
        <Reveal name="Source" at={56}>
          <SourceLine>Perez et al., N Engl J Med, 2019</SourceLine>
        </Reveal>
      </Bottom>
    </>
  );
};
