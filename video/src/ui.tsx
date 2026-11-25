import React from 'react';
import { AbsoluteFill, Interactive, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, EASE_EXIT, FONT, PAD_X, PAD_Y } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/**
 * One orchestrated entrance per element: opacity and a short rise.
 * Exits are faster than entrances and happen together at the end of the scene.
 */
export const Reveal: React.FC<{
  name: string;
  at: number;
  until?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ name, at, until, children, style }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const end = until ?? durationInFrames;
  return (
    <Interactive.Div
      name={name}
      style={{
        opacity:
          interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: EASE }) *
          interpolate(frame, [end - 10, end], [1, 0], { ...clamp, easing: EASE_EXIT }),
        translate: interpolate(frame, [at, at + 22], ['0px 26px', '0px 0px'], { ...clamp, easing: EASE }),
        ...style,
      }}
    >
      {children}
    </Interactive.Div>
  );
};

/** Text block anchored to the bottom of the safe area. */
export const Bottom: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 26 }) => (
  <AbsoluteFill
    style={{
      fontFamily: FONT,
      color: C.ink,
      justifyContent: 'flex-end',
      padding: `${PAD_Y}px ${PAD_X}px`,
      gap,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Numbered organ row, as in the site's organ index. */
export const OrganRow: React.FC<{ n: string; name: string; status?: string }> = ({ n, name, status }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, paddingBottom: 20, borderBottom: `1px solid ${C.hair2}`, fontSize: 34 }}>
    <span style={{ color: C.ink3, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}>{n}</span>
    <span style={{ color: C.ink, fontWeight: 500 }}>{name}</span>
    {status ? <span style={{ marginLeft: 'auto', color: C.ink2, fontSize: 28 }}>{status}</span> : null}
  </div>
);

export const Figure: React.FC<{ children: React.ReactNode; unit?: string }> = ({ children, unit }) => (
  <div style={{ fontSize: 176, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.035em', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'baseline', gap: 18 }}>
    {children}
    {unit ? <span style={{ fontSize: 64, color: C.ink2, letterSpacing: '-0.01em' }}>{unit}</span> : null}
  </div>
);

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 42, lineHeight: 1.3, color: C.ink2, maxWidth: 860, textWrap: 'pretty' }}>{children}</div>
);

export const SourceLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 26, color: C.ink3, letterSpacing: '0.01em' }}>Source: {children}</div>
);

export const Headline: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 84 }) => (
  <div style={{ fontSize: size, fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.025em', maxWidth: 900, textWrap: 'balance' }}>{children}</div>
);

/**
 * Number that counts up to its value. Digits are tabular and the final string is
 * reserved invisibly, so the width never shifts while it counts.
 */
export const CountUp: React.FC<{ to: number; from?: number; at: number; dur?: number; decimals?: number; suffix?: string }> = ({
  to,
  from = 0,
  at,
  dur = 40,
  decimals = 0,
  suffix = '',
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + dur], [from, to], { ...clamp, easing: EASE });
  const fmt = (x: number) => x.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  return (
    <span style={{ display: 'inline-grid' }}>
      <span style={{ gridArea: '1 / 1', visibility: 'hidden' }}>{fmt(to)}</span>
      <span style={{ gridArea: '1 / 1', textAlign: 'left' }}>{fmt(v)}</span>
    </span>
  );
};
