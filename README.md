# GTA VI Trophy Guide & Tracker

![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/Fadliilmi/gta6-trophy-guide-01/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/Fadliilmi/gta6-trophy-guide-01/reward.svg)

An offline guide and tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI** — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **All 55 official trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — with their official names, descriptions and grades as published on PlayStation, each with a guide written in our own words that cites its sources (PowerPyx, GTABase, SixShore, Output Lag, Press Start).
- **Tracker** — tick trophies off; progress saves in your browser (localStorage) and can be exported to a `.json` file and imported back.
- **Filters** — by kind (story, side quests, collectibles, activities, robberies, exploration, secrets, misc, 100% completion), by grade, missable-only, earned-only, and free-text search.
- **Spoiler mode** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum** — three steps (~200 hours, difficulty 4/10, one playthrough), built from the official descriptions, with the one potentially missable trophy flagged: **Positive Mental Attitude** (the Chapter 1 balcony meditation).
- **Fully offline** — static files under `app/`, no build step, no network requests. Serve `app/` with any static server and open `index.html`.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates the trophy file (55 trophies, the official grade split, every guide non-blank with at least one cited source), copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

- [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/)
- [GTABase — GTA 6 Trophy & Achievement Guide](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series)
- [SixShore — GTA 6 Trophy and Achievement List](https://sixshore.com/gta-6/guides/trophies-and-achievements/)
- [Output Lag — GTA 6 Trophy List](https://outputlag.com/guides/gta-6-trophy-list/)
- [Press Start — GTA 6 Trophy/Achievement List](https://press-start.com.au/news/2026/11/18/gta-6-trophy-list/)

Guide text is written in our own words for this entry; the official trophy names and descriptions are shown as PlayStation publishes them. No Rockstar logo or official artwork is used anywhere in the app or its screenshots.
