#!/usr/bin/env bash
# Bake a poster into frame 0 of a rendered video, so social players show it as the thumbnail.
# Usage: finish.sh <render.mp4> <poster-time-seconds> <final.mp4> [poster.jpg]
#   poster-time: a moment where the title/story is fully on screen (not mid-animation), e.g. 7.3
# Re-run this after EVERY re-render: the poster is a frame of the video, so it carries whatever names and
# text the video had when it was taken. A stale poster once kept an old company name after a rename.
set -euo pipefail
render="$1"; t="$2"; final="$3"; poster="${4:-$(dirname "$final")/poster.jpg}"
ffmpeg -v error -y -ss "$t" -i "$render" -frames:v 1 -q:v 2 "$poster"
ffmpeg -v error -y -i "$render" -i "$poster" \
  -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" -map "[v]" -map 0:a \
  -c:v libx264 -crf 15 -preset medium -pix_fmt yuv420p -r 60 -c:a copy -movflags +faststart "$final"
echo "final: $final"
ffprobe -v error -show_entries format=duration:stream=width,height -of csv=p=0 "$final"
echo "poster: $poster  (LOOK AT IT: names, spelling, no mid-animation frame)"
