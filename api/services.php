<?php
/**
 * GET /api/services.php?category=x
 * Public endpoint to fetch published service items / packages.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$pdo = getDbConnection();

if (!$pdo) {
    sendJson(['success' => false, 'data' => [], 'message' => 'Database unavailable, using fallback'], 200);
}

try {
    if (!empty($category)) {
        $stmt = $pdo->prepare('SELECT id, category, title, description, price, image_url, sort_order FROM service_items WHERE category = :category AND is_published = 1 ORDER BY sort_order ASC, id ASC');
        $stmt->execute([':category' => $category]);
    } else {
        $stmt = $pdo->prepare('SELECT id, category, title, description, price, image_url, sort_order FROM service_items WHERE is_published = 1 ORDER BY category ASC, sort_order ASC, id ASC');
        $stmt->execute();
    }
    $items = $stmt->fetchAll();

    sendJson([
        'success' => true,
        'category' => $category,
        'data' => $items
    ]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch services', 'data' => []], 500);
}
