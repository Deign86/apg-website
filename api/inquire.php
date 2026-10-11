<?php
/**
 * POST /api/inquire.php
 * Inquiry handler for every Alpha Premier enterprise (and the corporate site).
 * Stores every accepted submission in `inquiries` (admin Inquiries inbox) before any mail goes out,
 * emails the team (inquiryRecipient()) in the enterprise's own branded template, with the visitor as
 * Reply-To, and sends the visitor a short confirmation in the same branding.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/Mailer.php';
require_once __DIR__ . '/lib/EmailTemplate.php';

/**
 * Team inbox for an enterprise's form submissions: careers feedback goes to that company's HR inbox,
 * everything else to its inquiry inbox (admin private settings, company then default, else .env).
 */
function inquiryRecipient(string $slug, string $form): string {
    if ($form === 'feedback') {
        require_once __DIR__ . '/lib/Ats.php';
        return atsHrEmail($slug);
    }
    require_once __DIR__ . '/lib/ContentRegistry.php';
    return inquiryInbox($slug);
}

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
}

if (!is_array($data)) {
    sendJson(['success' => false, 'error' => 'Invalid form submission.'], 400);
}
// Non-inquiry forms sharing this pipeline: footer/blog newsletter sign-ups and careers feedback.
// Each form kind has its own per-IP submission budget.
$form = is_string($data['form'] ?? null) && in_array($data['form'], ['newsletter', 'feedback'], true) ? $data['form'] : 'inquiry';
guardPublicFormSubmission($data, $form);
$readText = static function (array $source, array $keys): string {
    foreach ($keys as $key) {
        if (isset($source[$key]) && is_string($source[$key])) {
            return trim(str_replace("\0", '', $source[$key]));
        }
    }
    return '';
};

$name     = $readText($data, ['name', 'fullName']);
$email    = $readText($data, ['email']);
$phone    = $readText($data, ['phone', 'contact']);
$subject  = $readText($data, ['subject']);
$message  = $readText($data, ['message', 'notes', 'details']);
$company  = $readText($data, ['company', 'organization', 'brand']);
$budget   = $readText($data, ['budget']);
$timeline = $readText($data, ['timeline', 'targetTimeline', 'preferredDate', 'campaignDate']);
$service  = $readText($data, ['service', 'serviceType', 'package']);
$topic    = $readText($data, ['topic', 'selectedTopic', 'interestType']);
$jobTitle = $readText($data, ['jobTitle', 'position']);
$property = $readText($data, ['property', 'propertyTitle', 'listing']);
if ($form === 'newsletter' && $name === '') {
    $name = 'Newsletter subscriber';
}

// Validation
if (empty($name) || empty($email)) {
    sendJson(['success' => false, 'error' => 'Name and email are required fields.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson(['success' => false, 'error' => 'Invalid email address.'], 400);
}

if (strlen($name) > 600 || strlen($email) > 254 || strlen($phone) > 200 || strlen($subject) > 800 || strlen($message) > 40000 || strlen($company) > 800 || strlen($jobTitle) > 800) {
    sendJson(['success' => false, 'error' => 'One or more fields exceed the maximum allowed length.'], 400);
}

// Enterprise -> theme (canonical slugs; free text such as "Alpha Realty" or "Swift Clear" resolves too).
$slug = resolveEnterpriseSlug($readText($data, ['enterprise', 'source']), 'corporate');
$t = emailTheme($slug);

// Website listing ref (api/cron/drive-sync.php): verified against the live feed, which also gives
// staff the listing's Drive folder and gives the visitor the listing's real title.
$listing = null;
if (preg_match('/\bAPR-[0-9A-F]{6}\b/', $property, $refMatch)) {
    $feed = json_decode((string)@file_get_contents(__DIR__ . '/data/listings.generated.json'), true);
    foreach (is_array($feed['listings'] ?? null) ? $feed['listings'] : [] as $item) {
        if (($item['ref'] ?? '') === $refMatch[0]) {
            $listing = $item;
            break;
        }
    }
}

$ticket = 'APG-' . strtoupper(substr(md5(uniqid(time(), true)), 0, 8));
$firstName = emailSafeFirstName($name);

if ($form === 'newsletter') {
    $eyebrow = 'New newsletter subscriber';
    $emailSubject = "[{$ticket}] Newsletter subscription — {$email} ({$t['name']})";
} elseif ($form === 'feedback') {
    $eyebrow = 'New careers feedback';
    $emailSubject = "[{$ticket}] Careers feedback from {$name} ({$t['name']})";
} elseif ($jobTitle !== '') {
    $eyebrow = 'New career inquiry';
    $emailSubject = "[{$ticket}] Job inquiry: {$jobTitle} — {$name}";
} elseif ($listing !== null) {
    $eyebrow = 'New property inquiry';
    $emailSubject = "[{$ticket}] Property inquiry {$listing['ref']}: {$listing['title']} — {$name}";
} else {
    $eyebrow = 'New inquiry';
    $emailSubject = $subject !== '' ? "[{$ticket}] {$subject}" : "[{$ticket}] {$t['name']} inquiry from {$name}";
}

// ---- Team notification -------------------------------------------------------------------------
$rows = [emailRow('Email', emailLink('mailto:' . $email, $email, $t))];
if ($phone !== '') {
    $rows[] = emailRow('Phone', emailLink('tel:' . preg_replace('/[^\d+]/', '', $phone), $phone, $t));
}
if ($company !== '') {
    $rows[] = emailRow('Company', emailEsc($company));
}
if ($service !== '' && $service !== 'Select a Service') {
    $rows[] = emailRow('Service', emailEsc($service));
}
if ($property !== '') {
    $rows[] = emailRow('Property', emailEsc($listing !== null ? "{$listing['ref']} — {$listing['title']}" : $property));
}
if ($topic !== '' && $topic !== $service) {
    $rows[] = emailRow('Topic', emailEsc($topic));
}
if ($jobTitle !== '') {
    $rows[] = emailRow('Position', emailEsc($jobTitle));
}
if ($budget !== '' && $budget !== 'Select Budget Range') {
    $rows[] = emailRow('Budget', emailEsc($budget));
}
if ($timeline !== '') {
    $rows[] = emailRow('Timeline', emailEsc($timeline));
}
// Any extra fields an enterprise form sends (capped so a crafted payload can't bloat the email).
$standardKeys = ['form', 'name','fullName', 'email', 'phone', 'contact', 'subject', 'message', 'notes', 'details', 'company', 'organization', 'brand', 'budget', 'timeline', 'targetTimeline', 'preferredDate', 'campaignDate', 'service', 'serviceType', 'package', 'topic', 'selectedTopic', 'interestType', 'jobTitle', 'position', 'property', 'propertyTitle', 'listing', 'enterprise', 'source', 'type', 'inquiryType', 'website', 'form_started_at', 'turnstile_token'];
$extraFields = [];
foreach ($data as $k => $v) {
    if (count($extraFields) < 15 && is_string($k) && !in_array($k, $standardKeys, true) && is_string($v) && trim($v) !== '') {
        $label = ucwords(str_replace(['_', '-'], ' ', mb_substr($k, 0, 40)));
        $extraFields[$label] = mb_substr(trim($v), 0, 1000);
        $rows[] = emailRow($label, emailEsc($extraFields[$label]));
    }
}

$actions = [['Reply to ' . ($firstName === 'there' ? 'sender' : $firstName), 'mailto:' . $email . '?subject=' . rawurlencode("Re: [{$ticket}] " . ($listing['title'] ?? $t['name'])), 'primary']];
if ($listing !== null && is_string($listing['drive_folder'] ?? null)) {
    $actions[] = ['Open Drive folder', 'https://drive.google.com/drive/folders/' . rawurlencode($listing['drive_folder']), 'secondary'];
} elseif ($phone !== '') {
    $actions[] = ['Call ' . $phone, 'tel:' . preg_replace('/[^\d+]/', '', $phone), 'secondary'];
}

$teamHtml = emailRender($t, [
    'preheader' => $name . ' · ' . ($listing['title'] ?? ($subject ?: $t['name'])),
    'eyebrow' => $eyebrow,
    'title' => $name,
    'subtitle' => $listing !== null ? "{$listing['title']} · {$listing['ref']}" : ($jobTitle ?: ($service ?: $subject)),
    'rows' => $rows,
    'quote' => $form === 'newsletter'
        ? ['Request', 'Please add this address to the ' . $t['name'] . ' newsletter list.']
        : [$form === 'feedback' ? 'Feedback' : 'Message', $message !== '' ? $message : 'No message provided.'],
    'actions' => $actions,
    'note' => 'Reply to this email to answer ' . ($firstName === 'there' ? 'the sender' : $firstName) . ' directly. Submitted through '
        . preg_replace('#^https?://#', '', $t['url']) . ' on ' . date('F j, Y, g:i A') . '.',
    'ref' => $ticket,
]);

// Visitor upload (same limits as api/applicants.php: 15MB and an extension allow-list).
$attachments = [];
foreach (['resume', 'attachment'] as $fileKey) {
    $uploadError = $_FILES[$fileKey]['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($uploadError === UPLOAD_ERR_NO_FILE) {
        continue;
    }
    if ($uploadError !== UPLOAD_ERR_OK) {
        // Never send the inquiry on without the file the visitor thinks they attached.
        sendJson(['success' => false, 'error' => in_array($uploadError, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
            ? 'Attachment is too large. Please upload a smaller file (max 15MB).'
            : 'Attachment upload failed. Please try again.'], 400);
    }
    $file = $_FILES[$fileKey];
    $originalName = basename((string)$file['name']);
    if ($file['size'] > 15 * 1024 * 1024) {
        sendJson(['success' => false, 'error' => 'Attachment exceeds maximum allowed size (15MB).'], 400);
    }
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $mimeTypes = [
        'pdf' => 'application/pdf', 'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'rtf' => 'application/rtf', 'txt' => 'text/plain', 'png' => 'image/png', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
    ];
    if (!isset($mimeTypes[$ext])) {
        sendJson(['success' => false, 'error' => 'Invalid file format. Please upload a PDF, DOC, or DOCX file.'], 400);
    }
    $attachments[] = [
        'path' => $file['tmp_name'],
        'name' => $originalName,
        'type' => $mimeTypes[$ext],
    ];
    break;
}

// ---- Inbox row (admin Inquiries). Written before mail so a lead survives an SMTP failure; a database
// problem is logged and never blocks the email. Newsletter sign-ups are kept once per address.
$kind = match (true) {
    $form !== 'inquiry' => $form,
    $jobTitle !== '' => 'application_question',
    $listing !== null => 'listing',
    default => 'inquiry',
};
recordPublicFormSubmission($form); // accepted: every check above passed

$pdo = getDbConnection();
if ($pdo !== null) {
    try {
        $existingId = false;
        if ($kind === 'newsletter') {
            $find = $pdo->prepare("SELECT id FROM inquiries WHERE kind = 'newsletter' AND email = :email LIMIT 1");
            $find->execute([':email' => $email]);
            $existingId = $find->fetchColumn();
        }
        if ($existingId !== false) {
            $pdo->prepare('UPDATE inquiries SET updated_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $existingId]);
        } else {
            $meta = array_filter([
                'ticket' => $ticket,
                'listing_ref' => $listing['ref'] ?? null,
                'listing_title' => $listing['title'] ?? null,
                'property' => $listing === null ? $property : null,
                'company' => $company,
                'service' => $service !== 'Select a Service' ? $service : null,
                'topic' => $topic,
                'position' => $jobTitle,
                'budget' => $budget !== 'Select Budget Range' ? $budget : null,
                'timeline' => $timeline,
                'type' => $readText($data, ['inquiryType', 'type']),
                'attachment' => $attachments[0]['name'] ?? null,
                'fields' => $extraFields,
            ], static fn($v) => $v !== null && $v !== '' && $v !== []);
            $pdo->prepare('INSERT INTO inquiries (kind, enterprise_slug, name, email, phone, subject, message, meta)
                VALUES (:kind, :slug, :name, :email, :phone, :subject, :message, :meta)')->execute([
                ':kind' => $kind,
                ':slug' => $slug,
                ':name' => mb_substr($name, 0, 255),
                ':email' => $email,
                ':phone' => $phone !== '' ? $phone : null,
                ':subject' => mb_substr(preg_replace('/^\[[^\]]+\] /', '', $emailSubject), 0, 500),
                ':message' => $message !== '' ? $message : null,
                ':meta' => json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE),
            ]);
        }
    } catch (PDOException $e) {
        error_log('inquire.php: could not store inquiry ' . $ticket . ': ' . $e->getMessage());
    }
}

emailSend($t, inquiryRecipient($slug, $form), $emailSubject, $teamHtml, $email, $name, $attachments);

// ---- Visitor confirmation (after the response is flushed, so the visitor never waits on it) ----
// Repeats nothing the visitor typed except a safe first name; only server-verified details.
register_shutdown_function(static function () use ($t, $email, $ticket, $firstName, $listing, $form) {
    ignore_user_abort(true);
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } elseif (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    }
    if (!emailConfirmationAllowed($email)) {
        return;
    }
    $confirmRows = [emailRow('Reference', '<span style="font-variant-numeric:tabular-nums;">' . emailEsc($ticket) . '</span>')];
    $confirmActions = [];
    if ($listing !== null) {
        $listingUrl = emailTheme('realty')['url'] . '/properties?ref=' . rawurlencode($listing['ref']);
        $confirmRows[] = emailRow('Property', emailEsc($listing['title']) . ' · ' . emailEsc($listing['ref']));
        $confirmActions[] = ['View the listing', $listingUrl, 'primary'];
    }
    // Public contact details from Site settings ("0915 888 9482 / (02) 8 650 2540" -> "… · …").
    $phoneLine = implode(' · ', preg_split('/\s*[\/|]\s*/', $t['phone'], -1, PREG_SPLIT_NO_EMPTY));
    $confirmRows[] = emailRow('Contact us', emailLink('mailto:' . $t['inbox'], $t['inbox'], $t) . ($phoneLine !== '' ? '<br>' . emailEsc($phoneLine) : ''));
    $confirmActions[] = ['Visit ' . $t['name'], $t['url'], $confirmActions ? 'secondary' : 'primary'];

    [$eyebrow, $title, $intro, $subject] = match ($form) {
        'newsletter' => ['Subscription confirmed', "You're subscribed.",
            "Thank you for subscribing to {$t['name']} news and insights. We'll email you new articles and updates.\n\nTo unsubscribe at any time, reply to this email with \"Unsubscribe\".",
            "You're subscribed to {$t['name']} updates"],
        'feedback' => ['Feedback received', "Thank you, {$firstName}.",
            "Thank you for sharing your experience with {$t['name']}. Our HR team has received your feedback and reads every submission.",
            "Thank you for your feedback [{$ticket}] — {$t['name']}"],
        default => ['Inquiry received', "Thank you, {$firstName}.",
            "We've received your inquiry for {$t['name']}. A member of our team will get back to you within one business day.\n\nIf you need to add anything, simply reply to this email and keep the reference number in the subject.",
            "We've received your inquiry [{$ticket}] — {$t['name']}"],
    };
    $confirmHtml = emailRender($t, [
        'preheader' => "{$eyebrow}. Reference {$ticket}.",
        'eyebrow' => $eyebrow,
        'title' => $title,
        'intro' => $intro,
        'rows' => $confirmRows,
        'actions' => $confirmActions,
        'note' => "You're receiving this because this email address was entered on our website. If that wasn't you, you can ignore this message.",
        'ref' => $ticket,
    ]);
    // Reply-To is the PUBLIC company email; the private delivery inbox (inquiryRecipient) is never exposed.
    emailSend($t, $email, $subject, $confirmHtml, $t['inbox'], $t['name']);
});

sendJson([
    'success' => true,
    'ticket' => $ticket,
    'enterprise' => $t['name'],
    'message' => "Thank you. Your inquiry has been sent to the {$t['name']} team."
]);
