import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const liveSite = path.join(root, 'apps/live-site');
const srcRoot = path.join(root, 'src');

function isFile(p: string) {
  try {
    return existsSync(p) && statSync(p).isFile();
  } catch {
    return false;
  }
}

/** Prefer `utils.ts` over a sibling `utils/` directory (live-site has both). */
function resolveAtAlias(base: string, id: string): string | null {
  const rel = id.startsWith('@/') ? id.slice(2) : id;
  for (const ext of ['.tsx', '.ts', '.jsx', '.js', '.css']) {
    const candidate = path.join(base, rel + ext);
    if (isFile(candidate)) return candidate;
  }
  const bare = path.join(base, rel);
  if (isFile(bare)) return bare;
  for (const ext of ['.tsx', '.ts', '.jsx', '.js']) {
    const candidate = path.join(base, rel, `index${ext}`);
    if (isFile(candidate)) return candidate;
  }
  return null;
}

function isLiveSiteFile(id: string) {
  const file = id.split('?')[0];
  return file.includes(`${path.sep}apps${path.sep}live-site${path.sep}`) || file.includes('/apps/live-site/');
}

/**
 * Rewrite `@/…` inside live-site modules to absolute paths under apps/live-site.
 * The global `@` → src alias must not win for product chrome (Cashier, Shell, etc.).
 */
function liveSiteAtRewrite(): Plugin {
  const re = /(['"])@\/([^'"]+)\1/g;
  return {
    name: 'live-site-at-rewrite',
    enforce: 'pre',
    transform(code, id) {
      if (!isLiveSiteFile(id)) return null;
      if (!code.includes('@/')) return null;
      let touched = false;
      const next = code.replace(re, (full, quote: string, rel: string) => {
        const abs = resolveAtAlias(liveSite, `@/${rel}`);
        if (!abs) return full;
        touched = true;
        return `${quote}${abs}${quote}`;
      });
      return touched ? { code: next, map: null } : null;
    },
  };
}

/**
 * Lumen Storybook. Documents `src/components/lumen` primitives, plus live-site
 * chrome imported from `apps/live-site/components/site/shell-*.tsx`.
 * Do not reimplement dock / drawer / UBC / header here.
 */
const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../src/components/lumen/**/*.stories.@(ts|tsx)'],
  staticDirs: [
    '../public',
    { from: '../apps/live-site/public/shell', to: '/shell' },
    { from: '../apps/live-site/public/animations', to: '/animations' },
    { from: '../apps/live-site/public/games', to: '/games' },
    { from: '../apps/live-site/public/banners', to: '/banners' },
    { from: '../apps/live-site/public/vendot_logos', to: '/vendot_logos' },
    /* Live casino tile art + play-circle — required by CasinoLobby stories. */
    { from: '../apps/live-site/public/casino', to: '/casino' },
  ],
  viteFinal(viteConfig) {
    const liveSiteNm = path.join(liveSite, 'node_modules');
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...(viteConfig.resolve?.alias as Record<string, string> | undefined),
        '@': srcRoot,
        'next/link': path.join(root, '.storybook/mocks/next-link.tsx'),
        'next/navigation': path.join(root, '.storybook/mocks/next-navigation.tsx'),
        'next-themes': path.join(root, '.storybook/mocks/next-themes.ts'),
        '@tabler/icons-react': path.join(liveSiteNm, '@tabler/icons-react'),
        '@number-flow/react': path.join(liveSiteNm, '@number-flow/react'),
      },
    };
    // live-site tsconfig is `jsx: preserve` (Next). esbuild reads that file and emits
    // React.createElement without importing React — tsconfigRaw stops it from winning.
    viteConfig.esbuild = {
      ...viteConfig.esbuild,
      jsx: 'automatic',
      jsxImportSource: 'react',
      tsconfigRaw: {
        compilerOptions: {
          jsx: 'react-jsx',
          jsxImportSource: 'react',
        },
      },
    };
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      /* Live-site source must go through the rewrite plugin — do not prebundle it. */
      exclude: [
        ...((viteConfig.optimizeDeps?.exclude as string[] | undefined) ?? []),
      ],
      esbuildOptions: {
        ...viteConfig.optimizeDeps?.esbuildOptions,
        jsx: 'automatic',
        jsxImportSource: 'react',
        tsconfigRaw: {
          compilerOptions: {
            jsx: 'react-jsx',
            jsxImportSource: 'react',
          },
        },
        plugins: [
          {
            name: 'live-site-at-esbuild',
            setup(build) {
              build.onResolve({ filter: /^@\// }, (args) => {
                const fromLive =
                  !!args.importer &&
                  (args.importer.includes('/apps/live-site/') ||
                    args.importer.includes(`${path.sep}apps${path.sep}live-site${path.sep}`));
                const base = fromLive ? liveSite : srcRoot;
                const resolved = resolveAtAlias(base, args.path);
                if (!resolved) return undefined;
                return { path: resolved };
              });
            },
          },
        ],
      },
    };
    const plugins = Array.isArray(viteConfig.plugins) ? viteConfig.plugins : [];
    plugins.unshift(
      liveSiteAtRewrite(),
      {
        name: 'live-site-classic-jsx-react',
        enforce: 'pre',
        transform(code: string, id: string) {
          const file = id.split('?')[0];
          if (!file.includes('/apps/live-site/') || !file.endsWith('.tsx')) return;
          if (/\bimport\s+(?:\*\s+as\s+)?React[\s,]/.test(code)) return;
          return { code: `import React from 'react'\n${code}`, map: null };
        },
      },
    );
    viteConfig.plugins = plugins;
    viteConfig.server = {
      ...viteConfig.server,
      host: true,
      allowedHosts: true,
      fs: {
        ...viteConfig.server?.fs,
        allow: [root, liveSite],
      },
    };
    return viteConfig;
  },
};

export default config;
