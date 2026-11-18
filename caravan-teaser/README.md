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

## Footage
`public/footage/01-corridor.mp4` and `02-reception.mp4` (your two 3D walkthrough clips, re-wrapped from .mov without
re-encoding) are used in both languages:
- 2–6 s: darkened and slightly blurred behind the tease text,
- 6–10 s: four 1-second impact cuts with a slow pan, push-in, blue grade and sparks.

Each shot is set in `footage.shots` / `footage.teaseShots` (`clip`, `from` = seconds into the clip, `pan` = crop position
0 = left … 1 = right). Shots are framed to keep the misspelled wall slogan ("achive / belive") out of view.
To add or replace clips: drop files into `public/footage/` (alphabetical order = clip index), run
`npm run prepare-assets`, adjust the shots, render. Set `footage.enabled: false` for the abstract graphics instead.
The clips are 832×464 — a 1080p (or 4K) export of the same renders will look much sharper.

## Voiceover narration (both versions)
On by default (`audio.voiceover.enabled`). The music dips to `duckedMusicVolume` under every spoken line.

**AI voice (current):** lines and timings are in `narration` in `src/config.ts`; voices in `voices`.
Regenerate after editing: `pip install piper-tts faster-whisper && npm run make-voiceover`
(`LANGS=fa` to redo only one language, `TAKES=20` for more takes). The script records several takes per line,
transcribes them with Whisper and keeps the take that best matches the script.
- EN: Piper `en_US-john-medium` (public-domain LibriVox data). FA: Piper `fa_IR-amir-medium` (CC0 data).
  Both allow commercial use. The Persian voice has an Iranian accent, not a Kabul Dari one.

**Recorded voice (recommended for the final post):** put `public/audio/voiceover-en.mp3` and/or
`voiceover-fa.mp3` in place, run `npm run prepare-assets`, render. A recording automatically replaces the AI lines
for that language (starts at `audio.voiceover.recordedStartFrame`). Narration timing to aim for:

| time | EN | FA |
|---|---|---|
| 0.9 s | Something big is coming. | بیشتر از یک باشگاه ورزشی، |
| 2.7 / 3.2 s | New gym. … New level. … New you. | بلکه یک استاندارد جهانی، |
| 10.2 s | Caravan Fitness. … Built for the strong. | کاروان فیتنس، |
| 14.0 s | Coming soon. … Follow for the opening. | به زودی |

## Swap the music
The current soundtrack is a **generated PLACEHOLDER** (`public/generated/placeholder-beat.wav`, 120 BPM).
Drop a licensed track into `public/audio/` (e.g. `track.mp3`), run `npm run prepare-assets`, render.
Use `audio.musicStartFrom` (seconds) to line its drop up with the logo slam at 10 s.

## Logo
`public/brand/caravan-logo.png` is used unaltered (transparent PNG). `prepare-assets` only crops the empty
transparent margin to `public/generated/logo-trimmed.png`. Because the arm and "FITNESS" are dark grey/black,
the logo sits on a white plate with an accent glow so it stays legible on the dark background.
