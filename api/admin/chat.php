<?php
/**
 * /api/admin/chat.php
 * Gated admin endpoint to manage live chat sessions, claim sessions,
 * post admin replies, and close active conversations.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/ContentRegistry.php';
require_once __DIR__ . '/../lib/ChatExpiry.php';
require_once __DIR__ . '/../lib/Profanity.php';

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
    requireAdminCapability('chat');
    $sessionId = isset($_GET['session_id']) ? (int)$_GET['session_id'] : 0;
    $afterId = isset($_GET['after_id']) ? (int)$_GET['after_id'] : 0;
    $statusFilter = inputText($_GET, 'status', 'all');

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

    // List sessions. ?summary=1 returns only the counts (sidebar badge, dashboard). ?status=open is the
    // live queue (everything not closed, kept small by the idle expiry); a single status orders newest
    // first and pages with ?limit=&offset=, so closed history is read a page at a time. ?q= searches
    // visitor, company and last message. The summary always counts every session.
    expireIdleChats($pdo);
    try {
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
        $summary = [
            'total' => (int)$counts['total_count'],
            'waiting' => (int)$counts['waiting_count'],
            'active' => (int)$counts['active_count'],
            'closed' => (int)$counts['closed_count'],
            'bot' => (int)$counts['bot_count'],
        ];
        if (isset($_GET['summary'])) {
            sendJson(['success' => true, 'summary' => $summary]);
        }

        $statuses = ['waiting_for_agent', 'agent_active', 'bot', 'closed'];
        $where = [];
        $params = [];
        if ($statusFilter === 'open') {
            $where[] = "cs.status IN ('waiting_for_agent', 'agent_active', 'bot')";
        } elseif (in_array($statusFilter, $statuses, true)) {
            $where[] = 'cs.status = ?';
            $params[] = $statusFilter;
        }
        $q = inputText($_GET, 'q');
        if ($q !== '') {
            if (mb_strlen($q) > 200) {
                sendJson(['success' => false, 'error' => 'Search is limited to 200 characters'], 400);
            }
            $like = '%' . addcslashes($q, '%_\\') . '%';
            $where[] = '(cs.visitor_name LIKE ? OR cs.visitor_email LIKE ? OR cs.enterprise_slug LIKE ?
                OR (SELECT body FROM chat_messages WHERE session_id = cs.id ORDER BY id DESC LIMIT 1) LIKE ?)';
            array_push($params, $like, $like, $like, $like);
        }
        $limitSql = '';
        if (isset($_GET['limit'])) {
            $limit = filter_var($_GET['limit'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 200]]);
            $offset = filter_var($_GET['offset'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            if ($limit === false || $offset === false) {
                sendJson(['success' => false, 'error' => 'limit must be 1-200 and offset 0 or more'], 400);
            }
            $limitSql = "LIMIT {$limit} OFFSET {$offset}";
        }
        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        // One status is ordered by recency (idx_chat_status_updated); mixed lists keep the queue order.
        $orderSql = in_array($statusFilter, $statuses, true)
            ? 'cs.updated_at DESC, cs.id DESC'
            : "FIELD(cs.status, 'waiting_for_agent', 'agent_active', 'bot', 'closed'), cs.updated_at DESC, cs.id DESC";

        // The page is cut in the derived table first, so the per-session message lookups run for its rows only.
        $stmt = $pdo->prepare("
            SELECT cs.*, a.name AS assigned_admin_name,
                   (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) AS message_count,
                   lm.body AS last_message, lm.sender AS last_sender, lm.created_at AS last_message_at,
                   TIMESTAMPDIFF(SECOND, cs.updated_at, NOW()) AS wait_seconds
            FROM (SELECT * FROM chat_sessions cs {$whereSql} ORDER BY {$orderSql} {$limitSql}) cs
            LEFT JOIN admins a ON cs.assigned_admin_id = a.id
            LEFT JOIN chat_messages lm ON lm.id = (SELECT MAX(id) FROM chat_messages WHERE session_id = cs.id)
            ORDER BY {$orderSql}
        ");
        $stmt->execute($params);

        sendJson([
            'success' => true,
            'data' => $stmt->fetchAll(),
            'summary' => $summary,
        ]);
    } catch (PDOException $e) {
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        sendJson(['success' => false, 'error' => 'A server error occurred. Please try again.'], 500);
    }
}

// 2. POST / PUT — Actions: claim, message, close
if ($method === 'POST' || $method === 'PUT') {
    requireAdminCapability('chat');
    $data = jsonBody() ?: $_POST;

    $action = inputText($data, 'action', inputText($_GET, 'action', 'message'));
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

    // The visitor widget stops polling once a session is closed, so a claim or reply
    // there would never be seen.
    if ($session['status'] === 'closed' && ($action === 'claim' || $action === 'message')) {
        sendJson(['success' => false, 'error' => 'This conversation is closed. The visitor can no longer see new messages.'], 409);
    }
    // Closing twice would post a second closing note.
    if ($session['status'] === 'closed' && $action === 'close') {
        sendJson(['success' => false, 'error' => 'This conversation is already closed.', 'status' => 'closed'], 409);
    }

    // ACTION: CLAIM SESSION
    if ($action === 'claim') {
        $upStmt = $pdo->prepare('
            UPDATE chat_sessions
            SET assigned_admin_id = ?, status = "agent_active", updated_at = NOW()
            WHERE id = ?
        ');
        $upStmt->execute([$adminId, $sessionId]);

        $joinText = "{$adminName} has joined the chat and is reviewing your inquiry.";
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
        $bodyInput = $data['body'] ?? $data['message'] ?? '';
        $body = is_string($bodyInput) ? trim($bodyInput) : '';
        if ($body === '') {
            sendJson(['success' => false, 'error' => 'Message body cannot be empty'], 400);
        }
        $bodyLength = preg_match_all('/./us', $body);
        if ($bodyLength === false || $bodyLength > 2000) {
            sendJson(['success' => false, 'error' => 'Message body must be valid UTF-8 and no more than 2000 characters'], 400);
        }
        $body = censorProfanity($body);

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
        // Insert the closing note before flipping status: the visitor widget stops
        // polling once it sees "closed", so the note must already be readable.
        $chatSlug = (string)($session['enterprise_slug'] ?? '');
        $closePhone = siteContactPhone($chatSlug, '0915 888 9482');
        $closeEmail = siteContactEmail($chatSlug, 'contact@alphapremiergroup.com');
        $closeMsg = "This session has been marked as closed by {$adminName}. For further assistance, contact {$closePhone} / {$closeEmail}.";
        // Row lock so two admins closing at once can't both add the note.
        $pdo->beginTransaction();
        $lock = $pdo->prepare('SELECT status FROM chat_sessions WHERE id = ? FOR UPDATE');
        $lock->execute([$sessionId]);
        if ($lock->fetchColumn() === 'closed') {
            $pdo->rollBack();
            sendJson(['success' => false, 'error' => 'This conversation is already closed.', 'status' => 'closed'], 409);
        }
        $insMsg = $pdo->prepare('
            INSERT INTO chat_messages (session_id, sender, sender_admin_id, body)
            VALUES (?, "admin", ?, ?)
        ');
        $insMsg->execute([$sessionId, $adminId, $closeMsg]);

        $upStmt = $pdo->prepare('
            UPDATE chat_sessions
            SET status = "closed", closed_at = NOW(), updated_at = NOW()
            WHERE id = ?
        ');
        $upStmt->execute([$sessionId]);
        $pdo->commit();

        sendJson([
            'success' => true,
            'message' => 'Session closed successfully',
            'status' => 'closed',
        ]);
    }

    sendJson(['success' => false, 'error' => 'Unknown action'], 400);
}

sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
