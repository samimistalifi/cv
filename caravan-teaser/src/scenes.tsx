import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Copy, FRAMES_PER_BEAT, footage, hits, scenes} from './config';
import {detected} from './generated/assets';
import {extracted} from './generated/brand';
import {Barbell, Plate} from './gym';
import {impactAt, LightStreaks, Sparks} from './fx';
import {accent, accentDeep, toPersianDigits, typeface} from './theme';
import {Display, Rich, Rise, Safe, Slam, useLayout} from './type';

/* ------------------------------------------------------------------ 0–2 s HOOK */
export const Hook: React.FC<{copy: Copy}> = ({copy}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const slam = hits.hookSlam - scenes.hook.from;
  const beat = impactAt(frame + scenes.hook.from, 5);
  const per = scenes.hook.duration / copy.hook.length;
  return (
    <AbsoluteFill>
      {/* heartbeat: a thin pulse line + glow on the black screen */}
      {frame < slam ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              width: width * (0.15 + beat * 1.2),
              height: 3,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              opacity: 0.25 + beat * 2.5,
              boxShadow: `0 0 30px ${accent}`,
            }}
          />
          <AbsoluteFill style={{background: `radial-gradient(circle at center, ${accent}${Math.round(Math.min(1, beat * 1.4) * 60).toString(16).padStart(2, '0')} 0%, transparent 45%)`}} />
        </AbsoluteFill>
      ) : (
        <>
          <LightStreaks count={5} seed="hook" opacity={0.25} />
          <Sparks at={slam} count={36} seed="hook-sp" />
        </>
      )}
      <Safe>
        {copy.hook.map((t, i) => (
          <Slam key={i} at={slam + i * per} until={i < copy.hook.length - 1 ? slam + (i + 1) * per : undefined} style={{position: i ? 'absolute' : 'relative'}}>
            <Display text={t} size={copy.lang === 'fa' ? 150 : 230} />
          </Slam>
        ))}
      </Safe>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 2–6 s TEASE */
export const Tease: React.FC<{copy: Copy}> = ({copy}) => {
  const frame = useCurrentFrame();
  const {u} = useLayout();
  const starts = copy.tease.map((_, i) => (hits.teaseLines[i] ?? hits.teaseLines[0] + i * 2 * FRAMES_PER_BEAT) - scenes.tease.from);
  const fa = copy.lang === 'fa';
  const bgShots = hasFootage() && footage.behindTease ? footage.teaseShots : [];
  return (
    <AbsoluteFill>
      {bgShots.map((shot, i) => {
        const from = i === 0 ? 0 : starts[i] ?? starts[0] + i * 40;
        const to = i < bgShots.length - 1 ? (starts[i + 1] ?? from + 40) : scenes.tease.duration;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} layout="none">
            <FootageShot shot={shot} len={to - from} overlay={footage.teaseOverlay} blur={2} seed={`t${i}`} />
          </Sequence>
        );
      })}
      <LightStreaks count={8} seed="tease" speed={2} opacity={0.3} />
      {/* accent glow kicks on every beat */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentDeep}55 0%, transparent 60%)`,
          opacity: 0.4 + impactAt(frame + scenes.tease.from, 6),
        }}
      />
      {starts.map((s, i) => (
        <Sparks key={i} at={s} count={24} seed={`tease-${i}`} power={0.8} />
      ))}
      {copy.teaseMode === 'replace' ? (
        <Safe>
          {copy.tease.map((t, i) => {
            const end = starts[i + 1];
            if (frame < starts[i] || (end !== undefined && frame >= end)) return null;
            const local = frame - starts[i];
            return (
              <AbsoluteFill key={i} style={{alignItems: 'center', justifyContent: 'center'}}>
                {/* outline echo behind the main word */}
                <div style={{position: 'absolute', transform: `scale(${1.25 + local * 0.006})`, opacity: 0.18}}>
                  <Display text={t.replace(/[[\]]/g, '')} size={fa ? 200 : 330} style={{color: 'transparent', WebkitTextStroke: `2px ${accent}`}} />
                </div>
                <Slam at={starts[i]} from={2.2}>
                  <div style={{transform: `scale(${1 + local * 0.0015})`}}>
                    <Display text={t} size={fa ? 200 : 330} />
                  </div>
                </Slam>
              </AbsoluteFill>
            );
          })}
        </Safe>
      ) : (
        <Safe gap={0}>
          {copy.tease.map((t, i) => (
            <Slam key={i} at={starts[i]} from={1.8}>
              <Display text={t} size={i === 1 ? 190 : 150} lineHeight={1.4} />
            </Slam>
          ))}
          <div style={{height: 6 * u}} />
        </Safe>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 6–10 s VISUAL ENERGY */
const ShotBarbell: React.FC<{len: number; lift?: boolean}> = ({len, lift}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const p = f / len;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <LightStreaks count={10} seed="bar" speed={3} opacity={0.4} angle={-12} />
      <div
        style={{
          transform: lift
            ? `translateY(${interpolate(p, [0, 1], [200, -40])}px) rotate(${interpolate(p, [0, 1], [-24, -16])}deg) scale(${interpolate(p, [0, 1], [0.85, 1.02])})`
            : `translateX(${interpolate(p, [0, 1], [60, -60])}px) rotate(${interpolate(p, [0, 1], [-10, -4])}deg) scale(${interpolate(p, [0, 1], [0.95, 1.08])})`,
        }}
      >
        <Barbell width={width * (width > height ? 0.75 : 0.92)} glow={1 + impactAt(f, 5)} />
      </div>
      {lift ? <Sparks at={0} count={50} seed="lift" y={undefined} power={1.2} /> : null}
    </AbsoluteFill>
  );
};

const ShotPlate: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const size = Math.max(width, height) * 0.85;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `scale(${interpolate(f, [0, len], [0.9, 1.25])})`}}>
        <Plate size={size} rotation={f * 9} glow={1.3} />
      </div>
      <LightStreaks count={6} seed="plate" speed={4} opacity={0.35} angle={30} />
    </AbsoluteFill>
  );
};

const ShotPulse: React.FC<{len: number}> = ({len}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const m = Math.max(width, height);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      {new Array(6).fill(0).map((_, i) => {
        const t = ((f + i * (FRAMES_PER_BEAT / 2)) % (FRAMES_PER_BEAT * 3)) / (FRAMES_PER_BEAT * 3);
        const s = m * (0.1 + t * 1.1);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: s,
              height: s,
              border: `${6 * (1 - t) + 1}px solid ${i % 2 ? accent : accentDeep}`,
              borderRadius: i % 3 === 0 ? '50%' : '18%',
              transform: `rotate(${45 + f * (i % 2 ? 1.5 : -1.5)}deg)`,
              opacity: (1 - t) * 0.9,
              boxShadow: `0 0 40px ${accent}88, inset 0 0 40px ${accent}44`,
            }}
          />
        );
      })}
      <div style={{transform: `rotate(${-30 + f}deg) scale(${0.45 + impactAt(f, 6) * 0.1 + f / len / 10})`}}>
        <Plate size={m * 0.5} rotation={-f * 12} />
      </div>
      <LightStreaks count={8} seed="pulse" speed={5} opacity={0.4} angle={-60} />
    </AbsoluteFill>
  );
};

type Shot = {clip: number; from: number; pan: [number, number]};

/** One footage shot: cover-crop with a slow pan (so a 9:16 crop still travels across the 16:9 clip), push-in and grade. */
export const FootageShot: React.FC<{shot: Shot; len: number; overlay: number; blur?: number; seed: string}> = ({shot, len, overlay, blur = 0, seed}) => {
  const f = useCurrentFrame();
  const files = detected.footage;
  const src = files[shot.clip % files.length];
  const p = Math.min(1, f / Math.max(1, len));
  const pan = interpolate(p, [0, 1], shot.pan);
  const {width, height} = useVideoConfig();
  const zoom = footage.zoom[width < height ? 'vertical' : width === height ? 'square' : 'wide'];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        trimBefore={Math.round(shot.from * 30)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${pan * 100}% 50%`,
          transform: `scale(${zoom * interpolate(p, [0, 1], [1.04, 1.14])})`,
          transformOrigin: `${pan * 100}% 55%`,
          filter: `contrast(1.12) saturate(1.1) brightness(0.95)${blur ? ` blur(${blur}px)` : ''}`,
        }}
      />
      <AbsoluteFill style={{background: `rgba(11,13,15,${overlay})`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(11,13,15,0.55) 0%, transparent 30%, transparent 70%, rgba(11,13,15,0.7) 100%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${accentDeep}30, transparent 45%, ${accent}22)`, mixBlendMode: 'screen'}} />
      <LightStreaks count={5} seed={`ft${seed}`} speed={3} opacity={0.3} />
    </AbsoluteFill>
  );
};

export const hasFootage = () => footage.enabled !== false && detected.footage.length > 0;

export const Energy: React.FC<{copy: Copy}> = ({copy}) => {
  const frame = useCurrentFrame();
  const cuts = hits.energyCuts.map((h) => h - scenes.energy.from);
  const useFootage = hasFootage();
  const total = scenes.energy.duration;
  return (
    <AbsoluteFill>
      {cuts.map((c, i) => {
        const len = (cuts[i + 1] ?? total) - c;
        const Graphic = [ShotBarbell, ShotPlate, ShotPulse, ShotBarbell][i % 4];
        return (
          <Sequence key={i} from={c} durationInFrames={len} layout="none">
            {useFootage ? (
              <>
                <FootageShot shot={footage.shots[i % footage.shots.length]} len={len} overlay={footage.overlay} seed={`e${i}`} />
                <Sparks at={0} count={i === cuts.length - 1 ? 50 : 22} seed={`ecut${i}`} y={undefined} power={i === cuts.length - 1 ? 1.2 : 0.8} />
              </>
            ) : (
              <Graphic len={len} lift={i === 3} />
            )}
          </Sequence>
        );
      })}
      {/* accent edge pulse on every beat */}
      {useFootage ? (
        <AbsoluteFill style={{boxShadow: `inset 0 0 ${120 + 160 * impactAt(frame + scenes.energy.from, 6)}px ${accent}66`}} />
      ) : null}
      {copy.energyWord ? (
        <Safe>
          <div style={{opacity: 0.85}}>
            <Display text={copy.energyWord} size={120} />
          </div>
        </Safe>
      ) : null}
      {/* build-up glow into the logo slam */}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(frame, [total - 12, total], [0, 0.7], {extrapolateLeft: 'clamp'}), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ logo plate (logo is never altered) */
export const LogoPlate: React.FC<{width: number; glow?: number}> = ({width, glow = 1}) => {
  const {u} = useLayout();
  const {logoTrimmed} = extracted;
  const pad = width * 0.08;
  const imgW = width - pad * 2;
  const imgH = (imgW * logoTrimmed.height) / logoTrimmed.width;
  return (
    <div
      style={{
        width,
        height: imgH + pad * 2,
        borderRadius: 34 * u,
        background: 'linear-gradient(160deg, #ffffff 0%, #f2f5f8 60%, #e6ebf0 100%)',
        boxShadow: `0 0 ${80 * glow}px ${accent}${Math.round(Math.min(1, 0.55 * glow) * 255).toString(16).padStart(2, '0')}, 0 0 0 ${3 * u}px ${accent}, 0 30px 80px rgba(0,0,0,0.6)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Img src={staticFile(logoTrimmed.file)} style={{width: imgW, height: imgH}} />
    </div>
  );
};

/* ------------------------------------------------------------------ 10–14 s LOGO REVEAL */
export const LogoReveal: React.FC<{copy: Copy}> = ({copy}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {u, lang} = useLayout();
  const tf = typeface(lang);
  const slam = hits.logoSlam - scenes.logo.from;
  const s = spring({frame: frame - slam, fps, config: {damping: 12, stiffness: 220, mass: 1}});
  const scale = interpolate(s, [0, 1], [2.6, 1]);
  const ring = (frame - slam) / 30;
  const glow = 0.8 + 0.5 * Math.sin(frame / 6) * 0.5 + impactAt(frame + scenes.logo.from, 8);
  return (
    <AbsoluteFill>
      {/* rotating rays */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.6}deg at 50% 45%, ${accent}18 0deg 4deg, transparent 4deg 18deg)`,
          maskImage: 'radial-gradient(circle at 50% 45%, black 0%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 0%, transparent 60%)',
        }}
      />
      <LightStreaks count={5} seed="logo" opacity={0.25} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        {ring >= 0 && ring < 1 ? (
          <div
            style={{
              position: 'absolute',
              width: 300 + ring * 1800,
              height: 300 + ring * 1800,
              borderRadius: '50%',
              border: `${10 * (1 - ring)}px solid ${accent}`,
              opacity: 1 - ring,
              boxShadow: `0 0 60px ${accent}`,
            }}
          />
        ) : null}
      </AbsoluteFill>
      <Sparks at={slam} count={60} seed="logo-sp" power={1.4} />
      <Safe gap={46 * u}>
        <div style={{transform: `scale(${scale})`, opacity: frame >= slam ? 1 : 0}}>
          <LogoPlate width={520 * u} glow={glow} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * u}}>
          <Rise at={hits.logoTitle - scenes.logo.from}>
            <Display text={copy.logoTitle} size={lang === 'fa' ? 120 : 120} lineHeight={lang === 'fa' ? 1.5 : 1} style={{letterSpacing: lang === 'fa' ? 0 : '0.05em'}} />
          </Rise>
          {copy.logoTagline ? (
            <Rise at={hits.logoTagline - scenes.logo.from}>
              <div style={{display: 'flex', alignItems: 'center', gap: 22 * u}}>
                <div style={{width: 60 * u, height: 2, background: accent}} />
                <div dir={lang === 'fa' ? 'rtl' : 'ltr'} style={{fontFamily: tf.body, fontWeight: tf.bodyWeight, fontSize: 44 * u, color: 'rgba(255,255,255,0.88)', letterSpacing: lang === 'fa' ? 0 : '0.04em'}}>
                  <Rich text={copy.logoTagline} />
                </div>
                <div style={{width: 60 * u, height: 2, background: accent}} />
              </div>
            </Rise>
          ) : null}
        </div>
      </Safe>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 14–18 s END CARD */
const PinIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={2.2}>
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);
const InstaIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="1.1" fill="#fff" stroke="none" />
  </svg>
);

export const EndCard: React.FC<{copy: Copy}> = ({copy}) => {
  const frame = useCurrentFrame();
  const {u, lang} = useLayout();
  const tf = typeface(lang);
  const fa = lang === 'fa';
  const details = hits.endDetails - scenes.endCard.from;
  const beatPhase = (frame % FRAMES_PER_BEAT) / FRAMES_PER_BEAT;
  const pulse = 1 + 0.06 * Math.exp(-beatPhase * 5);
  const small = {fontFamily: tf.body, fontWeight: tf.bodyWeight, color: 'rgba(255,255,255,0.88)'};
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${accentDeep}44 0%, transparent 55%)`}} />
      <LightStreaks count={6} seed="end" opacity={0.22} />
      <Sparks at={0} count={40} seed="end-sp" />
      <Safe gap={34 * u}>
        <Rise at={4} distance={30}>
          <LogoPlate width={190 * u} glow={0.7} />
        </Rise>
        <Slam at={0} from={2}>
          <Display text={copy.endTitle} size={fa ? 210 : 250} lineHeight={fa ? 1.45 : 0.95} />
        </Slam>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * u}}>
          <Rise at={details}>
            <div dir={fa ? 'rtl' : 'ltr'} style={{...small, fontSize: (fa ? 50 : 44) * u, display: 'flex', alignItems: 'center', gap: 14 * u, letterSpacing: fa ? 0 : '0.08em', textTransform: fa ? 'none' : 'uppercase'}}>
              <PinIcon size={44 * u} />
              <span>{fa ? toPersianDigits(copy.location) : copy.location}</span>
            </div>
          </Rise>
          {copy.followPrompt ? (
            <Rise at={details + FRAMES_PER_BEAT}>
              <div
                style={{
                  transform: `scale(${frame > details + FRAMES_PER_BEAT ? pulse : 1})`,
                  border: `3px solid ${accent}`,
                  borderRadius: 999,
                  padding: `${16 * u}px ${38 * u}px`,
                  fontFamily: tf.body,
                  fontWeight: 700,
                  fontSize: 38 * u,
                  letterSpacing: fa ? 0 : '0.12em',
                  color: '#fff',
                  boxShadow: `0 0 ${30 * pulse * pulse}px ${accent}aa, inset 0 0 20px ${accent}55`,
                  background: `${accent}22`,
                }}
                dir={fa ? 'rtl' : 'ltr'}
              >
                {copy.followPrompt}
              </div>
            </Rise>
          ) : null}
          <Rise at={details + FRAMES_PER_BEAT * 2}>
            {/* the handle is Latin: isolate it as LTR even inside the RTL version */}
            <div dir="ltr" style={{display: 'flex', alignItems: 'center', gap: 14 * u, fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: 46 * u, color: '#fff', unicodeBidi: 'isolate'}}>
              <InstaIcon size={46 * u} />
              <span>{copy.handle}</span>
            </div>
          </Rise>
        </div>
      </Safe>
    </AbsoluteFill>
  );
};
