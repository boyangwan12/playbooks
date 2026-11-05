# Example: Cash Gap Forecaster carousel

`slides.json` is the exact copy used. `preview.jpg` shows the five slides.
The background art (`work/paper/paper-1..5.jpg`, Gemini, 1792x2400) is not stored here (about 13 MB);
regenerate it with the prompts in `references/image-gen.md`, then run:

    node skills/carousel-post/scripts/build.mjs <dir containing slides.json and work/paper/>

(paths in slides.json are relative to that directory; run from a folder where `playwright` is installed).
