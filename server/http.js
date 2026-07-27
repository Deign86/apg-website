// server/http.js — Shared HTTP helpers for Vercel serverless functions.
// SERVER-ONLY. This file lives OUTSIDE /api, so Vercel never treats it as a
// route — it is bundled into each function that imports it (via nft).
//
// Why this exists: Vercel's Node.js runtime does NOT consistently pre-parse
// req.body into an object (behaviour varies by runtime version). The original
// /api/* handlers read req.body synchronously, so on Vercel the body was often
// `undefined` and every POST returned "Message required" / 400. readBody()
// handles every case — pre-parsed object, raw string, Buffer, or an unread
// stream — so /api/* functions reliably receive JSON bodies in production.

function safeParse(s) {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Read and JSON-parse an IncomingMessage body, robust across runtimes.
 * Order of preference:
 *   1. req.body already populated by the platform (object / string / Buffer)
 *   2. consume the raw stream (with a safety timeout so an already-consumed
 *      or non-emitting stream can never hang the function)
 * @param {import('http').IncomingMessage | null | undefined} req
 * @returns {Promise<object | null>}
 */
export async function readBody(req) {
  if (!req) return null;
  const b = req.body;
  if (b !== undefined && b !== null) {
    if (typeof b === 'string') return safeParse(b);
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(b)) return safeParse(b.toString('utf8'));
    return b; // already a parsed object
  }
  return new Promise((resolve) => {
    let raw = '';
    let done = false;
    const finish = (v) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    req.on('data', (chunk) => {
      raw += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    });
    req.on('end', () => finish(safeParse(raw)));
    req.on('error', () => finish(null));
    // Safety net: if the stream was already consumed and never emits 'end',
    // resolve with whatever we have so the function never hangs.
    setTimeout(() => finish(raw ? safeParse(raw) : null), 2500);
  });
}
