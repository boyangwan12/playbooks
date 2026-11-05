# Carousel concepts

A concept is one visual metaphor that **changes across the slides**, so the viewer feels the story before reading. Pair it with the five roles in `exergy-style.md`. Each entry: metaphor, how it moves, a prompt seed (always add "No text, no logos", warm off-white palette, empty upper 60%).

## Rule: it must flow
A concept only works if the slides connect. Design ONE wide picture and slice it. Test by joining the exported slides side by side: the artwork must continue across every seam. Keep text away from the seams.

## Tested
**00. Data line across the strip (default for product/data stories).** The product's own line chart, drawn as one seamless picture: minimum-cash dashed line, the dip shaded, a gold "after the move" line, labelled markers, a dotted fade-out at the end. One flat cream background. Used for the Cash Gap Forecaster carousel after the abstract ribbon was rejected as unreadable. Made by `scripts/chart-panorama.mjs`. Best for: anything with a time series, a threshold and a before/after.

**0. Flow ribbon (seamless panorama; abstract, rejected once for being illegible).** One ribbon of light runs across all slides: tangled and wide at the start, squeezed to a point at the problem (labelled, e.g. "WEEK 6 · $19,934"), then opening into a calm, wide band; background dark to cream with the turn at a slide seam. Made by `scripts/flow-ribbon.mjs`. Best for: cash flow, pipelines, process bottlenecks, anything that narrows then clears.

**1. Rippled paper to clean fold** (photo series, used for the first Cash Gap Forecaster carousel; matches EXERGY's existing carousel family, which a coworker already posted). Five separate photos with gradual change: weaker than a seamless panorama.
Messy crumples, calmer ripples, one smooth wave, almost flat, neatly folded stack. Best for: tidy-up, clarity, "from chaos to control" stories. Prompts in `image-gen.md`.

## Untested directions (propose, then test one slide before committing to five)
**2. Tangled thread to straight line.** A cream cotton thread knotted on the wall, loosening, then one straight line. Seed: "a single cream thread on a plaster wall, tightly tangled in a knot of loops" then "same, fewer loops", "a gentle curve", "a perfectly straight line". Best for: process mess, scheduling, data cleaning.

**3. Stacked papers to one sheet.** A tall, leaning stack of paper shrinks over slides to a single page. Best for: reporting, documents, "everything in one place".

**4. Dim room to open window light.** The same corner of a room, with light growing slide by slide until a clear window of sunlight. Best for: visibility, forecasting ("see it early"), dashboards.

**5. Scattered stones to a balanced cairn.** Loose river stones, grouped, then a stable stack. Best for: prioritisation, capacity, workload.

**6. Cracked ceramic to repaired (kintsugi).** A cup with growing gold seams. Best for: recovery, resilience, risk, "fix before it breaks".

**7. Calendar grid filling up.** Abstract paper tiles for weeks; one tile highlighted, then moved. Best for: the 13-week forecast idea; closest to the product.

## How to invent more
1. Name the before and after state of the reader's problem in four words each ("tangled, slow" / "clear, calm").
2. Find a physical object that can show both states with one material and one light.
3. Write five points along the change, equally spaced; slide 1 must already look unsettled, slide 5 resolved.
4. Keep camera, wall, light and palette constant; change one thing per slide.
5. Generate slide 1 and slide 5 first: if the two extremes look good, the middle slides will.
6. Reject concepts that need text inside the image, people's faces, logos, or hands (generators handle them badly and they raise rights questions).
