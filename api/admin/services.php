<?php
/**
 * /api/admin/services.php
 * Gated admin endpoint to manage service items (Virtual Office packages & subsidiary cards).
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET (list all or by category)
if ($method === 'GET') {
    $category = trim($_GET['category'] ?? '');
    try {
        if (!empty($category)) {
            $stmt = $pdo->prepare('SELECT * FROM service_items WHERE category = :category ORDER BY sort_order ASC, id ASC');
            $stmt->execute([':category' => $category]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM service_items ORDER BY category ASC, sort_order ASC, id ASC');
            $stmt->execute();
        }
        sendJson(['success' => true, 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 2. POST (Create new service item)
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $category    = trim($data['category'] ?? 'virtual-office');
    $title       = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $price       = trim($data['price'] ?? '');
    $imageUrl    = trim($data['image_url'] ?? '');
    $sortOrder   = (int)($data['sort_order'] ?? 0);
    $isPublished = isset($data['is_published']) ? (int)$data['is_published'] : 1;

    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Title is required'], 400);
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO service_items (category, title, description, price, image_url, sort_order, is_published)
            VALUES (:category, :title, :description, :price, :image_url, :sort_order, :is_published)
        ');
        $stmt->execute([
            ':category'    => $category,
            ':title'       => $title,
            ':description' => $description,
            ':price'       => $price,
            ':image_url'   => $imageUrl,
            ':sort_order'  => $sortOrder,
            ':is_published'=> $isPublished,
        ]);

        $newId = $pdo->lastInsertId();
        sendJson(['success' => true, 'message' => 'Service item created', 'id' => $newId]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 3. PUT (Update existing service item)
if ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id          = (int)($data['id'] ?? 0);
    $category    = trim($data['category'] ?? 'virtual-office');
    $title       = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $price       = trim($data['price'] ?? '');
    $imageUrl    = trim($data['image_url'] ?? '');
    $sortOrder   = (int)($data['sort_order'] ?? 0);
    $isPublished = isset($data['is_published']) ? (int)$data['is_published'] : 1;

    if (!$id || empty($title)) {
        sendJson(['success' => false, 'error' => 'Valid ID and Title are required'], 400);
    }

    try {
        $stmt = $pdo->prepare('
            UPDATE service_items
            SET category = :category,
                title = :title,
                description = :description,
                price = :price,
                image_url = :image_url,
                sort_order = :sort_order,
                is_published = :is_published,
                updated_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([
            ':id'          => $id,
            ':category'    => $category,
            ':title'       => $title,
            ':description' => $description,
            ':price'       => $price,
            ':image_url'   => $imageUrl,
            ':sort_order'  => $sortOrder,
            ':is_published'=> $isPublished,
        ]);

        sendJson(['success' => true, 'message' => 'Service item updated']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 4. DELETE
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'Valid ID is required'], 400);
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM service_items WHERE id = :id');
        $stmt->execute([':id' => $id]);
        sendJson(['success' => true, 'message' => 'Service item deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
