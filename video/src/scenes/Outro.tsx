import React from 'react';
import { C } from '../theme';
import { Bottom, Reveal } from '../ui';

export const Outro: React.FC = () => (
  <Bottom gap={0}>
    <Reveal name="Wordmark" at={20}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <span style={{ fontSize: 64, fontWeight: 700, letterSpacing: '0.22em' }}>HUDAP</span>
        <span style={{ width: 56, height: 1, background: C.hair2 }} />
        <span style={{ fontSize: 40, color: C.ink2 }}>Human Data Platform</span>
      </div>
    </Reveal>
    <Reveal name="Claim" at={38} style={{ marginTop: 30 }}>
      <div style={{ fontSize: 44, lineHeight: 1.3, color: C.ink, maxWidth: 880 }}>Five organs. Every figure linked to its source.</div>
    </Reveal>
    <Reveal name="URL" at={54} style={{ marginTop: 48, paddingTop: 26, borderTop: `1px solid ${C.hair2}` }}>
      <div style={{ fontSize: 36, color: C.ink2, letterSpacing: '0.005em' }}>carlosgutierrezmartin.github.io/HUDAP</div>
    </Reveal>
  </Bottom>
);
