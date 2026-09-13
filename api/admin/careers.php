<?php
/**
 * /api/admin/careers.php
 * Gated admin endpoint to manage job openings across all APG enterprises.
 *
 *   GET    ?enterprise=&status=   list
 *   POST                          create
 *   PUT                           update by id
 *   DELETE ?id=                   hard delete
 *
 * Auth: admin session cookie via requireAdminAuth(). Any authenticated admin may
 * manage openings for any enterprise.
 *
 * Deleting is a hard delete, matching api/admin/blogs.php.
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
function jobJsonList($value) {
    if (!is_array($value) || $value === []) {
        return null;
    }
    return json_encode(array_values($value), JSON_UNESCAPED_UNICODE);
}

/** Decodes the JSON list columns back into arrays for the client. */
function jobDecodeRow(array $job) {
    foreach (['requirements', 'responsibilities'] as $field) {
        if (!empty($job[$field])) {
            $decoded = json_decode($job[$field], true);
            $job[$field] = is_array($decoded) ? $decoded : [$job[$field]];
        } else {
            $job[$field] = [];
        }
    }
    return $job;
}

/** Returns [slug, error]. */
function readJobEnterprise($data, $default = 'corporate') {
    $slug = trim($data['enterprise_slug'] ?? '');
    if ($slug === '') {
        return [$default, null];
    }
    if (!isValidEnterpriseSlug($slug)) {
        return [null, 'Unknown enterprise_slug "' . $slug . '". Allowed: ' . implode(', ', enterpriseSlugs())];
    }
    return [$slug, null];
}

// ---------------------------------------------------------------- GET (list)

if ($method === 'GET') {
    $where = [];
    $params = [];

    $enterprise = trim($_GET['enterprise'] ?? $_GET['enterprise_slug'] ?? '');
    if ($enterprise !== '' && $enterprise !== 'all') {
        if (!isValidEnterpriseSlug($enterprise)) {
            sendJson(['success' => false, 'error' => 'Unknown enterprise_slug "' . $enterprise . '"'], 422);
        }
        $where[] = 'enterprise_slug = :enterprise';
        $params[':enterprise'] = $enterprise;
    }

    $status = trim($_GET['status'] ?? '');
    if ($status !== '' && $status !== 'all') {
        if (!in_array($status, ['active', 'closed'], true)) {
            sendJson(['success' => false, 'error' => 'status filter must be "active" or "closed"'], 422);
        }
        $where[] = 'status = :status';
        $params[':status'] = $status;
    }

    $sql = 'SELECT * FROM job_openings';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY sort_order ASC, id DESC';

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $jobs = array_map('jobDecodeRow', $stmt->fetchAll());
        sendJson(['success' => true, 'data' => $jobs]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to list job openings'], 500);
    }
}

// ---------------------------------------------------------------- POST

if ($method === 'POST') {
    requireAdminCapability('careers');
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $title = trim($data['title'] ?? '');
    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Job title is required'], 400);
    }

    [$enterpriseSlug, $err] = readJobEnterprise($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    $status = in_array($data['status'] ?? '', ['active', 'closed'], true) ? $data['status'] : 'active';

    try {
        $stmt = $pdo->prepare('
            INSERT INTO job_openings
                (title, location, type, tag, description, requirements, responsibilities, salary, is_featured, enterprise_slug, status, sort_order)
            VALUES
                (:title, :location, :type, :tag, :description, :requirements, :responsibilities, :salary, :is_featured, :enterprise_slug, :status, :sort_order)
        ');
        $stmt->execute([
            ':title'            => $title,
            ':location'         => trim($data['location'] ?? 'Ortigas Center, Pasig City'),
            ':type'             => trim($data['type'] ?? 'Full-Time'),
            ':tag'              => trim($data['tag'] ?? ''),
            ':description'      => trim($data['description'] ?? ''),
            ':requirements'     => jobJsonList($data['requirements'] ?? []),
            ':responsibilities' => jobJsonList($data['responsibilities'] ?? []),
            ':salary'           => trim($data['salary'] ?? '') ?: null,
            ':is_featured'      => !empty($data['is_featured']) ? 1 : 0,
            ':enterprise_slug'  => $enterpriseSlug,
            ':status'           => $status,
            ':sort_order'       => (int)($data['sort_order'] ?? 0),
        ]);

        sendJson(['success' => true, 'message' => 'Job opening created', 'id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            sendJson(['success' => false, 'error' => 'This enterprise already has an opening titled "' . $title . '"'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to create job opening'], 500);
    }
}

// ---------------------------------------------------------------- PUT

if ($method === 'PUT') {
    requireAdminCapability('careers');
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id = (int)($data['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid job id is required'], 400);
    }

    $title = trim($data['title'] ?? '');
    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Job title is required'], 400);
    }

    [$enterpriseSlug, $err] = readJobEnterprise($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    $status = in_array($data['status'] ?? '', ['active', 'closed'], true) ? $data['status'] : 'active';

    try {
        $exists = $pdo->prepare('SELECT id FROM job_openings WHERE id = :id LIMIT 1');
        $exists->execute([':id' => $id]);
        if (!$exists->fetch()) {
            sendJson(['success' => false, 'error' => 'Job opening not found'], 404);
        }

        $stmt = $pdo->prepare('
            UPDATE job_openings
            SET title = :title,
                location = :location,
                type = :type,
                tag = :tag,
                description = :description,
                requirements = :requirements,
                responsibilities = :responsibilities,
                salary = :salary,
                is_featured = :is_featured,
                enterprise_slug = :enterprise_slug,
                status = :status,
                sort_order = :sort_order,
                updated_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([
            ':id'               => $id,
            ':title'            => $title,
            ':location'         => trim($data['location'] ?? 'Ortigas Center, Pasig City'),
            ':type'             => trim($data['type'] ?? 'Full-Time'),
            ':tag'              => trim($data['tag'] ?? ''),
            ':description'      => trim($data['description'] ?? ''),
            ':requirements'     => jobJsonList($data['requirements'] ?? []),
            ':responsibilities' => jobJsonList($data['responsibilities'] ?? []),
            ':salary'           => trim($data['salary'] ?? '') ?: null,
            ':is_featured'      => !empty($data['is_featured']) ? 1 : 0,
            ':enterprise_slug'  => $enterpriseSlug,
            ':status'           => $status,
            ':sort_order'       => (int)($data['sort_order'] ?? 0),
        ]);

        sendJson(['success' => true, 'message' => 'Job opening updated']);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            sendJson(['success' => false, 'error' => 'This enterprise already has an opening titled "' . $title . '"'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to update job opening'], 500);
    }
}

// ---------------------------------------------------------------- DELETE

if ($method === 'DELETE') {
    requireAdminCapability('delete');
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid job id is required'], 400);
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM job_openings WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) {
            sendJson(['success' => false, 'error' => 'Job opening not found'], 404);
        }
        sendJson(['success' => true, 'message' => 'Job opening deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to delete job opening'], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
