<?php
/**
 * GET /api/listings.php
 * Public feed of available APR properties, synced from the Google Drive every 15 minutes
 * by api/cron/drive-sync.php. The client filters and searches (the feed is small).
 */
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$feed = json_decode((string)@file_get_contents(__DIR__ . '/data/listings.generated.json'), true);
if (!is_array($feed) || !is_array($feed['listings'] ?? null)) {
    // Not synced yet (fresh deploy): an honest empty list, never sample data.
    sendJson(['success' => true, 'synced_at' => null, 'data' => []]);
}

$listings = array_map(static function (array $l): array {
    unset($l['drive_folder']); // staff-only
    return $l;
}, $feed['listings']);

header('Cache-Control: public, max-age=60');
sendJson(['success' => true, 'synced_at' => $feed['synced_at'] ?? null, 'data' => $listings]);
