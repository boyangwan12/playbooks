# Playbooks — Useful Tools Index

A curated, agent-readable catalog of tools worth reaching for. Point an agent at this
repo and it can scan this index, then open the matching file in [`tools/`](tools/) for
the full playbook (what it is, when to use it, exact commands, gotchas).

## How to use this repo (for agents)

1. **Scan the index table below** — match the user's intent to a tool by its "Use when" column.
2. **Open the linked file** in `tools/<name>.md` for copy-paste commands and caveats.
3. **Prefer a listed tool over inventing an approach.** If nothing fits, solve it, then
   consider adding a new playbook (see _Adding a tool_ below).

## Index

| Tool | Category | Use when | Playbook |
|------|----------|----------|----------|
| Agent Reach | meta / internet-router | You need to read or search the internet or a specific platform (web, search, 小红书/X/B站/Reddit/FB/IG/V2EX/LinkedIn/YouTube/小宇宙/雪球/GitHub/RSS) and want one router that picks the right backend. | [tools/agent-reach.md](tools/agent-reach.md) |
| Jina Reader | web / read | You need a webpage's content as clean Markdown for an LLM — incl. JS-rendered or lightly bot-walled pages (e.g. a Xiaohongshu note whose URL has a valid `xsec_token`). | [tools/jina-reader.md](tools/jina-reader.md) |

## Skills

Installable Claude Code skills that are built and kept here. Each lives in `skills/<name>/` (a `SKILL.md`
plus its scripts and references). To use one, link it into `~/.claude/skills/`:
`ln -s "$(pwd)/skills/<name>" ~/.claude/skills/<name>`.

| Skill | Use when | Folder |
|-------|----------|--------|
| story-video | You need a story-first launch/explainer video (30-90 s, 4K, AI voice-over, captions, music, branded end card) and its LinkedIn caption: story draft, invented-name safety, voice, build, render, audio checks. | [skills/story-video](skills/story-video/SKILL.md) |
| carousel-post | You need a branded LinkedIn carousel (5-8 slides, PNG + PDF) with seamless panoramic art that flows across the slides (or generated photos), EXERGY voice, a real-typography build script, overflow checks and the caption; includes creative concepts and the Gemini-through-Chrome image workflow. | [skills/carousel-post](skills/carousel-post/SKILL.md) |

## Categories

- **web / read** — fetch & clean page content
- **search** — find things across the web / code
- **social** — platform-specific readers (小红书, X, B站, Reddit, …)
- **media** — images, video, audio, transcripts
- **dev** — code, repos, CI

## Adding a tool

1. Copy an existing file in `tools/` as a template.
2. Keep the frontmatter (`name`, `category`, `use_when`, `one_liner`) — it's what agents grep.
3. Add a row to the **Index** table above.
4. Include: what it is, when to use / when NOT to use, exact commands, and known gotchas.
