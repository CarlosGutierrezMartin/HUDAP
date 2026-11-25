import React from 'react';
import { CountUp, Bottom, Figure, Label, OrganRow, Reveal, SourceLine } from '../ui';

export interface OrganFigureProps {
  n: string;
  name: string;
  status: string;
  value: number;
  decimals?: number;
  suffix?: string;
  unit?: string;
  label: string;
  source: string;
}

/** One organ, one figure, one source. */
export const OrganFigure: React.FC<OrganFigureProps> = ({ n, name, status, value, decimals, suffix, unit, label, source }) => (
  <Bottom>
    <Reveal name="Organ" at={14}>
      <OrganRow n={n} name={name} status={status} />
    </Reveal>
    <Reveal name="Figure" at={30}>
      <Figure unit={unit}>
        <CountUp to={value} decimals={decimals} suffix={suffix} at={30} dur={40} />
      </Figure>
    </Reveal>
    <Reveal name="Label" at={42}>
      <Label>{label}</Label>
    </Reveal>
    <Reveal name="Source" at={52}>
      <SourceLine>{source}</SourceLine>
    </Reveal>
  </Bottom>
);

export const Eyes: React.FC = () => (
  <OrganFigure
    n="02"
    name="Eyes"
    status="FDA-authorised, 2018"
    value={87.4}
    decimals={1}
    suffix="%"
    label="sensitivity of autonomous AI for more-than-mild diabetic retinopathy, with no specialist reading the image"
    source="ACP Diabetes Monthly, 2018"
  />
);

export const Lungs: React.FC = () => (
  <OrganFigure
    n="04"
    name="Lungs and sleep"
    status="Imaging AI"
    value={1000}
    suffix="+"
    label="of about 1,250 FDA-authorised clinical AI algorithms work on medical images (mid-2025 count)"
    source="Cardiovascular Business, 2025"
  />
);

export const Blood: React.FC = () => (
  <OrganFigure
    n="05"
    name="Blood and metabolism"
    status="FDA cleared, 2024"
    value={15}
    unit="min"
    label="between readings from the first continuous glucose monitor sold without a prescription"
    source="U.S. Food and Drug Administration"
  />
);
