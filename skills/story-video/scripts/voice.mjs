// Generates the narration with ElevenLabs, with character-level timestamps, one clip per narration line.
// Usage: node --env-file=.env video/tools/voice.mjs [outDir] [narration.json]   (the key is read from env, never printed)
//
// Takes are CHAINED: each request carries the request ids of the takes before it (previous_request_ids) and the text
// of the line after it (next_text), so tone, pace and loudness carry across the cuts between scenes.
// A `joins.json` next to the narration file lists lines (1-based) that are generated as ONE take with the line after
// them, then split at the pause between the two, so two halves of one sentence keep a single intonation.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
const out = process.argv[2] ?? 'video/v2/work/voice';
const narration = process.argv[3] ?? 'video/tools/v2/narration.json';
const { ELEVENLABS_API_KEY: key, ELEVENLABS_VOICE_ID: voice, ELEVENLABS_MODEL_ID: model = 'eleven_multilingual_v2', ELEVENLABS_OUTPUT_FORMAT: fmt = 'mp3_44100_128' } = process.env;
if (!key || !voice) { console.error('missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID'); process.exit(1); }
const lines = JSON.parse(readFileSync(narration, 'utf8'));
const joinFile = join(dirname(narration), 'joins.json');
const joins = new Set(existsSync(joinFile) ? JSON.parse(readFileSync(joinFile, 'utf8')) : []);
const settings = { stability: 0.5, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true, speed: 0.96 };

const units = [];                                   // { lines: [first line index, ...] , text }
for (let i = 0; i < lines.length; i++) {
  if (joins.has(i + 1) && i + 1 < lines.length) { units.push({ idx: [i, i + 1], text: `${lines[i]} ${lines[i + 1]}` }); i++; }
  else units.push({ idx: [i], text: lines[i] });
}

const sub = (a, from, to, shift) => ({ characters: a.characters.slice(from, to), character_start_times_seconds: a.character_start_times_seconds.slice(from, to).map((x) => +(x - shift).toFixed(3)), character_end_times_seconds: a.character_end_times_seconds.slice(from, to).map((x) => +(x - shift).toFixed(3)) });
const requestIds = [];
for (let u = 0; u < units.length; u++) {
  const { idx, text } = units[u];
  const body = { text, model_id: model, voice_settings: settings };
  if (requestIds.length) body.previous_request_ids = requestIds.slice(-3); else body.previous_text = undefined;
  if (units[u + 1]) body.next_text = units[u + 1].text;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=${fmt}`, { method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) { console.error(`line ${idx[0] + 1}: HTTP ${res.status}`, (await res.text()).slice(0, 300).replace(key, '***')); process.exit(1); }
  const rid = res.headers.get('request-id'); if (rid) requestIds.push(rid);
  const j = await res.json();
  const mp3 = Buffer.from(j.audio_base64, 'base64'), al = j.alignment;
  if (idx.length === 1) {
    writeFileSync(`${out}/beat${idx[0] + 1}.mp3`, mp3); writeFileSync(`${out}/beat${idx[0] + 1}.align.json`, JSON.stringify(al));
  } else {                                          // one take, two beats: cut in the middle of the pause between them
    const n1 = lines[idx[0]].length;                // the space between the two lines is character n1
    const cut = +((al.character_end_times_seconds[n1 - 1] + al.character_start_times_seconds[n1 + 1]) / 2).toFixed(3);
    const tmp = `${out}/_take.mp3`; writeFileSync(tmp, mp3);
    const enc = ['-c:a', 'libmp3lame', '-b:a', '128k'];
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-t', String(cut), ...enc, `${out}/beat${idx[0] + 1}.mp3`]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(cut), '-i', tmp, ...enc, `${out}/beat${idx[1] + 1}.mp3`]);
    writeFileSync(`${out}/beat${idx[0] + 1}.align.json`, JSON.stringify(sub(al, 0, n1, 0)));
    writeFileSync(`${out}/beat${idx[1] + 1}.align.json`, JSON.stringify(sub(al, n1 + 1, al.characters.length, cut)));
    console.log(`lines ${idx[0] + 1}+${idx[1] + 1}: one take, split at ${cut}s`);
  }
  console.log(`line ${idx.map((k) => k + 1).join('+')} ok`);
}
