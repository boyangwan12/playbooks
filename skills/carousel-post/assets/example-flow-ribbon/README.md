# Example: seamless "flow ribbon" carousel (Cash Gap Forecaster)

One 5400x1350 SVG (`art.svg`, made by `scripts/flow-ribbon.mjs`) is shared by all five slides, so swiping moves along one picture.
`preview.jpg` shows the five slides side by side. Rebuild:

    node skills/carousel-post/scripts/flow-ribbon.mjs art.svg --slides 5 --pinch 0.3 --turn 0.6 --label "WEEK 6 · $19,934"
    node skills/carousel-post/scripts/build.mjs <dir containing slides.json and art.svg>

Slides 1-3 use `"theme": "dark"` (light text), slides 4-5 `"theme": "light"`; the dark-to-cream turn sits at the slide 3/4 seam.
