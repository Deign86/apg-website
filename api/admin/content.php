<?php
/**
 * /api/admin/content.php
 * Gated admin endpoint to manage static text / card content blocks.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET (list all or by page)
if ($method === 'GET') {
    $page = trim($_GET['page'] ?? '');
    try {
        if (!empty($page)) {
            $stmt = $pdo->prepare('SELECT * FROM content_blocks WHERE page_slug = :page ORDER BY sort_order ASC, id ASC');
            $stmt->execute([':page' => $page]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM content_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC');
            $stmt->execute();
        }
        sendJson(['success' => true, 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 2. POST / PUT (Upsert content block)
if ($method === 'POST' || $method === 'PUT') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $pageSlug   = trim($data['page_slug'] ?? '');
    $sectionKey = trim($data['section_key'] ?? '');
    $type       = trim($data['type'] ?? 'text');
    $value      = $data['value'] ?? '';
    $sortOrder  = (int)($data['sort_order'] ?? 0);

    if (empty($pageSlug) || empty($sectionKey)) {
        sendJson(['success' => false, 'error' => 'page_slug and section_key are required'], 400);
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO content_blocks (page_slug, section_key, type, value, sort_order)
            VALUES (:page_slug, :section_key, :type, :value, :sort_order)
            ON DUPLICATE KEY UPDATE
                type = VALUES(type),
                value = VALUES(value),
                sort_order = VALUES(sort_order),
                updated_at = NOW()
        ');
        $stmt->execute([
            ':page_slug'   => $pageSlug,
            ':section_key' => $sectionKey,
            ':type'        => $type,
            ':value'       => is_string($value) ? $value : json_encode($value),
            ':sort_order'  => $sortOrder,
        ]);

        sendJson(['success' => true, 'message' => 'Content block saved successfully']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 3. DELETE
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'ID is required'], 400);
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM content_blocks WHERE id = :id');
        $stmt->execute([':id' => $id]);
        sendJson(['success' => true, 'message' => 'Content block deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
