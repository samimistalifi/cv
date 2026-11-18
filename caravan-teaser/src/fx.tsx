import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {hits, look} from './config';
import {accent} from './theme';

/** Every frame where something "hits" (used for global flash + shake). */
export const ALL_HITS: {frame: number; power: number}[] = [
  ...hits.heartbeat.map((frame) => ({frame, power: 0.25})),
  {frame: hits.hookSlam, power: 1},
  ...hits.teaseLines.map((frame) => ({frame, power: 0.8})),
  ...hits.energyCuts.map((frame) => ({frame, power: 0.65})),
  {frame: hits.logoSlam, power: 1.2},
  {frame: hits.logoTitle, power: 0.35},
  {frame: hits.logoTagline, power: 0.25},
  {frame: hits.endSlam, power: 0.9},
];

/** 0..~1 impact envelope at a frame (fast attack, exponential decay). */
export const impactAt = (frame: number, decay = 4) =>
  ALL_HITS.reduce((m, h) => (frame >= h.frame ? Math.max(m, h.power * Math.exp(-(frame - h.frame) / decay)) : m), 0);

export const useShake = () => {
  const frame = useCurrentFrame();
  const amt = impactAt(frame, 3) * look.shake;
  return {
    x: random(`sx${frame}`) * 2 * amt - amt,
    y: random(`sy${frame}`) * 2 * amt - amt,
    r: (random(`sr${frame}`) - 0.5) * amt * 0.08,
  };
};

export const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const v = ALL_HITS.reduce(
    (m, h) => (frame >= h.frame && h.power >= 0.6 ? Math.max(m, h.power * Math.exp(-(frame - h.frame) / 2.2)) : m),
    0,
  );
  return <AbsoluteFill style={{background: '#fff', opacity: Math.min(look.flash, v * look.flash), mixBlendMode: 'screen'}} />;
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const id = `grain-${frame % 8}`;
  return (
    <AbsoluteFill style={{opacity: look.grain, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 8} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${look.vignette}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Diagonal light streaks that sweep across the frame. `burstAt` = frame (local) for a fast sweep. */
export const LightStreaks: React.FC<{count?: number; seed?: string; speed?: number; opacity?: number; angle?: number}> = ({
  count = 6,
  seed = 's',
  speed = 1,
  opacity = 0.35,
  angle = -24,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const diag = Math.hypot(width, height);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: width / 2 - diag / 2, top: height / 2 - diag / 2, width: diag, height: diag, transform: `rotate(${angle}deg)`}}>
        {new Array(count).fill(0).map((_, i) => {
          const r = (k: string) => random(`${seed}-${i}-${k}`);
          const period = 40 + r('p') * 60;
          const t = ((frame * speed + r('o') * period) % period) / period;
          const len = diag * (0.25 + r('l') * 0.45);
          const thick = 1 + r('t') * 5;
          const x = interpolate(t, [0, 1], [-len, diag + len]);
          const y = r('y') * diag;
          const tint = r('c') > 0.5 ? accent : '#ffffff';
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - len,
                top: y,
                width: len,
                height: thick,
                borderRadius: thick,
                background: `linear-gradient(90deg, transparent, ${tint} 70%, #fff)`,
                opacity: opacity * (0.4 + r('a') * 0.6),
                filter: `blur(${thick > 4 ? 2 : 0.5}px)`,
                boxShadow: `0 0 ${thick * 6}px ${tint}`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Spark burst from (x,y) starting at local frame `at`. */
export const Sparks: React.FC<{at: number; x?: number; y?: number; count?: number; seed?: string; spread?: number; power?: number}> = ({
  at,
  x,
  y,
  count = 40,
  seed = 'sp',
  spread = 360,
  power = 1,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ox = x ?? width / 2;
  const oy = y ?? height / 2;
  const t = frame - at;
  if (t < 0 || t > 60) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const life = 18 + r('life') * 30;
        if (t > life) return null;
        const ang = ((-90 + (r('a') - 0.5) * spread) * Math.PI) / 180;
        const v = (14 + r('v') * 36) * power;
        const drag = Math.pow(0.9, t);
        const dist = (v * (1 - drag)) / 0.1;
        const px = ox + Math.cos(ang) * dist;
        const py = oy + Math.sin(ang) * dist + 0.35 * t * t * 0.5;
        const vx = Math.cos(ang) * v * drag;
        const vy = Math.sin(ang) * v * drag + 0.35 * t;
        const speed = Math.hypot(vx, vy);
        const rot = (Math.atan2(vy, vx) * 180) / Math.PI;
        const fade = 1 - t / life;
        const hot = r('c') > 0.35;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px,
              top: py,
              width: Math.max(3, speed * 1.6),
              height: 3,
              borderRadius: 3,
              transform: `translate(-50%,-50%) rotate(${rot}deg)`,
              background: hot ? '#fff6e0' : accent,
              boxShadow: `0 0 10px ${hot ? '#ffb347' : accent}`,
              opacity: fade,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Slow ambient embers drifting upward. */
export const Embers: React.FC<{count?: number}> = ({count = 26}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`emb-${i}-${k}`);
        const sp = 0.6 + r('s') * 1.8;
        const y = height - ((frame * sp + r('y') * height) % (height + 40));
        const x = r('x') * width + Math.sin(frame / (20 + r('w') * 20) + i) * 20;
        const s = 2 + r('z') * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: s,
              background: r('c') > 0.5 ? accent : '#ffd9a0',
              opacity: 0.15 + r('o') * 0.35,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Wraps a scene: slow push-in + whip in/out with directional blur. */
export const Camera: React.FC<{
  duration: number;
  whipIn?: boolean;
  whipOut?: boolean;
  children: React.ReactNode;
}> = ({duration, whipIn, whipOut, children}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const push = 1 + look.pushIn * (frame / duration);
  const W = 6; // whip length in frames
  let tx = 0;
  let blur = 0;
  if (whipIn && frame < W) {
    const p = 1 - frame / W;
    tx = width * 0.6 * p * p;
    blur = 60 * p;
  }
  if (whipOut && frame > duration - W) {
    const p = (frame - (duration - W)) / W;
    tx = -width * 0.6 * p * p;
    blur = 60 * p;
  }
  const id = `whip-${Math.round(blur)}`;
  return (
    <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${push})`, filter: blur > 0.5 ? `url(#${id})` : undefined}}>
      {blur > 0.5 ? (
        <svg width="0" height="0" style={{position: 'absolute'}}>
          <filter id={id} x="-20%" y="0" width="140%" height="100%">
            <feGaussianBlur stdDeviation={`${blur} 0`} />
          </filter>
        </svg>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};
