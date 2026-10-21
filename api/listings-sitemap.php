<?php
/**
 * GET /sitemap-listings.xml (.htaccess → api/listings-sitemap.php)
 * Live sitemap of every public listing page (realty.alphapremiergroup.com/properties/APR-XXXXXX): the Drive
 * feed with admin-hidden listings removed, as api/listings.php serves it. Empty before the first sync.
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

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=900');
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
foreach ($listings as $l) {
    $ref = $l['ref'] ?? null;
    if (!is_string($ref) || !preg_match(LISTING_REF_PATTERN, $ref)) {
        continue;
    }
    $updated = is_string($l['updated'] ?? null) ? strtotime($l['updated']) : false;
    $lastmod = $updated === false ? '' : '<lastmod>' . date(DATE_W3C, $updated) . '</lastmod>';
    echo '  <url><loc>' . htmlspecialchars(listingUrl($ref), ENT_XML1 | ENT_QUOTES, 'UTF-8') . "</loc>{$lastmod}</url>\n";
}
echo "</urlset>\n";
