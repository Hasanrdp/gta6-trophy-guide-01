[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline web app that guides and tracks all **55 Grand Theft Auto VI trophies** on PlayStation 5:
1 platinum, 2 gold, 6 silver, 46 bronze — 28 of them hidden until earned.
A checklist saved in your browser, a 5-stage roadmap to the platinum, the one
missable trophy flagged, a next-up planner, and a cited guide for every trophy.
It runs entirely from its own files with the network off.

## What it does

- **Tracker** — all 55 trophies with official name, description and grade, a
  progress bar ("X of 55 earned"), per-grade counts, PSN targets (e.g. 0/42),
  checkboxes saved in localStorage, medal swatches, kind and grade filters,
  search, a spoiler toggle that hides hidden trophies' names and descriptions
  until earned, an earned-only toggle, export / import / reset, and free-text
  notes per trophy.
- **Roadmap** — five stages with hours and trophy lists: story first (60–80h),
  side stories, activities & challenges, collectibles & exploration, then money,
  robberies & cleanup into the 100% checklist and the platinum. Includes the
  cheat warning (cheats disable trophies and saving) and the no-mission-replay
  manual-save advice.
- **Missables** — Positive Mental Attitude is the only missable trophy: the first
  meditation spot, at Jason's house in Chapter 1, is permanently unavailable
  after that chapter ends. Every other trophy is listed as safe, with the note
  that no other missable is confirmed yet.
- **Next-up planner** — the next unearned trophies in roadmap order.
- **Guide detail** — per trophy: guide in our own words, steps, PSN target,
  when it can be missed, and named sources with links.

## Method & sources

Official names, descriptions, grades and hidden flags are the PlayStation 5
list as published by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/)
and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)
(the two agree on all 55), cross-checked for the hidden/visible split against
[Planet GTA 6](https://www.planetgta6.com/en/gta-6-trophies/) and
[GTA Zone](https://gta-zone.com/news/gta-6-trophies-achievements/).
The roadmap and the 100% completion breakdown follow
[PowerPyx](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/):
platinum difficulty 4/10, about 200 hours, 55 offline / 0 online, one playthrough,
five story chapters of 60–80 hours, no mission replay, free-roam after the story.

Every guide is written in our own words for this entry and cites its sources
beside each trophy. Where no verified method exists yet — five trophies
(In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There,
Ten Pin) — the guide says so honestly instead of inventing steps.

No Rockstar Games logo or official artwork is used anywhere; the look is our own.

## How to run

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` through any static file server with `app/` at its root.
Views take URL parameters: `?view=checklist|roadmap|missables|nextup|guide`,
`?view=guide&id=17` opens one trophy's guide, and `?demo=1` seeds a fixed
13 earned trophies (in memory only, for screenshots).

## Files

| Path | What it is |
| --- | --- |
| `main.ts` | Entrypoint: copies `app/` + `screenshots/` to `/output`, writes `dossier.json` |
| `serve.ts` | Tiny static server for local testing (port 8080) |
| `vendor/makefun-frontend.ts` | The kit's dossier library, byte-identical |
| `app/index.html` | The guide's single page |
| `app/style.css` | Paper + night themes, coral accent |
| `app/js/main.js` | Boot, routing, wiring |
| `app/js/store.js` | localStorage progress, export / import / reset |
| `app/js/filters.js` | Kind / grade / search / spoiler filtering |
| `app/js/views.js` | Checklist, roadmap, missables, next-up, guide detail |
| `app/data/trophies.json` | All 55 official trophies with guides, steps and sources |
| `screenshots/` | Four real renders of the app (1280×800 JPEG) |
| `LICENSE` | MIT |

## Local validation

- `node main.ts` twice to two output dirs: dossier bytes identical (deterministic).
- `node <kit>/cli/makefun.mjs check --kit <kit> --repo .` — passes (LICENSE,
  entrypoint, size caps).
- Trophy data check: all 55 official names present, each with a non-blank guide,
  grades 1 platinum / 2 gold / 6 silver / 46 bronze, 28 hidden.
- `owner.json` and `.makefun/owner.json` are each exactly 58 bytes.
- Screenshots: 4 files, each under 256 KiB, 1280×800.
