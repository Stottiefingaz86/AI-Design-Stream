#!/usr/bin/env node
/**
 * Lumen token sync — Figma plugin JSON → CSS the prototypes and the live site consume.
 *
 * Input:  tokens/figma/*.json  — pasted AS-IS from the "Lumen token sync" Figma plugin.
 *         Shape: { format, brands: { <brand>: { light: {--token: value}, dark?: {...} } } }
 * Output: tokens/dist/brands/<brand>.css   [data-brand='x'] {…}  [data-brand='x'].dark {…}
 *         tokens/dist/base.css              @theme inline { --color-primary: var(--primary); … }
 *         tokens/dist/manifest.json         every allowed CSS var, per brand/mode — the lint reads this
 *         tokens/dist/brands.ts             BRANDS array for runtime validation
 *
 * Rules (same as @lumen/core/scripts/sync-tokens.mjs):
 *   - `--color-foo` is emitted as `--foo` in the brand block; base.css maps `--color-foo: var(--foo)`.
 *   - Other namespaces are kept verbatim.
 *   - Never hand-edit anything in tokens/dist — rerun `npm run tokens:sync`.
 *
 * Files are merged by brand: e.g. mode.json ("light"/"dark" brands from the ☀️ Mode
 * collection) becomes the `default` brand; tailwind.json/responsive.json are shared
 * primitives emitted under :root; brand-*.json become their own brands.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.TOKENS_SRC ?? path.join(ROOT, 'tokens', 'figma');
const OUT = process.env.TOKENS_OUT ?? path.join(ROOT, 'tokens', 'dist');

/** Figma collections whose "brands" are really modes (light/dark) of the default brand. */
const MODE_FILES = new Set(['mode.json']);
/** Collections that are brand-independent primitives → emitted under :root. */
const PRIMITIVE_FILES = new Set(['tailwind.json', 'responsive.json', 'brand-palettes.json', 'palettes.json']);

/** Strip the `--color-` namespace (semantic colours become `--primary` etc.). */
function brandVarName(token) {
  return token.startsWith('--color-') ? `--${token.slice('--color-'.length)}` : token;
}

/** Quote string-ish tokens the plugin exports (e.g. "Lorem ipsum", font names with spaces). */
function cssValue(v) {
  const s = String(v).trim();
  if (s === '') return '""';
  if (/^-?\d*\.?\d+(px|rem|em|%|vh|vw|ms|s)?$/.test(s)) return s;
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return s.toLowerCase();
  if (/^(rgba?|hsla?|oklch|var|calc)\(/.test(s)) return s;
  if (/^[a-z0-9-]+$/i.test(s)) return s; // keywords: lg, true, Figtree
  if (/^"[^"]*"$/.test(s)) return s;
  return JSON.stringify(s); // anything with spaces/punctuation
}

function isPlainObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

/** Validate the plugin export shape; throw a readable error otherwise. */
function assertExport(file, data) {
  if (!isPlainObject(data) || !isPlainObject(data.brands)) {
    throw new Error(`${file}: expected { format, brands: { <brand>: { light: {...} } } }`);
  }
  for (const [brand, modes] of Object.entries(data.brands)) {
    if (!isPlainObject(modes)) throw new Error(`${file}: brands.${brand} must be an object`);
    for (const [mode, tokens] of Object.entries(modes)) {
      if (!isPlainObject(tokens)) throw new Error(`${file}: brands.${brand}.${mode} must be an object`);
      for (const k of Object.keys(tokens)) {
        if (!k.startsWith('--')) throw new Error(`${file}: token "${k}" in ${brand}.${mode} must start with --`);
      }
    }
  }
}

async function main() {
  let files;
  try {
    files = (await readdir(SRC)).filter((f) => f.endsWith('.json')).sort();
  } catch {
    files = [];
  }
  if (files.length === 0) {
    console.error(
      [
        `No token exports found in ${path.relative(ROOT, SRC)}/.`,
        'Export each collection from the "Lumen token sync" Figma plugin and save as:',
        '  tokens/figma/mode.json            (☀️ Mode — light/dark)',
        '  tokens/figma/tailwind.json        (💨 Tailwind primitives)',
        '  tokens/figma/responsive.json      (web/tablet/mobile)',
        '  tokens/figma/brand-palettes.json  (brand colour ramps)',
        '  tokens/figma/brand-<name>.json    (🚀 Themes — one per brand, e.g. brand-betonline.json)',
        'Paste the JSON exactly as the plugin produced it. Do not rename tokens.',
      ].join('\n'),
    );
    process.exit(1);
  }

  /** brand → mode → { token: value } (token names already namespaced for the brand block) */
  const brands = new Map();
  /** :root primitives */
  const root = new Map();
  /** For the manifest: original token name → { brand, mode, value } */
  const manifest = { generatedAt: new Date().toISOString(), sources: files, brands: {}, root: {} };

  const addBrand = (brand, mode, token, value) => {
    if (!brands.has(brand)) brands.set(brand, new Map());
    const modes = brands.get(brand);
    if (!modes.has(mode)) modes.set(mode, new Map());
    modes.get(mode).set(brandVarName(token), value);
    manifest.brands[brand] ??= {};
    manifest.brands[brand][mode] ??= {};
    manifest.brands[brand][mode][token] = value;
  };

  for (const file of files) {
    const data = JSON.parse(await readFile(path.join(SRC, file), 'utf8'));
    assertExport(file, data);

    if (MODE_FILES.has(file)) {
      // brands.light.light → default/light ; brands.dark.* → default/dark
      for (const [brandAsMode, modes] of Object.entries(data.brands)) {
        const target = /dark/i.test(brandAsMode) ? 'dark' : 'light';
        for (const tokens of Object.values(modes)) {
          for (const [k, v] of Object.entries(tokens)) addBrand('default', target, k, v);
        }
      }
      continue;
    }

    if (PRIMITIVE_FILES.has(file)) {
      for (const [, modes] of Object.entries(data.brands)) {
        for (const [, tokens] of Object.entries(modes)) {
          for (const [k, v] of Object.entries(tokens)) {
            if (!root.has(k)) root.set(k, v); // first writer wins; primitives shouldn't collide
            manifest.root[k] = v;
          }
        }
      }
      continue;
    }

    // Brand files: brands.<brand>.{light,dark}
    for (const [brand, modes] of Object.entries(data.brands)) {
      for (const [mode, tokens] of Object.entries(modes)) {
        const target = /dark/i.test(mode) ? 'dark' : 'light';
        for (const [k, v] of Object.entries(tokens)) addBrand(brand, target, k, v);
      }
    }
  }

  // Semantic names (--color-*) across all brands drive the @theme block.
  const semanticColours = new Set();
  for (const [, modes] of brands) {
    for (const [, tokens] of modes) {
      for (const name of tokens.keys()) semanticColours.add(name);
    }
  }
  const colourVars = [
    ...new Set(Object.values(manifest.brands).flatMap((m) => Object.values(m).flatMap((t) => Object.keys(t)))),
  ]
    .filter((t) => t.startsWith('--color-'))
    .sort();

  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, 'brands'), { recursive: true });

  const header = (what) =>
    `/* GENERATED by scripts/sync-tokens.mjs — ${what}. Do not edit; rerun \`npm run tokens:sync\`. */\n`;

  // brands/<brand>.css
  for (const [brand, modes] of brands) {
    const light = modes.get('light') ?? new Map();
    const dark = modes.get('dark') ?? new Map();
    const block = (sel, tokens) =>
      `${sel} {\n${[...tokens.entries()].map(([k, v]) => `  ${k}: ${cssValue(v)};`).join('\n')}\n}\n`;
    const css =
      header(`brand "${brand}"`) +
      block(`[data-brand='${brand}']`, light) +
      (dark.size ? `\n${block(`[data-brand='${brand}'].dark`, dark)}` : '');
    await writeFile(path.join(OUT, 'brands', `${brand}.css`), css);
  }

  // base.css — primitives on :root + Tailwind v4 theme mapping for semantic colours
  const rootBlock = root.size
    ? `:root {\n${[...root.entries()].map(([k, v]) => `  ${k}: ${cssValue(v)};`).join('\n')}\n}\n\n`
    : '';
  // Radii (--border-radius-md → --radius-md) and font families (--font-family-font-sans → --font-sans)
  // so `rounded-md` / `font-sans` resolve to Lumen values too.
  const allBrandTokens = new Set(
    Object.values(manifest.brands).flatMap((m) => Object.values(m).flatMap((t) => Object.keys(t))),
  );
  const radiusVars = [...allBrandTokens].filter((t) => t.startsWith('--border-radius-')).sort();
  const fontVars = [...allBrandTokens].filter((t) => /^--font-family-font-(sans|serif|mono)$/.test(t)).sort();
  const themeBlock =
    `@theme inline {\n` +
    colourVars.map((t) => `  ${t}: var(${brandVarName(t)});`).join('\n') +
    (radiusVars.length ? '\n' + radiusVars.map((t) => `  --radius-${t.slice('--border-radius-'.length)}: var(${t});`).join('\n') : '') +
    (fontVars.length ? '\n' + fontVars.map((t) => `  --font-${t.slice('--font-family-font-'.length)}: var(${t});`).join('\n') : '') +
    `\n}\n`;
  await writeFile(path.join(OUT, 'base.css'), header('primitives + @theme mapping') + rootBlock + themeBlock);

  // brands.ts — runtime validation list (BrandTheme equivalent)
  const brandList = [...brands.keys()].sort();
  await writeFile(
    path.join(OUT, 'brands.ts'),
    `// GENERATED by scripts/sync-tokens.mjs — do not edit.\nexport const BRANDS = ${JSON.stringify(brandList)} as const;\nexport type Brand = (typeof BRANDS)[number];\n`,
  );

  // manifest.json — what the lint allows
  manifest.allowedVars = [...new Set([...Object.keys(manifest.root), ...colourVars, ...semanticColours])].sort();
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const count = (m) => [...m.values()].reduce((n, t) => n + t.size, 0);
  console.log(`tokens: ${files.length} export(s) → ${brandList.length} brand(s) [${brandList.join(', ')}]`);
  for (const [b, m] of brands) console.log(`  ${b}: ${count(m)} vars (light ${m.get('light')?.size ?? 0}, dark ${m.get('dark')?.size ?? 0})`);
  console.log(`  :root primitives: ${root.size} · @theme colours: ${colourVars.length}`);
  console.log(`→ ${path.relative(ROOT, OUT)}/`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
