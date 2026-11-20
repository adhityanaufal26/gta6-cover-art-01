# Neon Palm Cover Studio — GTA-Style Cover Art Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adhityanaufal26/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adhityanaufal26/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Neon Palm Cover Studio is a standalone browser tool for building a multi-panel game-cover style poster from photos you pick on your own machine. You drop in images, add a title and caption, choose a layout and a sunset/neon colour treatment, and export a ready-to-share PNG. It was built for the make.fun bounty [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) and uses an original visual design throughout — no Rockstar Games artwork, logos, or fonts are included.

## Features

- Six layout templates to choose from: a nine-panel grid with a title block, a four-panel grid, a hero image with three supporting panels, a full-bleed single image, tilted snapshots, and a strip collage.
- Five colour grades inspired by tropical sunset and neon signage: Vice Sunset, Neon Night, Twilight Gold, Teal Heat, and Mono Ink. Each grade is a gradient-map treatment you can combine with grain, vignette, and halftone effects.
- Bring your own photos via the file picker or drag-and-drop, loading several at once if you like. Every panel supports individual crop and positioning — drag to reframe, zoom to tighten the shot — and a single photo can fill multiple panels.
- Fully editable text: main title, neon-script subtitle, tagline, and per-panel callouts, all styled with bold poster lettering, a sunset-gradient condensed title with ink stroke, a glowing script accent, a Palm Coast seal, heat-meter stars, and a billing block.
- One-click PNG export in four sizes: 1080x1080, 1080x1350, 1920x1080, and 1080x1920, either individually or all at once. Undo and redo are available while editing.
- Runs entirely offline from the static files in `app/`. There is no build step and no network access — photos are read locally and never leave your computer. Two sample photos load by default so you see a finished cover immediately.

## Run it locally

```bash
node serve.ts
```

Open the local address it prints in a desktop browser. Pointing any static file server at `app/` works just as well.

## Build the submission bundle

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` runs on Node 22 using only the standard library. It copies `app/` and `screenshots/` into the output directory and generates `dossier.json` via the kit's `buildDossier`.

## License

MIT — see [LICENSE](LICENSE).
