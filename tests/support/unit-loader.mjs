// Module hooks for the unit suite (registered by unit-register.mjs), so Node can import the app's
// Vite-style modules directly. Node strips the TypeScript types itself (22.18+).
//  - extensionless / directory specifiers and the "@/" alias resolve like Vite does
//  - JSON imports get the import attribute Node requires
//  - src/hooks/useListings.ts additionally exports its private row parser `toListing`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json'];

function candidate(base) {
  for (const file of [base, ...EXTENSIONS.map((e) => base + e), ...EXTENSIONS.map((e) => path.join(base, `index${e}`))]) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let target = null;
  if (specifier.startsWith('@/')) target = candidate(path.join(SRC, specifier.slice(2)));
  else if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    target = candidate(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
  }
  if (target) {
    const url = pathToFileURL(target).href;
    return { url, shortCircuit: true, importAttributes: target.endsWith('.json') ? { type: 'json' } : context.importAttributes };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.endsWith('/src/hooks/useListings.ts')) {
    return { ...result, source: `${result.source}\nexport { toListing };\n` };
  }
  return result;
}
