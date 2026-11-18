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
   * voiceover-*), otherwise the generated PLACEHOLDER beat. Or set a path
   * inside /public, e.g. 'audio/my-licensed-track.mp3'.
   */
  music: 'auto' as string,
  musicVolume: 0.9,
  /** Seconds into the music track to start from (to line a drop up with 0:10). */
  musicStartFrom: 0,
  fadeOutFrames: 30, // last 1 s
  voiceover: {
    /**
     * true  = narration ON in both versions.
     * A recorded file (/public/audio/voiceover-en.mp3 or voiceover-fa.mp3) always wins over the AI voice;
     * it starts at `recordedStartFrame`. Without one, the AI narration lines below are used.
     */
    enabled: true,
    recordedStartFrame: 0,
    volume: 1,
    /** Music level while the voice is speaking (ducking). */
    duckedMusicVolume: 0.2,
    duckRampFrames: 5,
  },
};

/**
 * AI NARRATION SCRIPT (Piper TTS, generated by `npm run make-voiceover`).
 * `at` = start frame. `say` = what is spoken. Inside `say`, [[ ... ]] gives exact
 * phonemes for a word the engine mispronounces. `check` = expected transcript for the
 * automatic quality check (defaults to `say`).
 * After editing, run `npm run make-voiceover` and re-render.
 */
export const narration: Record<Lang, {at: number; say: string; check?: string}[]> = {
  en: [
    {at: 28, say: 'Something big is coming.'},
    {at: 80, say: 'New gym.'},
    {at: 108, say: 'New level.'},
    {at: 153, say: 'New you.'},
    {at: 306, say: 'Caravan Fitness.'},
    {at: 360, say: 'Built for the strong.'},
    {at: 421, say: 'Coming soon.'},
    {at: 463, say: 'Follow for the opening.'},
  ],
  fa: [
    // exactly the four parts of: «بیشتر از یک باشگاه ورزشی، بلکه یک استاندارد جهانی، کاروان فیتنس، به زودی»
    {at: 28, say: 'بیشتر از یک باشگاه ورزشی،'},
    {at: 96, say: 'بلکه یک استاندارد جهانی،'},
    {at: 314, say: 'کاروان، فیتنس،', check: 'کاروان فیتنس'}, // the comma only adds a tiny pause: clearer brand name
    {at: 432, say: 'به زودی'},
  ],
};

export const voices = {
  en: {model: 'en_US-john-medium', lengthScale: 1.05, pitch: 0.95},
  fa: {model: 'fa_IR-amir-medium', lengthScale: 1.2, pitch: 0.96},
};

// ---------------------------------------------------------------- footage
export const footage = {
  /** 'auto' = use the videos in /public/footage. false = always abstract graphics. */
  enabled: 'auto' as 'auto' | false,
  /** 0–1 darkness of the overlay on top of the footage. */
  overlay: 0.45,
  /** Also run footage (heavily darkened) behind the 2–6 s tease text. */
  behindTease: true,
  teaseOverlay: 0.72,
  /**
   * The 6–10 s scene: one shot per impact cut (hits.energyCuts). `clip` = index into the
   * files in /public/footage (alphabetical), `from` = seconds into that clip,
   * `pan` = horizontal crop position (0 = left, 1 = right) at start → end of the shot.
   */
  /**
   * Extra zoom per format (the clips are 16:9, so the vertical crop is already tight).
   * The zoom is anchored at the shot's `pan` position.
   */
  zoom: {vertical: 1, square: 1.5, wide: 2.2} as Record<FormatId, number>,
  /**
   * The 6–10 s scene: one shot per impact cut (hits.energyCuts). `clip` = index into the
   * files in /public/footage (alphabetical), `from` = seconds into that clip,
   * `pan` = horizontal crop position (0 = left, 1 = right) at start → end of the shot.
   * Framed to keep the misspelled wall slogan ("achive / belive") out of shot.
   */
  shots: [
    {clip: 0, from: 3.4, pan: [0.92, 1.0]}, // corridor end
    {clip: 1, from: 0.3, pan: [0.82, 0.95]}, // supplement wall + logo sign
    {clip: 0, from: 4.1, pan: [1.0, 0.94]},
    {clip: 1, from: 3.4, pan: [0.97, 0.85]},
  ] as {clip: number; from: number; pan: [number, number]}[],
  /** Tease background: one shot per tease card. */
  teaseShots: [
    {clip: 0, from: 3.3, pan: [0.94, 1.0]},
    {clip: 1, from: 1.6, pan: [0.85, 0.95]},
    {clip: 0, from: 4.0, pan: [1.0, 0.96]},
  ] as {clip: number; from: number; pan: [number, number]}[],
};

// ---------------------------------------------------------------- look
export const look = {
  grain: 0.09,
  vignette: 0.75,
  pushIn: 0.06, // slow camera push-in per scene (6 %)
  shake: 14, // px, on impact frames
  flash: 0.85, // max white flash opacity on impacts
};
