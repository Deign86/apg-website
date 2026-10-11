<?php
/**
 * /api/admin/listings.php — "Property Listings" control (capability 'listings').
 *
 * GET  → { data: every Drive listing (hidden ones included, with drive_folder), overrides: {ref: {...}},
 *          status: last Drive sync run, drive_folder: APR root folder id }
 * PUT  { ref, hidden, featured, sort_order, price_override, note } → upserts that ref's override.
 *
 * New listings, photos and SOLD moves come from the Drive (api/cron/drive-sync.php, every 15 min);
 * this endpoint only stores website-side controls in `listing_overrides`.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/Listings.php';

requireAdminCapability('listings');

$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $feed = listingsFeed();
    sendJson([
        'success' => true,
        'data' => $feed['listings'] ?? [],
        'overrides' => (object)listingOverrides($pdo),
        'status' => listingsSyncStatus($feed),
        'drive_folder' => getenv('DRIVE_FOLDER_ID') ?: '1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll',
    ]);
}

if ($method !== 'PUT') {
    sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
}

$data = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($data)) {
    sendJson(['success' => false, 'error' => 'Invalid JSON body'], 400);
}

$ref = is_string($data['ref'] ?? null) ? $data['ref'] : '';
if (!preg_match(LISTING_REF_PATTERN, $ref)) {
    sendJson(['success' => false, 'error' => 'Valid listing ref (APR-XXXXXX) is required'], 400);
}
$feed = listingsFeed();
if (!in_array($ref, array_column($feed['listings'] ?? [], 'ref'), true)) {
    sendJson(['success' => false, 'error' => 'That listing is no longer in the Drive feed'], 404);
}

$flag = static function (string $key) use ($data): int {
    $v = $data[$key] ?? false;
    if (!is_bool($v) && $v !== 0 && $v !== 1) {
        sendJson(['success' => false, 'error' => "{$key} must be true or false"], 400);
    }
    return $v ? 1 : 0;
};
$optionalText = static function (string $key, int $max) use ($data): ?string {
    $v = $data[$key] ?? null;
    if ($v === null) {
        return null;
    }
    if (!is_string($v)) {
        sendJson(['success' => false, 'error' => "{$key} must be text"], 400);
    }
    $v = trim(str_replace("\0", '', $v));
    if (mb_strlen($v) > $max) {
        sendJson(['success' => false, 'error' => "{$key} is limited to {$max} characters"], 400);
    }
    return $v === '' ? null : $v;
};

$sortOrder = $data['sort_order'] ?? null;
if ($sortOrder === '') {
    $sortOrder = null;
}
if ($sortOrder !== null) {
    $sortOrder = filter_var($sortOrder, FILTER_VALIDATE_INT, ['options' => ['min_range' => -9999, 'max_range' => 9999]]);
    if ($sortOrder === false) {
        sendJson(['success' => false, 'error' => 'Order must be a whole number between -9999 and 9999 (or empty)'], 400);
    }
}

$params = [
    ':ref' => $ref,
    ':hidden' => $flag('hidden'),
    ':featured' => $flag('featured'),
    ':sort_order' => $sortOrder,
    ':price_override' => $optionalText('price_override', 255),
    ':note' => $optionalText('note', 500),
    ':updated_by' => (int)$_SESSION['admin_id'],
];

try {
    $stmt = $pdo->prepare('INSERT INTO listing_overrides (ref, hidden, featured, sort_order, price_override, note, updated_by)
        VALUES (:ref, :hidden, :featured, :sort_order, :price_override, :note, :updated_by)
        ON DUPLICATE KEY UPDATE hidden = VALUES(hidden), featured = VALUES(featured), sort_order = VALUES(sort_order),
            price_override = VALUES(price_override), note = VALUES(note), updated_by = VALUES(updated_by), updated_at = CURRENT_TIMESTAMP');
    $stmt->execute($params);
} catch (PDOException $e) {
    error_log('admin/listings PUT: ' . $e->getMessage());
    sendJson(['success' => false, 'error' => 'Could not save the listing settings'], 500);
}

sendJson(['success' => true, 'data' => listingOverrides($pdo)[$ref] ?? null]);
