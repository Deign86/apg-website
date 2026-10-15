<?php
/**
 * /api/admin/applicants.php
 * Gated admin endpoint to manage job applicants, candidate status pipeline,
 * recruiter internal notes, and secure resume streaming.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/Ats.php';

requireAdminAuth();

$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    jobSchemaEnsure($pdo);
} catch (PDOException $e) {
    error_log('ATS schema check failed: ' . $e->getMessage());
}

// POST ?action=rescreen — re-run ATS scoring for one applicant.
if ($method === 'POST' && $action === 'rescreen') {
    requireAdminCapability('applicants');
    $data = json_decode(file_get_contents('php://input'), true);
    $id = is_array($data) ? (int)($data['id'] ?? 0) : 0;
    if ($id <= 0) {
        sendJson(['success' => false, 'error' => 'Valid applicant ID is required'], 400);
    }
    if (!rateLimit('ats-rescreen-' . $_SESSION['admin_id'], 30, 600)) {
        sendJson(['success' => false, 'error' => 'Too many re-screen requests. Please wait a few minutes.'], 429);
    }
    // Re-scoring never re-emails HR (applications are emailed once, on submission).
    if (atsScreenSafely($pdo, $id, false) === null) {
        sendJson(['success' => false, 'error' => 'Applicant not found or screening failed'], 404);
    }
    $stmt = $pdo->prepare('SELECT id, status, auto_rejected_at, ats_score, ats_summary, ats_method, ats_shortlisted, ats_notified_at, ats_scored_at FROM job_applicants WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    $row['ats_details'] = atsDetails($row['ats_summary']);
    sendJson(['success' => true, 'data' => $row]);
}

// POST ?action=invite {id, interview_at: "YYYY-MM-DDTHH:MM", note?} — accept for interview: status
// becomes interviewing and the applicant is emailed the schedule and office address.
if ($method === 'POST' && $action === 'invite') {
    requireAdminCapability('applicants');
    $data = jsonBody();
    $id = (int)($data['id'] ?? 0);
    $rawWhen = is_string($data['interview_at'] ?? null) ? trim($data['interview_at']) : '';
    $note = is_string($data['note'] ?? null) ? trim($data['note']) : '';
    if ($id <= 0) {
        sendJson(['success' => false, 'error' => 'Valid applicant ID is required'], 400);
    }
    $when = DateTime::createFromFormat('Y-m-d\TH:i', $rawWhen);
    if (!$when || $when->format('Y-m-d\TH:i') !== $rawWhen) {
        sendJson(['success' => false, 'error' => 'Pick a valid interview date and time.'], 400);
    }
    if ($when <= new DateTime()) {
        sendJson(['success' => false, 'error' => 'The interview must be scheduled in the future.'], 400);
    }
    if (mb_strlen($note) > 1000) {
        sendJson(['success' => false, 'error' => 'The note must be 1000 characters or fewer.'], 400);
    }
    $stmt = $pdo->prepare('SELECT * FROM job_applicants WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $applicant = $stmt->fetch();
    if (!$applicant) {
        sendJson(['success' => false, 'error' => 'Applicant not found'], 404);
    }
    $interviewAt = $when->format('Y-m-d H:i:s');
    $pdo->prepare('UPDATE job_applicants SET status = "interviewing", interview_at = :at, interview_note = :note, auto_rejected_at = NULL, updated_at = NOW() WHERE id = :id')
        ->execute([':at' => $interviewAt, ':note' => $note !== '' ? $note : null, ':id' => $id]);
    $emailed = atsSendInterviewInvite($applicant, $interviewAt, $note);
    if ($emailed) {
        $pdo->prepare('UPDATE job_applicants SET decision_emailed_at = NOW() WHERE id = :id')->execute([':id' => $id]);
    }
    sendJson([
        'success' => true,
        'emailed' => $emailed,
        'message' => $emailed ? 'Interview invitation sent.' : 'Status updated, but the invitation email could not be sent. Please contact the applicant directly.',
        'data' => ['id' => $id, 'status' => 'interviewing', 'interview_at' => $interviewAt, 'interview_note' => $note !== '' ? $note : null],
    ]);
}

/** Counts by status over every applicant (quick stats; the dashboard card). */
function applicantSummary(PDO $pdo): array {
    $counts = $pdo->query('
        SELECT
            COUNT(*) as total_count,
            SUM(CASE WHEN status = "new" THEN 1 ELSE 0 END) as new_count,
            SUM(CASE WHEN status = "interviewing" THEN 1 ELSE 0 END) as interviewing_count,
            SUM(CASE WHEN status = "hired" THEN 1 ELSE 0 END) as hired_count
        FROM job_applicants
    ')->fetch();
    return [
        'total' => (int)($counts['total_count'] ?? 0),
        'new' => (int)($counts['new_count'] ?? 0),
        'interviewing' => (int)($counts['interviewing_count'] ?? 0),
        'hired' => (int)($counts['hired_count'] ?? 0),
    ];
}

// GET ?action=summary — the counts only, for the dashboard (no applicant rows).
if ($method === 'GET' && $action === 'summary') {
    requireAdminCapability('applicants');
    try {
        sendJson(['success' => true, 'summary' => applicantSummary($pdo)]);
    } catch (PDOException $e) {
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        sendJson(['success' => false, 'error' => 'A server error occurred. Please try again.'], 500);
    }
}

// GET ?action=photo&id= — the applicant's 2x2 photo (private upload, same access as resumes).
if ($method === 'GET' && $action === 'photo') {
    requireAdminCapability('applicants');
    $stmt = $pdo->prepare('SELECT photo_path FROM job_applicants WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => (int)($_GET['id'] ?? 0)]);
    $photoPath = (string)($stmt->fetchColumn() ?: '');
    $baseDir = realpath(dirname(__DIR__) . '/../uploads/photos');
    $file = $photoPath !== '' ? realpath(dirname(__DIR__) . '/../' . ltrim($photoPath, '/')) : false;
    if (!$file || !$baseDir || !str_starts_with($file, $baseDir . DIRECTORY_SEPARATOR) || !is_file($file)) {
        sendJson(['success' => false, 'error' => 'Photo not found for this applicant'], 404);
    }
    header('Content-Type: ' . (str_ends_with($file, '.png') ? 'image/png' : 'image/jpeg'));
    header('Content-Length: ' . filesize($file));
    header('Cache-Control: private, max-age=3600');
    header('X-Content-Type-Options: nosniff');
    readfile($file);
    exit;
}

// 1. GET — Secure Resume Streaming (Gated via authenticated session)
// Resume files are candidate PII — restricted to the hiring domain
// (superadmin/admin/recruiter via the 'applicants' capability).
if ($method === 'GET' && $action === 'resume') {
    requireAdminCapability('applicants');
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
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        sendJson(['success' => false, 'error' => 'A server error occurred. Please try again.'], 500);
    }
}

// 2. GET — List / Single Applicant
if ($method === 'GET') {
    requireAdminCapability('applicants');
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
                $applicant['ats_details'] = atsDetails($applicant['ats_summary'] ?? null);
                $applicant['portfolio_links'] = json_decode((string)($applicant['portfolio_links'] ?? ''), true) ?: [];
                sendJson(['success' => true, 'data' => $applicant]);
            } else {
                sendJson(['success' => false, 'error' => 'Applicant not found'], 404);
            }
        } catch (PDOException $e) {
            error_log(basename(__FILE__) . ': ' . $e->getMessage());
            sendJson(['success' => false, 'error' => 'A server error occurred. Please try again.'], 500);
        }
    } else {
        // List with filtering & search: the table's columns only (cover letter, notes, full ATS
        // details etc. come with ?id= when one applicant is opened). ?limit=&offset= page it;
        // `total` is the filtered count, `by_enterprise` the unfiltered count per company.
        $enterprise = inputText($_GET, isset($_GET['enterprise']) ? 'enterprise' : 'enterprise_slug');
        $status     = inputText($_GET, 'status');
        $jobId      = isset($_GET['job_id']) && is_numeric($_GET['job_id']) ? (int)$_GET['job_id'] : 0;
        $search     = inputText($_GET, 'search');

        $where = ' WHERE 1=1';
        $params = [];

        if (!empty($enterprise) && $enterprise !== 'all') {
            $where .= ' AND a.enterprise_slug = :enterprise';
            $params[':enterprise'] = $enterprise;
        }

        if (!empty($status) && $status !== 'all') {
            $where .= ' AND a.status = :status';
            $params[':status'] = $status;
        }

        if ($jobId > 0) {
            $where .= ' AND a.job_id = :job_id';
            $params[':job_id'] = $jobId;
        }

        if (!empty($_GET['shortlisted'])) {
            $where .= ' AND a.ats_shortlisted = 1';
        }

        if (!empty($search)) {
            $where .= ' AND (a.full_name LIKE :s1 OR a.email LIKE :s2 OR a.phone LIKE :s3 OR a.job_title LIKE :s4)';
            $searchTerm = '%' . addcslashes($search, '%_\\') . '%';
            $params[':s1'] = $searchTerm;
            $params[':s2'] = $searchTerm;
            $params[':s3'] = $searchTerm;
            $params[':s4'] = $searchTerm;
        }

        // Unscored applicants sort last by score, as the table did client-side.
        $order = inputText($_GET, 'sort') === 'score'
            ? ' ORDER BY COALESCE(a.ats_score, -1) DESC, a.submitted_at DESC, a.id DESC'
            : ' ORDER BY a.submitted_at DESC, a.id DESC';
        $limitSql = '';
        if (isset($_GET['limit'])) {
            $limit = filter_var($_GET['limit'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 200]]);
            $offset = filter_var($_GET['offset'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            if ($limit === false || $offset === false) {
                sendJson(['success' => false, 'error' => 'limit must be 1-200 and offset 0 or more'], 400);
            }
            $limitSql = " LIMIT {$limit} OFFSET {$offset}";
        }

        try {
            $stmt = $pdo->prepare('
                SELECT a.id, a.job_id, a.job_title, a.enterprise_slug, a.full_name, a.email, a.phone, a.status,
                       a.ats_score, a.ats_summary, a.ats_shortlisted, a.resume_path, a.submitted_at, j.title AS opening_title
                FROM job_applicants a
                LEFT JOIN job_openings j ON a.job_id = j.id' . $where . $order . $limitSql);
            $stmt->execute($params);
            $applicants = array_map(static function (array $row): array {
                // The badge needs only the recommendation (colour) and summary (tooltip).
                $ats = atsDetails($row['ats_summary']);
                $row['ats_details'] = $ats === null ? null : ['recommendation' => $ats['recommendation'] ?? null, 'summary' => $ats['summary'] ?? null];
                unset($row['ats_summary']);
                return $row;
            }, $stmt->fetchAll());
            $filtered = $pdo->prepare('SELECT COUNT(*) FROM job_applicants a' . $where);
            $filtered->execute($params);
            $total = (int)$filtered->fetchColumn();
            $byEnterprise = [];
            foreach ($pdo->query('SELECT enterprise_slug, COUNT(*) AS n FROM job_applicants GROUP BY enterprise_slug') as $row) {
                $byEnterprise[$row['enterprise_slug']] = (int)$row['n'];
            }

            sendJson([
                'success' => true,
                'data' => $applicants,
                'total' => $total,
                'by_enterprise' => $byEnterprise,
                'summary' => applicantSummary($pdo),
            ]);
        } catch (PDOException $e) {
            error_log(basename(__FILE__) . ': ' . $e->getMessage());
            sendJson(['success' => false, 'error' => 'A server error occurred. Please try again.', 'data' => []], 500);
        }
    }
}

// 3. PUT — Update Status & Internal Recruiter Notes
if ($method === 'PUT') {
    requireAdminCapability('applicants');
    $data = jsonBody();

    $id            = (int)($data['id'] ?? 0);
    $status        = is_string($data['status'] ?? null) ? trim($data['status']) : '';
    $internalNotes = is_string($data['internal_notes'] ?? null) ? trim($data['internal_notes']) : null;

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

        $exists = $pdo->prepare('SELECT 1 FROM job_applicants WHERE id = :id');
        $exists->execute([':id' => $id]);
        if (!$exists->fetchColumn()) {
            sendJson(['success' => false, 'error' => 'Applicant not found'], 404);
        }

        $updates[] = 'updated_at = NOW()';
        $sql = 'UPDATE job_applicants SET ' . implode(', ', $updates) . ' WHERE id = :id';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        sendJson(['success' => true, 'message' => 'Applicant updated successfully']);
    } catch (PDOException $e) {
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        sendJson(['success' => false, 'error' => 'A server error occurred. Please try again.'], 500);
    }
}

// 4. DELETE — Remove Applicant & Delete Associated Resume
if ($method === 'DELETE') {
    requireAdminCapability('delete');
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'Valid applicant ID is required'], 400);
    }

    try {
        $stmt = $pdo->prepare('SELECT resume_path, photo_path FROM job_applicants WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $applicant = $stmt->fetch();
        if (!$applicant) {
            sendJson(['success' => false, 'error' => 'Applicant not found'], 404);
        }

        foreach (['resume_path', 'photo_path'] as $column) {
            if (!empty($applicant[$column])) {
                $filePath = dirname(__DIR__) . '/../' . ltrim($applicant[$column], '/');
                if (file_exists($filePath) && is_file($filePath)) {
                    @unlink($filePath);
                }
            }
        }

        $delStmt = $pdo->prepare('DELETE FROM job_applicants WHERE id = :id');
        $delStmt->execute([':id' => $id]);

        sendJson(['success' => true, 'message' => 'Applicant record and resume deleted successfully']);
    } catch (PDOException $e) {
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        sendJson(['success' => false, 'error' => 'A server error occurred. Please try again.'], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
