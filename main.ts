// GTA VI trophy guide entry (Node 22, standard library only). The guide is
// this directory's app/ folder: plain static files a browser opens at
// app/index.html (an ES module, CSS, no build step), fully offline — it loads
// nothing over the network — and its trophy list and guides are
// app/data/trophies.json. This program hands the entry in: it first checks
// the trophy file holds the official 55 trophies (1 platinum, 2 gold,
// 6 silver, 46 bronze), each with a non-blank guide of our own words and at
// least one cited source, then copies app/ and screenshots/ from beside this
// file to /output and writes /output/dossier.json, the summary the judge
// reads (the screenshots, the first load's files and bytes, and the source),
// with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it
// is: the scorer requires dossier.json to be byte for byte what its own copy
// writes.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Validate the trophy file before anything is handed in: the official list
// is 55 trophies, 1 platinum, 2 gold, 6 silver and 46 bronze, and every
// trophy needs a guide in our own words that cites at least one source.
const trophyFile = join(here, 'app', 'data', 'trophies.json');
const trophyDoc = JSON.parse(readFileSync(trophyFile, 'utf8'));
const trophies = trophyDoc.trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`expected 55 trophies, found ${Array.isArray(trophies) ? trophies.length : 'no array'}`);
}
const gradeCounts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
for (const trophy of trophies) {
  if (typeof trophy.name !== 'string' || !trophy.name.trim()) throw new Error('trophy without a name');
  if (typeof trophy.guide !== 'string' || !trophy.guide.trim()) throw new Error(`trophy ${trophy.name} has no guide`);
  if (!Array.isArray(trophy.sources) || trophy.sources.length === 0) throw new Error(`trophy ${trophy.name} cites no source`);
  for (const source of trophy.sources) {
    if (typeof source.name !== 'string' || !source.name.trim() || typeof source.url !== 'string' || !source.url.startsWith('https://')) {
      throw new Error(`trophy ${trophy.name} has a bad source`);
    }
  }
  gradeCounts[trophy.grade] = (gradeCounts[trophy.grade] ?? 0) + 1;
}
if (gradeCounts.platinum !== 1 || gradeCounts.gold !== 2 || gradeCounts.silver !== 6 || gradeCounts.bronze !== 46) {
  throw new Error(`unexpected grade split: ${JSON.stringify(gradeCounts)}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
