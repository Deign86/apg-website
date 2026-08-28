import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

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

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    figmaAssetResolver(),
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
    // Proxy all /api requests to local PHP backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
