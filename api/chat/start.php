<?php
/**
 * /api/chat/start.php
 * Public endpoint to start a new chat session or restore an existing one.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJson(['status' => 'ok']);
}

$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

// Support JSON body or GET/POST params
$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: ($_POST ?: $_GET);

$token = trim($data['session_token'] ?? $data['token'] ?? '');
$enterprise = trim($data['enterprise_slug'] ?? $data['enterprise'] ?? 'apg-main');
$visitorName = trim($data['visitor_name'] ?? '');
$visitorEmail = trim($data['visitor_email'] ?? '');
$visitorPhone = trim($data['visitor_phone'] ?? '');

$session = null;
$messages = [];

if (!empty($token)) {
    // Attempt to restore existing session
    $stmt = $pdo->prepare('
        SELECT cs.*, a.name AS assigned_admin_name
        FROM chat_sessions cs
        LEFT JOIN admins a ON cs.assigned_admin_id = a.id
        WHERE cs.session_token = ?
        LIMIT 1
    ');
    $stmt->execute([$token]);
    $session = $stmt->fetch();

    if ($session) {
        // Fetch message history
        $msgStmt = $pdo->prepare('
            SELECT id, session_id, sender, sender_admin_id, body, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY id ASC
        ');
        $msgStmt->execute([$session['id']]);
        $messages = $msgStmt->fetchAll();

        // Update enterprise slug if browsing a specific subsidiary
        if (!empty($enterprise) && $enterprise !== $session['enterprise_slug']) {
            $upStmt = $pdo->prepare('UPDATE chat_sessions SET enterprise_slug = ? WHERE id = ?');
            $upStmt->execute([$enterprise, $session['id']]);
            $session['enterprise_slug'] = $enterprise;
        }
    }
}

if (!$session) {
    // Generate fresh session token
    $token = bin2hex(random_bytes(16));
    $stmt = $pdo->prepare('
        INSERT INTO chat_sessions (session_token, enterprise_slug, visitor_name, visitor_email, visitor_phone, status)
        VALUES (?, ?, ?, ?, ?, "bot")
    ');
    $stmt->execute([
        $token,
        $enterprise ?: 'apg-main',
        $visitorName ?: null,
        $visitorEmail ?: null,
        $visitorPhone ?: null,
    ]);
    $sessionId = (int)$pdo->lastInsertId();

    $session = [
        'id' => $sessionId,
        'session_token' => $token,
        'enterprise_slug' => $enterprise ?: 'apg-main',
        'visitor_name' => $visitorName ?: null,
        'visitor_email' => $visitorEmail ?: null,
        'visitor_phone' => $visitorPhone ?: null,
        'status' => 'bot',
        'assigned_admin_id' => null,
        'assigned_admin_name' => null,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s'),
        'closed_at' => null,
    ];
}

sendJson([
    'success' => true,
    'session' => $session,
    'messages' => $messages,
]);
