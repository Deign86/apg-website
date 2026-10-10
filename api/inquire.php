<?php
/**
 * POST /api/inquire.php
 * Inquiry handler for every Alpha Premier enterprise (and the corporate site).
 * Emails the team (MAIL_TO_EMAIL) in the enterprise's own branded template, with the visitor as
 * Reply-To, and sends the visitor a short confirmation in the same branding.
 */
require_once __DIR__ . '/config.php';
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
    sendJson(['success' => false, 'error' => 'Invalid form submission.'], 400);
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

if ($jobTitle !== '') {
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
$standardKeys = ['name', 'fullName', 'email', 'phone', 'contact', 'subject', 'message', 'notes', 'details', 'company', 'organization', 'brand', 'budget', 'timeline', 'targetTimeline', 'preferredDate', 'campaignDate', 'service', 'serviceType', 'package', 'topic', 'selectedTopic', 'interestType', 'jobTitle', 'position', 'property', 'propertyTitle', 'listing', 'enterprise', 'source', 'type', 'inquiryType', 'website', 'form_started_at', 'turnstile_token'];
$extra = 0;
foreach ($data as $k => $v) {
    if ($extra < 15 && is_string($k) && !in_array($k, $standardKeys, true) && is_string($v) && trim($v) !== '') {
        $rows[] = emailRow(ucwords(str_replace(['_', '-'], ' ', mb_substr($k, 0, 40))), emailEsc(mb_substr(trim($v), 0, 1000)));
        $extra++;
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
    'quote' => ['Message', $message !== '' ? $message : 'No message provided.'],
    'actions' => $actions,
    'note' => 'Reply to this email to answer ' . ($firstName === 'there' ? 'the sender' : $firstName) . ' directly. Submitted through '
        . preg_replace('#^https?://#', '', $t['url']) . ' on ' . date('F j, Y, g:i A') . '.',
    'ref' => $ticket,
]);

// Visitor upload (same limits as api/applicants.php: 15MB and an extension allow-list).
$attachments = [];
foreach (['resume', 'attachment'] as $fileKey) {
    if (empty($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        continue;
    }
    $file = $_FILES[$fileKey];
    $originalName = basename((string)$file['name']);
    if ($file['size'] > 15 * 1024 * 1024) {
        sendJson(['success' => false, 'error' => 'Attachment exceeds maximum allowed size (15MB).'], 400);
    }
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($ext, ['pdf', 'doc', 'docx', 'rtf', 'txt', 'png', 'jpg', 'jpeg'], true)) {
        sendJson(['success' => false, 'error' => 'Invalid file format. Please upload a PDF, DOC, or DOCX file.'], 400);
    }
    $attachments[] = [
        'path' => $file['tmp_name'],
        'name' => $originalName,
        'type' => (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']) ?: 'application/octet-stream',
    ];
    break;
}

emailSend($t, MAIL_TO_EMAIL, $emailSubject, $teamHtml, $email, $name, $attachments);

// ---- Visitor confirmation (after the response is flushed, so the visitor never waits on it) ----
// Repeats nothing the visitor typed except a safe first name; only server-verified details.
register_shutdown_function(static function () use ($t, $email, $ticket, $firstName, $listing) {
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
    $confirmRows[] = emailRow('Contact us', emailLink('mailto:' . $t['inbox'], $t['inbox'], $t) . '<br>0915 888 9482 · (02) 8650 2540');
    $confirmActions[] = ['Visit ' . $t['name'], $t['url'], $confirmActions ? 'secondary' : 'primary'];

    $confirmHtml = emailRender($t, [
        'preheader' => "We've received your inquiry. Reference {$ticket}.",
        'eyebrow' => 'Inquiry received',
        'title' => "Thank you, {$firstName}.",
        'intro' => "We've received your inquiry for {$t['name']}. A member of our team will get back to you within one business day.\n\nIf you need to add anything, simply reply to this email and keep the reference number in the subject.",
        'rows' => $confirmRows,
        'actions' => $confirmActions,
        'note' => "You're receiving this because this email address was entered on our website. If that wasn't you, you can ignore this message.",
        'ref' => $ticket,
    ]);
    emailSend($t, $email, "We've received your inquiry [{$ticket}] — {$t['name']}", $confirmHtml, MAIL_TO_EMAIL, $t['name']);
});

sendJson([
    'success' => true,
    'ticket' => $ticket,
    'enterprise' => $t['name'],
    'message' => "Thank you. Your inquiry has been sent to the {$t['name']} team."
]);
