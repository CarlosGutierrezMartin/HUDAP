import React from 'react';
import { Bottom, CountUp, Figure, Headline, Label, Reveal, SourceLine } from '../ui';

export const Notice: React.FC = () => (
  <Bottom>
    <Reveal name="Headline" at={12}>
      <Headline size={76}>A notification is not a diagnosis.</Headline>
    </Reveal>
    <Reveal name="Figure" at={40}>
      <Figure>
        <CountUp to={18} suffix="%" at={40} dur={36} />
      </Figure>
    </Reveal>
    <Reveal name="Label" at={52}>
      <Label>of notified participants under 40 had atrial fibrillation on the follow-up ECG patch</Label>
    </Reveal>
    <Reveal name="Source" at={62}>
      <SourceLine>Perez et al., N Engl J Med, 2019</SourceLine>
    </Reveal>
  </Bottom>
);
