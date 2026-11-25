import React from 'react';
import { C } from '../theme';
import { Bottom, Headline, OrganRow, Reveal, SourceLine } from '../ui';

export const Brain: React.FC = () => (
  <Bottom>
    <Reveal name="Organ" at={14}>
      <OrganRow n="03" name="Brain" status="FDA De Novo, 2018" />
    </Reveal>
    <Reveal name="Headline" at={30}>
      <Headline size={64}>AI spots a suspected blocked artery on a CT scan and alerts the stroke specialist.</Headline>
    </Reveal>
    <Reveal name="Label" at={48}>
      <div style={{ fontSize: 42, lineHeight: 1.3, color: C.ink2 }}>Triage, not diagnosis: the specialist makes the call.</div>
    </Reveal>
    <Reveal name="Source" at={58}>
      <SourceLine>U.S. Food and Drug Administration</SourceLine>
    </Reveal>
  </Bottom>
);
