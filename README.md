# Leonida Platinum

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 official Grand Theft Auto VI trophies** on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden — with a cited guide for every trophy, a roadmap to the platinum, and the one missable trophy flagged.

## What it is

A static web app under `app/` that runs from its own files with the network off. No account, no ads, no build step.

- **Tracker** — a checklist of all 55 trophies with their official name, description and grade, saved in the browser (localStorage), with export to JSON, import, and reset. Each trophy carries its PSN progress target (for example 0/42 shooting-range golds), a missable flag, kind tags, and a free-text note field.
- **Filters** — search by name or description, filter by kind (Story, Missable, Collectibles, Activities, Combat, Exploration, Money) and by grade, plus an earned-only toggle.
- **Spoiler setting** — hides the names and descriptions of hidden trophies until you earn them.
- **Roadmap** — five stages in order, from the 60–80 hour story run to the money and robbery cleanup, with the hours each stage takes and the trophies it covers.
- **Missables** — Positive Mental Attitude is the only missable trophy: the first meditation spot, at Jason's house in Chapter 1, is gone for good once that chapter ends. Every other trophy is listed as safe to clean up in free roam.
- **Next up** — the next unearned trophies in roadmap order, so you always know what to do next.
- **Guide per trophy** — what to do, where, the steps, when it can be missed, and the sources behind every fact, with links. Five trophies have no confirmed method published yet (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin); their guides say so honestly instead of inventing steps.

## Method and sources

- Official names, descriptions and grades: [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) — they agree on all 55.
- Methods, roadmap hours and the 100% completion breakdown: [PowerPyx](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) (platinum 4/10, ~200 hours, 55 offline / 0 online).
- Hidden/visible split cross-checked on [Planet GTA 6](https://www.planetgta6.com/en/gta-6-trophies/) and [GTA Zone](https://gta-zone.com/news/gta-6-trophies-achievements/).
- Every guide is written in our own words for this entry. Sources are cited beside each trophy, never copied. No Rockstar logo or artwork is used anywhere.

## How to run

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Open http://localhost:8080 in desktop Chrome. It works with the network off: the only thing the app fetches is its own `app/data/trophies.json`.

Hand the entry in (writes `dossier.json` next to the copied `app/` and `screenshots/`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Local validation

- `makefun check` against the kit at commit `5a4da19`: **4 passed, 0 failed, 16 skipped** (the 5 at-submission checks — repo public, owner, created-after-open, commit pushed, duplicate snapshot — are the site's at submission).
- `app/data/trophies.json`: all 55 official names present with descriptions byte-identical to the kit's official list, each with a non-blank guide; grades 1 platinum / 2 gold / 6 silver / 46 bronze; 28 hidden; only trophy 28 (Positive Mental Attitude) flagged missable.
- `main.ts` run twice into two output directories: byte-identical output (`diff -r` clean); dossier 619,124 bytes, under the 1.5 MiB cap.
- Screenshots: 4 real renders of the app at 1280×800 — 1-checklist.jpg 90,300 bytes, 2-guide.jpg 103,285 bytes, 3-roadmap.jpg 101,797 bytes, 4-missables.jpg 102,819 bytes — each under 256 KiB, all visually checked.
- `owner.json` and `.makefun/owner.json`: exactly 58 bytes each.

## Files

- `main.ts` — entrypoint: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored library.
- `serve.ts` — tiny static server for local testing (port 8080).
- `vendor/makefun-frontend.ts` — the kit's dossier library, byte-identical to the kit copy.
- `app/index.html` — the page shell: header, progress, tabs, filters, footer.
- `app/style.css` — paper and night themes, coral accent, serif display.
- `app/js/main.js` — startup, URL params, toolbar and tab wiring.
- `app/js/store.js` — progress in localStorage, demo seed, export/import/reset.
- `app/js/filters.js` — kind, grade, search and earned-only filtering; roadmap order; next-up list.
- `app/js/views.js` — checklist, roadmap, missables, next-up and guide-detail rendering.
- `app/data/trophies.json` — the 55 official trophies with guides, steps and sources.
- `screenshots/` — 4 screenshots of the app (checklist, guide detail, roadmap, missables).
- `LICENSE` — MIT.

## License

MIT — see `LICENSE`. An unofficial fan guide; Grand Theft Auto and GTA are trademarks of Take-Two Interactive.
