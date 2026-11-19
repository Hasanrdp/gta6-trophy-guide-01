# Leonida Platinum — GTA 6 Trophy Guide & Tracker

![competition](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/Hasanrdp/gta6-trophy-guide-01/reward.svg)

A free, open-source, offline guide and tracker for all 55 PlayStation 5
trophies of Grand Theft Auto VI. Built for the
[make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Every trophy, exact.** All 55 official trophies — 1 platinum, 2 gold,
  6 silver, 46 bronze — with the official name, description and grade as
  PlayStation publishes them.
- **Tracker.** Check trophies off as you earn them. Progress is saved in
  the browser (localStorage) and can be exported to a file and imported
  back.
- **Filters.** Filter by kind (story, side, collectible, activity,
  challenge), by grade, by missable-only, or search by name.
- **Spoiler setting.** Hides the names and descriptions of story trophies
  until you earn them.
- **Roadmap to the platinum.** Four stages in the order to play them, from
  the story run to the final cleanup.
- **Missables flagged.** The trophies tied to one-time moments or a
  partner are flagged, with why they can be missed. The flags are built
  from the official descriptions and are labelled as not yet verified
  in-game.
- **A guide for each trophy, in our own words, with its sources cited.**
  Every guide names where its facts come from: the official list on
  Exophase for the name, description and grade, PSNProfiles for PSN's
  progress count where it has one, and our own advice from the official
  description, not yet checked in the game. Nothing is copied from
  other guides.

## How to use it

Serve the `app/` directory with any static file server and open
`app/index.html` in a desktop browser. It works with the network off:
every file it loads lives under `app/`. Or open `app/index.html`
directly from the files.

```sh
cd app && python3 -m http.server 8000
# open http://localhost:8000/
```

## How it is built

`main.ts` (Node 22) copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` with the kit's
`vendor/makefun-frontend.ts` dossier library. The dossier is the
byte-for-byte output of that library from the same files.

## Sources

- Official trophy list (names, descriptions, grades):
  Exophase, Grand Theft Auto VI trophies for PS5.
- PSN progress targets: PSNProfiles, Grand Theft Auto VI trophies.
- Guides: our own words from the official descriptions. Where a place
  or a step is not pinned down by the official description, the guide
  says so plainly instead of inventing it.

## License

MIT. See [LICENSE](LICENSE).
