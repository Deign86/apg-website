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
require_once __DIR__ . '/lib/JobSchema.php';
require_once __DIR__ . '/lib/Validation.php';

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
    $data = jsonBody();
} else {
    $data = $_POST;
    // Over post_max_size PHP drops the whole body, which would otherwise read as a bad form.
    if ($data === [] && empty($_FILES) && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        // PHP's startup "POST Content-Length exceeds the limit" warning may sit in the output
        // buffer (output_buffering is on in production php.ini): drop it so the reply is clean JSON.
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        sendJson(['success' => false, 'error' => 'Resume file is too large. Please upload a smaller file (max 15MB).'], 413);
    }
}

if (!is_array($data)) {
    sendJson(['success' => false, 'error' => 'Invalid application submission.'], 400);
}
guardPublicFormSubmission($data, 'application');
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

// Field validation (same rules and messages as src/lib/formValidation.ts)
$fieldError = validationNameError($fullName)
    ?? ((empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) ? 'A valid email address is required.' : null)
    ?? validationPhoneError($phone)
    ?? validationTextError($coverLetter, 'Cover note', false, 0, 5000);
if ($fieldError !== null) {
    sendJson(['success' => false, 'error' => $fieldError], 400);
}

if (strlen($fullName) > 600 || strlen($email) > 254 || strlen($phone) > 200 || strlen($jobTitle) > 800 || strlen($coverLetter) > 40000) {
    sendJson(['success' => false, 'error' => 'One or more fields exceed the maximum allowed length.'], 400);
}

// Link to a real job_openings row first: the opening decides which extra fields (2x2 photo,
// portfolio links) the application needs. Trust a submitted id only if it exists, otherwise match
// the chosen title (most careers forms send only the title).
$pdo = getDbConnection();
$applicantId = null;
$jobMatched = false;
$requirePhoto = false;
$askPortfolio = false;

if ($pdo) {
    try {
        jobSchemaEnsure($pdo);
        $job = false;
        if ($jobId !== null) {
            $jobStmt = $pdo->prepare('SELECT id, enterprise_slug, require_photo, ask_portfolio FROM job_openings WHERE id = :id LIMIT 1');
            $jobStmt->execute([':id' => $jobId]);
            $job = $jobStmt->fetch();
        }
        if (!$job && $jobTitle !== 'General Application') {
            $jobStmt = $pdo->prepare('
                SELECT id, enterprise_slug, require_photo, ask_portfolio FROM job_openings
                WHERE LOWER(title) = LOWER(:title)
                ORDER BY (enterprise_slug = :slug) DESC, (status = "active") DESC, id DESC
                LIMIT 1
            ');
            $jobStmt->execute([':title' => $jobTitle, ':slug' => $enterpriseSlug]);
            $job = $jobStmt->fetch();
        }
        $jobId = $job ? (int)$job['id'] : null;
        $jobMatched = $jobId !== null;
        $requirePhoto = $job && (int)$job['require_photo'] === 1;
        $askPortfolio = $job && (int)$job['ask_portfolio'] === 1;
        // The opening decides the enterprise when the form only sent a division label
        // (the apex careers page sends e.g. "Logistics", which resolves to corporate).
        if ($job && $enterpriseSlug === 'corporate' && isValidEnterpriseSlug((string)$job['enterprise_slug'])) {
            $enterpriseSlug = (string)$job['enterprise_slug'];
            $t = emailTheme($enterpriseSlug);
        }
    } catch (PDOException $e) {
        error_log('Job lookup error in applicants.php: ' . $e->getMessage());
        $jobId = null;
    }
}

// Portfolio links (openings that ask for them): optional, up to 5 http(s) URLs, one per line or comma-separated.
$portfolioLinks = [];
if ($askPortfolio) {
    $rawLinks = $data['portfolioLinks'] ?? $data['portfolio_links'] ?? '';
    $rawLinks = is_array($rawLinks) ? implode("\n", array_filter($rawLinks, 'is_string')) : (is_string($rawLinks) ? $rawLinks : '');
    $portfolioLinks = array_values(array_unique(array_filter(preg_split('/[\s,]+/', trim($rawLinks)) ?: [], 'strlen')));
    if (count($portfolioLinks) > 5) {
        sendJson(['success' => false, 'error' => 'Please share at most 5 portfolio links.'], 400);
    }
    foreach ($portfolioLinks as $link) {
        $linkError = validationUrlError($link, true);
        if ($linkError !== null) {
            sendJson(['success' => false, 'error' => "Portfolio link \"{$link}\": {$linkError}"], 400);
        }
    }
}

// 2x2 photo (openings that require one): JPG/PNG, square, at least 600x600 px (2 in at 300 dpi).
// Checked before anything is saved so a bad photo never leaves an orphaned resume behind.
$photoUpload = null;
if ($requirePhoto) {
    $photoError = $_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($photoError === UPLOAD_ERR_NO_FILE) {
        sendJson(['success' => false, 'error' => 'A 2x2 photo is required for this position.'], 400);
    }
    if ($photoError !== UPLOAD_ERR_OK) {
        sendJson(['success' => false, 'error' => in_array($photoError, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
            ? 'Photo is too large. Please upload one under 5MB.'
            : 'Photo upload failed. Please try again.'], 400);
    }
    $size = (int)$_FILES['photo']['size'];
    if ($size === 0 || $size > 5 * 1024 * 1024) {
        sendJson(['success' => false, 'error' => $size === 0 ? 'The photo file is empty. Please choose another file.' : 'Photo is too large. Please upload one under 5MB.'], 400);
    }
    $info = @getimagesize($_FILES['photo']['tmp_name']);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG], true)) {
        sendJson(['success' => false, 'error' => 'Your photo must be a JPG or PNG image.'], 400);
    }
    [$width, $height] = $info;
    if (abs($width / $height - 1) > 0.03) {
        sendJson(['success' => false, 'error' => "Your photo must be a square 2x2 ID photo; this one is {$width}x{$height} pixels."], 400);
    }
    if (min($width, $height) < 600) {
        sendJson(['success' => false, 'error' => "Your 2x2 photo must be at least 600x600 pixels; this one is {$width}x{$height}."], 400);
    }
    $photoUpload = ['tmp' => $_FILES['photo']['tmp_name'], 'ext' => $info[2] === IMAGETYPE_PNG ? 'png' : 'jpg'];
}

// Upload directories are private: files are served only through the admin API.
$privateUploadDir = static function (string $name): string {
    $dir = dirname(__DIR__) . '/uploads/' . $name;
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $htaccessBody = "Require all denied\nOptions -Indexes\n";
    if (!file_exists($dir . '/.htaccess') || file_get_contents($dir . '/.htaccess') !== $htaccessBody) {
        file_put_contents($dir . '/.htaccess', $htaccessBody);
    }
    return $dir;
};
$uploadDir = $privateUploadDir('resumes');

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

// A resume that was sent but failed to upload must not be silently dropped.
foreach (['resume', 'attachment', 'file'] as $key) {
    $uploadError = $_FILES[$key]['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($fileKey === null && $uploadError !== UPLOAD_ERR_NO_FILE) {
        sendJson(['success' => false, 'error' => in_array($uploadError, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
            ? 'Resume file is too large. Please upload a smaller file (max 15MB).'
            : 'Resume upload failed. Please try again.'], 400);
    }
}
if ($fileKey !== null && (int)$_FILES[$fileKey]['size'] === 0) {
    sendJson(['success' => false, 'error' => 'The resume file is empty. Please choose another file.'], 400);
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

    recordPublicFormSubmission('application'); // accepted: counts against the per-IP budget
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

if ($resumeFile === null) {
    recordPublicFormSubmission('application'); // accepted without a resume (counted above otherwise)
}

$photoPath = null;
if ($photoUpload !== null) {
    $photoName = 'photo_' . date('Ymd_His') . '_' . bin2hex(random_bytes(8)) . '.' . $photoUpload['ext'];
    if (!move_uploaded_file($photoUpload['tmp'], $privateUploadDir('photos') . '/' . $photoName)) {
        sendJson(['success' => false, 'error' => 'Failed to save your photo. Please try again.'], 500);
    }
    $photoPath = 'uploads/photos/' . $photoName;
}

// Generate unique ticket reference
$ticket = 'APG-APP-' . strtoupper(substr(md5(uniqid(time(), true)), 0, 8));

// Persistence to MySQL Database
if ($pdo) {
    try {
        $stmt = $pdo->prepare('
            INSERT INTO job_applicants (
                job_id, job_title, enterprise_slug, full_name, email, phone,
                cover_letter, resume_path, resume_filename, photo_path, portfolio_links, status, submitted_at
            ) VALUES (
                :job_id, :job_title, :enterprise_slug, :full_name, :email, :phone,
                :cover_letter, :resume_path, :resume_filename, :photo_path, :portfolio_links, "new", NOW()
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
            ':photo_path'      => $photoPath,
            ':portfolio_links' => $portfolioLinks ? json_encode($portfolioLinks, JSON_UNESCAPED_SLASHES) : null,
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
    emailSend($t, $email, "We've received your application [{$ticket}] — {$t['name']}", $html, $t['inbox'], $t['name']); // public company email, never the private HR inbox
});

sendJson([
    'success' => true,
    'ticket' => $ticket,
    'applicant_id' => $applicantId,
    'enterprise' => $t['name'],
    'message' => 'Thank you. Your job application and resume have been submitted to our talent acquisition team.'
]);
