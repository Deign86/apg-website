<?php
/**
 * /api/chat/poll.php
 * Public lightweight polling endpoint for active chat widgets.
 * Returns updated session status and any new messages since after_id.
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

$token = trim($_GET['session_token'] ?? $_GET['token'] ?? ($_POST['session_token'] ?? ''));
$afterId = (int)($_GET['after_id'] ?? ($_POST['after_id'] ?? 0));

if (empty($token)) {
    // Also support JSON body
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $json = json_decode($raw, true);
        if (!empty($json['session_token'])) $token = trim($json['session_token']);
        if (!empty($json['token'])) $token = trim($json['token']);
        if (isset($json['after_id'])) $afterId = (int)$json['after_id'];
    }
}

if (empty($token)) {
    sendJson(['success' => false, 'error' => 'Session token is required'], 400);
}

// Fetch session status & assigned admin name
$stmt = $pdo->prepare('
    SELECT cs.id, cs.session_token, cs.enterprise_slug, cs.status, cs.assigned_admin_id, cs.closed_at, cs.updated_at,
           a.name AS assigned_admin_name
    FROM chat_sessions cs
    LEFT JOIN admins a ON cs.assigned_admin_id = a.id
    WHERE cs.session_token = ?
    LIMIT 1
');
$stmt->execute([$token]);
$session = $stmt->fetch();

if (!$session) {
    sendJson(['success' => false, 'error' => 'Session not found'], 404);
}

// Fetch any new messages since after_id
$msgStmt = $pdo->prepare('
    SELECT cm.id, cm.session_id, cm.sender, cm.sender_admin_id, cm.body, cm.created_at,
           a.name AS sender_admin_name
    FROM chat_messages cm
    LEFT JOIN admins a ON cm.sender_admin_id = a.id
    WHERE cm.session_id = ? AND cm.id > ?
    ORDER BY cm.id ASC
');
$msgStmt->execute([$session['id'], $afterId]);
$newMessages = $msgStmt->fetchAll();

sendJson([
    'success' => true,
    'status' => $session['status'],
    'assigned_admin_id' => $session['assigned_admin_id'],
    'assigned_admin_name' => $session['assigned_admin_name'],
    'enterprise_slug' => $session['enterprise_slug'],
    'closed_at' => $session['closed_at'],
    'messages' => $newMessages,
]);
