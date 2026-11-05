# Generating the background art

## Options (decided in the first session)

| Route | Status | Notes |
|---|---|---|
| **Gemini app in the user's Chrome (Claude in Chrome tools)** | Works, used for the example | Uses the user's Gemini Pro plan, no API billing. Slower and more fragile than an API. Needs Chrome open, extension connected, Gemini signed in. |
| **Gemini API** (`gemini-2.5-flash-image`, `gemini-nano-banana-2.1`, `gemini-3-pro-image`...) | Needs billing | The key in `.env` (`VITE_GEMINI_API_KEY`) was valid and listed image models but every call returned 429 "free tier limit 0". Enable billing on the key's Google Cloud project (set a monthly cap, about $5). Prices from third-party pages, unverified: about $0.04 to $0.14 per 1K image. |
| **Pollinations (free, keyless)** | Rejected | Ignored the prompt, low resolution (686x858), watermark. |
| **User's own images** | Always fine | If a coworker already has the artwork, use it and skip generation. |
| **Procedural SVG paper** | Fallback | Clean but not photographic; only if nothing else is possible. |

## Driving Gemini through Chrome (steps that worked)

1. Load the tools in ONE ToolSearch call (see the chrome-browser skill): tabs_context_mcp, navigate, computer, find, read_page, tabs_create_mcp, tabs_close_mcp.
2. `tabs_context_mcp` with `createIfEmpty`, then `navigate` to `https://gemini.google.com/app`, screenshot to confirm it is signed in (shows the user's name and the Pro badge).
3. Click **Images** in the left sidebar (it opens `/images`). The first time a "Create images with Nano Banana" dialog appears: click **Try it**.
4. Click **Aspect ratio** and choose **3:4** (options are 1:1, 9:16, 3:4, 4:3, 16:9; there is no 4:5).
5. Click the prompt box, `type` the slide-1 prompt, press **Return** (or click the send arrow). The page moves to a chat URL.
6. **Wait with 10 s waits and screenshots.** The tool refuses waits over 10 s. Generation takes 10-25 s; the stop button shows while it runs. Only send the next prompt when the stop button is gone and the image has appeared.
7. For slides 2..N send follow-ups in the same chat: "Same scene, same paper, same wall and lighting, same framing. <change>". This keeps the look consistent.
8. If Gemini answers "I encountered an error doing what you asked", use the small reload icon under the reply, then **Try again** (worked once on the first retry). Stop and ask the user after 2-3 failures.
9. Use `find` with "download buttons for each generated image": it returns "Download full size image" refs. Click each by `ref`. Files arrive in `~/Downloads/Gemini_Generated_Image_*.jpeg`, 1792x2400, about 2.7 MB each. Map them to slides by modified time (generation order), copy to `work/paper/paper-N.jpg`.
10. Contact-sheet them (ffmpeg hstack) and look. Close your tab with `tabs_close_mcp`.

## The prompts that worked (paper metaphor)

Slide 1 (full prompt, text-free, top 60% empty):
> Minimal premium editorial photograph, portrait. A single long sheet of thick cream-white textured paper lies along the bottom third of the frame, bunched into several tall, irregular, messy ripples and crumples. Soft diffused studio light from the upper left, gentle realistic shadows on a plain cream plaster wall. The upper 60% of the frame is empty, smooth cream wall with no objects. Warm off-white palette, calm, high-end brand photography. No text, no logos.

Follow-ups (each prefixed "Same scene, same paper, same wall and lighting, same framing."):
2. "The ripples are still there but fewer, lower and a little calmer." (looked close to slide 1; ask for a clearer step if wanted)
3. "The paper is now one smooth, long, gentle wave, with no crumples."
4. "The paper is now almost flat, with just one soft lift at the edge."
5. "The paper is now neatly folded in half into a clean, crisp stack, lying flat and calm."

## Prompt craft
- Always say "No text, no logos" and keep a big empty region for the type.
- One subject, one wall, one light. Change a single thing per slide.
- Name the palette (warm off-white) so every slide matches the cream background of the template.
- Check the result for stray text, extra objects, or a changed wall colour before building.
