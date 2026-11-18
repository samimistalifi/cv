// Renders preview frames of every scene for every composition into out/previews/.
// Usage: node scripts/preview-stills.mjs [CompositionId ...]
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';

const root = path.resolve(import.meta.dirname, '..');
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(chrome) ? chrome : undefined;
const frames = (process.env.FRAMES ?? '8,40,58,70,115,165,195,225,255,290,312,345,400,425,470,520').split(',').map(Number);
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const comps = await getCompositions(serveUrl, {browserExecutable});
const wanted = process.argv.slice(2);
const outDir = path.join(root, 'out', 'previews');
fs.mkdirSync(outDir, {recursive: true});
for (const c of comps.filter((c) => !wanted.length || wanted.includes(c.id))) {
  for (const f of frames) {
    const output = path.join(outDir, `${c.id}-${String(f).padStart(3, '0')}.png`);
    await renderStill({composition: c, serveUrl, frame: f, output, browserExecutable, scale: 0.5});
  }
  console.log('done', c.id);
}
