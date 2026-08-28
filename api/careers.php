<?php
/**
 * GET /api/careers.php
 * Public endpoint to fetch active job openings.
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

try {
    $stmt = $pdo->prepare('SELECT id, title, location, type, tag, description, requirements, sort_order, created_at FROM job_openings WHERE status = "active" ORDER BY sort_order ASC, id DESC');
    $stmt->execute();
    $jobs = $stmt->fetchAll();

    // Decode requirements JSON into array
    foreach ($jobs as &$job) {
        if (!empty($job['requirements'])) {
            $decoded = json_decode($job['requirements'], true);
            $job['requirements'] = is_array($decoded) ? $decoded : [$job['requirements']];
        } else {
            $job['requirements'] = [];
        }
    }

    sendJson([
        'success' => true,
        'data' => $jobs
    ]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch careers', 'data' => []], 500);
}
