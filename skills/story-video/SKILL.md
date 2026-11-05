---
name: story-video
description: Make a story-first launch/explainer video (30-90 s, 4K, AI voice-over, captions, music, branded end card) for a product, demo app or proof of concept, and the LinkedIn caption that goes with it. Use whenever the user wants a launch video, demo video, "video for LinkedIn", a video of a POC or app, a redo of a video that "is too fast / unclear", or a new version of an existing video, even if they never say "story". Covers story draft and approval, invented-company-name safety, ElevenLabs voice with word timestamps, drawn scenes plus a few real app screens, music, Hyperframes render, poster, and audio seam checks. Prefer this over the brag skill when the video must explain a business problem and result to people who have never seen the product.
---

# Story-first video pipeline

A reusable pipeline distilled from the Cash Gap Forecaster launch video (POC_02, `video/v2/`). The finished project is the worked example: `assets/reference-impl/` holds its scripts, and the repo has every output.

**Core idea.** People do not understand a product from a fast tour of its screens. They understand a *story*: what happened to a business, why it hurt, how the product changed that, and the result. So the story is **drawn** (simple cards, timelines, numbers animating in sync with the voice) and the real app appears only for the two or three moments that prove it, held long enough to read. A coworker's review of v1 ("too fast, I don't understand what the pages are") is the reason this pipeline exists; do not slide back into a feature tour.

## Workflow

Do the phases in order. Phases 1 and 2 are cheap and are where the expensive mistakes get caught; do not start voice generation or rendering before the user approves the story and the names.

### 0. Intake (ask only what you cannot infer)
Product and audience; where it will be posted (LinkedIn: aim for 60-85 s, never over 90); brand end card asset; voice (ElevenLabs voice id in `.env`); whether the company in the story is a real client or an invented example (see Disclosure). Check `.env` has `ELEVENLABS_API_KEY`/`ELEVENLABS_VOICE_ID`; never print keys.

### 1. Names first
Every company, hotel, bakery, vendor or person name that can appear on screen or in the voice must be invented, and checked before anything is built. Renaming later means regenerating data, re-capturing screens, re-rendering and re-baking the poster. Read `references/name-safety.md`. In short: coin names, search each with exact-phrase web searches, reject anything with hits, anything that is a character or brand, and anything that matches the user's own company, agency or clients. A web search lowers risk; it is not trademark clearance, and you must say so.

### 2. Story draft, then approval
Write `STORY.md` from `references/story-template.md`: one-sentence takeaway per beat, full narration (first person, the business owner), scene-by-scene plan, time budget, numbers used and where each comes from. Narration is 7-9 short lines, about 140-170 words. **Every number must be real** (from the running app or simple arithmetic on it). Show the user the narration and wait for approval. Drafts get reworked; keep a short "dropped and why" list.

Beat shape that worked: (1) who the owner is, (2) why the old way misleads, (3) the pile-up with a date, (4) the product learns from history, (5) the gap, drawn on the real forecast, (6) try a fix, (7) result number, (8) conclusion in the owner's voice (control, time to act, no stress), (9) product name + brand. Keep one client name for the viewer to remember.

### 3. Voice
Use `scripts/voice.mjs` (ElevenLabs `with-timestamps`; outputs `beatN.mp3` + `beatN.align.json`). It already does the three things that fixed audible cuts between scenes:
- **Chains takes** with `previous_request_ids` + `next_text`, so tone and loudness carry across scenes.
- **Joins**: a `joins.json` next to the narration lists lines to generate as ONE take and split at the pause (a sentence broken across two scenes otherwise resets its intonation at the cut).
- Regenerating one line alone loses the chain; regenerate the whole file when wording changes.
Regeneration costs credits and changes every take slightly; tell the user. The company name often is not spoken; if a coined name is spoken, listen for how it is pronounced (ask the user to confirm; you cannot hear audio yourself).

### 4. App screens (only the proof moments)
Capture 2-4 stills with Playwright (`channel: 'chrome'`, 3x device scale) plus bounding boxes of the elements to highlight (`boxes.json`). Hide noise (ids, test labels). Re-run capture whenever the app, its data or any name changes. Max two app screens, each held 8 s or more, one thing zoomed per screen. Nothing clicks while the voice is talking; clicks happen in the silence after a sentence.

### 5. Choreography and build
Copy `assets/reference-impl/` into the project (`video/tools/vN/`) and `npm install` its fonts/GSAP. `template.html` is the stage (1920x1080 authored, rendered 2x to 4K, paused GSAP timeline at `window.__timelines['main']`). `choreo.js` keys every on-screen move to spoken words with `A(beat, 'word', n)` (word start), `Z` (end), `S`/`E` (beat start/end), `gapEnd`. `build.mjs` measures the clips, builds captions and the timeline, writes the composition and mixes the audio. Edit narration and gaps (`GAPS`, seconds of silence after each beat: room to read and for clicks) there. The reference scripts have hard-coded paths and scene content for the bakery story; keep the machinery, replace the content. Anything keyed to a word breaks if narration changes that word: grep `A(` after editing narration.

### 6. Check before rendering
`cd composition && npx hyperframes check`. Fix errors. Known acceptable warnings: `first_frame_empty` (solved by the poster bake), `composition_file_too_large`, 52 px "by EXERGY" tag. Take `hyperframes snapshot --at t1,t2,...` at the beat starts, the longest caption and the end card, and look at them: captions fit one line, nothing overlaps, no leftover old names.

### 7. Render, poster, verify
```
npx hyperframes render --quality delivery --resolution 4k --fps 60 --video-frame-format png --output ../render.mp4
bash scripts/finish.sh render.mp4 <poster-time> final.mp4     # poster baked into frame 0
python3 scripts/audio_check.py final.mp4 work/timeline.json     # seams and loudness
```
Renders take a few minutes; run in the background. Look at the poster and an end-card frame yourself. Delete `render.mp4` after baking. Targets: about -16 to -17 LUFS, peak under -1.5 dBFS, duration under 90 s.

### 8. Share copy and delivery
Write the LinkedIn caption (`share-copy.txt`) in the company's voice (see `references/lessons.md`, "Posting"). Commit locally; **push only when asked**. Report what was verified and what was not (you cannot listen to the video).

## Audio rules (each one fixed a real problem)
- **Music at one constant low level** (`volume=-13dB` after `loudnorm=-24`). Sidechain ducking made the music swell by about 17 dB in the pauses and the user disliked it.
- **Per-clip loudness match + 20 ms fade-in / 60 ms fade-out** in the mix; this is what removes clicks at scene joins.
- **Music source:** the ElevenLabs key often lacks music/sound-effect permission (401). Do not keep retrying. Use a CC0 track (OpenGameArt), trim a steady stretch, and record the source and licence in `MUSIC_CREDITS.md`.
- Shorten pauses between scenes rather than dropping them: the viewer needs them to read the screen.
- Voice speed 0.96, stability 0.5 worked for a calm owner voice.

## Disclosure and honesty
Whether the video says the company is fictional is the **user's** call; do not add or remove such a line on your own. Do flag it when it matters: if the same account posts real client case studies, an invented bakery with no disclosure can read as a real result. Caption wording like "a typical wholesale bakery" avoids the problem without touching the video.

## Repo hygiene
Keep `video/v1/`, `video/v2/`, `video/tools/` separate; inputs under `work/`, outputs next to `STORY.md`; a README with rebuild steps. Superseded cuts may keep old names, which stay public if the repo is public; say so rather than silently leaving them. Do not commit `render.mp4`, `node_modules`, `.env`.

See `references/lessons.md` for the full list of pitfalls and how they showed up.
