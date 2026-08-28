<?php
/**
 * POST /api/applicants.php
 * Public endpoint to submit career and talent applications.
 * Handles candidate validation, secure resume upload, MySQL persistence into job_applicants,
 * and email notification dispatch via Mailer.php.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/Mailer.php';

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

$fullName    = trim($data['fullName'] ?? $data['full_name'] ?? $data['name'] ?? '');
$email       = trim($data['email'] ?? '');
$phone       = trim($data['phone'] ?? $data['contact'] ?? $data['mobile'] ?? '');
$jobTitle    = trim($data['jobTitle'] ?? $data['job_title'] ?? $data['position'] ?? 'General Application');
$coverLetter = trim($data['coverLetter'] ?? $data['cover_letter'] ?? $data['coverNote'] ?? $data['notes'] ?? $data['message'] ?? '');
$rawJobId    = $data['jobId'] ?? $data['job_id'] ?? null;
$jobId       = (!empty($rawJobId) && is_numeric($rawJobId)) ? (int)$rawJobId : null;

// Resolve Enterprise Slug
$rawEnterprise = strtolower(trim($data['enterprise'] ?? $data['enterprise_slug'] ?? $data['source'] ?? 'general'));
$enterpriseSlug = 'general';

if (str_contains($rawEnterprise, 'realty') && !str_contains($rawEnterprise, 'luxe')) {
    $enterpriseSlug = 'realty';
} elseif (str_contains($rawEnterprise, 'luxe')) {
    $enterpriseSlug = 'luxe-prime';
} elseif (str_contains($rawEnterprise, 'swift') || str_contains($rawEnterprise, 'clean')) {
    $enterpriseSlug = 'swift-clear';
} elseif (str_contains($rawEnterprise, 'dynamic') || str_contains($rawEnterprise, 'media') || str_contains($rawEnterprise, 'talent')) {
    $enterpriseSlug = 'dynamic-tree';
} elseif (str_contains($rawEnterprise, 'alta') || str_contains($rawEnterprise, 'outsource') || str_contains($rawEnterprise, 'bpo')) {
    $enterpriseSlug = 'alta-venture';
} elseif (str_contains($rawEnterprise, 'construction') || str_contains($rawEnterprise, 'contract')) {
    $enterpriseSlug = 'construction';
} elseif (str_contains($rawEnterprise, '88') || str_contains($rawEnterprise, 'prime')) {
    $enterpriseSlug = '88-prime';
} elseif (str_contains($rawEnterprise, 'virtual') || str_contains($rawEnterprise, 'office')) {
    $enterpriseSlug = 'virtual-office';
}

// Enterprise Registry for Branding in Email Notification
$enterpriseMap = [
    'realty' => [
        'name' => 'Alpha Premier Realty',
        'badge' => 'ALPHA PREMIER REALTY TALENT',
        'color' => '#C5A85C',
    ],
    'luxe-prime' => [
        'name' => 'Luxe Prime Realty',
        'badge' => 'LUXE PRIME TALENT ACQUISITION',
        'color' => '#C49A2A',
    ],
    'swift-clear' => [
        'name' => 'Swift Clear Facility & Cleaning',
        'badge' => 'SWIFTCLEAR RECRUITMENT',
        'color' => '#00B4D8',
    ],
    'dynamic-tree' => [
        'name' => 'Dynamic Tree Multimedia',
        'badge' => 'DYNAMIC TREE CREATIVE TALENT',
        'color' => '#C84A72',
    ],
    'alta-venture' => [
        'name' => 'Alta Venture Outsource',
        'badge' => 'ALTA VENTURE GLOBAL TALENT',
        'color' => '#19A48A',
    ],
    'construction' => [
        'name' => 'Alpha Premier Construction',
        'badge' => 'ALPHA PREMIER CONSTRUCTION CAREERS',
        'color' => '#E5A93C',
    ],
    '88-prime' => [
        'name' => '88 Prime Trading',
        'badge' => '88 PRIME TALENT POOL',
        'color' => '#D4AF37',
    ],
    'virtual-office' => [
        'name' => 'Alpha Premier Virtual Office',
        'badge' => 'VIRTUAL OFFICE OPERATIONS',
        'color' => '#C5A059',
    ],
    'general' => [
        'name' => 'Alpha Premier Group',
        'badge' => 'APG TALENT ACQUISITION',
        'color' => '#C5A059',
    ],
];

$brand = $enterpriseMap[$enterpriseSlug] ?? $enterpriseMap['general'];

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

// Ensure Upload Directory Exists & is Protected
$uploadDir = dirname(__DIR__) . '/uploads/resumes';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}
$htaccessFile = $uploadDir . '/.htaccess';
if (!file_exists($htaccessFile)) {
    file_put_contents($htaccessFile, "# Prevent direct execution\n<FilesMatch \"\\.(php|phtml|php3|php4|php5|phps)$\">\n    Order Deny,Allow\n    Deny from all\n</FilesMatch>\nOptions -Indexes\n");
}

$resumePath = '';
$resumeFilename = '';
$uploadedFileRef = null;

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
        $uploadedFileRef = [
            'path' => $destPath,
            'name' => $originalName,
            'type' => $file['type'] ?: 'application/octet-stream',
        ];
    } else {
        sendJson(['success' => false, 'error' => 'Failed to save resume file. Please try again.'], 500);
    }
}

// Generate unique ticket reference
$ticket = 'APG-APP-' . strtoupper(substr(md5(uniqid(time(), true)), 0, 8));

// Persistence to MySQL Database
$pdo = getDbConnection();
$applicantId = null;

if ($pdo) {
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

// Prepare HTML Email Dispatch
$emailSubject = "[{$ticket}] Job Application: {$jobTitle} — {$fullName} ({$brand['name']})";
$accentColor = $brand['color'];
$dateStr = date('F j, Y · g:i A (T)');
$safeName = htmlspecialchars($fullName);
$safeEmail = htmlspecialchars($email);
$safePhone = htmlspecialchars($phone);
$safeJob = htmlspecialchars($jobTitle);
$safeBrand = htmlspecialchars($brand['name']);
$safeBadge = htmlspecialchars($brand['badge']);
$safeLetter = nl2br(htmlspecialchars($coverLetter ?: 'No additional cover note provided.'));
$safeResumeName = htmlspecialchars($resumeFilename ?: 'No attachment uploaded');

$htmlBody = <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Talent Application: {$safeJob}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07080b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07080b; padding: 32px 16px;">
    <tr>
      <td align="center" valign="top">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0f1118; border: 1px solid #232738; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.85);">
          <tr>
            <td style="background: linear-gradient(180deg, #161822 0%, #0c0e14 100%); border-bottom: 2px solid {$accentColor}; padding: 28px 30px; text-align: center;">
              <div style="font-size: 14px; font-weight: 800; letter-spacing: 2.5px; color: {$accentColor}; text-transform: uppercase;">
                {$safeBrand}
              </div>
              <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.5px; color: #94a3b8; margin-top: 4px;">
                Talent Acquisition &amp; Executive Recruitment Board
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #141722; padding: 12px 30px; border-bottom: 1px solid #1c2030;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="display: inline-block; background-color: {$accentColor}; color: #000000; font-weight: 800; font-size: 10px; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
                      {$safeBadge}
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; font-weight: 700; color: {$accentColor}; font-family: monospace;">
                      Ticket: {$ticket}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <div style="font-size: 13px; color: #9ca3af; margin-bottom: 20px; line-height: 1.5;">
                A new candidate application was submitted through the <strong style="color: #ffffff;">{$safeBrand}</strong> careers portal:
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px; background-color: #0b0c12; border: 1px solid #1c2030; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #8a90a4; font-size: 11px; font-weight: 700; width: 34%; text-transform: uppercase;">Candidate Name</td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #ffffff; font-size: 13px; font-weight: 600;">{$safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #8a90a4; font-size: 11px; font-weight: 700; text-transform: uppercase;">Position Applied</td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #60a5fa; font-size: 13px; font-weight: 700;">{$safeJob}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #8a90a4; font-size: 11px; font-weight: 700; text-transform: uppercase;">Email Address</td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #ffffff; font-size: 13px;"><a href="mailto:{$safeEmail}" style="color: {$accentColor}; text-decoration: none;">{$safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #8a90a4; font-size: 11px; font-weight: 700; text-transform: uppercase;">Mobile Number</td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #ffffff; font-size: 13px;">{$safePhone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #8a90a4; font-size: 11px; font-weight: 700; text-transform: uppercase;">Resume Attachment</td>
                  <td style="padding: 10px 16px; border-bottom: 1px solid #1c2030; color: #34d399; font-size: 13px; font-weight: 600;">{$safeResumeName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; color: #8a90a4; font-size: 11px; font-weight: 700; text-transform: uppercase;">Submitted At</td>
                  <td style="padding: 10px 16px; color: #8a90a4; font-size: 12px;">{$dateStr}</td>
                </tr>
              </table>
              <div style="font-size: 11px; font-weight: 800; color: {$accentColor}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                Cover Note / Candidate Message:
              </div>
              <div style="background-color: #0b0c12; border: 1px solid #1c2030; border-left: 3px solid {$accentColor}; border-radius: 4px; padding: 16px; color: #f1f5f9; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">
                {$safeLetter}
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:{$safeEmail}?subject=Re:%20[{$ticket}]%20{$safeBrand}%20Job%20Application" style="display: inline-block; background-color: {$accentColor}; color: #000000; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-decoration: none; padding: 14px 28px; border-radius: 6px; text-transform: uppercase;">
                      Reply to Candidate
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #090a0f; border-top: 1px solid #1c2030; padding: 20px 30px; text-align: center; font-size: 11px; color: #6b7280;">
              Alpha Premier Group of Companies &bull; Unified Talent Pipeline<br />
              Dispatched via Hostinger SMTP &bull; Reference: {$ticket}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

$attachments = [];
if ($uploadedFileRef !== null && file_exists($uploadedFileRef['path'])) {
    $attachments[] = $uploadedFileRef;
}

// Mail notification
$mailer = new Mailer();
$recipient = MAIL_TO_EMAIL;
$mailer->send($recipient, $emailSubject, $htmlBody, $email, $fullName, $attachments);

sendJson([
    'success' => true,
    'ticket' => $ticket,
    'applicant_id' => $applicantId,
    'enterprise' => $brand['name'],
    'message' => 'Thank you. Your job application and resume have been submitted to our talent acquisition board.'
]);
