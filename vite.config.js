import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { devLiveSite } from './tools/dev-live-site.mjs';

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id, importer) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '');
        // Resolve to the calling enterprise's own app/assets folder, based on
        // the importer's path (e.g. .../subsidiaries/luxe-prime/app/...).
        // Fall back to luxe-prime (the original hardcoded behavior) if we can't
        // tell which enterprise is calling.
        let enterpriseSlug = 'luxe-prime';
        if (importer) {
          const match = /[\\/]subsidiaries[\\/](.+?)[\\/]app[\\/]/.exec(importer);
          if (match && match[1]) enterpriseSlug = match[1];
        }
        return path.resolve(__dirname, 'src/routes/subsidiaries', enterpriseSlug, 'app/assets', filename);
      }
    },
  };
}

/** DEV_LIVE_SITE (.env.local, dev server only): the live site whose public data the dev server shows (read-only). */
function liveSiteOrigin(mode) {
  const value = loadEnv(mode, __dirname, 'DEV_LIVE_').DEV_LIVE_SITE;
  if (!value) return null;
  const url = URL.canParse(value) ? new URL(value) : null;
  if (url?.protocol !== 'https:') throw new Error(`DEV_LIVE_SITE must be an https:// address, got "${value}"`);
  return url.origin;
}

export default defineConfig(({ mode }) => {
  const liveSite = liveSiteOrigin(mode);
  // Proxy /api requests to the local PHP backend, except api/data/ files that the
  // frontend imports as modules (e.g. content-schema.json) — Vite must serve those.
  const proxy = {
    '^/api/(?!data/)': {
      // Force IPv4: on Windows localhost may resolve to ::1 while the
      // PHP backend binds 127.0.0.1, which breaks the proxy.
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  };
  // Uploaded photos (listings, services, blog posts, page content) of the live data (see tools/dev-live-site.mjs).
  if (liveSite) proxy['/uploads/'] = { target: liveSite, changeOrigin: true };
  return {
    plugins: [
      react(),
      tailwindcss(),
      figmaAssetResolver(),
      ...(liveSite ? [devLiveSite(liveSite)] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    server: {
      port: 3000,
      open: true,
      proxy,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [],
    },
  };
});
