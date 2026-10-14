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
  staticDirs: ['../public', { from: '../apps/live-site/public/shell', to: '/shell' }],
  viteFinal(viteConfig) {
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...(viteConfig.resolve?.alias as Record<string, string> | undefined),
        '@': path.join(root, 'src'),
        'next/link': path.join(root, '.storybook/mocks/next-link.tsx'),
        'next/navigation': path.join(root, '.storybook/mocks/next-navigation.tsx'),
        'next-themes': path.join(root, '.storybook/mocks/next-themes.ts'),
      },
    };
    viteConfig.server = { ...viteConfig.server, host: true, allowedHosts: true };
    return viteConfig;
  },
};

export default config;
