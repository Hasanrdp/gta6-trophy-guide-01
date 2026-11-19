// Leonida Platinum — a GTA 6 trophy guide and tracker for gta6-trophy-guide-01.
// Node 22, standard library only. The guide itself is plain static files under app/:
// index.html, its style and modules, and app/data/trophies.json with all 55 official
// trophies and a cited guide for each. No build step, no network at run time.
//
// This program hands the guide in: it copies app/ and screenshots/ from beside this
// file into the output directory and writes dossier.json there with the vendored
// make.fun library, which is the summary the judge reads. The grader runs this twice
// and both runs must write identical bytes, so there is no timestamp or randomness here.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the dossier's bytes; the rest
// refuse an entry the scorer would refuse anyway (more than 4 screenshots, one over
// 256 KiB, app/ over 993 files and directories or 48 MiB).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
