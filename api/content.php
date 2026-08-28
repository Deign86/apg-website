<?php
/**
 * GET /api/content.php?page=slug
 * Public endpoint to fetch content blocks for a specific page.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$page = isset($_GET['page']) ? trim($_GET['page']) : '';
$pdo = getDbConnection();

if (!$pdo) {
    // Database unreachable, return empty array so frontend falls back gracefully
    sendJson(['success' => false, 'data' => [], 'message' => 'Database unavailable, using fallback'], 200);
}

try {
    if (!empty($page)) {
        $stmt = $pdo->prepare('SELECT page_slug, section_key, type, value, sort_order FROM content_blocks WHERE page_slug = :page ORDER BY sort_order ASC, id ASC');
        $stmt->execute([':page' => $page]);
    } else {
        $stmt = $pdo->prepare('SELECT page_slug, section_key, type, value, sort_order FROM content_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC');
        $stmt->execute();
    }
    $blocks = $stmt->fetchAll();

    // Keyed associative map for fast frontend consumption
    $mapped = [];
    foreach ($blocks as $b) {
        $mapped[$b['section_key']] = $b['value'];
    }

    sendJson([
        'success' => true,
        'page' => $page,
        'blocks' => $blocks,
        'data' => $mapped
    ]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch content blocks', 'data' => []], 500);
}
