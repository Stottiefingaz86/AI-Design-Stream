import tailwindcss from '@tailwindcss/postcss';

/** Tailwind v4 — use the plugin factory so Vite always gets a real transform (object shorthand can be undefined). */
export default {
  plugins: [tailwindcss()],
};
