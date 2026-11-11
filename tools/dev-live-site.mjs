/**
 * Dev server only (`npm run dev`, never the build): shows the live site's public data on localhost, so the
 * Realty pages can be worked on with real content without PHP or MySQL. Turned on by DEV_LIVE_SITE in
 * .env.local (see .env.example); vite.config.js also proxies uploaded photos (/uploads/) to the same site.
 *
 * - GET /api/listings.php: a small sample of the live listings feed (PER_TYPE per property type).
 * - GET of the other public read endpoints (LIVE_READS: services, blog posts, job openings, page content):
 *   passed through from the live site as they are.
 *
 * Read-only: only GET requests are forwarded, and nothing is stored. Form posts (inquiries, applications)
 * still go to the local PHP backend, so working locally never sends anything to the live site.
 */

const PER_TYPE = 8;
const CACHE_MS = 15 * 60 * 1000; // the live feed itself is re-synced from the Drive every 15 minutes

/** Public read endpoints passed through from the live site (GET only). */
const LIVE_READS = /^\/api\/(services|careers|blogs|content)\.php(\?|$)/;

const str = (v) => (v == null ? '' : String(v));

/** The fields the sample is chosen by, read once from each raw feed listing (which is passed on unchanged). */
const parseListing = (raw) => ({
  raw,
  type: str(raw?.type),
  typeLabel: str(raw?.type_label),
  title: str(raw?.title),
  price: str(raw?.price),
  deal: str(raw?.deal),
  areaSlug: str(raw?.area_slug),
  photos: Array.isArray(raw?.photos) ? raw.photos.length : 0,
});

const parseHub = (raw) => ({
  raw,
  type: str(raw?.type),
  deal: str(raw?.deal),
  areaSlug: str(raw?.area_slug),
  h1: str(raw?.h1),
  description: str(raw?.description),
  count: Number(raw?.count) || 0,
});

/**
 * Up to PER_TYPE listings of each type, chosen to keep the cases the design must handle: no photos, no price,
 * the longest title, both lease and sale, then one per area. Listings keep the live feed's order.
 */
export function sampleFeed(feed) {
  const listings = feed.data.map(parseListing).filter((l) => l.type !== '');
  const byType = new Map();
  for (const l of listings) byType.set(l.type, [...(byType.get(l.type) ?? []), l]);

  const picked = new Set();
  for (const group of byType.values()) {
    const chosen = new Set();
    const add = (l) => {
      if (l && chosen.size < PER_TYPE) chosen.add(l);
    };
    add(group.find((l) => l.photos === 0));
    add(group.find((l) => l.price === ''));
    add(group.reduce((a, b) => (b.title.length > a.title.length ? b : a)));
    add(group.find((l) => l.deal === 'sale'));
    add(group.find((l) => l.deal === 'lease'));
    const areas = new Set([...chosen].map((l) => l.areaSlug));
    for (const l of group) {
      if (!areas.has(l.areaSlug)) {
        areas.add(l.areaSlug);
        add(l);
      }
    }
    for (const l of group) add(l);
    for (const l of chosen) picked.add(l);
  }
  const sample = listings.filter((l) => picked.has(l));

  // Browse pages ("hubs") recounted for the sample; ones with no sampled listing are dropped. Each keeps the
  // live `indexable` flag, so the page shows the same kinds of browse links as the live site.
  const inHub = (l, h) => l.type === h.type && l.deal === h.deal && (h.areaSlug === '' || l.areaSlug === h.areaSlug);
  const hubs = feed.hubs.map(parseHub).flatMap((h) => {
    const members = sample.filter((l) => inHub(l, h));
    if (members.length === 0) return [];
    const plural = h.h1.split(' for ')[0].toLowerCase();
    const noun = members.length === 1 ? members[0].typeLabel.toLowerCase() : plural;
    const description = h.description.replace(`${h.count} ${plural}`, `${members.length} ${noun}`);
    return [{ ...h.raw, count: members.length, description }];
  });

  return { ...feed, data: sample.map((l) => l.raw), hubs };
}

/** Vite plugin serving the live data. `origin` is the live site, e.g. https://realty.alphapremiergroup.com. */
export function devLiveSite(origin) {
  let cached = null; // { at, body: Promise<string> }

  const sampleBody = () => {
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.body;
    const body = fetch(`${origin}/api/listings.php`, { headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((feed) => {
        if (!feed || !Array.isArray(feed.data) || !Array.isArray(feed.hubs)) throw new Error('unexpected feed shape');
        return JSON.stringify(sampleFeed(feed));
      });
    cached = { at: Date.now(), body };
    body.catch(() => {
      cached = null; // retry on the next request
    });
    return body;
  };

  return {
    name: 'dev-live-site',
    apply: 'serve',
    configureServer(server) {
      const fail = (res, what, err) => {
        server.config.logger.error(`[dev-live-site] ${origin}${what} failed: ${err.message}`);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ success: false, error: 'Live site unavailable' }));
      };

      server.middlewares.use('/api/listings.php', (req, res, next) => {
        if (req.method !== 'GET') return next();
        sampleBody().then((body) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(body);
        }, (err) => fail(res, '/api/listings.php', err));
      });

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (req.method !== 'GET' || !LIVE_READS.test(url)) return next();
        fetch(`${origin}${url}`, { headers: { Accept: 'application/json' } })
          .then(async (live) => {
            res.statusCode = live.status;
            res.setHeader('Content-Type', live.headers.get('content-type') ?? 'application/json; charset=utf-8');
            res.end(await live.text());
          })
          .catch((err) => fail(res, url, err));
      });
    },
  };
}
