# Example: seamless data-line carousel (Cash Gap Forecaster)

One 5400x1350 SVG shared by all five slides; the forecast line (real weekly values from the app) flows across every seam.
Rebuild:

    node skills/carousel-post/scripts/chart-panorama.mjs chart.json art.svg
    node skills/carousel-post/scripts/build.mjs <dir containing slides.json and art.svg>

`chart.json` x values are pixel positions across the 5400 px strip (weeks are spaced unevenly on purpose so week 6 lands on slide 3);
values are $ thousands. Slide text order follows the picture: slide 2 ends on a swipe cliffhanger, slide 3 shows the dip and the fix.
