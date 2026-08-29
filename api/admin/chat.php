<?php
/**
 * /api/admin/chat.php
 * Gated admin endpoint to manage live chat sessions, claim sessions,
 * post admin replies, and close active conversations.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();

$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$adminId = (int)($_SESSION['admin_id'] ?? 0);
$adminName = $_SESSION['admin_name'] ?? 'Admin Broker';

// 1. GET — List sessions or fetch single session thread
if ($method === 'GET') {
    $sessionId = isset($_GET['session_id']) ? (int)$_GET['session_id'] : 0;
    $afterId = isset($_GET['after_id']) ? (int)$_GET['after_id'] : 0;
    $statusFilter = trim($_GET['status'] ?? 'all');

    if ($sessionId > 0) {
        // Fetch session metadata
        $stmt = $pdo->prepare('
            SELECT cs.*, a.name AS assigned_admin_name, a.email AS assigned_admin_email
            FROM chat_sessions cs
            LEFT JOIN admins a ON cs.assigned_admin_id = a.id
            WHERE cs.id = ?
            LIMIT 1
        ');
        $stmt->execute([$sessionId]);
        $session = $stmt->fetch();

        if (!$session) {
            sendJson(['success' => false, 'error' => 'Chat session not found'], 404);
        }

        // Fetch messages (optionally incremental after_id for live polling)
        $msgStmt = $pdo->prepare('
            SELECT cm.*, a.name AS sender_admin_name
            FROM chat_messages cm
            LEFT JOIN admins a ON cm.sender_admin_id = a.id
            WHERE cm.session_id = ? AND cm.id > ?
            ORDER BY cm.id ASC
        ');
        $msgStmt->execute([$sessionId, $afterId]);
        $messages = $msgStmt->fetchAll();

        sendJson([
            'success' => true,
            'session' => $session,
            'messages' => $messages,
        ]);
    }

    // List all sessions
    try {
        $whereSql = '';
        $params = [];

        if ($statusFilter !== 'all' && in_array($statusFilter, ['waiting_for_agent', 'agent_active', 'bot', 'closed'])) {
            $whereSql = 'WHERE cs.status = ?';
            $params[] = $statusFilter;
        }

        $listSql = "
            SELECT cs.*, a.name AS assigned_admin_name,
                   (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) AS message_count,
                   (SELECT body FROM chat_messages WHERE session_id = cs.id ORDER BY id DESC LIMIT 1) AS last_message,
                   (SELECT sender FROM chat_messages WHERE session_id = cs.id ORDER BY id DESC LIMIT 1) AS last_sender,
                   (SELECT created_at FROM chat_messages WHERE session_id = cs.id ORDER BY id DESC LIMIT 1) AS last_message_at,
                   TIMESTAMPDIFF(SECOND, cs.updated_at, NOW()) AS wait_seconds
            FROM chat_sessions cs
            LEFT JOIN admins a ON cs.assigned_admin_id = a.id
            {$whereSql}
            ORDER BY 
                FIELD(cs.status, 'waiting_for_agent', 'agent_active', 'bot', 'closed'),
                cs.updated_at DESC
        ";

        $stmt = $pdo->prepare($listSql);
        $stmt->execute($params);
        $sessions = $stmt->fetchAll();

        // Calculate summary counts
        $countsStmt = $pdo->query('
            SELECT 
                COUNT(*) AS total_count,
                SUM(CASE WHEN status = "waiting_for_agent" THEN 1 ELSE 0 END) AS waiting_count,
                SUM(CASE WHEN status = "agent_active" THEN 1 ELSE 0 END) AS active_count,
                SUM(CASE WHEN status = "closed" THEN 1 ELSE 0 END) AS closed_count,
                SUM(CASE WHEN status = "bot" THEN 1 ELSE 0 END) AS bot_count
            FROM chat_sessions
        ');
        $counts = $countsStmt->fetch() ?: [
            'total_count' => 0,
            'waiting_count' => 0,
            'active_count' => 0,
            'closed_count' => 0,
            'bot_count' => 0,
        ];

        sendJson([
            'success' => true,
            'data' => $sessions,
            'summary' => [
                'total' => (int)$counts['total_count'],
                'waiting' => (int)$counts['waiting_count'],
                'active' => (int)$counts['active_count'],
                'closed' => (int)$counts['closed_count'],
                'bot' => (int)$counts['bot_count'],
            ],
        ]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 2. POST / PUT — Actions: claim, message, close
if ($method === 'POST' || $method === 'PUT') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $action = trim($data['action'] ?? ($_GET['action'] ?? 'message'));
    $sessionId = (int)($data['session_id'] ?? ($_GET['session_id'] ?? 0));

    if ($sessionId <= 0) {
        sendJson(['success' => false, 'error' => 'Invalid session ID'], 400);
    }

    // Verify session exists
    $chkStmt = $pdo->prepare('SELECT * FROM chat_sessions WHERE id = ? LIMIT 1');
    $chkStmt->execute([$sessionId]);
    $session = $chkStmt->fetch();

    if (!$session) {
        sendJson(['success' => false, 'error' => 'Chat session not found'], 404);
    }

    // ACTION: CLAIM SESSION
    if ($action === 'claim') {
        $upStmt = $pdo->prepare('
            UPDATE chat_sessions
            SET assigned_admin_id = ?, status = "agent_active", updated_at = NOW()
            WHERE id = ?
        ');
        $upStmt->execute([$adminId, $sessionId]);

        $joinText = "{$adminName} from Alpha Premier Brokerage has joined the chat and is reviewing your inquiry.";
        $insMsg = $pdo->prepare('
            INSERT INTO chat_messages (session_id, sender, sender_admin_id, body)
            VALUES (?, "admin", ?, ?)
        ');
        $insMsg->execute([$sessionId, $adminId, $joinText]);

        sendJson([
            'success' => true,
            'message' => 'Session claimed successfully',
            'status' => 'agent_active',
            'assigned_admin_id' => $adminId,
            'assigned_admin_name' => $adminName,
        ]);
    }

    // ACTION: POST ADMIN MESSAGE
    if ($action === 'message') {
        $body = trim($data['body'] ?? $data['message'] ?? '');
        if (empty($body)) {
            sendJson(['success' => false, 'error' => 'Message body cannot be empty'], 400);
        }

        // Auto-assign admin and transition status if waiting
        if ($session['status'] === 'waiting_for_agent' || empty($session['assigned_admin_id'])) {
            $upStmt = $pdo->prepare('
                UPDATE chat_sessions
                SET assigned_admin_id = ?, status = "agent_active", updated_at = NOW()
                WHERE id = ?
            ');
            $upStmt->execute([$adminId, $sessionId]);
        } else {
            $upStmt = $pdo->prepare('UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?');
            $upStmt->execute([$sessionId]);
        }

        // Insert admin reply
        $insMsg = $pdo->prepare('
            INSERT INTO chat_messages (session_id, sender, sender_admin_id, body)
            VALUES (?, "admin", ?, ?)
        ');
        $insMsg->execute([$sessionId, $adminId, $body]);
        $msgId = (int)$pdo->lastInsertId();

        sendJson([
            'success' => true,
            'message_id' => $msgId,
            'status' => 'agent_active',
        ]);
    }

    // ACTION: CLOSE SESSION
    if ($action === 'close') {
        $upStmt = $pdo->prepare('
            UPDATE chat_sessions
            SET status = "closed", closed_at = NOW(), updated_at = NOW()
            WHERE id = ?
        ');
        $upStmt->execute([$sessionId]);

        $closeMsg = "This session has been marked as closed by {$adminName}. For further assistance, contact 0915 888 9482 / contact@alphapremiergroup.com.";
        $insMsg = $pdo->prepare('
            INSERT INTO chat_messages (session_id, sender, sender_admin_id, body)
            VALUES (?, "admin", ?, ?)
        ');
        $insMsg->execute([$sessionId, $adminId, $closeMsg]);

        sendJson([
            'success' => true,
            'message' => 'Session closed successfully',
            'status' => 'closed',
        ]);
    }

    sendJson(['success' => false, 'error' => 'Unknown action'], 400);
}

sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
