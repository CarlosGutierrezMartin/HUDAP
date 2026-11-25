import React from 'react';
import { C } from '../theme';
import { Bottom, Headline, Reveal } from '../ui';

const ROWS = [
  { name: 'Wellness wearable', help: 'Everyday data. Not authorised to screen, diagnose or monitor disease.' },
  { name: 'Authorised wearable', help: 'Cleared by a regulator for one defined medical purpose.' },
  { name: 'Clinical device', help: 'Measured in a clinical setting and read by a professional.' },
];

/** The three origins every signal on the site is tagged with. */
export const Line: React.FC = () => (
  <Bottom gap={0}>
    <Reveal name="Headline" at={12} style={{ marginBottom: 40 }}>
      <Headline size={72}>Where wellness ends and medicine begins.</Headline>
    </Reveal>
    {ROWS.map((r, i) => (
      <Reveal key={r.name} name={r.name} at={40 + i * 16}>
        <div style={{ borderTop: `1px solid ${C.hair2}`, padding: '20px 0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 38, fontWeight: 500 }}>{r.name}</div>
          <div style={{ fontSize: 30, lineHeight: 1.3, color: C.ink2 }}>{r.help}</div>
        </div>
      </Reveal>
    ))}
  </Bottom>
);
