// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const livePublic = path.resolve(__dirname, 'apps/live-site/public');
const mocks = path.resolve(__dirname, '.storybook/mocks');

/** Serve live-site images so the testing-ground shell matches production chrome. */
function liveSiteAssets() {
  const types = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
  };
  return {
    name: 'live-site-assets',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'next/link') return path.join(mocks, 'next-link.tsx');
      if (id === 'next/navigation') return path.join(mocks, 'next-navigation.tsx');
      if (id === 'next/image') return path.join(mocks, 'next-image.tsx');
      if (id === 'next-themes') return path.join(mocks, 'next-themes.ts');
      return undefined;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        if (!/^\/(shell|casino_slots_tiles|games|footer|logos|vip|banners|vendot_logos)\//.test(url)) return next();
        const file = path.normalize(path.join(livePublic, decodeURIComponent(url)));
        if (!file.startsWith(livePublic) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
        res.setHeader('Content-Type', types[path.extname(file)] ?? 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  devToolbar: { enabled: false },
  // Bind IPv4 + IPv6 so http://localhost:4321 and http://127.0.0.1:4321 both work.
  server: { host: true, port: 4321 },
  integrations: [react()],
  vite: {
    plugins: [liveSiteAssets()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'next/link': path.join(mocks, 'next-link.tsx'),
        'next/navigation': path.join(mocks, 'next-navigation.tsx'),
        'next/image': path.join(mocks, 'next-image.tsx'),
        'next-themes': path.join(mocks, 'next-themes.ts'),
        '@tabler/icons-react': path.resolve(
          __dirname,
          'apps/live-site/node_modules/@tabler/icons-react/dist/esm/tabler-icons-react.mjs',
        ),
      },
    },
    server: {
      fs: { allow: [__dirname, path.resolve(__dirname, 'apps/live-site')] },
    },
    define: {
      'process.env': {},
    },
    optimizeDeps: {
      include: ['pixi.js'],
      exclude: ['next', 'next/link', 'next/navigation', 'next/image', 'next-themes'],
    },
  },
});
