/**
 * CARAVAN FITNESS — "Coming Soon" teaser #2
 * -------------------------------------------------------------
 * EDIT EVERYTHING HERE: text, colours, timings, audio settings.
 * All times are in FRAMES at 30 fps (30 frames = 1 second).
 *
 * Text markup: wrap a word in [brackets] to paint it in the accent colour,
 * e.g. "[BIG] IS". Use "\n" inside a string for a manual line break.
 *
 * This file is also read by the Node scripts in /scripts (the placeholder beat
 * is generated from `beatHits` below), so keep it plain TypeScript with no imports.
 */

export const FPS = 30;
export const DURATION_IN_FRAMES = 18 * FPS; // 18 s

// ---------------------------------------------------------------- brand
export const brand = {
  background: '#0B0D0F',
  text: '#FFFFFF',
  /**
   * 'auto' = use the colour extracted from the logo by scripts/extract-accent.mjs
   * (written to src/generated/brand.ts). Put a hex value here to override, e.g. '#00AEEF'.
   */
  accent: 'auto' as string,
  logoFile: 'brand/caravan-logo.png', // inside /public — never modified
  /** Instagram handle shown on the end card. */
  handle: '@your_handle',
};

// ---------------------------------------------------------------- scenes (frames)
export const scenes = {
  hook: {from: 0, duration: 60}, // 0–2 s
  tease: {from: 60, duration: 120}, // 2–6 s
  energy: {from: 180, duration: 120}, // 6–10 s
  logo: {from: 300, duration: 120}, // 10–14 s
  endCard: {from: 420, duration: 120}, // 14–18 s
};

/** Musical grid: 120 BPM → one beat every 15 frames. */
export const BPM = 120;
export const FRAMES_PER_BEAT = (60 / BPM) * FPS;

/**
 * Absolute frames where the text/visuals "hit". The placeholder beat puts an
 * impact sound on each of these, and the video puts a flash/shake on them.
 */
export const hits = {
  heartbeat: [5, 13], // lub-dub on the black screen
  hookSlam: 30, // "SOMETHING BIG IS COMING"
  teaseLines: [60, 105, 150], // one per tease line (EN). FA uses the first N
  energyCuts: [180, 210, 240, 270], // impact cuts in the visual-energy scene
  logoSlam: 300,
  logoTitle: 330,
  logoTagline: 360,
  endSlam: 420,
  endDetails: 450,
};

// ---------------------------------------------------------------- copy
export type Lang = 'en' | 'fa';

export type Copy = {
  lang: Lang;
  /** Each entry is one "card" that slams in on the matching hit. */
  hook: string[];
  /** 'replace' = each card replaces the previous; 'stack' = lines build up. */
  teaseMode: 'replace' | 'stack';
  tease: string[];
  /** Optional very light word in the energy scene ('' = none). */
  energyWord: string;
  logoTitle: string;
  logoTagline: string; // '' = hidden
  endTitle: string;
  location: string;
  followPrompt: string; // '' = hidden
  handle: string;
};

export const copy: Record<Lang, Copy> = {
  en: {
    lang: 'en',
    hook: ['SOMETHING\n[BIG] IS\nCOMING'],
    teaseMode: 'replace',
    tease: ['NEW\n[GYM.]', 'NEW\n[LEVEL.]', 'NEW\n[YOU.]'],
    energyWord: '',
    logoTitle: 'CARAVAN [FITNESS]',
    logoTagline: 'Built for the Strong.',
    endTitle: 'COMING\n[SOON]',
    location: 'Kabul, Afghanistan',
    followPrompt: 'FOLLOW FOR THE OPENING',
    handle: brand.handle,
  },
  fa: {
    lang: 'fa',
    // Message: «بیشتر از یک باشگاه ورزشی، بلکه یک استاندارد جهانی، کاروان فیتنس، به زودی»
    hook: ['بیشتر از یک\n[باشگاه ورزشی]'],
    teaseMode: 'stack',
    tease: ['بلکه یک', '[استاندارد]', 'جهانی'],
    energyWord: '',
    logoTitle: 'کاروان [فیتنس]',
    logoTagline: '',
    endTitle: '[به زودی]',
    location: 'کابل، افغانستان',
    followPrompt: '',
    handle: brand.handle,
  },
};

// ---------------------------------------------------------------- formats
export type FormatId = 'vertical' | 'square' | 'wide';

export const formats: Record<
  FormatId,
  {width: number; height: number; safe: {top: number; bottom: number; side: number}; unit: number}
> = {
  // Reels / TikTok: keep text out of the top 250 px and bottom 400 px.
  vertical: {width: 1080, height: 1920, safe: {top: 250, bottom: 400, side: 90}, unit: 1},
  square: {width: 1080, height: 1080, safe: {top: 90, bottom: 90, side: 110}, unit: 0.72},
  wide: {width: 1920, height: 1080, safe: {top: 90, bottom: 90, side: 200}, unit: 0.72},
};

// ---------------------------------------------------------------- audio
export const audio = {
  /**
   * Music. 'auto' = use the first audio file found in /public/audio (other than
   * voiceover-fa.*), otherwise the generated PLACEHOLDER beat. Or set a path
   * inside /public, e.g. 'audio/my-licensed-track.mp3'.
   */
  music: 'auto' as string,
  musicVolume: 0.9,
  /** Seconds into the music track to start from (to line a drop up with 0:10). */
  musicStartFrom: 0,
  fadeOutFrames: 30, // last 1 s
  voiceover: {
    /** 'auto' = used in the FA version only if /public/audio/voiceover-fa.mp3 exists. false = never. */
    enabled: 'auto' as 'auto' | false,
    file: 'audio/voiceover-fa.mp3',
    startFrame: 0,
    volume: 1,
    /** Music level while the voiceover is playing (ducking). */
    duckedMusicVolume: 0.25,
    duckRampFrames: 8,
  },
};

// ---------------------------------------------------------------- footage
export const footage = {
  /** 'auto' = use any videos in /public/footage for the 6–10 s scene. false = always abstract graphics. */
  enabled: 'auto' as 'auto' | false,
  /** 0–1 darkness of the overlay on top of the footage. */
  overlay: 0.55,
  /** Frames per footage cut (15 = a cut on every beat). */
  cutEvery: 15,
};

// ---------------------------------------------------------------- look
export const look = {
  grain: 0.09,
  vignette: 0.75,
  pushIn: 0.06, // slow camera push-in per scene (6 %)
  shake: 14, // px, on impact frames
  flash: 0.85, // max white flash opacity on impacts
};
