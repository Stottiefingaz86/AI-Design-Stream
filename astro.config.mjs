// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  devToolbar: { enabled: false },
  // Bind IPv4 + IPv6 so http://localhost:4321 and http://127.0.0.1:4321 both work.
  server: { host: true, port: 4321 },
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimizeDeps: {
      include: ['pixi.js'],
    },
  },
});
