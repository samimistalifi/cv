import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {audio, brand, copy as allCopy, DURATION_IN_FRAMES, FormatId, FPS, Lang, scenes} from './config';
import {detected} from './generated/assets';
import {aiNarration} from './generated/narration';
import {Camera, Embers, Flash, Grain, useShake, Vignette} from './fx';
import {accentDeep} from './theme';
import {EndCard, Energy, Hook, LogoReveal, Tease} from './scenes';
import {getFormat} from './theme';
import {LayoutContext} from './type';

export type TeaserProps = {lang: Lang; format: FormatId};

const Soundtrack: React.FC<{lang: Lang}> = ({lang}) => {
  const music = audio.music !== 'auto' ? audio.music : detected.userMusic ?? detected.placeholderMusic;
  const vo = audio.voiceover;
  const recorded = vo.enabled ? detected.recordedVoiceover[lang] : null;
  // A recorded file wins over the AI narration lines.
  const lines = !vo.enabled
    ? []
    : recorded
      ? [{at: vo.recordedStartFrame, file: recorded.file, durationInFrames: Math.ceil(recorded.durationInSeconds * FPS)}]
      : aiNarration[lang] ?? [];
  const fadeOut = (f: number) =>
    interpolate(f, [DURATION_IN_FRAMES - audio.fadeOutFrames, DURATION_IN_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ducked = vo.duckedMusicVolume / audio.musicVolume;
  const r = vo.duckRampFrames;
  const duck = (f: number) =>
    lines.reduce((m, l) => {
      const end = l.at + l.durationInFrames;
      const v = interpolate(f, [l.at - r, l.at, end, end + r], [1, ducked, ducked, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return Math.min(m, v);
    }, 1);
  return (
    <>
      <Audio src={staticFile(music)} volume={(f) => audio.musicVolume * fadeOut(f) * duck(f)} trimBefore={Math.round(audio.musicStartFrom * FPS)} />
      {lines.map((l, i) => (
        <Sequence key={i} from={l.at} durationInFrames={l.durationInFrames + 30}>
          <Audio src={staticFile(l.file)} volume={(f) => vo.volume * fadeOut(f + l.at)} />
        </Sequence>
      ))}
    </>
  );
};

const Shaker: React.FC<{children: React.ReactNode}> = ({children}) => {
  const s = useShake();
  return <AbsoluteFill style={{transform: `translate(${s.x}px, ${s.y}px) rotate(${s.r}deg)`}}>{children}</AbsoluteFill>;
};

export const Teaser: React.FC<TeaserProps> = ({lang, format}) => {
  const fmt = getFormat(format);
  const c = allCopy[lang];
  const S = scenes;
  return (
    <LayoutContext.Provider value={{lang, u: fmt.unit, safe: fmt.safe}}>
      <AbsoluteFill style={{background: brand.background, overflow: 'hidden'}}>
        <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 120%, ${accentDeep}30 0%, transparent 60%)`}} />
        <Embers />
        <Shaker>
          <Sequence from={S.hook.from} durationInFrames={S.hook.duration}>
            <Camera duration={S.hook.duration} whipOut>
              <Hook copy={c} />
            </Camera>
          </Sequence>
          <Sequence from={S.tease.from} durationInFrames={S.tease.duration}>
            <Camera duration={S.tease.duration} whipIn>
              <Tease copy={c} />
            </Camera>
          </Sequence>
          <Sequence from={S.energy.from} durationInFrames={S.energy.duration}>
            <Camera duration={S.energy.duration}>
              <Energy copy={c} />
            </Camera>
          </Sequence>
          <Sequence from={S.logo.from} durationInFrames={S.logo.duration}>
            <Camera duration={S.logo.duration} whipOut>
              <LogoReveal copy={c} />
            </Camera>
          </Sequence>
          <Sequence from={S.endCard.from} durationInFrames={S.endCard.duration}>
            <Camera duration={S.endCard.duration} whipIn>
              <EndCard copy={c} />
            </Camera>
          </Sequence>
        </Shaker>
        <Flash />
        <Vignette />
        <Grain />
        <Soundtrack lang={lang} />
      </AbsoluteFill>
    </LayoutContext.Provider>
  );
};
