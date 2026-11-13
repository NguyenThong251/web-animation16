#!/usr/bin/env node
/*
 * subpath.mjs — rebase the captured why.zero.university build onto a subpath
 * (GitHub Pages serves this repo at /web-animation16/).
 *
 * The origin's Vite build is compiled for "/" and references assets three ways:
 *   1. root-absolute HTML/CSS URLs  (/assets/main-*.js, url(/assets/fonts/…))
 *   2. root-absolute JS literals     (`/assets/…`, "/assets/…", `/vendor/draco/`)
 *   3. base-path variables/arguments (Sb=`/`, Sg=`/`, Lw=`/` → origami, audio, plant;
 *                                     Dv(`/`), LO(`/`) → stage-2 + star videos)
 * Relative strings (`assets/models/…`) already follow the document URL, so they
 * are left alone. Every patch asserts its exact match count so a changed bundle
 * fails loudly instead of deploying half-rebased.
 *
 * Usage: node scripts/subpath.mjs <siteDir> </base/>
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const [dir, baseArg] = process.argv.slice(2);
if (!dir || !baseArg) { console.error("usage: node subpath.mjs <siteDir> </base/>"); process.exit(1); }
const BASE = ("/" + baseArg.replace(/^\/+|\/+$/g, "") + "/").replace(/^\/\/$/, "/");

function patch(file, rules) {
  let s = readFileSync(file, "utf8");
  for (const [re, to, expected] of rules) {
    const n = (s.match(re) || []).length;
    if (n !== expected) { console.error(`✗ ${file}: ${re} matched ${n}, expected ${expected}`); process.exit(1); }
    s = s.replace(re, to);
    console.log(`✓ ${file.replace(dir, "")}: ${re} ×${n}`);
  }
  writeFileSync(file, s);
}

const assets = join(dir, "assets");
const js = readdirSync(assets).filter((f) => /^main-.*\.js$/.test(f));
const css = readdirSync(assets).filter((f) => /^main-.*\.css$/.test(f));
if (js.length !== 1 || css.length !== 1) { console.error("expected exactly one main-*.js and main-*.css"); process.exit(1); }

patch(join(dir, "index.html"), [
  [/(src|href)="\/assets\//g, `$1="${BASE}assets/`, 2],
]);
patch(join(assets, css[0]), [
  [/url\(\/assets\//g, `url(${BASE}assets/`, 4],
]);
patch(join(assets, js[0]), [
  [/\b(Sb|Sg|Lw)=`\/`/g, `$1=\`${BASE}\``, 3],
  [/([`"])\/assets\//g, `$1${BASE}assets/`, 12],
  [/`\/vendor\//g, `\`${BASE}vendor/`, 4],
  // video factories take the base as an argument: Dv(`/`) (stage-2 bg video), LO(`/`) (star video)
  [/\b(Dv|LO)\(`\/`\)/g, `$1(\`${BASE}\`)`, 6],
]);
console.log(`rebased ${dir} onto ${BASE}`);
