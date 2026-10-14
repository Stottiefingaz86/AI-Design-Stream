#!/usr/bin/env node
/**
 * vitejs/vite#21162 — Astro + React dev can call removed transform hooks.
 * Patches node_modules/vite/dist/node/chunks/config.js using regex (works even if
 * whitespace differs slightly). Exits 1 if the critical guard cannot be applied.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'node_modules/vite/dist/node/chunks/config.js');

/** Unguarded stock: getHookHandler(transform) immediately followed by try { (no guard line between). */
const UNGUARDED_TRANSFORM_RE =
  /const handler = getHookHandler\(plugin\.transform\);\s*\r?\n(\s*)try \{/;

function isTransformStillVulnerable(s) {
  return UNGUARDED_TRANSFORM_RE.test(s);
}

function main() {
  if (!existsSync(target)) {
    console.error('[design-studio] Missing', target, '— run npm install from project root.');
    process.exit(1);
  }

  let s = readFileSync(target, 'utf8');
  const before = s;

  // --- transform: regex (idempotent if guard already present) ---
  s = s.replace(
    /const handler = getHookHandler\(plugin\.transform\);\s*\r?\n(\s*)try \{/g,
    (match, indent) =>
      `const handler = getHookHandler(plugin.transform);\n${indent}if (typeof handler !== "function") continue;\n${indent}try {`
  );

  // Skip null/removed transform before touching plugin object (stale cache)
  if (
    !s.includes('if (plugin.transform == null) continue;') &&
    s.includes('if (filter$1 && !filter$1(id, code)) continue;')
  ) {
    s = s.replace(
      /(if \(filter\$1 && !filter\$1\(id, code\)\) continue;\s*\r?\n)(\s*)(if \(isFutureDeprecationEnabled\(topLevelConfig, "removePluginHookSsrArgument"\))/,
      `$1$2if (plugin.transform == null) continue;\n$2$3`
    );
  }

  const rep = (from, to) => {
    if (!s.includes(from)) return;
    s = s.split(from).join(to);
  };

  rep(
    `\t\tfor (const plugin of this.getSortedPlugins(hookName)) {\n\t\t\tif (condition && !condition(plugin)) continue;\n\t\t\tconst hook = plugin[hookName];\n\t\t\tconst handler = getHookHandler(hook);\n\t\t\tif (hook.sequential) {`,
    `\t\tfor (const plugin of this.getSortedPlugins(hookName)) {\n\t\t\tif (condition && !condition(plugin)) continue;\n\t\t\tconst hook = plugin[hookName];\n\t\t\tif (hook == null) continue;\n\t\t\tconst handler = getHookHandler(hook);\n\t\t\tif (typeof handler !== "function") continue;\n\t\t\tif (typeof hook === "object" && hook != null && hook.sequential) {`
  );

  rep(
    `\t\t\tconst pluginResolveStart = debugPluginResolve ? performance$1.now() : 0;\n\t\t\tconst handler = getHookHandler(plugin.resolveId);\n\t\t\tconst result = await this.handleHookPromise(handler.call(ctx, rawId, importer, normalizedOptions));`,
    `\t\t\tconst pluginResolveStart = debugPluginResolve ? performance$1.now() : 0;\n\t\t\tconst handler = getHookHandler(plugin.resolveId);\n\t\t\tif (typeof handler !== "function") continue;\n\t\t\tconst result = await this.handleHookPromise(handler.call(ctx, rawId, importer, normalizedOptions));`
  );

  rep(
    `\t\t\tconst handler = getHookHandler(plugin.load);\n\t\t\tconst result = await this.handleHookPromise(handler.call(ctx, id, options$1));`,
    `\t\t\tconst handler = getHookHandler(plugin.load);\n\t\t\tif (typeof handler !== "function") continue;\n\t\t\tconst result = await this.handleHookPromise(handler.call(ctx, id, options$1));`
  );

  s = s.split(`\t\t\t// __DESIGN_STUDIO_VITE_CONTAINER_PATCH__\n`).join('');

  rep(
    `\tfunction getSortedPlugins(hookName) {\n\t\tif (sortedPluginsCache.has(hookName)) return sortedPluginsCache.get(hookName);\n\t\tconst sorted = getSortedPluginsByHook(hookName, plugins$1);\n\t\tsortedPluginsCache.set(hookName, sorted);\n\t\treturn sorted;\n\t}`,
    `\tfunction getSortedPlugins(hookName) {\n\t\tif (!sortedPluginsCache.has(hookName)) {\n\t\t\tconst sorted = getSortedPluginsByHook(hookName, plugins$1);\n\t\t\tsortedPluginsCache.set(hookName, sorted);\n\t\t}\n\t\tconst sorted = sortedPluginsCache.get(hookName);\n\t\tif (hookName === "transform" || hookName === "load" || hookName === "resolveId") {\n\t\t\treturn sorted.filter((plugin) => {\n\t\t\t\tconst hook = plugin[hookName];\n\t\t\t\tif (hook == null) return false;\n\t\t\t\treturn typeof getHookHandler(hook) === "function";\n\t\t\t});\n\t\t}\n\t\treturn sorted;\n\t}`
  );

  s = s.replace(/\tif \(!handler\) continue;/g, '\tif (typeof handler !== "function") continue;');
  s = s.replace(
    /\tif \(typeof hook === "object" && hook\.sequential\) \{/g,
    '\tif (typeof hook === "object" && hook != null && hook.sequential) {'
  );

  if (isTransformStillVulnerable(s)) {
    console.error(
      '[design-studio] Could not patch Vite transform loop. Reinstall vite@7.3.1 (npm install) or report layout change.\n',
      'File:',
      target
    );
    process.exit(1);
  }

  if (s !== before) {
    writeFileSync(target, s, 'utf8');
    console.log('[design-studio] Patched Vite (#21162):', target);
  }
  process.exit(0);
}

main();
