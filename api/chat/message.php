<?php
/**
 * /api/chat/message.php
 * Public endpoint to handle visitor messages, match FAQ intents, or trigger live agent handoffs.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/Mailer.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJson(['status' => 'ok']);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
}

$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: $_POST;

$token = trim($data['session_token'] ?? $data['token'] ?? '');
$messageText = trim($data['message'] ?? $data['text'] ?? '');
$isExplicitHandoff = !empty($data['is_handoff']) || !empty($data['handoff']);
$enterprise = trim($data['enterprise_slug'] ?? $data['enterprise'] ?? 'apg-main');

if (empty($token)) {
    sendJson(['success' => false, 'error' => 'Session token is required'], 400);
}

if (empty($messageText) && !$isExplicitHandoff) {
    sendJson(['success' => false, 'error' => 'Message cannot be empty'], 400);
}

// Fetch current session
$stmt = $pdo->prepare('
    SELECT cs.*, a.name AS assigned_admin_name
    FROM chat_sessions cs
    LEFT JOIN admins a ON cs.assigned_admin_id = a.id
    WHERE cs.session_token = ?
    LIMIT 1
');
$stmt->execute([$token]);
$session = $stmt->fetch();

if (!$session) {
    sendJson(['success' => false, 'error' => 'Invalid or expired chat session'], 404);
}

$sessionId = (int)$session['id'];
$currentStatus = $session['status'];

if ($currentStatus === 'closed') {
    sendJson([
        'success' => false,
        'error' => 'This conversation has been closed. Please start a new session.',
        'session_closed' => true,
    ], 400);
}

// If visitor provided a message, insert visitor message into chat_messages
$visitorMsgId = null;
if (!empty($messageText)) {
    $insStmt = $pdo->prepare('
        INSERT INTO chat_messages (session_id, sender, body)
        VALUES (?, "visitor", ?)
    ');
    $insStmt->execute([$sessionId, $messageText]);
    $visitorMsgId = (int)$pdo->lastInsertId();

    // Bump session updated_at so admin queue reflects latest interaction
    $updStmt = $pdo->prepare('UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?');
    $updStmt->execute([$sessionId]);
}

// Fetch recent conversation history to check consecutive misses & format email
$histStmt = $pdo->prepare('
    SELECT sender, body, created_at
    FROM chat_messages
    WHERE session_id = ?
    ORDER BY id ASC
');
$histStmt->execute([$sessionId]);
$history = $histStmt->fetchAll();

// If status is already agent_active or waiting_for_agent, don't generate bot replies
if ($currentStatus === 'agent_active' || $currentStatus === 'waiting_for_agent') {
    sendJson([
        'success' => true,
        'status' => $currentStatus,
        'session' => $session,
        'reply' => null,
    ]);
}

// === BOT LOGIC & INTENT EVALUATION ===

// Enterprise details lookup for context & branding
$enterpriseTitles = [
    'realty' => 'Alpha Premier Realty',
    'luxe-prime' => 'Luxe Prime Realty',
    'swiftclear' => 'SwiftClear Facility & Cleaning',
    'swift-clear' => 'SwiftClear Facility & Cleaning',
    'dynamic-tree' => 'Dynamic Tree Talent & Media',
    'alta-venture' => 'Alta Venture Outsourcing',
    'construction' => 'Alpha Premier Construction',
    '88prime' => '88 Prime Trading & Supplies',
    '88-prime' => '88 Prime Trading & Supplies',
    'virtual-office' => 'Alpha Premier Virtual Office',
    'apg-main' => 'Alpha Premier Group',
];
$enterpriseName = $enterpriseTitles[$session['enterprise_slug']] ?? 'Alpha Premier Group';

// 1. Check for Handoff Trigger Conditions
$handoffKeywords = [
    'agent', 'broker', 'human', 'representative', 'real person',
    'live person', 'speak with someone', 'talk to someone', 'speak to someone',
    'speak with a person', 'talk to a person', 'customer service', 'support desk',
    'help desk', 'operator', 'manager', 'specialist', 'advisor'
];

$highStakesKeywords = [
    'negotiate', 'negotiation', 'discount', 'lower the price', 'best price',
    'make an offer', 'contract term', 'lease term', 'contract terms', 'nda',
    'exclusive contract', 'viewing schedule', 'schedule viewing', 'schedule site visit',
    'book viewing', 'is unit available', 'unit availability', 'payment terms'
];

$lowerText = strtolower($messageText);

$matchesHandoffKeyword = false;
foreach ($handoffKeywords as $kw) {
    if (str_contains($lowerText, $kw)) {
        $matchesHandoffKeyword = true;
        break;
    }
}

$matchesHighStakes = false;
foreach ($highStakesKeywords as $kw) {
    if (str_contains($lowerText, $kw)) {
        $matchesHighStakes = true;
        break;
    }
}

// Check consecutive misses in history
$consecutiveMisses = 0;
for ($i = count($history) - 1; $i >= 0; $i--) {
    if ($history[$i]['sender'] === 'bot') {
        if (str_contains($history[$i]['body'], "I'm not quite sure") || str_contains($history[$i]['body'], "didn't catch that")) {
            $consecutiveMisses++;
        } else {
            break;
        }
    }
}

// 2. FAQ INTENT MATCHING ENGINE
function matchFaqReply($slug, $text) {
    $q = strtolower($text);

    // Common Global Categories
    if (str_contains($q, 'ceo') || str_contains($q, 'president') || str_contains($q, 'founder') || str_contains($q, 'leadership') || str_contains($q, 'owner')) {
        return "Alpha Premier Group of Companies is led by President and CEO Mr. Mark Anthony Abito-Santos.";
    }

    if (str_contains($q, 'office hour') || str_contains($q, 'operating hour') || str_contains($q, 'hours') || str_contains($q, 'schedule') || str_contains($q, 'open')) {
        return "Our corporate headquarters and concierge desk operate Monday through Friday from 8:30 AM to 5:30 PM, and Saturday from 9:00 AM to 1:00 PM.";
    }

    if (str_contains($q, 'location') || str_contains($q, 'address') || str_contains($q, 'where are you') || str_contains($q, 'directions') || str_contains($q, 'building') || str_contains($q, 'tektite')) {
        return "Our corporate headquarters is located at Unit 3104, Philippine Stock Exchange Centre (PSE), Tektite East Tower, Exchange Road, Ortigas Center, Pasig City, Metro Manila.";
    }

    if (str_contains($q, 'phone') || str_contains($q, 'hotline') || str_contains($q, 'cellphone') || str_contains($q, 'telephone') || str_contains($q, 'call')) {
        return "You can reach our executive concierge team directly at 0915 888 9482 or landline (02) 8 650 2540.";
    }

    if (str_contains($q, 'email') || str_contains($q, 'inbox') || str_contains($q, 'mail')) {
        return "You can send direct inquiries to contact@alphapremiergroup.com or contact@alphapremier.com.";
    }

    if (str_contains($q, 'career') || str_contains($q, 'job') || str_contains($q, 'hiring') || str_contains($q, 'opening') || str_contains($q, 'apply') || str_contains($q, 'resume') || str_contains($q, 'work with us')) {
        return "We offer career opportunities across our real estate brokerage, general construction, facility services, BPO outsourcing, and media divisions. Visit our Careers section to view active openings and submit your application.";
    }

    if (str_contains($q, 'how to inquire') || str_contains($q, 'submit inquiry') || str_contains($q, 'consultation') || str_contains($q, 'book consultation')) {
        return "You can submit a formal consultation request through our Inquire page, or reach our concierge directly at 0915 888 9482 / contact@alphapremiergroup.com.";
    }

    // Enterprise Specific Intent Matches
    if ($slug === 'luxe-prime') {
        if (str_contains($q, 'sublease') || str_contains($q, 'subleasing') || str_contains($q, 'rental')) {
            return "Luxe Prime Realty offers a modern co-managed subleasing model that provides the flexibility of short and mid-term rentals while guaranteeing white-glove property care, guest screening, and maximized rental yield.";
        }
        if (str_contains($q, 'admin') || str_contains($q, 'administration') || str_contains($q, 'management') || str_contains($q, 'property management')) {
            return "Our End-to-End Property Administration oversees tenant vetting, lease compliance, 24/7 maintenance dispatch, utility reconciliation, and transparent monthly financial reporting for effortless ownership.";
        }
        if (str_contains($q, 'portfolio') || str_contains($q, 'off-market') || str_contains($q, 'penthouse') || str_contains($q, 'luxury') || str_contains($q, 'listings')) {
            return "Luxe Prime manages exclusive off-market luxury estates, sky penthouses, and prime residential developments across Bonifacio Global City, Makati CBD, and Ortigas Center.";
        }
        if (str_contains($q, 'service') || str_contains($q, 'what do you do') || str_contains($q, 'about')) {
            return "Luxe Prime Realty is our luxury brokerage arm specializing in co-managed subleasing, end-to-end residential asset administration, and private off-market portfolios.";
        }
    } elseif ($slug === 'dynamic-tree') {
        if (str_contains($q, 'model') || str_contains($q, 'talent') || str_contains($q, 'ambassador') || str_contains($q, 'influencer')) {
            return "Dynamic Tree manages commercial models, high-fashion talent, brand ambassadors, influencers, and event hosts for nationwide commercial campaigns and brand activations.";
        }
        if (str_contains($q, 'video') || str_contains($q, 'production') || str_contains($q, 'shoot') || str_contains($q, 'commercial') || str_contains($q, 'photography') || str_contains($q, 'studio')) {
            return "From concept development to post-production, Dynamic Tree directs commercial TVCs, fashion films, high-concept photography, product trailers, and digital visual campaigns.";
        }
        if (str_contains($q, 'casting') || str_contains($q, 'audition') || str_contains($q, 'booking')) {
            return "Our casting team connects premier brands and production houses with tailored talent rosters matching specific campaign archetypes.";
        }
        if (str_contains($q, 'service') || str_contains($q, 'what do you do') || str_contains($q, 'about')) {
            return "Dynamic Tree is the creative media, modeling, and talent management division of Alpha Premier Group, driving cinematic productions and commercial campaigns.";
        }
    } elseif ($slug === 'alta-venture') {
        if (str_contains($q, 'cfo') || str_contains($q, 'finance') || str_contains($q, 'accounting') || str_contains($q, 'bookkeeping') || str_contains($q, 'tax')) {
            return "Alta Venture's Virtual CFO and Finance solutions provide fractional financial controller oversight, budgeting, compliance, payroll, and strategic growth modeling.";
        }
        if (str_contains($q, 'talent') || str_contains($q, 'hr') || str_contains($q, 'staffing') || str_contains($q, 'recruitment') || str_contains($q, 'executive search')) {
            return "Alta Venture HR solutions provide end-to-end talent acquisition, dedicated offshore staffing, employee onboarding, and HR management.";
        }
        if (str_contains($q, 'cx') || str_contains($q, 'customer service') || str_contains($q, 'it') || str_contains($q, 'back office') || str_contains($q, 'bpo')) {
            return "We deliver 24/7 omnichannel customer experience (CX), technical helpdesk support, data operations, and back-office process optimization.";
        }
        if (str_contains($q, 'service') || str_contains($q, 'what do you do') || str_contains($q, 'about')) {
            return "Alta Venture Outsourcing delivers BPO solutions spanning Virtual CFO & Finance, Executive Talent Acquisition, CX Customer Support, and IT Management.";
        }
    } elseif ($slug === 'construction') {
        if (str_contains($q, 'fit-out') || str_contains($q, 'renovation') || str_contains($q, 'architectural') || str_contains($q, 'interior')) {
            return "Alpha Premier Construction provides turnkey architectural fit-outs, executive office buildouts, luxury retail storefronts, and residential remodels.";
        }
        if (str_contains($q, 'contracting') || str_contains($q, 'civil') || str_contains($q, 'engineering') || str_contains($q, 'structure') || str_contains($q, 'mep')) {
            return "We provide general contracting, structural civil works, and complete MEP (mechanical, electrical, plumbing, fire protection) engineering.";
        }
        if (str_contains($q, 'material') || str_contains($q, 'supply') || str_contains($q, 'hvac') || str_contains($q, 'panels')) {
            return "Our materials supply division supplies premium acoustic ceiling tiles, PVC/WPC fluted panels, commercial HVAC systems, and architectural finishes.";
        }
        if (str_contains($q, 'service') || str_contains($q, 'what do you do') || str_contains($q, 'about')) {
            return "Alpha Premier Construction provides general contracting, architectural fit-out, structural engineering, and materials supply for commercial and residential developments.";
        }
    } elseif ($slug === 'swiftclear' || $slug === 'swift-clear') {
        if (str_contains($q, 'disinfection') || str_contains($q, 'sanitation') || str_contains($q, 'sanitize') || str_contains($q, 'hospital')) {
            return "SwiftClear uses EPA-registered, hospital-grade electrostatic misting and botanical sanitization for corporate offices, healthcare facilities, and commercial hubs.";
        }
        if (str_contains($q, 'cleaning') || str_contains($q, 'deep clean') || str_contains($q, 'post-construction') || str_contains($q, 'facade')) {
            return "We specialize in deep cleaning, post-construction turnovers, high-rise glass facade cleaning, and scheduled office maintenance.";
        }
        if (str_contains($q, 'aircon') || str_contains($q, 'ac') || str_contains($q, 'hvac') || str_contains($q, 'freon')) {
            return "SwiftClear offers precision chemical wash, aircon maintenance, leak diagnostics, and preventive servicing for split-type, ceiling cassette, and VRF systems.";
        }
        if (str_contains($q, 'pest') || str_contains($q, 'termite') || str_contains($q, 'rodent') || str_contains($q, 'fumigation')) {
            return "We provide FDA-approved integrated pest management, thermal fogging, termite barrier treatment, and rodent exclusion for commercial properties.";
        }
        if (str_contains($q, 'service') || str_contains($q, 'what do you do') || str_contains($q, 'about')) {
            return "SwiftClear Facility & Cleaning provides hospital-grade disinfection, deep cleaning, post-construction turnover, aircon maintenance, and pest control.";
        }
    } elseif ($slug === '88prime' || $slug === '88-prime') {
        if (str_contains($q, 'supplies') || str_contains($q, 'procurement') || str_contains($q, 'goods') || str_contains($q, 'trading') || str_contains($q, 'pantry')) {
            return "88 Prime Consumer Goods Trading supplies corporate pantry items, ergonomic workstations, institutional cleaning chemicals, and BPO operations supplies.";
        }
        if (str_contains($q, 'panel') || str_contains($q, 'pvc') || str_contains($q, 'wpc') || str_contains($q, 'fluted') || str_contains($q, 'flooring')) {
            return "We distribute industrial-grade PVC marble sheets, exterior WPC fluted cladding, acoustic wall panels, and SPC vinyl flooring.";
        }
        if (str_contains($q, 'hvac') || str_contains($q, 'carrier') || str_contains($q, 'daikin') || str_contains($q, 'midea') || str_contains($q, 'gree')) {
            return "88 Prime is an authorized supplier and installer for Carrier, Daikin, Midea, Gree, Koppel, Mitsubishi Electric, and Samsung commercial air conditioning units.";
        }
        if (str_contains($q, 'service') || str_contains($q, 'what do you do') || str_contains($q, 'about')) {
            return "88 Prime provides corporate supplies, industrial architectural wall panels, and authorized HVAC air conditioning systems.";
        }
    } elseif ($slug === 'realty') {
        if (str_contains($q, 'warehouse') || str_contains($q, 'industrial') || str_contains($q, 'logistics')) {
            return "Alpha Premier Realty curates high-ceiling logistics warehouses and industrial complexes situated along major arterial expressways in Pasig, Valenzuela, and Cavite.";
        }
        if (str_contains($q, 'office') || str_contains($q, 'commercial') || str_contains($q, 'retail') || str_contains($q, 'lease')) {
            return "We represent PEZA-accredited Grade-A office towers, commercial storefronts, and turnkey corporate headquarters in Ortigas Center, BGC, and Makati.";
        }
        if (str_contains($q, 'condo') || str_contains($q, 'residential') || str_contains($q, 'penthouse') || str_contains($q, 'buy')) {
            return "Our brokerage portfolio features luxury condominiums, residential estates, and pre-selling investment opportunities across key central business districts.";
        }
        if (str_contains($q, 'service') || str_contains($q, 'what do you do') || str_contains($q, 'about')) {
            return "Alpha Premier Realty is our flagship brokerage division, delivering prime commercial office leasing, logistics warehouse acquisitions, and luxury residential advisory.";
        }
    }

    // Corporate General / Virtual Office
    if (str_contains($q, 'virtual office') || str_contains($q, 'virtual') || str_contains($q, 'package') || str_contains($q, 'sec') || str_contains($q, 'dti') || str_contains($q, 'address')) {
        return "Alpha Premier Virtual Office in Ortigas Center offers Bronze (₱1,500/mo - SEC/DTI address & mail), Silver (₱3,000/mo - dedicated phone & call answering), Gold (₱5,500/mo - conference room & lounge access), and Platinum custom enterprise suites.";
    }

    if (str_contains($q, 'subsidiaries') || str_contains($q, 'companies') || str_contains($q, 'what do you offer') || str_contains($q, 'enterprise') || str_contains($q, 'overview') || str_contains($q, 'what is alpha premier') || str_contains($q, 'about')) {
        return "Alpha Premier Group is a diversified Philippine corporate conglomerate operating market-leading enterprises in Real Estate Brokerage (Alpha Realty & Luxe Prime), General Construction & Fit-Out, Facility & Disinfection Services (SwiftClear), BPO Outsourcing (Alta Venture), Dynamic Tree Creative Media, and 88 Prime Trading.";
    }

    return null;
}

// 3. Determine if Handoff Should Fire
$triggerHandoff = false;
$handoffReason = '';

if ($isExplicitHandoff) {
    $triggerHandoff = true;
    $handoffReason = 'Visitor clicked "Talk to a Live Agent"';
} elseif ($matchesHandoffKeyword) {
    $triggerHandoff = true;
    $handoffReason = 'Visitor requested live agent / broker directly';
} elseif ($matchesHighStakes) {
    $triggerHandoff = true;
    $handoffReason = 'Transactional / high-stakes inquiry requiring human broker';
} else {
    $matchedReply = matchFaqReply($session['enterprise_slug'], $messageText);
    if ($matchedReply === null) {
        if ($consecutiveMisses >= 1) {
            // This is the 2nd miss in a row
            $triggerHandoff = true;
            $handoffReason = 'Repeated bot query non-match (2x consecutive misses)';
        }
    }
}

if ($triggerHandoff) {
    // Flip session status to waiting_for_agent
    $upStmt = $pdo->prepare('UPDATE chat_sessions SET status = "waiting_for_agent", updated_at = NOW() WHERE id = ?');
    $upStmt->execute([$sessionId]);

    // Insert bot handoff transition message
    $handoffMsg = "Connecting you to a live representative. Our broker team has been notified and will assist you shortly. Feel free to provide additional details or specific requirements while you wait.";
    $insBot = $pdo->prepare('INSERT INTO chat_messages (session_id, sender, body) VALUES (?, "bot", ?)');
    $insBot->execute([$sessionId, $handoffMsg]);

    // Send SMTP Notification Email to Admin
    try {
        $mailer = new Mailer();
        $adminTo = defined('MAIL_TO_EMAIL') ? MAIL_TO_EMAIL : 'contact@alphapremiergroup.com';
        $subject = "[APG Live Chat Handoff] Visitor Request — {$enterpriseName}";

        // Build recent conversation snippet for the email
        $convoHtml = '';
        foreach ($history as $h) {
            $sLabel = $h['sender'] === 'visitor' ? 'Visitor' : ($h['sender'] === 'admin' ? 'Admin' : 'Bot');
            $sColor = $h['sender'] === 'visitor' ? '#2563eb' : '#6b7280';
            $convoHtml .= "<div style='margin-bottom:8px;'><strong style='color:{$sColor};'>{$sLabel}:</strong> " . htmlspecialchars($h['body']) . "</div>";
        }
        if (!empty($messageText)) {
            $convoHtml .= "<div style='margin-bottom:8px;'><strong style='color:#2563eb;'>Visitor:</strong> " . htmlspecialchars($messageText) . "</div>";
        }

        $adminUrl = "https://alphapremiergroup.com/admin/live-chat?session={$sessionId}";
        if (!empty($_SERVER['HTTP_HOST'])) {
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $adminUrl = "{$protocol}://{$_SERVER['HTTP_HOST']}/admin/live-chat?session={$sessionId}";
        }

        $emailBody = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0f19; color: #f3f4f6; border-radius: 8px; overflow: hidden; border: 1px solid #1f2937;'>
            <div style='background: #111827; padding: 20px 24px; border-bottom: 2px solid #c5a059;'>
                <span style='background: #c5a059; color: #000; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;'>LIVE CHAT HANDOFF</span>
                <h2 style='margin: 10px 0 0; color: #ffffff; font-size: 18px;'>{$enterpriseName} — Live Assistance Requested</h2>
            </div>
            <div style='padding: 24px;'>
                <p style='color: #9ca3af; margin-top: 0;'>A website visitor is waiting for live assistance in the concierge queue.</p>
                
                <table style='width: 100%; margin-bottom: 20px; border-collapse: collapse;'>
                    <tr>
                        <td style='color: #9ca3af; padding: 6px 0; width: 120px;'><strong>Reason:</strong></td>
                        <td style='color: #f3f4f6; padding: 6px 0;'>{$handoffReason}</td>
                    </tr>
                    <tr>
                        <td style='color: #9ca3af; padding: 6px 0;'><strong>Enterprise:</strong></td>
                        <td style='color: #c5a059; padding: 6px 0;'>{$enterpriseName} ({$session['enterprise_slug']})</td>
                    </tr>
                    <tr>
                        <td style='color: #9ca3af; padding: 6px 0;'><strong>Session ID:</strong></td>
                        <td style='color: #9ca3af; padding: 6px 0;'>#{$sessionId}</td>
                    </tr>
                </table>

                <div style='background: #1f2937; padding: 16px; border-radius: 6px; margin-bottom: 24px;'>
                    <div style='font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px;'>Conversation Excerpt</div>
                    {$convoHtml}
                </div>

                <div style='text-align: center;'>
                    <a href='{$adminUrl}' style='display: inline-block; background: #c5a059; color: #0b0f19; font-weight: bold; padding: 12px 28px; border-radius: 6px; text-decoration: none;'>Open Live Chat Queue</a>
                </div>
            </div>
            <div style='background: #111827; padding: 14px 24px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #1f2937;'>
                Alpha Premier Group of Companies — Real-Time Concierge Dispatcher
            </div>
        </div>";

        $mailer->send($adminTo, $subject, $emailBody);
    } catch (Exception $e) {
        error_log("Failed to send live chat notification email: " . $e->getMessage());
    }

    sendJson([
        'success' => true,
        'status' => 'waiting_for_agent',
        'reply' => $handoffMsg,
        'handoff' => true,
    ]);
}

// 4. Normal FAQ Reply
$matchedReply = matchFaqReply($session['enterprise_slug'], $messageText);

if ($matchedReply !== null) {
    // Insert matched bot reply
    $insBot = $pdo->prepare('INSERT INTO chat_messages (session_id, sender, body) VALUES (?, "bot", ?)');
    $insBot->execute([$sessionId, $matchedReply]);

    sendJson([
        'success' => true,
        'status' => 'bot',
        'reply' => $matchedReply,
        'handoff' => false,
    ]);
}

// Fallback message when not matched (1st miss)
$fallbackReply = "I didn't quite catch that. You can ask about our services, pricing packages, office locations, operating hours, or careers — or click \"Talk to a live agent\" below to speak with our broker team directly.";
$insBot = $pdo->prepare('INSERT INTO chat_messages (session_id, sender, body) VALUES (?, "bot", ?)');
$insBot->execute([$sessionId, $fallbackReply]);

sendJson([
    'success' => true,
    'status' => 'bot',
    'reply' => $fallbackReply,
    'handoff' => false,
]);
