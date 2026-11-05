// Assembles the composition and the audio mix. Run from the repo root: node video/tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { homedir } from 'node:os';
import { chromium } from '../../../node_modules/playwright/index.mjs';

const OUT = 'video/v2', WORK = `${OUT}/work`, COMP = `${OUT}/composition`, AS = `${COMP}/assets`;
const SFXDIR = `${homedir()}/.claude/skills/brag/assets/sfx`;
const EXERGY_ANIM = '/Users/wanby/my_files/exergy/EXERGY-Brand/assets/EXERGY_Luxury_Glow_Reveal.mp4';
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const probe = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
['shots', 'fonts'].forEach((d) => mkdirSync(`${AS}/${d}`, { recursive: true }));

// ---------- timeline from the measured voice clips
const lines = JSON.parse(readFileSync('video/tools/v2/narration.json', 'utf8'));
const GAPS = [1.3, 2.3, 2.2, 1.8, 5.2, 2.7, 1.2, 0.9, 0.8];   // silence after each beat: room for clicks and for reading on-screen text
const wordsOf = (a) => { const out = []; let cur = null; a.characters.forEach((c, i) => { if (/\s/.test(c)) { if (cur) out.push(cur); cur = null; return; } if (!cur) cur = { w: '', s: a.character_start_times_seconds[i], e: 0 }; cur.w += c; cur.e = a.character_end_times_seconds[i]; }); if (cur) out.push(cur); return out; };
let t = 0.8; const beats = []; const caps = [];
lines.forEach((_, i) => {
  const mp3 = `${WORK}/voice/beat${i + 1}.mp3`, dur = probe(mp3);
  const words = wordsOf(JSON.parse(readFileSync(`${WORK}/voice/beat${i + 1}.align.json`, 'utf8')));
  beats.push({ start: +t.toFixed(3), end: +(t + dur).toFixed(3), dur, words });
  let first = 0; const sents = [];                 // sentences of this beat; short ones are merged with their neighbour so every caption can be read
  words.forEach((w, k) => { if (/[.?!]$/.test(w.w) || k === words.length - 1) { sents.push({ a: first, z: k }); first = k + 1; } });
  for (let q = 0; q < sents.length; q++) { if (sents[q].z - sents[q].a + 1 <= 5) { if (q + 1 < sents.length) { sents[q + 1].a = sents[q].a; sents.splice(q, 1); q--; } else if (q > 0) { sents[q - 1].z = sents[q].z; sents.splice(q, 1); } } }
  sents.forEach(({ a, z }) => caps.push({ t0: +(t + words[a].s - 0.05).toFixed(3), t1: +(t + words[z].e + 0.3).toFixed(3), text: words.slice(a, z + 1).map((x) => x.w).join(' ') }));
  t += dur + (GAPS[i] ?? 1);
});
const endStart = +(beats[beats.length - 1].end + GAPS[beats.length - 1]).toFixed(3), ANIM = 7, HOLD = 1.5, ctaAt = 5.0;
const dur = +(endStart + ANIM + HOLD).toFixed(3);
const T = { beats, caps, endStart, ctaAt, dur, gaps: GAPS };
writeFileSync(`${WORK}/timeline.json`, JSON.stringify({ ...T, beats: beats.map((b) => ({ start: b.start, end: b.end })) }, null, 1));

// ---------- assets
const STATES = ['forecast', 'forecast-compare', 'scenario-pre', 'scenario-post', 'scenario-top'];
STATES.forEach((s) => copyFileSync(`${WORK}/shots/${s}.png`, `${AS}/shots/${s}.png`));
const nm = (p) => `video/tools/node_modules/${p}`;
copyFileSync(nm('gsap/dist/gsap.min.js'), `${AS}/gsap.min.js`);
copyFileSync(nm('@fontsource/libre-baskerville/files/libre-baskerville-latin-400-normal.woff2'), `${AS}/fonts/libre-baskerville-400.woff2`);
copyFileSync(nm('@fontsource/libre-baskerville/files/libre-baskerville-latin-700-normal.woff2'), `${AS}/fonts/libre-baskerville-700.woff2`);
copyFileSync(nm('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2'), `${AS}/fonts/ibm-plex-mono-400.woff2`);
copyFileSync(nm('@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2'), `${AS}/fonts/ibm-plex-mono-500.woff2`);
copyFileSync(nm('@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2'), `${AS}/fonts/dm-sans.woff2`);
if (!existsSync(`${AS}/exergy_end.mp4`) && existsSync('video/v1/composition/assets/exergy_end.mp4')) copyFileSync('video/v1/composition/assets/exergy_end.mp4', `${AS}/exergy_end.mp4`);
if (!existsSync(`${AS}/exergy_end.mp4`)) {            // the EXERGY animation, upscaled with a high-quality filter to 4K, last frame held for the call to action
  ff(['-i', EXERGY_ANIM, '-an', '-vf', `scale=3840:2160:flags=lanczos,unsharp=5:5:0.5:5:5:0.0,tpad=stop_mode=clone:stop_duration=${HOLD},format=yuv420p`, '-r', '30', '-c:v', 'libx264', '-crf', '12', '-preset', 'slow', `${AS}/exergy_end.mp4`]);
}

// ---------- composition
const imgs = STATES.map((s) => `<img class="st" id="st-${s}" src="assets/shots/${s}.png" alt="">`).join('');
const html = readFileSync('video/tools/v2/template.html', 'utf8')
  .replaceAll('__DUR__', String(dur)).replaceAll('__ES__', String(endStart)).replaceAll('__VD__', String(ANIM + HOLD)).replace('__IMGS__', imgs)
  .replace('__T__', JSON.stringify(T)).replace('__B__', JSON.stringify({ ...JSON.parse(readFileSync(`${WORK}/shots/boxes.json`, 'utf8')), ...JSON.parse(readFileSync(`${WORK}/shots/boxes2.json`, 'utf8')) }))
  .replace('__CHOREO__', () => readFileSync('video/tools/v2/choreo.js', 'utf8'));
writeFileSync(`${COMP}/index.html`, html);
writeFileSync(`${COMP}/hyperframes.json`, JSON.stringify({ $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' } }, null, 2));
writeFileSync(`${COMP}/meta.json`, JSON.stringify({ id: 'cash-gap-forecaster-launch-v2', name: 'Cash Gap Forecaster launch video v2' }, null, 2));

// ---------- sound effects: the choreography records when each one should land
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`file://${process.cwd()}/${COMP}/index.html`);
await page.waitForFunction(() => window.__timelines && window.__timelines.main && window.__sfx && window.__sfx.length > 0, null, { timeout: 20000 });
const sfx = await page.evaluate(() => window.__sfx); await browser.close();
if (errors.length) { console.error('page errors:', errors); process.exit(1); }
writeFileSync(`${WORK}/sfx.json`, JSON.stringify(sfx, null, 1));
const SF = { click: ['ui/click2.ogg', 0.30], card: ['interface/bong_001.ogg', 0.20], reveal: ['impact/impactSoft_medium_001.ogg', 0.30], thump: ['impact/impactSoft_medium_004.ogg', 0.24], tick: ['ui/rollover2.ogg', 0.16], end: ['impact/impactSoft_heavy_001.ogg', 0.30] };

// ---------- audio mix: voice, music bed ducked under the voice, soft effects
mkdirSync(`${WORK}/audio`, { recursive: true });
const musicFile = existsSync(`${WORK}/audio/music.mp3`) ? `${WORK}/audio/music.mp3` : `${WORK}/audio/music.placeholder.wav`;
if (!existsSync(musicFile)) {
  const f = [110, 110.35, 164.81, 220, 277.18]; const ins = f.flatMap((x) => ['-f', 'lavfi', '-i', `sine=f=${x}:r=48000:d=${dur}`]);
  ff([...ins, '-filter_complex', `[0][1][2][3][4]amix=inputs=5:normalize=0,volume=0.5,tremolo=f=0.18:d=0.45,lowpass=f=900,aecho=0.8:0.7:700|1100:0.35|0.25,afade=t=in:d=3,afade=t=out:st=${dur - 4}:d=4,aformat=channel_layouts=stereo`, musicFile]);
}
const inputs = []; const fl = [];
// every clip is matched to the same loudness and gets short fades at both edges, so the cuts between scenes are inaudible
const measure = (f) => { const r = spawnSync('ffmpeg', ['-nostats', '-i', f, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }); const m = /Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+) LUFS/.exec(r.stderr); return m ? Number(m[1]) : -21; };
const VOICE_LUFS = -21, FADE_IN = 0.02, FADE_OUT = 0.06;
beats.forEach((b, i) => {
  const f = `${WORK}/voice/beat${i + 1}.mp3`; inputs.push('-i', f);
  const ms = Math.round(b.start * 1000), gain = Math.max(-6, Math.min(6, VOICE_LUFS - measure(f))).toFixed(2);
  fl.push(`[${i}:a]aresample=48000,aformat=channel_layouts=mono,volume=${gain}dB,afade=t=in:d=${FADE_IN},afade=t=out:st=${(b.dur - FADE_OUT).toFixed(3)}:d=${FADE_OUT},adelay=${ms}:all=1[v${i}]`);
});
fl.push(`${beats.map((_, i) => `[v${i}]`).join('')}amix=inputs=${beats.length}:normalize=0:duration=longest,pan=stereo|c0=c0|c1=c0,apad=whole_dur=${dur}[voice]`);
inputs.push('-i', musicFile); const mi = beats.length;
fl.push(`[${mi}:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-24:TP=-3:LRA=7,volume=-13dB,atrim=0:${dur},asetpts=PTS-STARTPTS,afade=t=in:d=2.5,afade=t=out:st=${dur - 3.5}:d=3.5[mus]`);
fl.push('[mus]anull[musd]');   // constant level: no ducking, so the music does not swell in the pauses
const sfxLabels = [];
sfx.forEach((e, k) => { const [file, base] = SF[e.name]; inputs.push('-i', `${SFXDIR}/${file}`); const idx = mi + 1 + k; fl.push(`[${idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${(base * e.g).toFixed(3)},adelay=${Math.round(e.t * 1000)}:all=1[s${k}]`); sfxLabels.push(`[s${k}]`); });
fl.push(`[voice][musd]${sfxLabels.join('')}amix=inputs=${2 + sfx.length}:normalize=0:duration=longest,atrim=0:${dur},loudnorm=I=-16:TP=-1.5:LRA=7,aformat=sample_rates=48000:channel_layouts=stereo[out]`);
ff([...inputs, '-filter_complex', fl.join(';'), '-map', '[out]', '-c:a', 'aac', '-b:a', '256k', `${AS}/mix.m4a`]);
console.log(JSON.stringify({ dur, endStart, beats: beats.map((b) => [b.start, b.end]), sfx: sfx.length, music: musicFile }));
