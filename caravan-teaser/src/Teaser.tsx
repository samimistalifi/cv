import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {audio, brand, copy as allCopy, DURATION_IN_FRAMES, FormatId, FPS, Lang, scenes} from './config';
import {detected} from './generated/assets';
import {Camera, Embers, Flash, Grain, useShake, Vignette} from './fx';
import {accentDeep} from './theme';
import {EndCard, Energy, Hook, LogoReveal, Tease} from './scenes';
import {getFormat} from './theme';
import {LayoutContext} from './type';

export type TeaserProps = {lang: Lang; format: FormatId};

const Soundtrack: React.FC<{lang: Lang}> = ({lang}) => {
  const music = audio.music !== 'auto' ? audio.music : detected.userMusic ?? detected.placeholderMusic;
  const vo = lang === 'fa' && audio.voiceover.enabled !== false ? detected.voiceoverFa : null;
  const voStart = audio.voiceover.startFrame;
  const voEnd = vo ? voStart + Math.ceil(vo.durationInSeconds * FPS) : 0;
  const ramp = audio.voiceover.duckRampFrames;
  const musicVolume = (f: number) => {
    const fade = interpolate(f, [DURATION_IN_FRAMES - audio.fadeOutFrames, DURATION_IN_FRAMES], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const duck = vo
      ? interpolate(f, [voStart - ramp, voStart, voEnd, voEnd + ramp], [1, audio.voiceover.duckedMusicVolume / audio.musicVolume, audio.voiceover.duckedMusicVolume / audio.musicVolume, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;
    return audio.musicVolume * fade * duck;
  };
  return (
    <>
      <Audio src={staticFile(music)} volume={musicVolume} trimBefore={Math.round(audio.musicStartFrom * FPS)} />
      {vo ? (
        <Sequence from={voStart}>
          <Audio
            src={staticFile(vo.file)}
            volume={(f) => audio.voiceover.volume * interpolate(f + voStart, [DURATION_IN_FRAMES - audio.fadeOutFrames, DURATION_IN_FRAMES], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          />
        </Sequence>
      ) : null}
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
