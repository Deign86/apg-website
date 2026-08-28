<?php
/**
 * /api/admin/careers.php
 * Gated admin endpoint to manage job openings.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET (list all jobs)
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare('SELECT * FROM job_openings ORDER BY sort_order ASC, id DESC');
        $stmt->execute();
        $jobs = $stmt->fetchAll();

        foreach ($jobs as &$job) {
            if (!empty($job['requirements'])) {
                $decoded = json_decode($job['requirements'], true);
                $job['requirements'] = is_array($decoded) ? $decoded : [$job['requirements']];
            } else {
                $job['requirements'] = [];
            }
        }

        sendJson(['success' => true, 'data' => $jobs]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 2. POST (Create new job opening)
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $title        = trim($data['title'] ?? '');
    $location     = trim($data['location'] ?? 'Ortigas Center, Pasig City');
    $type         = trim($data['type'] ?? 'Full-Time');
    $tag          = trim($data['tag'] ?? '');
    $description  = trim($data['description'] ?? '');
    $requirements = $data['requirements'] ?? [];
    $status       = in_array($data['status'] ?? '', ['active', 'closed']) ? $data['status'] : 'active';
    $sortOrder    = (int)($data['sort_order'] ?? 0);

    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Job title is required'], 400);
    }

    $reqJson = is_array($requirements) ? json_encode($requirements, JSON_UNESCAPED_UNICODE) : $requirements;

    try {
        $stmt = $pdo->prepare('
            INSERT INTO job_openings (title, location, type, tag, description, requirements, status, sort_order)
            VALUES (:title, :location, :type, :tag, :description, :requirements, :status, :sort_order)
        ');
        $stmt->execute([
            ':title'        => $title,
            ':location'     => $location,
            ':type'         => $type,
            ':tag'          => $tag,
            ':description'  => $description,
            ':requirements' => $reqJson,
            ':status'       => $status,
            ':sort_order'   => $sortOrder,
        ]);

        sendJson(['success' => true, 'message' => 'Job opening created', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 3. PUT (Update existing job opening)
if ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id           = (int)($data['id'] ?? 0);
    $title        = trim($data['title'] ?? '');
    $location     = trim($data['location'] ?? 'Ortigas Center, Pasig City');
    $type         = trim($data['type'] ?? 'Full-Time');
    $tag          = trim($data['tag'] ?? '');
    $description  = trim($data['description'] ?? '');
    $requirements = $data['requirements'] ?? [];
    $status       = in_array($data['status'] ?? '', ['active', 'closed']) ? $data['status'] : 'active';
    $sortOrder    = (int)($data['sort_order'] ?? 0);

    if (!$id || empty($title)) {
        sendJson(['success' => false, 'error' => 'Valid ID and Title are required'], 400);
    }

    $reqJson = is_array($requirements) ? json_encode($requirements, JSON_UNESCAPED_UNICODE) : $requirements;

    try {
        $stmt = $pdo->prepare('
            UPDATE job_openings
            SET title = :title,
                location = :location,
                type = :type,
                tag = :tag,
                description = :description,
                requirements = :requirements,
                status = :status,
                sort_order = :sort_order,
                updated_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([
            ':id'           => $id,
            ':title'        => $title,
            ':location'     => $location,
            ':type'         => $type,
            ':tag'          => $tag,
            ':description'  => $description,
            ':requirements' => $reqJson,
            ':status'       => $status,
            ':sort_order'   => $sortOrder,
        ]);

        sendJson(['success' => true, 'message' => 'Job opening updated']);
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
        $stmt = $pdo->prepare('DELETE FROM job_openings WHERE id = :id');
        $stmt->execute([':id' => $id]);
        sendJson(['success' => true, 'message' => 'Job opening deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
