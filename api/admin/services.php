<?php
/**
 * /api/admin/services.php
 * Gated admin endpoint to manage service items across all APG enterprises.
 *
 *   GET    ?category=   list (all, or one enterprise)
 *   POST                create
 *   PUT                 update by id
 *   DELETE ?id=         hard delete
 *   POST   ?action=upload_image   multipart `image` → { url } (cover / gallery photos)
 *
 * Service categories are the canonical enterprise slugs, so the same validator
 * used by blogs and careers applies here. `kind` separates a company's service
 * cards ('service'), catalog products ('product', e.g. 88 Prime) and priced
 * plans ('package', e.g. Virtual Office).
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if (($_GET['action'] ?? '') === 'upload_image') {
    if ($method !== 'POST') {
        sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
    }
    requireAdminCapability('services');
    require_once __DIR__ . '/../lib/upload-image.php';
    handleAdminImageUpload('services', 'service');
}

const SERVICE_KINDS = ['service', 'product', 'package'];

/** JSON-encodes a list of non-empty strings, or null when empty. */
function serviceJsonList($value) {
    if (!is_array($value)) {
        return null;
    }
    $items = [];
    foreach ($value as $item) {
        if (is_string($item) && trim($item) !== '') {
            $items[] = mb_substr(trim($item), 0, 1000);
        }
    }
    return $items === [] ? null : json_encode($items, JSON_UNESCAPED_UNICODE);
}

/** Returns [kind, error]; a missing kind keeps $default (the stored kind on update). */
function readServiceKind($data, $default = 'service') {
    $kind = inputText($data, 'kind', $default);
    if (!in_array($kind, SERVICE_KINDS, true)) {
        return [null, 'Unknown kind "' . $kind . '". Allowed: ' . implode(', ', SERVICE_KINDS)];
    }
    return [$kind, null];
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
    $category = inputText($data, 'category');
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
    $category = inputText($_GET, 'category');
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
    $data = jsonBody() ?: $_POST;

    $title = inputText($data, 'title');
    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Title is required'], 400);
    }

    [$category, $err] = readServiceCategory($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }
    [$kind, $err] = readServiceKind($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO service_items
                (category, kind, title, summary, tag, description, price, image_url, features, photos, sort_order, is_published)
            VALUES
                (:category, :kind, :title, :summary, :tag, :description, :price, :image_url, :features, :photos, :sort_order, :is_published)
        ');
        $stmt->execute([
            ':category'    => $category,
            ':kind'        => $kind,
            ':title'       => $title,
            ':summary'     => inputText($data, 'summary') ?: null,
            ':tag'         => inputText($data, 'tag') ?: null,
            ':description' => inputText($data, 'description'),
            ':price'       => inputText($data, 'price'),
            ':image_url'   => inputText($data, 'image_url'),
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
    $data = jsonBody();

    $id = (int)($data['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid service id is required'], 400);
    }

    $title = inputText($data, 'title');
    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Title is required'], 400);
    }

    [$category, $err] = readServiceCategory($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    try {
        $exists = $pdo->prepare('SELECT kind FROM service_items WHERE id = :id LIMIT 1');
        $exists->execute([':id' => $id]);
        $current = $exists->fetch();
        if (!$current) {
            sendJson(['success' => false, 'error' => 'Service item not found'], 404);
        }
        [$kind, $err] = readServiceKind($data, $current['kind']);
        if ($err) {
            sendJson(['success' => false, 'error' => $err], 422);
        }

        $stmt = $pdo->prepare('
            UPDATE service_items
            SET category = :category,
                kind = :kind,
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
            ':kind'        => $kind,
            ':title'       => $title,
            ':summary'     => inputText($data, 'summary') ?: null,
            ':tag'         => inputText($data, 'tag') ?: null,
            ':description' => inputText($data, 'description'),
            ':price'       => inputText($data, 'price'),
            ':image_url'   => inputText($data, 'image_url'),
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
