<?php
/**
 * GET /api/listings.php
 * Public feed of available APR properties, synced from the Google Drive every 15 minutes
 * by api/cron/drive-sync.php, with the admin's overrides applied (api/lib/Listings.php):
 * hidden ones removed, price overrides, featured first. The client filters and searches (the feed is small).
 * Each listing carries its `area_slug`; `hubs` are the browse pages (listingHubs()), and a listing belongs to
 * a hub when its type and deal match and, for an area hub, its area_slug does.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/Listings.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$feed = listingsFeed();
if ($feed === null) {
    // Not synced yet (fresh deploy): an honest empty list, never sample data.
    sendJson(['success' => true, 'synced_at' => null, 'data' => [], 'hubs' => []]);
}

$listings = array_map(static function (array $l): array {
    unset($l['drive_folder']); // staff-only
    return $l + ['area_slug' => listingSlug(listingAreaName((string)($l['area'] ?? '')))];
}, applyListingOverrides($feed['listings'], listingOverrides(getDbConnection())));

header('Cache-Control: public, max-age=60');
sendJson(['success' => true, 'synced_at' => $feed['synced_at'] ?? null, 'data' => $listings, 'hubs' => listingHubs($listings)]);
