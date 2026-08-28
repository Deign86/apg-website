<?php
/**
 * POST /api/inquire.php
 * Unified inquiry and career application handler.
 * Accepts JSON or multipart/form-data with resume attachments.
 * Dispatches directly to company email inbox via SMTP.
 */
require_once __DIR__ . '/config.php';
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

$name    = trim($data['name'] ?? $data['fullName'] ?? '');
$email   = trim($data['email'] ?? '');
$phone   = trim($data['phone'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');
$company = trim($data['company'] ?? '');
$source  = trim($data['source'] ?? $data['enterprise'] ?? 'General Contact');
$inquiryType = trim($data['inquiryType'] ?? $data['type'] ?? 'General Inquiry');
$jobTitle = trim($data['jobTitle'] ?? $data['position'] ?? '');

// Validation
if (empty($name) || empty($email)) {
    sendJson(['success' => false, 'error' => 'Name and email are required fields.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson(['success' => false, 'error' => 'Invalid email address.'], 400);
}

// Generate unique ticket number
$ticket = 'APG-' . strtoupper(substr(md5(uniqid(time(), true)), 0, 8));

// Email subject formatting
$emailSubject = !empty($subject) ? "[{$ticket}] {$subject}" : "[{$ticket}] New Inquiry: {$source} from {$name}";
if (!empty($jobTitle)) {
    $emailSubject = "[{$ticket}] Job Application: {$jobTitle} - {$name}";
}

// Build HTML email body
$sourceBadge = htmlspecialchars($source);
$safeName = htmlspecialchars($name);
$safeEmail = htmlspecialchars($email);
$safePhone = htmlspecialchars($phone ?: 'Not provided');
$safeCompany = htmlspecialchars($company ?: 'Not provided');
$safeJob = htmlspecialchars($jobTitle);
$safeType = htmlspecialchars($inquiryType);
$safeMessage = nl2br(htmlspecialchars($message ?: 'No additional message provided.'));
$dateStr = date('F j, Y, g:i a');

$htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0c10; color: #ffffff; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background-color: #12131a; border: 1px solid #c5a85c; border-radius: 8px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1b1c24 0%, #0a0b0e 100%); border-bottom: 2px solid #c5a85c; padding: 25px; text-align: center; }
  .header h1 { margin: 0; color: #d4af37; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; }
  .header p { margin: 5px 0 0 0; color: #a0a5b5; font-size: 12px; }
  .content { padding: 25px; }
  .badge { display: inline-block; background: #c5a85c; color: #000000; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .info-table { width: 100%; margin: 20px 0; border-collapse: collapse; }
  .info-table td { padding: 10px 12px; border-bottom: 1px solid #222533; font-size: 14px; }
  .info-table td.label { color: #8f94a6; width: 35%; font-weight: 600; }
  .info-table td.value { color: #ffffff; }
  .message-box { background-color: #1a1c26; border-left: 3px solid #c5a85c; padding: 15px; margin-top: 15px; border-radius: 0 4px 4px 0; color: #e1e3ea; font-size: 14px; line-height: 1.6; }
  .footer { background-color: #0d0e14; padding: 15px; text-align: center; font-size: 11px; color: #616678; border-top: 1px solid #1f2230; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Alpha Premier Group</h1>
    <p>Official Website Communication Dispatch</p>
  </div>
  <div class="content">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
      <span class="badge">{$sourceBadge}</span>
      <span style="color: #c5a85c; font-size: 12px; font-weight: bold;">Ticket: {$ticket}</span>
    </div>
    
    <table class="info-table">
      <tr><td class="label">Full Name:</td><td class="value"><strong>{$safeName}</strong></td></tr>
      <tr><td class="label">Email Address:</td><td class="value"><a href="mailto:{$safeEmail}" style="color: #d4af37; text-decoration: none;">{$safeEmail}</a></td></tr>
      <tr><td class="label">Contact Number:</td><td class="value">{$safePhone}</td></tr>
      <tr><td class="label">Company / Org:</td><td class="value">{$safeCompany}</td></tr>
      <tr><td class="label">Inquiry Type:</td><td class="value">{$safeType}</td></tr>
HTML;

if (!empty($jobTitle)) {
    $htmlBody .= "<tr><td class=\"label\">Position Applied:</td><td class=\"value\"><strong style=\"color: #60a5fa;\">{$safeJob}</strong></td></tr>";
}

$htmlBody .= <<<HTML
      <tr><td class="label">Submitted At:</td><td class="value">{$dateStr}</td></tr>
    </table>

    <div style="font-size: 13px; font-weight: 600; color: #c5a85c; margin-top: 20px;">Message / Additional Details:</div>
    <div class="message-box">
      {$safeMessage}
    </div>
  </div>
  <div class="footer">
    Alpha Premier Group of Companies &bull; Automatic notification dispatched via Hostinger PHP SMTP &bull; Reply directly to this email to contact {$safeName}.
  </div>
</div>
</body>
</html>
HTML;

// Handle Attachments (e.g. resumes for job applications)
$attachments = [];
if (!empty($_FILES['resume']) && $_FILES['resume']['error'] === UPLOAD_ERR_OK) {
    $attachments[] = [
        'path' => $_FILES['resume']['tmp_name'],
        'name' => $_FILES['resume']['name'],
        'type' => $_FILES['resume']['type'],
    ];
} elseif (!empty($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $attachments[] = [
        'path' => $_FILES['attachment']['tmp_name'],
        'name' => $_FILES['attachment']['name'],
        'type' => $_FILES['attachment']['type'],
    ];
}

// Send via Mailer
$mailer = new Mailer();
$recipient = MAIL_TO_EMAIL;
$sent = $mailer->send($recipient, $emailSubject, $htmlBody, $email, $name, $attachments);

sendJson([
    'success' => true,
    'ticket' => $ticket,
    'message' => 'Thank you. Your inquiry has been dispatched directly to the Alpha Premier executive team.'
]);
