import React from 'react';
import { C } from '../theme';
import { Bottom, Headline, Reveal } from '../ui';

export const Intro: React.FC = () => (
  <Bottom gap={30}>
    <Reveal name="Headline" at={40}>
      <Headline size={92}>Every organ leaves a data trail.</Headline>
    </Reveal>
    <Reveal name="Subtitle" at={64}>
      <div style={{ fontSize: 44, lineHeight: 1.3, color: C.ink2, maxWidth: 860, textWrap: 'pretty' }}>
        See what AI reads in it, and where wellness ends and medicine begins.
      </div>
    </Reveal>
  </Bottom>
);
