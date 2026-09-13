<?php
/**
 * /api/admin/services.php
 * Gated admin endpoint to manage service items across all APG enterprises.
 *
 *   GET    ?category=   list (all, or one enterprise)
 *   POST                create
 *   PUT                 update by id
 *   DELETE ?id=         hard delete
 *
 * Service categories are the canonical enterprise slugs, so the same validator
 * used by blogs and careers applies here.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

/** JSON-encodes a list column, or null when empty. */
function serviceJsonList($value) {
    if (!is_array($value) || $value === []) {
        return null;
    }
    return json_encode(array_values($value), JSON_UNESCAPED_UNICODE);
}

/** Decodes the JSON list columns back into arrays for the client. */
function serviceDecodeRow(array $item) {
    foreach (['features', 'photos'] as $field) {
        if (!empty($item[$field])) {
            $decoded = json_decode($item[$field], true);
            $item[$field] = is_array($decoded) ? $decoded : [$item[$field]];
        } else {
            $item[$field] = [];
        }
    }
    return $item;
}

/** Returns [category, error]. */
function readServiceCategory($data, $default = 'corporate') {
    $category = trim($data['category'] ?? '');
    if ($category === '') {
        return [$default, null];
    }
    if (!isValidEnterpriseSlug($category)) {
        return [null, 'Unknown category "' . $category . '". Allowed: ' . implode(', ', enterpriseSlugs())];
    }
    return [$category, null];
}

// ---------------------------------------------------------------- GET (list)

if ($method === 'GET') {
    $category = trim($_GET['category'] ?? '');
    if ($category !== '' && $category !== 'all' && !isValidEnterpriseSlug($category)) {
        sendJson(['success' => false, 'error' => 'Unknown category "' . $category . '"'], 422);
    }

    try {
        if ($category !== '' && $category !== 'all') {
            $stmt = $pdo->prepare('SELECT * FROM service_items WHERE category = :category ORDER BY sort_order ASC, id ASC');
            $stmt->execute([':category' => $category]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM service_items ORDER BY category ASC, sort_order ASC, id ASC');
            $stmt->execute();
        }
        sendJson(['success' => true, 'data' => array_map('serviceDecodeRow', $stmt->fetchAll())]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to list service items'], 500);
    }
}

// ---------------------------------------------------------------- POST

if ($method === 'POST') {
    requireAdminCapability('services');
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $title = trim($data['title'] ?? '');
    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Title is required'], 400);
    }

    [$category, $err] = readServiceCategory($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO service_items
                (category, title, summary, tag, description, price, image_url, features, photos, sort_order, is_published)
            VALUES
                (:category, :title, :summary, :tag, :description, :price, :image_url, :features, :photos, :sort_order, :is_published)
        ');
        $stmt->execute([
            ':category'    => $category,
            ':title'       => $title,
            ':summary'     => trim($data['summary'] ?? '') ?: null,
            ':tag'         => trim($data['tag'] ?? '') ?: null,
            ':description' => trim($data['description'] ?? ''),
            ':price'       => trim($data['price'] ?? ''),
            ':image_url'   => trim($data['image_url'] ?? ''),
            ':features'    => serviceJsonList($data['features'] ?? []),
            ':photos'      => serviceJsonList($data['photos'] ?? []),
            ':sort_order'  => (int)($data['sort_order'] ?? 0),
            ':is_published'=> isset($data['is_published']) ? (int)$data['is_published'] : 1,
        ]);

        sendJson(['success' => true, 'message' => 'Service item created', 'id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            sendJson(['success' => false, 'error' => 'This enterprise already has a service titled "' . $title . '"'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to create service item'], 500);
    }
}

// ---------------------------------------------------------------- PUT

if ($method === 'PUT') {
    requireAdminCapability('services');
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id = (int)($data['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid service id is required'], 400);
    }

    $title = trim($data['title'] ?? '');
    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Title is required'], 400);
    }

    [$category, $err] = readServiceCategory($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    try {
        $exists = $pdo->prepare('SELECT id FROM service_items WHERE id = :id LIMIT 1');
        $exists->execute([':id' => $id]);
        if (!$exists->fetch()) {
            sendJson(['success' => false, 'error' => 'Service item not found'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE service_items
            SET category = :category,
                title = :title,
                summary = :summary,
                tag = :tag,
                description = :description,
                price = :price,
                image_url = :image_url,
                features = :features,
                photos = :photos,
                sort_order = :sort_order,
                is_published = :is_published,
                updated_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([
            ':id'          => $id,
            ':category'    => $category,
            ':title'       => $title,
            ':summary'     => trim($data['summary'] ?? '') ?: null,
            ':tag'         => trim($data['tag'] ?? '') ?: null,
            ':description' => trim($data['description'] ?? ''),
            ':price'       => trim($data['price'] ?? ''),
            ':image_url'   => trim($data['image_url'] ?? ''),
            ':features'    => serviceJsonList($data['features'] ?? []),
            ':photos'      => serviceJsonList($data['photos'] ?? []),
            ':sort_order'  => (int)($data['sort_order'] ?? 0),
            ':is_published'=> isset($data['is_published']) ? (int)$data['is_published'] : 1,
        ]);

        sendJson(['success' => true, 'message' => 'Service item updated']);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            sendJson(['success' => false, 'error' => 'This enterprise already has a service titled "' . $title . '"'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to update service item'], 500);
    }
}

// ---------------------------------------------------------------- DELETE

if ($method === 'DELETE') {
    requireAdminCapability('delete');
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid service id is required'], 400);
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM service_items WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) {
            sendJson(['success' => false, 'error' => 'Service item not found'], 404);
        }
        sendJson(['success' => true, 'message' => 'Service item deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to delete service item'], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
