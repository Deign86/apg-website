<?php
/**
 * /api/admin/applicants.php
 * Gated admin endpoint to manage job applicants, candidate status pipeline,
 * recruiter internal notes, and secure resume streaming.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();

$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// 1. GET — Secure Resume Streaming (Gated via authenticated session)
if ($method === 'GET' && $action === 'resume') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'Invalid applicant ID'], 400);
    }

    try {
        $stmt = $pdo->prepare('SELECT resume_path, resume_filename, full_name FROM job_applicants WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $applicant = $stmt->fetch();

        if (!$applicant || empty($applicant['resume_path'])) {
            sendJson(['success' => false, 'error' => 'Resume file not found for this applicant'], 404);
        }

        $baseUploadDir = realpath(dirname(__DIR__) . '/../uploads/resumes');
        $filePath = realpath(dirname(__DIR__) . '/../' . ltrim($applicant['resume_path'], '/'));

        // Prevent directory traversal attacks
        if (!$filePath || !$baseUploadDir || !str_starts_with($filePath, $baseUploadDir) || !file_exists($filePath)) {
            sendJson(['success' => false, 'error' => 'Resume file could not be located on disk'], 404);
        }

        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'pdf'  => 'application/pdf',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'rtf'  => 'application/rtf',
            'txt'  => 'text/plain',
            'png'  => 'image/png',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
        ];
        $contentType = $mimeTypes[$ext] ?? 'application/octet-stream';
        $downloadName = $applicant['resume_filename'] ?: (preg_replace('/[^a-zA-Z0-9_-]/', '_', $applicant['full_name']) . '_Resume.' . $ext);

        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($filePath));
        header('Content-Disposition: inline; filename="' . addslashes($downloadName) . '"');
        header('Cache-Control: private, max-age=3600');
        header('Pragma: private');

        readfile($filePath);
        exit;
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

// 2. GET — List / Single Applicant
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id > 0) {
        try {
            $stmt = $pdo->prepare('
                SELECT a.*, j.title AS opening_title, j.location AS opening_location
                FROM job_applicants a
                LEFT JOIN job_openings j ON a.job_id = j.id
                WHERE a.id = :id
                LIMIT 1
            ');
            $stmt->execute([':id' => $id]);
            $applicant = $stmt->fetch();

            if ($applicant) {
                sendJson(['success' => true, 'data' => $applicant]);
            } else {
                sendJson(['success' => false, 'error' => 'Applicant not found'], 404);
            }
        } catch (PDOException $e) {
            sendJson(['success' => false, 'error' => $e->getMessage()], 500);
        }
    } else {
        // List with filtering & search
        $enterprise = trim($_GET['enterprise'] ?? $_GET['enterprise_slug'] ?? '');
        $status     = trim($_GET['status'] ?? '');
        $jobId      = isset($_GET['job_id']) && is_numeric($_GET['job_id']) ? (int)$_GET['job_id'] : 0;
        $search     = trim($_GET['search'] ?? '');

        $sql = '
            SELECT a.*, j.title AS opening_title
            FROM job_applicants a
            LEFT JOIN job_openings j ON a.job_id = j.id
            WHERE 1=1
        ';
        $params = [];

        if (!empty($enterprise) && $enterprise !== 'all') {
            $sql .= ' AND a.enterprise_slug = :enterprise';
            $params[':enterprise'] = $enterprise;
        }

        if (!empty($status) && $status !== 'all') {
            $sql .= ' AND a.status = :status';
            $params[':status'] = $status;
        }

        if ($jobId > 0) {
            $sql .= ' AND a.job_id = :job_id';
            $params[':job_id'] = $jobId;
        }

        if (!empty($search)) {
            $sql .= ' AND (a.full_name LIKE :s1 OR a.email LIKE :s2 OR a.phone LIKE :s3 OR a.job_title LIKE :s4)';
            $searchTerm = '%' . $search . '%';
            $params[':s1'] = $searchTerm;
            $params[':s2'] = $searchTerm;
            $params[':s3'] = $searchTerm;
            $params[':s4'] = $searchTerm;
        }

        $sql .= ' ORDER BY a.submitted_at DESC, a.id DESC';

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $applicants = $stmt->fetchAll();

            // Total counts by status for quick stats
            $countStmt = $pdo->query('
                SELECT 
                    COUNT(*) as total_count,
                    SUM(CASE WHEN status = "new" THEN 1 ELSE 0 END) as new_count,
                    SUM(CASE WHEN status = "interviewing" THEN 1 ELSE 0 END) as interviewing_count,
                    SUM(CASE WHEN status = "hired" THEN 1 ELSE 0 END) as hired_count
                FROM job_applicants
            ');
            $summary = $countStmt ? $countStmt->fetch() : [
                'total_count' => count($applicants),
                'new_count' => 0,
                'interviewing_count' => 0,
                'hired_count' => 0
            ];

            sendJson([
                'success' => true,
                'data' => $applicants,
                'summary' => [
                    'total' => (int)($summary['total_count'] ?? 0),
                    'new' => (int)($summary['new_count'] ?? 0),
                    'interviewing' => (int)($summary['interviewing_count'] ?? 0),
                    'hired' => (int)($summary['hired_count'] ?? 0),
                ]
            ]);
        } catch (PDOException $e) {
            sendJson(['success' => false, 'error' => $e->getMessage(), 'data' => []], 500);
        }
    }
}

// 3. PUT — Update Status & Internal Recruiter Notes
if ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id            = (int)($data['id'] ?? 0);
    $status        = trim($data['status'] ?? '');
    $internalNotes = isset($data['internal_notes']) ? trim($data['internal_notes']) : null;

    if (!$id) {
        sendJson(['success' => false, 'error' => 'Valid applicant ID is required'], 400);
    }

    $allowedStatuses = ['new', 'reviewed', 'interviewing', 'hired', 'rejected'];
    if (!empty($status) && !in_array($status, $allowedStatuses)) {
        sendJson(['success' => false, 'error' => 'Invalid status value'], 400);
    }

    try {
        $updates = [];
        $params = [':id' => $id];

        if (!empty($status)) {
            $updates[] = 'status = :status';
            $params[':status'] = $status;
        }

        if ($internalNotes !== null) {
            $updates[] = 'internal_notes = :internal_notes';
            $params[':internal_notes'] = $internalNotes;
        }

        if (empty($updates)) {
            sendJson(['success' => false, 'error' => 'No fields provided to update'], 400);
        }

        $updates[] = 'updated_at = NOW()';
        $sql = 'UPDATE job_applicants SET ' . implode(', ', $updates) . ' WHERE id = :id';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        sendJson(['success' => true, 'message' => 'Applicant updated successfully']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 4. DELETE — Remove Applicant & Delete Associated Resume
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'Valid applicant ID is required'], 400);
    }

    try {
        $stmt = $pdo->prepare('SELECT resume_path FROM job_applicants WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $applicant = $stmt->fetch();

        if ($applicant && !empty($applicant['resume_path'])) {
            $filePath = dirname(__DIR__) . '/../' . ltrim($applicant['resume_path'], '/');
            if (file_exists($filePath) && is_file($filePath)) {
                @unlink($filePath);
            }
        }

        $delStmt = $pdo->prepare('DELETE FROM job_applicants WHERE id = :id');
        $delStmt->execute([':id' => $id]);

        sendJson(['success' => true, 'message' => 'Applicant record and resume deleted successfully']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
