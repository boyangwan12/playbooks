#!/usr/bin/env python3
"""Check the audio seams of a finished story video.

Usage: python3 audio_check.py <video.mp4> <work/timeline.json>

For every narration clip it decodes the final mix and reports, at the clip start and end:
  - maxstep: the largest sample-to-sample jump within +-30 ms (a click or a hard cut shows as a big value
    at a clip END; speech onsets are naturally larger at a clip START, so only judge the ends)
  - rms: how loud the mix is there
It also prints the integrated loudness of the whole video (target about -16 to -17 LUFS).

Rule of thumb from past runs: clip ENDS should have maxstep below about 0.02. A tail that is still
audible in the last 50 ms (about -35 dBFS or louder) means the text-to-speech take was cut off:
regenerate that line or lengthen its fade-out.

False positives: the mix also contains music and effects, so a flagged end can be a musical note rather
than a voice cut (seen once on a final clip whose own voice file ended in -90 dB silence). Confirm by
checking the clip's own tail: ffmpeg -i beatN.mp3 -af "atrim=start=<dur-0.1>,volumedetect" -f null -
(a mean near -90 dB means the voice ended cleanly).

Limits: this finds clicks and level jumps. It cannot judge whether a join SOUNDS natural. Ask the
user for timestamps if they still hear something.
"""
import json, subprocess, sys, tempfile, wave
import numpy as np

video, timeline = sys.argv[1], sys.argv[2]
beats = json.load(open(timeline))["beats"]
with tempfile.TemporaryDirectory() as d:
    wav = f"{d}/mix.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-ac", "1", "-ar", "48000", wav], check=True)
    w = wave.open(wav)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
step = np.abs(np.diff(x))
sr = 48000
print(f"{'clip':<8}{'edge':<7}{'t(s)':>8}{'maxstep':>10}{'rms':>9}")
for i, b in enumerate(beats, 1):
    for edge, t in (("start", b["start"]), ("end", b["end"])):
        a, z = int((t - 0.03) * sr), int((t + 0.03) * sr)
        flag = "  <-- check" if edge == "end" and step[a:z].max() > 0.02 else ""
        print(f"beat{i:<4}{edge:<7}{t:>8.2f}{step[a:z].max():>10.4f}{np.sqrt(np.mean(x[a:z] ** 2)):>9.4f}{flag}")
out = subprocess.run(["ffmpeg", "-nostats", "-i", video, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
for line in out.splitlines()[-12:]:
    if line.strip().startswith("I:"):
        print("integrated loudness:", line.strip())
