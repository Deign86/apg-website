<?php
/**
 * GET /api/careers.php                     (all active openings)
 * GET /api/careers.php?enterprise=<slug>   (scoped to an enterprise)
 *
 * Public endpoint to fetch active job openings.
 *
 * A scoped request returns only that enterprise's active openings (an empty
 * list when it has none); corporate openings are never substituted.
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

$columns = 'id, title, location, type, tag, description, requirements, responsibilities, salary, is_featured, enterprise_slug, sort_order, created_at';

/** Decodes the requirements/responsibilities columns from JSON text into arrays. */
function decodeJobRequirements(array $jobs) {
    foreach ($jobs as &$job) {
        foreach (['requirements', 'responsibilities'] as $field) {
            if (!empty($job[$field])) {
                $decoded = json_decode($job[$field], true);
                $job[$field] = is_array($decoded) ? $decoded : [$job[$field]];
            } else {
                $job[$field] = [];
            }
        }
    }
    unset($job);
    return $jobs;
}

try {
    $enterprise = $_GET['enterprise'] ?? $_GET['enterprise_slug'] ?? '';
    $enterprise = is_string($enterprise) ? trim($enterprise) : '';

    if ($enterprise === '' || $enterprise === 'all') {
        $stmt = $pdo->prepare("SELECT {$columns} FROM job_openings WHERE status = 'active' ORDER BY sort_order ASC, id DESC");
        $stmt->execute();
        $jobs = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT {$columns} FROM job_openings WHERE status = 'active' AND enterprise_slug = :enterprise ORDER BY sort_order ASC, id DESC");
        $stmt->execute([':enterprise' => $enterprise]);
        $jobs = $stmt->fetchAll();
    }

    sendJson([
        'success' => true,
        'data' => decodeJobRequirements($jobs),
    ]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch careers', 'data' => []], 500);
}
