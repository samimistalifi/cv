import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lang} from './config';
import {accent, fontsReady, toPersianDigits, typeface} from './theme';

export type Ctx = {lang: Lang; u: number; safe: {top: number; bottom: number; side: number}};
export const LayoutContext = React.createContext<Ctx>({lang: 'en', u: 1, safe: {top: 0, bottom: 0, side: 0}});
export const useLayout = () => React.useContext(LayoutContext);

/** Content area that respects the platform safe zones. */
export const Safe: React.FC<{children: React.ReactNode; gap?: number; style?: React.CSSProperties}> = ({children, gap = 0, style}) => {
  const {safe} = useLayout();
  return (
    <AbsoluteFill
      style={{
        top: safe.top,
        bottom: safe.bottom,
        left: safe.side,
        right: safe.side,
        width: 'auto',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Renders "[word]" in the accent colour. Never splits inside a word (keeps Persian letters joined). */
export const Rich: React.FC<{text: string; glow?: boolean}> = ({text, glow = true}) => {
  const {lang} = useLayout();
  const t = lang === 'fa' ? toPersianDigits(text) : text;
  const parts = t.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('[') ? (
          <span key={i} style={{color: accent, textShadow: glow ? `0 0 40px ${accent}88, 0 0 12px ${accent}66` : undefined}}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

/** Scales its content down (never up) so it fits `maxWidth`. Measures after fonts load. */
export const Fit: React.FC<{maxWidth: number; children: React.ReactNode}> = ({maxWidth, children}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [handle] = useState(() => delayRender('fit-text'));
  useLayoutEffect(() => {
    let done = false;
    const release = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    fontsReady.then(() => document.fonts.ready).then(() => {
      if (done) return;
      const w = ref.current?.scrollWidth ?? 0;
      setScale(w > maxWidth ? maxWidth / w : 1);
      release();
    });
    return release;
  }, [maxWidth, handle]);
  return (
    <div style={{transform: `scale(${scale})`, transformOrigin: 'center center', display: 'flex', justifyContent: 'center'}}>
      <div ref={ref} style={{whiteSpace: 'nowrap', width: 'max-content'}}>
        {children}
      </div>
    </div>
  );
};

/** Big display text, one block per "\n" line, each line fitted to the safe width. */
export const Display: React.FC<{text: string; size: number; lineHeight?: number; style?: React.CSSProperties}> = ({
  text,
  size,
  lineHeight,
  style,
}) => {
  const {lang, u, safe} = useLayout();
  const {width} = useVideoConfig();
  const tf = typeface(lang);
  const maxW = width - safe.side * 2;
  return (
    <div
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      lang={lang}
      style={{
        fontFamily: tf.display,
        fontWeight: tf.displayWeight,
        fontSize: size * u,
        lineHeight: lineHeight ?? (lang === 'fa' ? 1.45 : 0.98),
        color: '#fff',
        textAlign: 'center',
        letterSpacing: lang === 'fa' ? 0 : '0.01em', // never letter-space Persian (breaks joining)
        textTransform: lang === 'fa' ? 'none' : 'uppercase',
        ...style,
      }}
    >
      {text.split('\n').map((line, i) => (
        <Fit key={i} maxWidth={maxW}>
          <Rich text={line} />
        </Fit>
      ))}
    </div>
  );
};

/** Slam-in: scale down from big with a stiff spring, motion blur on entry. */
export const Slam: React.FC<{at: number; children: React.ReactNode; from?: number; until?: number; style?: React.CSSProperties}> = ({
  at,
  children,
  from = 1.9,
  until,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (until !== undefined && frame >= until) return null;
  if (frame < at) return <div style={{opacity: 0, ...style}}>{children}</div>;
  const s = spring({frame: frame - at, fps, config: {damping: 13, stiffness: 260, mass: 0.7}});
  const scale = interpolate(s, [0, 1], [from, 1]);
  const blur = interpolate(frame - at, [0, 5], [14, 0], {extrapolateRight: 'clamp'});
  const opacity = interpolate(frame - at, [0, 2], [0, 1], {extrapolateRight: 'clamp'});
  return <div style={{transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity, ...style}}>{children}</div>;
};

/** Soft rise-in for secondary text. */
export const Rise: React.FC<{at: number; children: React.ReactNode; distance?: number; style?: React.CSSProperties}> = ({
  at,
  children,
  distance = 40,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {u} = useLayout();
  const s = spring({frame: frame - at, fps, config: {damping: 18, stiffness: 140}});
  if (frame < at) return <div style={{opacity: 0, ...style}}>{children}</div>;
  return (
    <div style={{transform: `translateY(${(1 - s) * distance * u}px)`, opacity: Math.min(1, s * 1.4), filter: s < 0.6 ? `blur(${(0.6 - s) * 12}px)` : undefined, ...style}}>
      {children}
    </div>
  );
};
