<?php
/**
 * GET /api/services.php                     (all published services)
 * GET /api/services.php?category=<slug>     (scoped to an enterprise)
 *
 * Public endpoint to fetch published service items / packages. Each row carries
 * `kind` (service | product | package) so a page can split cards from catalog items.
 *
 * A scoped request returns only that enterprise's published services (an empty
 * list when it has none); corporate services are never substituted.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$pdo = getDbConnection();

if (!$pdo) {
    sendJson(['success' => false, 'data' => [], 'message' => 'Database unavailable, using fallback'], 200);
}

$columns = 'id, category, kind, title, summary, tag, description, price, image_url, features, photos, sort_order';

/** Decodes the JSON list columns back into arrays for the client. */
function decodeServiceRows(array $items) {
    foreach ($items as &$item) {
        foreach (['features', 'photos'] as $field) {
            if (!empty($item[$field])) {
                $decoded = json_decode($item[$field], true);
                $item[$field] = is_array($decoded) ? $decoded : [$item[$field]];
            } else {
                $item[$field] = [];
            }
        }
    }
    unset($item);
    return $items;
}

$category = is_string($_GET['category'] ?? null) ? trim($_GET['category']) : '';

try {
    if ($category === '' || $category === 'all') {
        $stmt = $pdo->prepare("SELECT {$columns} FROM service_items WHERE is_published = 1 ORDER BY category ASC, sort_order ASC, id ASC");
        $stmt->execute();
        $items = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT {$columns} FROM service_items WHERE category = :category AND is_published = 1 ORDER BY sort_order ASC, id ASC");
        $stmt->execute([':category' => $category]);
        $items = $stmt->fetchAll();
    }

    sendJson([
        'success' => true,
        'category' => $category,
        'data' => decodeServiceRows($items),
    ]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch services', 'data' => []], 500);
}
