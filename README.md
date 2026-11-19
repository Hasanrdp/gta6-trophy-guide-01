# Leonida Trophy Atlas

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

**Leonida Trophy Atlas** is an offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide in our own words that cites its sources, a roadmap to the platinum, the one missable trophy flagged, and a checklist that saves progress in the browser. Built for the [make.fun gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it covers

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — each with its official name, description and grade exactly as PlayStation publishes them, and a guide written for this atlas that says what to do, where and how, and when it can be missed. Every guide names its sources beside it.
- **Roadmap to the platinum** — three stages (story 60–80 h, the 100% checklist ~100 h, cleanup ~10 h), built from the official descriptions: which chapters and missions, which collectibles and counts, in what order.
- **The missable trophy flagged** — Positive Mental Attitude, whose Chapter 1 balcony meditation is gone after Chapter 1. Five trophies with no confirmed unlock method at launch are marked unconfirmed in their guides rather than guessed at.
- **A tracker** — tick trophies off and they stay ticked (localStorage), export your progress to a file and import it back, filter by kind (story, missable, collectibles, activities, robbery, quests, exploration, money, combat, misc), by grade, by earned/remaining, and by search. Spoiler Guard hides the story trophies' names and descriptions until you earn them.

## Try it offline

Serve `app/` with any static server and open `index.html` in desktop Chrome:

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests: every file the app loads is a file under `app/`. Source links open only when you click them.

Screenshot demo modes (used for the entry's screenshots): `?shot=checklist`, `?shot=guide`, `?shot=roadmap`, `?shot=spoilers`.

## Files

- `app/index.html` — the guide shell
- `app/style.css` — the dark neon look, drawn only with CSS
- `app/app.js` — the tracker: filters, spoiler guard, progress, export/import, shot modes
- `app/data/trophies.json` — the 55 trophies, the roadmap, the sources and the notes
- `main.ts` — the entry program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `screenshots/` — four real renders of the guide's own code
- `serve.ts` — a tiny static server for local testing

## Sources

The trophy list is the official PS5 list frozen 18 November 2026 (Exophase / PSNProfiles, reported by Push Square). Guide facts are drawn from the PowerPyx trophy guide and roadmap, with KeenGamer, Output Lag, GTA Vibes and EGamers alongside — each trophy's guide names its sources, and the app's Sources section links them all. Nothing is copied: every guide is written in our own words.

## Originality

Fan-made and unofficial. No Rockstar Games logo, official artwork, box art or game screenshot anywhere in the app or its screenshots. The look is our own.

## License

MIT — see [LICENSE](LICENSE).
