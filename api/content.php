<?php
/**
 * GET /api/content.php?page=slug
 * Public endpoint: customized content values for one page as { key: value } (JSON-backed
 * fields arrive parsed). Keys without a row fall back to the registry defaults on the client.
 * Private pages (slug starting with "_", e.g. `_private`) are never returned.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/ContentRegistry.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$page = is_string($_GET['page'] ?? null) ? trim($_GET['page']) : '';
if ($page === '' || !preg_match('/^[a-z0-9][a-z0-9-]{0,99}$/', $page)) {
    sendJson(['success' => false, 'error' => 'A valid page is required', 'data' => (object)[]], 400);
}

$pdo = getDbConnection();
if (!$pdo) {
    // Database unreachable: the client renders its registry defaults.
    sendJson(['success' => false, 'data' => (object)[], 'message' => 'Database unavailable, using defaults'], 200);
}

try {
    $stmt = $pdo->prepare('SELECT section_key, type, value FROM content_blocks WHERE page_slug = :page ORDER BY sort_order ASC, id ASC');
    $stmt->execute([':page' => $page]);
    $data = [];
    foreach ($stmt->fetchAll() as $row) {
        $value = contentDecodeValue($row['type'], $row['value']);
        if ($value !== null) {
            $data[$row['section_key']] = $value;
        }
    }
    header('Cache-Control: no-cache');
    sendJson(['success' => true, 'page' => $page, 'data' => (object)$data]);
} catch (PDOException $e) {
    error_log(basename(__FILE__) . ': ' . $e->getMessage());
    sendJson(['success' => false, 'error' => 'Failed to fetch content', 'data' => (object)[]], 500);
}
