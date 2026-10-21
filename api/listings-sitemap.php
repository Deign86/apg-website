<?php
/**
 * GET /sitemap-listings.xml (.htaccess → api/listings-sitemap.php)
 * Live sitemap of every public listing page (realty.alphapremiergroup.com/properties/APR-XXXXXX) and every
 * indexable browse page (listingHubs(), lastmod = its newest listing): the Drive feed with admin-hidden
 * listings removed, as api/listings.php serves it. Empty before the first sync.
 * Listed in robots.txt, which every host shares, so the apex URL may list Realty pages.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/Listings.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(['error' => 'Method not allowed'], 405);
}

$feed = listingsFeed();
$listings = $feed === null ? [] : applyListingOverrides($feed['listings'], listingOverrides(getDbConnection()));
$updated = static fn(array $l): int => is_string($l['updated'] ?? null) ? (int)strtotime($l['updated']) : 0;
$url = static fn(string $loc, int $updated): string => '  <url><loc>' . htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>'
    . ($updated > 0 ? '<lastmod>' . date(DATE_W3C, $updated) . '</lastmod>' : '') . "</url>\n";

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=900');
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
$hubUpdated = [];
foreach ($listings as $l) {
    foreach (array_filter(listingHubPaths($l)) as $path) {
        $hubUpdated[$path] = max($hubUpdated[$path] ?? 0, $updated($l));
    }
    $ref = $l['ref'] ?? null;
    if (is_string($ref) && preg_match(LISTING_REF_PATTERN, $ref)) {
        echo $url(listingUrl($ref), $updated($l));
    }
}
foreach (listingHubs($listings) as $hub) {
    if ($hub['indexable']) {
        echo $url(REALTY_ORIGIN . $hub['path'], $hubUpdated[$hub['path']]);
    }
}
echo "</urlset>\n";
