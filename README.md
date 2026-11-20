# Neon Palm Cover Studio — GTA-Style Cover Art Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adhityanaufal26/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adhityanaufal26/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline web app that turns your own photos and a caption into GTA 6-style multi-panel cover art — Vice City sunset and neon grades, bold poster lettering — exported as a PNG to share. Built for the make.fun bounty [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01). Everything is original: no Rockstar Games logo, artwork, or fonts.

## What it is

- **Six layouts**: nine-panel grid with title block, four-panel grid, hero-and-three, full-bleed, tilted snapshots, and strip collage.
- **Five colour grades**: Vice Sunset, Neon Night, Twilight Gold, Teal Heat, and Mono Ink — gradient-map grades with grain, vignette, and halftone options.
- **Any photo**: load your own photos from disk (file picker or drag-and-drop, several at once), crop and position each panel by dragging and zooming, fill several panels from one photo or many, and edit the title, neon-script subtitle, tagline, and per-panel callouts.
- **Poster lettering**: sunset-gradient condensed title with ink stroke, glowing script subtitle, Palm Coast seal, heat-meter stars, and a billing block.
- **Fast export**: PNG in 1080×1080, 1080×1350, 1920×1080, and 1080×1920, one click per size or all at once, with undo/redo while you edit.
- Works fully offline from static files under `app/` — no build step, no network requests; photos are read on your machine and never uploaded.

## How to run

```bash
node serve.ts
```

Then open the printed local address in a desktop browser. Any static file server pointed at `app/` works the same way. Two sample photos are preloaded so a cover is on screen at first open.

## Handing in

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier`.

## License

MIT — see [LICENSE](LICENSE).
