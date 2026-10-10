<?php
/**
 * POST /api/applicants.php
 * Public endpoint to submit career and talent applications.
 * Validates the candidate, stores the resume securely, saves the job_applicants row, then (after
 * the response is flushed) scores it with the ATS and emails HR immediately in the enterprise's
 * branded template with the resume attached, and sends the applicant a confirmation.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/Mailer.php';
require_once __DIR__ . '/lib/EmailTemplate.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJson(['status' => 'ok']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
}

// Parse request input (JSON or multipart/form-data)
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
$data = [];

if (str_contains($contentType, 'application/json')) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
} else {
    $data = $_POST;
}

if (!is_array($data)) {
    sendJson(['success' => false, 'error' => 'Invalid application submission.'], 400);
}
guardPublicFormSubmission($data);
$readText = static function (array $source, array $keys): string {
    foreach ($keys as $key) {
        if (isset($source[$key]) && is_string($source[$key])) {
            return trim(str_replace("\0", '', $source[$key]));
        }
    }
    return '';
};

$fullName    = $readText($data, ['fullName', 'full_name', 'name']);
$email       = $readText($data, ['email']);
$phone       = $readText($data, ['phone', 'contact', 'mobile']);
$jobTitle    = $readText($data, ['jobTitle', 'job_title', 'position']) ?: 'General Application';
$coverLetter = $readText($data, ['coverLetter', 'cover_letter', 'coverNote', 'notes', 'message']);
$rawJobId    = $data['jobId'] ?? $data['job_id'] ?? null;
$jobId       = (!empty($rawJobId) && is_numeric($rawJobId)) ? (int)$rawJobId : null;

// Resolve Enterprise Slug to a canonical value. Accepts a canonical slug, a
// legacy alias (swift-clear, 88-prime, general), or free text such as
// "Swift Clear Facility & Cleaning" from the public form.
$rawEnterprise = $data['enterprise'] ?? $data['enterprise_slug'] ?? $data['source'] ?? '';
$enterpriseSlug = resolveEnterpriseSlug($rawEnterprise, 'corporate');
$t = emailTheme($enterpriseSlug);

// Field validation
if (empty($fullName)) {
    sendJson(['success' => false, 'error' => 'Full name is required.'], 400);
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson(['success' => false, 'error' => 'A valid email address is required.'], 400);
}

if (empty($phone)) {
    sendJson(['success' => false, 'error' => 'Contact/phone number is required.'], 400);
}

if (strlen($fullName) > 600 || strlen($email) > 254 || strlen($phone) > 200 || strlen($jobTitle) > 800 || strlen($coverLetter) > 40000) {
    sendJson(['success' => false, 'error' => 'One or more fields exceed the maximum allowed length.'], 400);
}

// Ensure Upload Directory Exists & is Protected
$uploadDir = dirname(__DIR__) . '/uploads/resumes';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}
$htaccessFile = $uploadDir . '/.htaccess';
$htaccessBody = "Require all denied\nOptions -Indexes\n";
if (!file_exists($htaccessFile) || file_get_contents($htaccessFile) !== $htaccessBody) {
    file_put_contents($htaccessFile, $htaccessBody);
}

$resumePath = '';
$resumeFilename = '';
$resumeFile = null;

// Handle Resume File Upload
$fileKey = null;
if (!empty($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
    $fileKey = 'resume';
} elseif (!empty($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $fileKey = 'attachment';
} elseif (!empty($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $fileKey = 'file';
}

if ($fileKey !== null) {
    $file = $_FILES[$fileKey];
    $originalName = basename($file['name']);
    $fileSize = $file['size'];
    $tmpPath = $file['tmp_name'];

    // Max 15MB
    if ($fileSize > 15 * 1024 * 1024) {
        sendJson(['success' => false, 'error' => 'Resume file exceeds maximum allowed size (15MB).'], 400);
    }

    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExts = ['pdf', 'doc', 'docx', 'rtf', 'txt', 'png', 'jpg', 'jpeg'];
    if (!in_array($ext, $allowedExts)) {
        sendJson(['success' => false, 'error' => 'Invalid file format. Please upload a PDF, DOC, or DOCX resume.'], 400);
    }

    // Generate secure randomized filename
    $uniqueName = 'resume_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $destPath = $uploadDir . '/' . $uniqueName;

    if (move_uploaded_file($tmpPath, $destPath)) {
        $resumePath = 'uploads/resumes/' . $uniqueName;
        $resumeFilename = $originalName;
        $resumeFile = $destPath;
    } else {
        sendJson(['success' => false, 'error' => 'Failed to save resume file. Please try again.'], 500);
    }
}

// Generate unique ticket reference
$ticket = 'APG-APP-' . strtoupper(substr(md5(uniqid(time(), true)), 0, 8));

// Persistence to MySQL Database
$pdo = getDbConnection();
$applicantId = null;
$jobMatched = false;

if ($pdo) {
    // Link to a real job_openings row: trust a submitted id only if it exists,
    // otherwise match the chosen title (most careers forms send only the title).
    try {
        if ($jobId !== null) {
            $jobStmt = $pdo->prepare('SELECT id FROM job_openings WHERE id = :id LIMIT 1');
            $jobStmt->execute([':id' => $jobId]);
            $jobId = (int)$jobStmt->fetchColumn() ?: null;
        }
        if ($jobId === null && $jobTitle !== 'General Application') {
            $jobStmt = $pdo->prepare('
                SELECT id FROM job_openings
                WHERE LOWER(title) = LOWER(:title)
                ORDER BY (enterprise_slug = :slug) DESC, (status = "active") DESC, id DESC
                LIMIT 1
            ');
            $jobStmt->execute([':title' => $jobTitle, ':slug' => $enterpriseSlug]);
            $jobId = (int)$jobStmt->fetchColumn() ?: null;
        }
        $jobMatched = $jobId !== null;
    } catch (PDOException $e) {
        error_log('Job lookup error in applicants.php: ' . $e->getMessage());
        $jobId = null;
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO job_applicants (
                job_id, job_title, enterprise_slug, full_name, email, phone,
                cover_letter, resume_path, resume_filename, status, submitted_at
            ) VALUES (
                :job_id, :job_title, :enterprise_slug, :full_name, :email, :phone,
                :cover_letter, :resume_path, :resume_filename, "new", NOW()
            )
        ');
        $stmt->execute([
            ':job_id'          => $jobId,
            ':job_title'       => $jobTitle,
            ':enterprise_slug' => $enterpriseSlug,
            ':full_name'       => $fullName,
            ':email'           => $email,
            ':phone'           => $phone,
            ':cover_letter'    => $coverLetter,
            ':resume_path'     => $resumePath,
            ':resume_filename' => $resumeFilename,
        ]);
        $applicantId = (int)$pdo->lastInsertId();
    } catch (PDOException $e) {
        // Fallback or log if table needs creation
        error_log('Database insert error in applicants.php: ' . $e->getMessage());
    }
}

// After the response is flushed (the candidate never waits on resume parsing, AI or SMTP):
// 1. ATS-score the application and email HR immediately with the score and resume. A scoring
//    failure, or no database at all, still emails HR, just without a score.
// 2. Send the applicant a branded confirmation.
register_shutdown_function(static function () use (
    $pdo, $applicantId, $t, $ticket, $fullName, $email, $phone, $jobTitle, $jobMatched, $enterpriseSlug, $coverLetter, $resumeFile, $resumeFilename
) {
    ignore_user_abort(true);
    @set_time_limit(120);
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } elseif (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    }
    require_once __DIR__ . '/lib/Ats.php';

    if ($pdo && $applicantId) {
        if (atsScreenSafely($pdo, $applicantId) === null) {
            atsNotifyUnscored($pdo, $applicantId);
        }
    } else {
        $profile = atsEnterpriseProfile($enterpriseSlug);
        atsNotifyHr([
            'id' => null, 'full_name' => $fullName, 'email' => $email, 'phone' => $phone, 'job_title' => $jobTitle,
            'enterprise_slug' => $enterpriseSlug, 'cover_letter' => $coverLetter, 'resume_filename' => $resumeFilename,
            'submitted_at' => date('Y-m-d H:i:s'),
        ], ['title' => $jobTitle, 'enterprise' => $profile['name']], null, $resumeFile);
    }

    if (!emailConfirmationAllowed($email)) {
        return;
    }
    $firstName = emailSafeFirstName($fullName);
    // Only a title that matched a real opening is repeated back; anything else stays generic.
    $role = $jobMatched ? $jobTitle : '';
    $rows = [emailRow('Reference', '<span style="font-variant-numeric:tabular-nums;">' . emailEsc($ticket) . '</span>')];
    if ($role !== '') {
        $rows[] = emailRow('Position', emailEsc($role));
    }
    $rows[] = emailRow('Resume', $resumeFile !== null ? 'Received' : 'Not attached — you can reply to this email with it.');
    $html = emailRender($t, [
        'preheader' => "We've received your application. Reference {$ticket}.",
        'eyebrow' => 'Application received',
        'title' => "Thank you, {$firstName}.",
        'intro' => "We've received your application" . ($role !== '' ? " for {$role}" : '') . " at {$t['name']}. Our talent team reviews every application and will contact you if your profile is a good match.\n\nTo add anything, reply to this email and keep the reference number in the subject.",
        'rows' => $rows,
        'actions' => [['Visit ' . $t['name'], $t['url'], 'primary']],
        'note' => "You're receiving this because this email address was entered on our careers form. If that wasn't you, you can ignore this message.",
        'ref' => $ticket,
    ]);
    emailSend($t, $email, "We've received your application [{$ticket}] — {$t['name']}", $html, atsHrEmail(), $t['name']);
});

sendJson([
    'success' => true,
    'ticket' => $ticket,
    'applicant_id' => $applicantId,
    'enterprise' => $t['name'],
    'message' => 'Thank you. Your job application and resume have been submitted to our talent acquisition team.'
]);
