---
name: Jina Reader
category: web / read
use_when: You need a webpage's readable content as clean Markdown for an LLM, including JavaScript-rendered pages or ones a plain curl can't fetch.
one_liner: Prefix any URL with https://r.jina.ai/ to get the page back as clean, LLM-friendly Markdown.
maker: Jina AI
homepage: https://jina.ai/reader
auth: none for basic use; optional API key for higher rate limits
---

# Jina Reader

## What it is

A free web service that fetches a webpage, renders its JavaScript in a real headless
browser, strips nav/ads/scripts, and returns the main content as **Markdown**. Part of
Jina AI's search tooling (`s.jina.ai` is the sibling web-*search* endpoint).

## When to use

- You want a page's text in clean Markdown to feed to an LLM.
- The content is behind JavaScript (modern SPAs where raw HTML is empty).
- A plain `curl` hits a bot-wall / login shell but the page is otherwise public.
- You only have a URL and want "just the readable content."

## When NOT to use

- **Truly private/authed content** — it only sees what's publicly reachable. For
  Xiaohongshu it works *only* if the URL carries a valid `xsec_token`; otherwise you get
  the login page.
- **Images** — Reader returns image *URLs*, not their contents. Download and OCR/view
  them separately (see recipe below).
- **Structured platform data** — no like/save/comment counts, no comment threads. Use a
  dedicated platform backend (e.g. OpenCLI for 小红书) when you need those.
- **Sensitive URLs** — the URL and page pass through Jina's servers; treat accordingly.

## Usage

Prefix the target URL with `https://r.jina.ai/`:

```bash
# Get a page as clean Markdown
curl -s "https://r.jina.ai/https://example.com/some-article"

# Works on JS-heavy / lightly walled pages, e.g. a Xiaohongshu note WITH a valid xsec_token
curl -s --max-time 40 "https://r.jina.ai/https://www.xiaohongshu.com/explore/<id>?xsec_token=<token>&xsec_source=pc_search"
```

Optional (higher limits / extras) — pass an API key:

```bash
curl -s "https://r.jina.ai/https://example.com" -H "Authorization: Bearer $JINA_API_KEY"
```

Useful response-shaping headers:

- `-H "X-Return-Format: markdown"` (default) — also `text`, `html`, `screenshot`.
- `-H "X-Target-Selector: article"` — extract only a CSS selector's subtree.
- `-H "X-Timeout: 30"` — max seconds to wait for the page.

## Recipe: read a page's text AND its images

Reader gives text + image URLs. To actually read the images:

```bash
# 1) text
curl -s "https://r.jina.ai/$URL" > page.md

# 2) pull image URLs out of the markdown, download, convert (macOS), then view with your image tool
#    (xhscdn and similar may need a Referer header)
curl -s -H "Referer: https://www.xiaohongshu.com/" -o img.webp "$IMG_URL"
sips -s format png img.webp --out img.png     # macOS webp->png
# then Read/OCR img.png
```

## Gotchas

- **Rate limits** on the free tier — space out bulk calls; add an API key if you hit them.
- **`xsec_token` for Xiaohongshu** expires; grab a fresh URL from search/feed rather than
  reusing an old one, and never use a bare note_id.
- **Latency** — it renders in a browser, so use `--max-time` (e.g. 40s) to avoid hangs.
- It reflects public state only; a page that looks logged-out to Jina yields the login shell.

## Related

- `s.jina.ai/<query>` — Jina's web **search** endpoint (returns top results as Markdown).
- For platform-native reads (counts, comments), prefer a dedicated backend over Reader.
