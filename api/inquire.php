<?php
/**
 * POST /api/inquire.php
 * Unified Multi-Enterprise Inquiry & Application Handler.
 * Dynamically adjusts email theme, colors, branding, badges, distinct subsidiary logos,
 * and structured form fields based on the specific Alpha Premier enterprise.
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

$name     = trim($data['name'] ?? $data['fullName'] ?? '');
$email    = trim($data['email'] ?? '');
$phone    = trim($data['phone'] ?? $data['contact'] ?? '');
$subject  = trim($data['subject'] ?? '');
$message  = trim($data['message'] ?? $data['notes'] ?? $data['details'] ?? '');
$company  = trim($data['company'] ?? $data['organization'] ?? $data['brand'] ?? '');
$budget   = trim($data['budget'] ?? '');
$timeline = trim($data['timeline'] ?? $data['targetTimeline'] ?? $data['preferredDate'] ?? $data['campaignDate'] ?? '');
$service  = trim($data['service'] ?? $data['serviceType'] ?? $data['package'] ?? '');
$topic    = trim($data['topic'] ?? $data['selectedTopic'] ?? $data['interestType'] ?? '');
$jobTitle = trim($data['jobTitle'] ?? $data['position'] ?? '');
$property = trim($data['property'] ?? $data['propertyTitle'] ?? $data['listing'] ?? '');

// Resolve Enterprise Key
$rawEnterprise = strtolower(trim($data['enterprise'] ?? $data['source'] ?? 'general'));
$enterpriseKey = 'general';

if (str_contains($rawEnterprise, 'realty') && !str_contains($rawEnterprise, 'luxe')) {
    $enterpriseKey = 'realty';
} elseif (str_contains($rawEnterprise, 'luxe')) {
    $enterpriseKey = 'luxe-prime';
} elseif (str_contains($rawEnterprise, 'swift') || str_contains($rawEnterprise, 'clean')) {
    $enterpriseKey = 'swift-clear';
} elseif (str_contains($rawEnterprise, 'dynamic') || str_contains($rawEnterprise, 'media') || str_contains($rawEnterprise, 'talent')) {
    $enterpriseKey = 'dynamic-tree';
} elseif (str_contains($rawEnterprise, 'alta') || str_contains($rawEnterprise, 'outsource') || str_contains($rawEnterprise, 'bpo')) {
    $enterpriseKey = 'alta-venture';
} elseif (str_contains($rawEnterprise, 'construction') || str_contains($rawEnterprise, 'contract')) {
    $enterpriseKey = 'construction';
} elseif (str_contains($rawEnterprise, '88') || str_contains($rawEnterprise, 'prime')) {
    $enterpriseKey = '88-prime';
} elseif (!empty($jobTitle) || str_contains($rawEnterprise, 'career') || str_contains($rawEnterprise, 'job')) {
    $enterpriseKey = 'careers';
} elseif (str_contains($rawEnterprise, 'virtual') || str_contains($rawEnterprise, 'office')) {
    $enterpriseKey = 'virtual-office';
}

// Enterprise Configuration Registry with Dedicated Logo Assets
$enterpriseMap = [
    'realty' => [
        'name'        => 'Alpha Premier Realty',
        'badge'       => 'ALPHA PREMIER REALTY',
        'tagline'     => 'Prime Commercial Real Estate & High-Yield Asset Portfolios',
        'color'       => '#C5A85C',
        'gradient'    => 'linear-gradient(135deg, #d4af37 0%, #c5a059 100%)',
        'textColor'   => '#000000',
        'divisionUrl' => 'https://alphapremiergroup.com/enterprises/realty',
        'logoFile'    => 'images/realty-banner-logo.png',
        'logoWidth'   => 180,
    ],
    'luxe-prime' => [
        'name'        => 'Luxe Prime Realty',
        'badge'       => 'LUXE PRIME REALTY',
        'tagline'     => 'Luxury Residential Estates, Penthouses & Private Brokerage',
        'color'       => '#C49A2A',
        'gradient'    => 'linear-gradient(135deg, #e5b94c 0%, #c49a2a 100%)',
        'textColor'   => '#000000',
        'divisionUrl' => 'https://alphapremiergroup.com/enterprises/luxe-prime',
        'logoFile'    => 'assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png',
        'logoWidth'   => 160,
    ],
    'swift-clear' => [
        'name'        => 'Swift Clear Facility & Cleaning',
        'badge'       => 'SWIFTCLEAR FACILITY & CLEANING',
        'tagline'     => 'Hospital-Grade Disinfection, High-Rise Facade Cleaning & Deep Sanitation',
        'color'       => '#00B4D8',
        'gradient'    => 'linear-gradient(135deg, #48cae4 0%, #0077b6 100%)',
        'textColor'   => '#ffffff',
        'divisionUrl' => 'https://alphapremiergroup.com/enterprises/swift-clear',
        'logoFile'    => 'images/swiftclear-logo.png',
        'logoWidth'   => 180,
    ],
    'dynamic-tree' => [
        'name'        => 'Dynamic Tree Multimedia Services',
        'badge'       => 'DYNAMIC TREE MULTIMEDIA',
        'tagline'     => 'Talent & Influencer Management, Commercial Video & Campaign Direction',
        'color'       => '#C84A72',
        'gradient'    => 'linear-gradient(135deg, #e06d91 0%, #a83257 100%)',
        'textColor'   => '#ffffff',
        'divisionUrl' => 'https://alphapremiergroup.com/enterprises/dynamic-tree',
        'logoFile'    => 'assets/alta-venture/2._Dynamic_Tree.png',
        'logoWidth'   => 150,
    ],
    'alta-venture' => [
        'name'        => 'Alta Venture Outsource',
        'badge'       => 'ALTA VENTURE OUTSOURCING',
        'tagline'     => 'Enterprise BPO Operations, Fractional CFO, Talent HR & 24/7 CX Scaling',
        'color'       => '#19A48A',
        'gradient'    => 'linear-gradient(135deg, #2dd4bf 0%, #0f766e 100%)',
        'textColor'   => '#ffffff',
        'divisionUrl' => 'https://alphapremiergroup.com/enterprises/alta-venture',
        'logoFile'    => 'assets/alta-venture/3._Alta_Venture_-_Logo.png',
        'logoWidth'   => 180,
    ],
    'construction' => [
        'name'        => 'Alpha Premier Construction',
        'badge'       => 'ALPHA PREMIER CONSTRUCTION',
        'tagline'     => 'General Contracting, Architectural Interior Fit-Outs, Structural & MEPFS',
        'color'       => '#E5A93C',
        'gradient'    => 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
        'textColor'   => '#000000',
        'divisionUrl' => 'https://alphapremiergroup.com/enterprises/construction',
        'logoFile'    => 'assets/images/main-construction/logo_transparent.png',
        'logoWidth'   => 150,
    ],
    '88-prime' => [
        'name'        => '88 Prime',
        'badge'       => '88 PRIME ENTERPRISE',
        'tagline'     => 'Corporate Advisory, Strategic Commodities & Commercial Trading',
        'color'       => '#D4AF37',
        'gradient'    => 'linear-gradient(135deg, #fef08a 0%, #ca8a04 100%)',
        'textColor'   => '#000000',
        'divisionUrl' => 'https://alphapremiergroup.com/enterprises/88-prime',
        'logoFile'    => 'assets/88prime/logo_88prime.png',
        'logoWidth'   => 140,
    ],
    'careers' => [
        'name'        => 'APG Talent Acquisition & Careers',
        'badge'       => 'CAREER & TALENT APPLICATION',
        'tagline'     => 'Executive Recruitment Across Alpha Premier Group of Companies',
        'color'       => '#3B82F6',
        'gradient'    => 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
        'textColor'   => '#ffffff',
        'divisionUrl' => 'https://alphapremiergroup.com/careers',
        'logoFile'    => 'assets/images/logo-horizontal-transparent.png',
        'logoWidth'   => 200,
    ],
    'virtual-office' => [
        'name'        => 'Alpha Premier Virtual Office',
        'badge'       => 'VIRTUAL OFFICE & PACKAGES',
        'tagline'     => 'SEC/DTI Business Registration, Prestigious Address & Boardroom Suites',
        'color'       => '#C5A059',
        'gradient'    => 'linear-gradient(135deg, #d4af37 0%, #c5a059 100%)',
        'textColor'   => '#000000',
        'divisionUrl' => 'https://alphapremiergroup.com/virtual-office',
        'logoFile'    => 'assets/images/logo-horizontal-transparent.png',
        'logoWidth'   => 200,
    ],
    'general' => [
        'name'        => 'Alpha Premier Group',
        'badge'       => 'CORPORATE GENERAL INQUIRY',
        'tagline'     => 'Diversified Corporate Conglomerate & Executive Advisory',
        'color'       => '#C5A059',
        'gradient'    => 'linear-gradient(135deg, #d4af37 0%, #c5a059 100%)',
        'textColor'   => '#000000',
        'divisionUrl' => 'https://alphapremiergroup.com',
        'logoFile'    => 'assets/images/logo-horizontal-transparent.png',
        'logoWidth'   => 200,
    ]
];

$brand = $enterpriseMap[$enterpriseKey];

// Validation
if (empty($name) || empty($email)) {
    sendJson(['success' => false, 'error' => 'Name and email are required fields.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendJson(['success' => false, 'error' => 'Invalid email address.'], 400);
}

// Generate unique ticket
$ticket = 'APG-' . strtoupper(substr(md5(uniqid(time(), true)), 0, 8));

// Email subject formatting
if (!empty($jobTitle)) {
    $emailSubject = "[{$ticket}] Job Application: {$jobTitle} — {$name}";
} elseif (!empty($subject)) {
    $emailSubject = "[{$ticket}] {$subject}";
} else {
    $emailSubject = "[{$ticket}] {$brand['name']} Inquiry from {$name}";
}

// Prepare Dynamic Structured Rows from all submitted inputs
$detailRows = [];
$detailRows[] = ['label' => 'Client Name', 'value' => htmlspecialchars($name)];
$detailRows[] = ['label' => 'Email Address', 'value' => '<a href="mailto:' . htmlspecialchars($email) . '" style="color: ' . $brand['color'] . '; text-decoration: none; font-weight: 600;">' . htmlspecialchars($email) . '</a>'];
$detailRows[] = ['label' => 'Contact / Phone', 'value' => htmlspecialchars($phone ?: '—')];

if (!empty($company)) {
    $detailRows[] = ['label' => 'Company / Brand', 'value' => htmlspecialchars($company)];
}

if (!empty($service) && $service !== 'Select a Service') {
    $detailRows[] = ['label' => 'Service Selected', 'value' => '<strong style="color: ' . $brand['color'] . ';">' . htmlspecialchars($service) . '</strong>'];
}

if (!empty($property)) {
    $detailRows[] = ['label' => 'Property / Unit', 'value' => '<strong style="color: ' . $brand['color'] . ';">' . htmlspecialchars($property) . '</strong>'];
}

if (!empty($topic) && $topic !== $service) {
    $detailRows[] = ['label' => 'Inquiry Topic', 'value' => htmlspecialchars($topic)];
}

if (!empty($jobTitle)) {
    $detailRows[] = ['label' => 'Position Applied', 'value' => '<strong style="color: #60a5fa;">' . htmlspecialchars($jobTitle) . '</strong>'];
}

if (!empty($budget) && $budget !== 'Select Budget Range') {
    $detailRows[] = ['label' => 'Budget Bracket', 'value' => '<span style="color: #34d399; font-weight: 700;">' . htmlspecialchars($budget) . '</span>'];
}

if (!empty($timeline)) {
    $detailRows[] = ['label' => 'Target Timeline', 'value' => htmlspecialchars($timeline)];
}

// Any extra custom fields passed in data
$standardKeys = ['name', 'fullName', 'email', 'phone', 'contact', 'subject', 'message', 'notes', 'details', 'company', 'organization', 'brand', 'budget', 'timeline', 'targetTimeline', 'preferredDate', 'campaignDate', 'service', 'serviceType', 'package', 'topic', 'selectedTopic', 'interestType', 'jobTitle', 'position', 'property', 'propertyTitle', 'listing', 'enterprise', 'source', 'type', 'inquiryType'];
foreach ($data as $k => $v) {
    if (!in_array($k, $standardKeys) && is_string($v) && trim($v) !== '') {
        $label = ucwords(str_replace(['_', '-'], ' ', $k));
        $detailRows[] = ['label' => $label, 'value' => htmlspecialchars(trim($v))];
    }
}

$dateStr = date('F j, Y · g:i A (T)');
$detailRows[] = ['label' => 'Submission Time', 'value' => '<span style="color: #8a90a4;">' . $dateStr . '</span>'];

// Build Table HTML
$tableRowsHtml = '';
foreach ($detailRows as $row) {
    $label = $row['label'];
    $val = $row['value'];
    $tableRowsHtml .= <<<HTML
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid #1c2030; color: #8a90a4; font-size: 11px; font-weight: 700; width: 34%; text-transform: uppercase; letter-spacing: 0.5px;">{$label}</td>
        <td style="padding: 12px 18px; border-bottom: 1px solid #1c2030; color: #ffffff; font-size: 13px;">{$val}</td>
      </tr>
HTML;
}

$safeBrandName = htmlspecialchars($brand['name']);
$safeBadge = htmlspecialchars($brand['badge']);
$safeTagline = htmlspecialchars($brand['tagline']);
$accentColor = $brand['color'];
$accentGradient = $brand['gradient'];
$btnTextColor = $brand['textColor'];
$divisionUrl = $brand['divisionUrl'];
$logoWidth = (int)($brand['logoWidth'] ?? 180);
$safeMessage = nl2br(htmlspecialchars($message ?: 'No additional message details provided.'));

$htmlBody = <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{$safeBrandName} Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07080b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #ffffff;">

  <!-- Outer wrapper table -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #07080b; padding: 32px 16px;">
    <tr>
      <td align="center" valign="top">

        <!-- Main Card Container (620px) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #0f1118; border: 1px solid #232738; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.85);">

          <!-- Enterprise-Themed Header Bar with Embedded Division Logo -->
          <tr>
            <td style="background: linear-gradient(180deg, #161822 0%, #0c0e14 100%); border-bottom: 2px solid {$accentColor}; padding: 32px 30px; text-align: center;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <img src="cid:enterprise_logo" alt="{$safeBrandName}" width="{$logoWidth}" style="display: block; margin: 0 auto 14px auto; width: {$logoWidth}px; max-width: 100%; height: auto;" />
                    <div style="font-size: 14px; font-weight: 800; letter-spacing: 2.5px; color: {$accentColor}; text-transform: uppercase; margin: 0;">
                      {$safeBrandName}
                    </div>
                    <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.5px; color: #94a3b8; margin-top: 4px;">
                      {$safeTagline}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subheader / Enterprise Badge & Ticket Row -->
          <tr>
            <td style="background-color: #141722; padding: 14px 30px; border-bottom: 1px solid #1c2030;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" valign="middle">
                    <span style="display: inline-block; background-color: {$accentColor}; color: {$btnTextColor}; font-weight: 800; font-size: 10px; letter-spacing: 1px; padding: 5px 12px; border-radius: 4px; text-transform: uppercase;">
                      {$safeBadge}
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 12px; font-weight: 700; color: {$accentColor}; font-family: monospace; letter-spacing: 0.5px;">
                      Ticket: {$ticket}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 30px;">

              <div style="font-size: 13px; color: #9ca3af; margin-bottom: 20px; line-height: 1.5;">
                A new client inquiry was submitted through the <strong style="color: #ffffff;">{$safeBrandName}</strong> portal. Form responses are detailed below:
              </div>

              <!-- Metadata Summary Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 24px; background-color: #0b0c12; border: 1px solid #1c2030; border-radius: 8px; overflow: hidden;">
                {$tableRowsHtml}
              </table>

              <!-- Project Scope / Message Box -->
              <div style="font-size: 11px; font-weight: 800; color: {$accentColor}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
                Client Requirements &amp; Message:
              </div>
              <div style="background-color: #0b0c12; border: 1px solid #1c2030; border-left: 3px solid {$accentColor}; border-radius: 4px; padding: 20px; color: #f1f5f9; font-size: 13px; line-height: 1.6; margin-bottom: 28px;">
                {$safeMessage}
              </div>

              <!-- Enterprise Themed Action Buttons -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:{$email}?subject=Re:%20[{$ticket}]%20{$safeBrandName}%20Consultation" style="display: inline-block; background: {$accentGradient}; color: {$btnTextColor}; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-decoration: none; padding: 15px 32px; border-radius: 6px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
                      Reply Directly to {$name}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Corporate Footer -->
          <tr>
            <td style="background-color: #090a0f; border-top: 1px solid #1c2030; padding: 24px 30px; text-align: center;">
              <div style="font-size: 12px; font-weight: 700; color: {$accentColor}; letter-spacing: 1px; margin-bottom: 6px;">
                {$safeBrandName} &bull; ALPHA PREMIER GROUP
              </div>
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #6b7280; line-height: 1.5;">
                Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Ortigas Center, Pasig City<br />
                Direct Concierge: +63 915 888 9482 &bull; Division Web: <a href="{$divisionUrl}" style="color: {$accentColor}; text-decoration: none;">{$divisionUrl}</a>
              </p>
              <div style="font-size: 10px; color: #475569; letter-spacing: 0.5px;">
                Dispatched securely via Hostinger SMTP &bull; Reference ID: {$ticket}
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
HTML;

// Attachments handling + Dedicated Enterprise Logo CID embedding
$attachments = [];
$publicDir = dirname(__DIR__) . '/public';
$logoRelativePath = $brand['logoFile'] ?? 'assets/images/logo-horizontal-transparent.png';
$logoPath = $publicDir . '/' . ltrim($logoRelativePath, '/');

if (file_exists($logoPath)) {
    $mimeType = str_ends_with(strtolower($logoPath), '.jpg') || str_ends_with(strtolower($logoPath), '.jpeg') ? 'image/jpeg' : 'image/png';
    $attachments[] = [
        'path' => $logoPath,
        'name' => basename($logoPath),
        'type' => $mimeType,
        'cid'  => 'enterprise_logo',
    ];
} else {
    // Fallback to corporate phoenix emblem
    $fallbackLogo = $publicDir . '/assets/images/logo-horizontal-transparent.png';
    if (file_exists($fallbackLogo)) {
        $attachments[] = [
            'path' => $fallbackLogo,
            'name' => 'apg-corporate-logo.png',
            'type' => 'image/png',
            'cid'  => 'enterprise_logo',
        ];
    }
}

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

// Send via Mailer to Hostinger receiving inbox
$mailer = new Mailer();
$recipient = MAIL_TO_EMAIL;
$sent = $mailer->send($recipient, $emailSubject, $htmlBody, $email, $name, $attachments);

sendJson([
    'success' => true,
    'ticket' => $ticket,
    'enterprise' => $brand['name'],
    'message' => "Thank you. Your inquiry has been dispatched directly to the {$brand['name']} executive team."
]);
