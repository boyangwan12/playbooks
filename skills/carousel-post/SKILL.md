---
name: carousel-post
description: Make a branded LinkedIn carousel (5-8 slides, PNG + PDF) with designed photo-style backgrounds, in EXERGY's voice, for a product, proof of concept, case study or idea. Use whenever the user wants a LinkedIn carousel, "a post like this with the pictures designed", slides for a document post, a carousel to go with a video, or creative carousel ideas, even if they never say "carousel". Covers concept and copy, generating the background art (Gemini through the user's Chrome, or an API), building slides with real typography and the EXERGY logo, overflow checks, and the caption. Pairs with the story-video skill: carousel first, video second.
---

# LinkedIn carousel pipeline

Worked example: the Cash Gap Forecaster carousel (`assets/example-cash-gap/`). Its look follows a carousel EXERGY already posted: cream paper, DM Sans, the logo bottom-left, "01 / 05" bottom-right, sections named *The Problem / The Ripple Effect / The Solution / Proof of Concept / The Invitation*.

**Core idea.** The pictures carry one visual metaphor across all slides (paper going from messy ripples to a clean fold, which is the story of the product), and the **type is real text added by code**, never baked into the generated image. Image generators misspell words and cannot hold a layout; code can. So: generate text-free art, then compose.

## Workflow

### 1. Concept (the creative step)
Pick the metaphor first, then the words. Read `references/concepts.md` for tested directions and how to invent more. The metaphor must change from slide 1 to the last slide in a way a viewer feels without reading (messy to clean, dark to light, tangled to straight, empty to full). Propose 2-3 concepts to the user with a one-line hook each; wait for a choice unless they already gave the idea.

### 2. Copy
Voice and structure in `references/exergy-style.md`. Five slides, each: a section title ending in a full stop, two short paragraphs, **one bold closing line**. Rules that matter:
- Every number real and traceable (from the product or its data).
- Do not claim a real client result unless it is one. For an invented example write "Picture a wholesale bakery..." and call the product "an EXERGY proof of concept". Whether to say "fictional" is the user's call.
- Slide 4 is the proof: three concrete capabilities, each with a lead phrase and a real number if there is one.
- Slide 5 is an invitation to talk, with the contact line `contact@exergylabs.ai` (the address on EXERGY's own carousel).
- If a video follows, slide 4 ends "Check our next post to see it in action."

### 3. Background art
Read `references/image-gen.md`. Default route: drive Gemini (Nano Banana) in the user's Chrome with the Claude-in-Chrome tools, one chat, slide 1 first and later slides as "same scene, but..." follow-ups, 3:4 portrait, text-free, upper 60% empty. Save as `work/paper/paper-N.jpg`. Look at all of them side by side before building; regenerate any slide that breaks the progression. The Gemini API works too but needs billing on the key (free tier returns 429 for image models).

### 4. Build
```
node <skill>/scripts/build.mjs <carousel-dir>     # run from a repo with playwright installed
```
`<carousel-dir>/slides.json` follows `assets/slides.example.json` (blocks: `p`, `b`, `item`+`text`, `note`, `email`). Output in `<carousel-dir>/out/`: `slide-N.png` (2160x2700), `carousel.pdf` (vector text, 1080x1350). The script crops 3:4 art to 4:5 anchored to the bottom (keeps the paper), and prints where each slide's text ends; set `textMax` per slide to the top edge of the artwork (about 770 when the paper is tall, about 1000 when it is flat). It warns on overflow: shorten the copy, do not shrink the type.

### 5. Review and deliver
Make a contact sheet and look at every slide: text clear of the artwork, no orphan words, numbers right, logo and page numbers present, progression reads. Then give the user the PDF (LinkedIn "document" upload) and the PNGs, plus the caption. Do not post for them. Commit sources, not the multi-megabyte renders.

## Caption (post text)
Write it for LinkedIn readers, in the EXERGY voice: a one-line hook (the problem, not the product), two or three short lines of context, the invitation, then 3-4 hashtags. Keep the real-vs-invented framing consistent with slide 1. See `references/linkedin.md`.

## Gotchas
- Browser-tool waits are capped at 10 s; generation takes 10-25 s. Poll with screenshots. Never type the next prompt while the previous image is still generating, the text gets mashed together (this happened).
- Gemini has no 4:5 option; use 3:4 and crop.
- The page's Download buttons are easiest to find with the `find` tool ("Download full size image") and click by ref; files land in `~/Downloads/Gemini_Generated_Image_*.jpeg` (1792x2400), in generation order.
- The Chrome route needs the user's Chrome open with the extension connected and Gemini signed in; stop and ask if not. Close the tab you opened when done.
- The fonts and logo default to the EXERGY brand repo and to `@fontsource-variable/dm-sans`; override with `font` and `logo` in slides.json.
