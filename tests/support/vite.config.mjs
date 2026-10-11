// Vite config for the browser suite: the project's own vite.config.js (plugins, aliases and the real
// `/api` proxy rules, so a broken proxy pattern still shows up as a blank page), with every proxy
// target pointed at the test PHP server instead of the developer's :8000.
//  - `vite build` + `vite preview` (PORTS.vite): the production bundle most specs run against
//  - `vite` dev server (PORTS.viteDev): the dev-only checks (module proxying, unbundled imports)
import { defineConfig } from 'vite';
import base from '../../vite.config.js';
import { PORTS } from './env.mjs';

const proxy = Object.fromEntries(
  Object.entries(base.server?.proxy ?? {}).map(([pattern, rule]) => [
    pattern,
    { ...(typeof rule === 'string' ? { target: rule } : rule), target: `http://127.0.0.1:${PORTS.php}` },
  ]),
);

export default defineConfig({
  ...base,
  // Its own cache dir: never shares (or invalidates) the dev server's optimized deps.
  cacheDir: 'node_modules/.vite-test',
  build: { ...base.build, outDir: 'node_modules/.apg-test-dist', emptyOutDir: true },
  server: { ...base.server, port: PORTS.viteDev, strictPort: true, open: false, host: '127.0.0.1', proxy, hmr: false },
  preview: { port: PORTS.vite, strictPort: true, open: false, host: '127.0.0.1', proxy },
  clearScreen: false,
  logLevel: 'warn',
});
