"""Generates the AI narration lines from `narration` / `voices` in src/config.ts.

Uses Piper TTS (open-source, offline). Voice models are downloaded once into ./voices/.
  pip install piper-tts
  npm run make-voiceover

Writes public/generated/vo/<lang>-<n>.wav and src/generated/narration.ts (start frame + length of each line).
"""
import json, os, subprocess, sys, urllib.request, wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = os.path.join(ROOT, 'voices')
OUT = os.path.join(ROOT, 'public', 'generated', 'vo')
HF = 'https://huggingface.co/rhasspy/piper-voices/resolve/main'

cfg = json.loads(subprocess.check_output(
    ['node', '--no-warnings', '-e',
     "import('./src/config.ts').then(m => console.log(JSON.stringify({n: m.narration, v: m.voices, fps: m.FPS, dur: m.DURATION_IN_FRAMES, fade: m.audio.fadeOutFrames})))"],
    cwd=ROOT))
fps = cfg['fps']


def model_path(name):
    lang_region, voice, quality = name.split('-')
    os.makedirs(VOICES, exist_ok=True)
    p = os.path.join(VOICES, name + '.onnx')
    for ext in ('.onnx', '.onnx.json'):
        if not os.path.exists(p.replace('.onnx', ext)):
            url = f"{HF}/{lang_region.split('_')[0]}/{lang_region}/{voice}/{quality}/{name}{ext}"
            print('downloading', url)
            urllib.request.urlretrieve(url, p.replace('.onnx', ext))
    return p


from piper import PiperVoice, SynthesisConfig  # noqa: E402
import difflib, io, re  # noqa: E402

# Quality check: if faster-whisper is installed, record TAKES takes per line, transcribe each one and keep
# the take whose transcript best matches the script (TTS output varies from take to take).
TAKES = int(os.environ.get('TAKES', '8'))
try:
    os.environ.setdefault('HF_HUB_DISABLE_XET', '1')
    from faster_whisper import WhisperModel
    asr = WhisperModel(os.environ.get('ASR_MODEL', 'medium'), device='cpu', compute_type='int8')
except Exception as e:  # noqa: BLE001
    print('faster-whisper not available — using the first take of each line', e)
    asr, TAKES = None, 1

import numpy as np  # noqa: E402


def norm(t):
    t = re.sub(r'\[\[.*?\]\]', '', t).replace('ي', 'ی').replace('ك', 'ک').replace('\u200c', '')
    return re.sub(r'[\W_]+', '', t.lower())


def score(wav_bytes, lang, expected):
    if not asr:
        return 1.0, ''
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', '-', '-af', 'apad=pad_dur=0.5', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                                     input=wav_bytes, capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
    heard = ' '.join(s.text.strip() for s in asr.transcribe(a, language=lang, beam_size=5)[0])
    return difflib.SequenceMatcher(None, norm(heard), norm(expected)).ratio(), heard

os.makedirs(OUT, exist_ok=True)
# LANGS=fa only regenerates the Dari lines (the other language's existing lines are kept).
only = [x for x in os.environ.get('LANGS', '').split(',') if x]
narr_ts = os.path.join(ROOT, 'src', 'generated', 'narration.ts')
result = {}
if only and os.path.exists(narr_ts):
    txt = open(narr_ts).read()
    result = json.loads(txt[txt.index('= ') + 2:].rstrip().rstrip(';'))
for lang, lines in cfg['n'].items():
    if only and lang not in only:
        continue
    vc = cfg['v'][lang]
    voice = PiperVoice.load(model_path(vc['model']))
    result[lang] = []
    prev_end = -1
    for i, line in enumerate(lines):
        raw = os.path.join(OUT, f'{lang}-{i}.raw.wav')
        out = os.path.join(OUT, f'{lang}-{i}.wav')
        expected = line.get('check') or line['say']
        best = None
        for take in range(TAKES):
            b = io.BytesIO()
            with wave.open(b, 'wb') as wf:
                voice.synthesize_wav(line['say'], wf, SynthesisConfig(length_scale=vc['lengthScale']))
            sc, heard = score(b.getvalue(), lang, expected)
            if best is None or sc > best[0]:
                best = (sc, heard, b.getvalue())
            if sc >= 0.999:
                break
        open(raw, 'wb').write(best[2])
        if asr:
            print(f'  best of {take + 1} takes: {best[0]:.2f} match, heard "{best[1]}"')
        sr = voice.config.sample_rate
        p = vc['pitch']
        # deeper + "trailer" polish: pitch, trim silence, EQ, compression, short room, loudness
        af = (f"asetrate={sr}*{p},aresample=48000,atempo={1 / p:.5f},"
              "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
              "highpass=f=75,equalizer=f=140:t=q:w=1:g=3,equalizer=f=3500:t=q:w=1.5:g=2.5,"
              "acompressor=threshold=-20dB:ratio=4:attack=5:release=80:makeup=4,"
              "aecho=0.8:0.6:38|71:0.10|0.06,apad=pad_dur=0.25,loudnorm=I=-15:TP=-1.5:LRA=7")
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ac', '2', '-ar', '48000', out], check=True)
        os.remove(raw)
        dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]))
        frames = int(round(dur * fps))
        if line['at'] < prev_end:
            print(f'  WARNING {lang} line {i} starts at {line["at"]} but the previous line ends at {prev_end}')
        if line['at'] + frames > cfg['dur'] - cfg['fade']:
            print(f'  WARNING {lang} line {i} runs into the final fade-out')
        prev_end = line['at'] + frames
        result[lang].append({'at': line['at'], 'file': f'generated/vo/{lang}-{i}.wav', 'durationInFrames': frames})
        print(f'{lang}-{i}: frames {line["at"]}–{prev_end} ({dur:.2f}s)  {line["say"]}')

with open(narr_ts, 'w') as f:
    f.write('// AUTO-GENERATED by scripts/make-voiceover.py — edit `narration` in src/config.ts instead\n')
    f.write('export const aiNarration: Record<"en" | "fa", {at: number; file: string; durationInFrames: number}[]> = ')
    f.write(json.dumps(result, indent=2, ensure_ascii=False) + ';\n')
