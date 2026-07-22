---
name: Agent Reach
category: meta / internet-router
use_when: You need to read/search the internet or any specific platform — web pages, search, 小红书/X/B站/Reddit/FB/IG/V2EX/LinkedIn/YouTube/小宇宙/雪球/GitHub/RSS — and want one router that picks the right backend.
one_liner: A Claude Code skill + CLI that routes 15 internet platforms to the best available backend (OpenCLI / per-platform CLIs / public APIs).
maker: Panniantong
homepage: https://github.com/Panniantong/Agent-Reach
auth: core channels zero-config; login channels need Chrome extension and/or cookies
---

# Agent Reach

## What it is

An "internet capability router." It ships as **both**:
- a **Claude Code skill** (`~/.claude/skills/agent-reach`) — routing tables + per-category
  reference docs the agent reads to pick the right command; and
- a **CLI** (`agent-reach`, pipx-installed) that installs/manages backends and reports status.

Covers 15 platforms across categories: search, social (小红书/X/B站/V2EX/Reddit/FB/IG),
career (LinkedIn), dev (GitHub), web (pages/articles/RSS), video (YouTube/B站/小宇宙),
finance (雪球).

## Standing rules (from the skill)

1. **Health-check first** for multi-backend/login platforms: `agent-reach doctor --json`,
   then use the command group matching each platform's `active_backend`.
2. **Say which backend you're using** before acting.
3. On failure, follow the **retry chains in `references/*.md`** — don't guess commands.
4. For broad research, **combine platforms in parallel** (Exa + X/Reddit + 小红书/B站), then synthesize.
5. Workspace: write temp to `/tmp/`, persistent data to `~/.agent-reach/`. Don't create files in the agent workspace.

## Install (global, done on this machine 2026-07-22)

```bash
# core CLI
pipx install "https://github.com/Panniantong/agent-reach/archive/main.zip"
# core zero-config channels: Web(Jina), YouTube, GitHub, RSS, Exa, V2EX, Bilibili(basic)
agent-reach install --env=auto
# login channels (OpenCLI-backed): 小红书 / Facebook / Instagram
agent-reach install --channels=opencli,xiaohongshu,facebook,instagram
```

Current state here: **agent-reach 1.5.0**, skill at `~/.claude/skills/agent-reach` (global),
**7/15 channels live** (GitHub, YouTube, V2EX, RSS, Exa, Jina web, Bilibili-search).
小红书/FB/IG installed but **pending the OpenCLI Chrome extension + site login** (see below).

## The OpenCLI manual step (login platforms: 小红书/FB/IG, and optionally X/Reddit)

OpenCLI reuses your logged-in Chrome session; its extension must be added by hand:
1. Add extension: https://chromewebstore.google.com/detail/opencli/ildkmabpimmkaediidaifkhjpohdnifk
2. Keep Chrome open, log into the target sites (xiaohongshu.com / facebook.com / instagram.com).
3. `opencli doctor` → Extension should show connected (`opencli daemon restart` if it lags).
4. `agent-reach doctor --json` → those channels flip `warn` → `ok`.

## Key commands by platform

```bash
# status / health
agent-reach doctor --json
agent-reach check-update

# web (zero-config) — clean Markdown of any public page  [see tools/jina-reader.md]
curl -s "https://r.jina.ai/URL"

# search (zero-config, free)
mcporter call 'exa.web_search_exa(query: "query", numResults: 5)'

# GitHub / V2EX / Bilibili / YouTube (zero-config)
gh search repos "query" --sort stars --limit 10
curl -s "https://www.v2ex.com/api/topics/hot.json" -H "User-Agent: agent-reach/1.0"
bili search "query" --type video -n 5     # (pipx install bilibili-cli for full features)
yt-dlp --write-sub --skip-download -o "/tmp/%(id)s" "URL"

# 小红书 (OpenCLI backend; note URL must carry a fresh xsec_token, never a bare note_id)
opencli xiaohongshu search "query" -f yaml
opencli xiaohongshu note "NOTE_URL" -f yaml
opencli xiaohongshu comments NOTE_ID -f yaml

# Facebook / Instagram (OpenCLI backend)
opencli facebook search "query" -f yaml
opencli instagram user USERNAME --limit 12 -f yaml
```

## Gotchas

- **Backends ≠ skill.** The skill docs can exist without the CLIs; check `agent-reach doctor`
  before assuming a platform works. If `agent-reach` isn't on PATH, add `~/.local/bin`.
- **小红书 xsec_token** is mandatory and expires — get a fresh URL from search/feed; a bare
  note_id fails on all backends. Rate-limit: space calls 2–3s or you trigger captchas.
- **Read-only mindset** — the skill is for fetching; no posting/liking/commenting.
- **B站: never use yt-dlp** (412-blocked). Use bili-cli / OpenCLI.
- **Reddit** has no zero-config path (anon JSON is 403); needs OpenCLI or rdt-cli login.
- Fallback when a login backend isn't ready: Jina Reader still reads public pages/notes
  (that's how we read a 小红书 note before OpenCLI was set up) — but yields no counts/comments.

## Reference docs (inside the skill)

`references/{search,social,career,dev,web,video}.md` — per-category command groups and
retry chains. Read the matching one for anything beyond the quick commands above.
