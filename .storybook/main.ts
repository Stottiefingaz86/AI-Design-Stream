import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
  ],
  viteFinal(viteConfig) {
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...(viteConfig.resolve?.alias as Record<string, string> | undefined),
        '@': path.join(root, 'src'),
        'next/link': path.join(root, '.storybook/mocks/next-link.tsx'),
        'next/navigation': path.join(root, '.storybook/mocks/next-navigation.tsx'),
        'next-themes': path.join(root, '.storybook/mocks/next-themes.ts'),
        '@tabler/icons-react': path.join(root, 'apps/live-site/node_modules/@tabler/icons-react'),
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
      },
    };
    const plugins = Array.isArray(viteConfig.plugins) ? viteConfig.plugins : [];
    plugins.unshift({
      name: 'live-site-classic-jsx-react',
      enforce: 'pre',
      transform(code: string, id: string) {
        const file = id.split('?')[0];
        if (!file.includes('/apps/live-site/') || !file.endsWith('.tsx')) return;
        if (/\bimport\s+(?:\*\s+as\s+)?React[\s,]/.test(code)) return;
        return { code: `import React from 'react'\n${code}`, map: null };
      },
    });
    viteConfig.plugins = plugins;
    viteConfig.server = { ...viteConfig.server, host: true, allowedHosts: true };
    return viteConfig;
  },
};

export default config;
