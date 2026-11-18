import {Config} from '@remotion/cli/config';
import fs from 'node:fs';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

// Use a locally installed Chrome Headless Shell if one exists (cloud sandbox); otherwise Remotion downloads its own.
const localChrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(localChrome)) Config.setBrowserExecutable(localChrome);
