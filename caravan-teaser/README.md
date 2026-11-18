# CARAVAN FITNESS — "Coming Soon" teaser #2

Remotion + TypeScript. 18 s, 30 fps. Compositions: `TeaserEN` (1080×1920), `TeaserFA` (1080×1920, Dari/RTL),
`TeaserENSquare` (1080×1080), `TeaserENWide` (1920×1080).

```bash
npm install
npm run studio        # live preview (also re-runs asset prep)
npm run render:all    # writes all four MP4s to /out
```

## Edit
Everything — text, colours, timings, safe zones, audio, footage — is in **`src/config.ts`**.
- `[word]` in any string paints it in the accent colour; `\n` = line break.
- Accent colour is extracted from the logo automatically (`brand.accent: 'auto'`) — or put a hex value there.
- `hits` = the frames where text slams / cuts happen. Change them and re-run `npm run prepare-assets` so the placeholder beat follows.

## Add real footage
Drop `.mp4/.mov/.webm` clips into `public/footage/`, run `npm run prepare-assets`, then render.
The 6–10 s scene switches from motion graphics to your clips (cut every beat, dark overlay).
Tune `footage.overlay` and `footage.cutEvery` in `src/config.ts`; set `footage.enabled: false` to force graphics.

## Swap the music
The current soundtrack is a **generated PLACEHOLDER** (`public/generated/placeholder-beat.wav`, 120 BPM).
Drop a licensed track into `public/audio/` (e.g. `track.mp3`), run `npm run prepare-assets`, render.
It is picked up automatically. Use `audio.musicStartFrom` (seconds) to line its drop up with the logo slam at 10 s.
For perfect sync pick a 120 BPM track, or change `BPM`/`hits` to match yours.

## Dari voiceover (optional)
Put `public/audio/voiceover-fa.mp3` in place and run `npm run prepare-assets`: the FA version plays it and
ducks the music (`audio.voiceover.*`). Set `audio.voiceover.enabled: false` to disable.

## Logo
`public/brand/caravan-logo.png` is used unaltered (transparent PNG). `prepare-assets` only crops the empty
transparent margin to `public/generated/logo-trimmed.png`. Because the arm and "FITNESS" are dark grey/black,
the logo sits on a white plate with an accent glow so it stays legible on the dark background.
