# Lessons and pitfalls (from the POC_02 video)

Each item: what happened, then what to do.

## Story
- **v1 was a feature tour (85 s, many screens). A coworker said it was too fast and unclear.** Rebuilt story-first as v2. Draft the story and get approval before building anything.
- A conclusion line over the result screen helped ("I saw it over a month early, so I have time to fix it. I'm in control of my cash, and there's no need to stress."). Without it the video jumped from the result number to the end card.
- Do not overclaim: the app's result card said weeks 12 and 13 still dip. Keep the narration consistent with what is on screen.

## Voice (ElevenLabs)
- Separate takes per scene produced audible resets at the joins: loudness spread of about 4 dB (-19 to -23 LUFS), one clip ending at about -35 dBFS (cut off), a sentence split across two takes with a reset in pitch. Fix: chained generation, joins.json for split sentences, per-clip loudness match and fades in the mix.
- `with-timestamps` returns per-character timings; `build.mjs` turns them into word times that drive the animation. Changing a spoken word breaks `A(beat,'word')` lookups (the build throws; fix the key).
- You cannot hear audio. After fixing, say which problems you measured and fixed and which you could not verify; ask the user for timestamps if they still hear a cut.
- Some takes end with a tail still audible in the last 50 ms; the 60 ms fade-out hides it, but consider regenerating if the user still hears it.

## Music and effects
- Music generation endpoints returned 401 for the user's key (permission missing even though the key "works" for TTS). Stop after one attempt, tell the user the permission is missing, and use a CC0 track.
- Ducking the music under the voice caused a big swell in pauses. Keep it constant.
- Bundled UI sound effects (click, card, thump, tick) at low gain sit under the voice; the choreography records when each should land (`window.__sfx`).

## Rendering (Hyperframes)
- `hyperframes check` flags: type below 56 px (4K) floor, `line_unread` (hold text about 0.5 s + 0.3 s per word), dead stretches, first frame empty. Fix or consciously accept; list accepted ones.
- Render flags: `--quality delivery --resolution 4k --fps 60 --video-frame-format png`. About 2-3 minutes for 85 s on this machine; run in the background.
- First frame is the social thumbnail: bake the poster into frame 0 (`scripts/finish.sh`) after every render.
- Playwright's bundled browser may be missing; use `channel: 'chrome'`.
- zsh quirks: unquoted globs error with "no matches found"; `set -- $w` does not word-split; macOS `sed -i` needs `''`. Use python for scripted edits.

## Names and legal
- Late discovery that "Crumb & Co." (real bakeries), "Brightside Cafe" (real cafes) and "Grand Meridian" (close to Le Meridien) collided with real businesses caused a full rename. Then "Pellwick" collided with the user's own agency name, and "Hoshimaru" is a manga character. See `name-safety.md` and do it in phase 1.
- Renaming data without changing numbers: change name strings only, keep list lengths, regenerate, diff against the old data after mapping names.
- Old names survive in git history and in superseded cuts; report that, do not hide it.

## Posting
- LinkedIn: a native document carousel tends to have the highest engagement rate (benchmarks differ: 2% to 24% depending on how engagement is defined; carousels beat single images and text; versus video it varies by study). A carousel post followed by a video post was the team's plan.
- EXERGY's carousel voice: plain, second person, calm; sections like The Problem, The Ripple Effect, The Solution, Proof of Concept, The Invitation; short bold closing line per slide; contact line at the end; "Next up: we'll show you the Proof of Concept in action." Match the caption to that voice, not the owner's first-person voice.
- Their carousel says "we built this for one of our clients". If the video's company is invented, word the caption as an example business so viewers do not read it as a real client result.

## Process
- Commit locally after each verified change; push only when asked. Keep old versions (v1) unless the user says delete.
- Keep the repo tidy (v1/v2/tools split, README with rebuild steps). Generated `render.mp4` is deleted after the poster bake.
- When the user's feedback is vague ("weird cuts"), say what you measured, what you changed and what you could not verify, and ask for a timestamp.
