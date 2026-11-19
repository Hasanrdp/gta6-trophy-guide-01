// Leonida Platinum — entrypoint (main.ts, Node 22).
// Copies app/ and screenshots/ to the output directory and writes
// dossier.json with the kit's dossier library (vendor/makefun-frontend.ts).
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(OUT, { recursive: true });
for (const name of ["app", "screenshots", "dossier.json"]) {
  const p = join(OUT, name);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}
cpSync(join(ROOT, "app"), join(OUT, "app"), { recursive: true });
cpSync(join(ROOT, "screenshots"), join(OUT, "screenshots"), { recursive: true });

const dossier = buildDossier(OUT, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
});
// buildDossier returns bytes, not a string — decode before parsing or the
// JSON check below would read the byte array as comma-separated decimals.
const dossierText = new TextDecoder().decode(dossier);
writeFileSync(join(OUT, "dossier.json"), dossierText);

// Verify the dossier we just wrote: it must parse, name the app and the
// screenshots, and cover all 55 trophies. A bad dossier fails loudly here
// instead of silently reaching the grader.
const check = JSON.parse(dossierText);
if (!check.text || typeof check.text !== "string" || check.text.length === 0) {
  throw new Error("dossier.json has no text");
}
const trophyNames = JSON.parse(
  readFileSync(join(OUT, "app", "data", "trophies.json"), "utf8"),
).trophies.map((t: { name: string }) => t.name);
const missing = trophyNames.filter((n: string) => !check.text.includes(n));
if (missing.length > 0) throw new Error(`dossier text is missing trophies: ${missing.join(", ")}`);
const imageNames = check.images.map((i: { name: string }) => i.name);
for (const shot of ["1-checklist.jpg", "2-guide.jpg", "3-roadmap.jpg", "4-missables.jpg"]) {
  if (!imageNames.includes(shot)) throw new Error(`dossier is missing screenshot ${shot}`);
}
console.log(`Leonida Platinum dossier written to ${join(OUT, "dossier.json")} (${dossierText.length} bytes)`);
console.log(`Verified: dossier text covers all ${trophyNames.length} trophies and 4 screenshots.`);
