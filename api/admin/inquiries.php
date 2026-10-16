<?php
/**
 * /api/admin/inquiries.php — Inquiries inbox (capability 'inquiries'; visitor PII, so GET is gated too).
 *
 * GET                     list, newest first, a page at a time (?limit= 1-200, default 50; the next page
 *                         with ?before_at=&before_id= of the last loaded row, or ?offset=);
 *                         `total` is the full match count. Rows carry meta without replies (?id= has them).
 *                         filters: kind, enterprise, status, from/to (YYYY-MM-DD), q (name/email/phone/subject/message),
 *                         hide=archived (every status but archived; the Inbox default)
 * GET ?id=N               one inquiry with the full message
 * GET ?action=summary     unread counts for the dashboard and sidebar
 * GET ?action=export      CSV of the filtered list (UTF-8 BOM, formula-injection safe)
 * POST ?action=reply { id, message }  emails the inquirer (enterprise theme, Reply-To the public inbox),
 *                         then sets status 'replied' and appends {at, by, body} to meta.replies.
 *                         Not for newsletter rows; 502 (nothing saved) when the mail server refuses it.
 * PUT { id, status }      new | read | replied | archived
 * PUT ?action=archive_replied   archives every replied inquiry matching the list filters; returns `count`
 * DELETE ?id=N            permanent delete (also needs capability 'delete')
 * DELETE ?action=delete_archived  permanently deletes every archived inquiry matching the list filters
 *                         (capability 'delete'); returns `count`. Neither bulk action touches newsletter rows.
 *
 * Rows are written by api/inquire.php (contact + listing inquiries, newsletter sign-ups, feedback).
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminCapability('inquiries');

$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

const INQUIRY_KINDS = ['inquiry', 'listing', 'newsletter', 'feedback', 'application_question'];
const INQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'];
const INQUIRY_PAGE_SIZE = 50;

$method = $_SERVER['REQUEST_METHOD'];
$action = is_string($_GET['action'] ?? null) ? $_GET['action'] : '';

/** Decoded meta column; anything unexpected becomes an empty object. */
function inquiryMeta(?string $json): array {
    $meta = json_decode((string)$json, true);
    return is_array($meta) ? $meta : [];
}

/** WHERE clause + bound params from validated query-string filters (invalid values are a 400). */
function inquiryFilters(): array {
    $where = [];
    $params = [];
    $get = static fn(string $key): string => is_string($_GET[$key] ?? null) ? trim($_GET[$key]) : '';

    if (($kind = $get('kind')) !== '') {
        if (!in_array($kind, INQUIRY_KINDS, true)) {
            sendJson(['success' => false, 'error' => 'Unknown kind'], 400);
        }
        $where[] = 'kind = :kind';
        $params[':kind'] = $kind;
    } elseif ($get('exclude') === 'newsletter') {
        $where[] = "kind <> 'newsletter'";
    }
    if (($enterprise = $get('enterprise')) !== '') {
        if (!isValidEnterpriseSlug($enterprise)) {
            sendJson(['success' => false, 'error' => 'Unknown enterprise'], 400);
        }
        $where[] = 'enterprise_slug = :enterprise';
        $params[':enterprise'] = $enterprise;
    }
    if (($status = $get('status')) !== '') {
        if (!in_array($status, INQUIRY_STATUSES, true)) {
            sendJson(['success' => false, 'error' => 'Unknown status'], 400);
        }
        $where[] = 'status = :status';
        $params[':status'] = $status;
    } elseif ($get('hide') === 'archived') {
        $where[] = "status <> 'archived'";
    }
    foreach (['from' => '>=', 'to' => '<'] as $key => $op) {
        if (($value = $get($key)) === '') {
            continue;
        }
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        if ($date === false || $date->format('Y-m-d') !== $value) {
            sendJson(['success' => false, 'error' => "Invalid {$key} date (use YYYY-MM-DD)"], 400);
        }
        $where[] = "created_at {$op} :{$key}";
        $params[":{$key}"] = ($key === 'to' ? $date->modify('+1 day') : $date)->format('Y-m-d H:i:s');
    }
    if (($q = $get('q')) !== '') {
        if (mb_strlen($q) > 200) {
            sendJson(['success' => false, 'error' => 'Search is limited to 200 characters'], 400);
        }
        // Native prepares forbid reusing a named placeholder.
        $like = '%' . addcslashes($q, '%_\\') . '%';
        $columns = ['name', 'email', 'phone', 'subject', 'message'];
        $where[] = '(' . implode(' OR ', array_map(static fn($c, $i) => "{$c} LIKE :q{$i}", $columns, array_keys($columns))) . ')';
        foreach (array_keys($columns) as $i) {
            $params[":q{$i}"] = $like;
        }
    }
    return [$where === [] ? '' : 'WHERE ' . implode(' AND ', $where), $params];
}

/** Spreadsheet-safe CSV cell: text starting with = + - @ (or tab/CR) is prefixed with ' so it is never run as a formula. */
function csvCell($value): string {
    $value = (string)($value ?? '');
    return preg_match('/^[=+\-@\t\r]/', $value) ? "'" . $value : $value;
}

try {
    if ($method === 'GET' && $action === 'summary') {
        $rows = $pdo->query("SELECT kind, COUNT(*) AS n FROM inquiries WHERE status = 'new' GROUP BY kind")->fetchAll();
        $byKind = array_fill_keys(INQUIRY_KINDS, 0);
        foreach ($rows as $row) {
            $byKind[$row['kind']] = (int)$row['n'];
        }
        sendJson(['success' => true, 'summary' => [
            'unread' => array_sum($byKind) - $byKind['newsletter'],
            'by_kind' => $byKind,
            'subscribers' => (int)$pdo->query("SELECT COUNT(*) FROM inquiries WHERE kind = 'newsletter'")->fetchColumn(),
        ]]);
    }

    if ($method === 'GET' && $action === 'export') {
        [$where, $params] = inquiryFilters();
        $stmt = $pdo->prepare("SELECT id, created_at, updated_at, kind, enterprise_slug, status, name, email, phone, subject, message, meta FROM inquiries {$where} ORDER BY created_at DESC, id DESC");
        $stmt->execute($params);

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="inquiries-' . date('Ymd-Hi') . '.csv"');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        $out = fopen('php://output', 'w');
        fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel shows ₱, ñ, etc.
        fputcsv($out, ['ID', 'Received', 'Last activity', 'Kind', 'Company', 'Status', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Reference', 'Listing', 'Details'], ',', '"', '');
        while ($row = $stmt->fetch()) {
            $meta = inquiryMeta($row['meta']);
            $details = [];
            foreach (['company', 'service', 'topic', 'position', 'budget', 'timeline', 'type', 'property', 'attachment'] as $key) {
                if (isset($meta[$key]) && is_string($meta[$key])) {
                    $details[] = ucfirst($key) . ': ' . $meta[$key];
                }
            }
            foreach (is_array($meta['fields'] ?? null) ? $meta['fields'] : [] as $label => $value) {
                $details[] = $label . ': ' . (is_string($value) ? $value : '');
            }
            fputcsv($out, array_map('csvCell', [
                $row['id'], $row['created_at'], $row['updated_at'], $row['kind'], $row['enterprise_slug'], $row['status'],
                $row['name'], $row['email'], $row['phone'], $row['subject'], $row['message'],
                $meta['ticket'] ?? '', trim(($meta['listing_ref'] ?? '') . ' ' . ($meta['listing_title'] ?? '')),
                implode('; ', $details),
            ]), ',', '"', '');
        }
        fclose($out);
        exit;
    }

    if ($method === 'GET' && isset($_GET['id'])) {
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id === false) {
            sendJson(['success' => false, 'error' => 'Invalid inquiry ID'], 400);
        }
        $stmt = $pdo->prepare('SELECT * FROM inquiries WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            sendJson(['success' => false, 'error' => 'Inquiry not found'], 404);
        }
        $row['meta'] = inquiryMeta($row['meta']);
        sendJson(['success' => true, 'data' => $row]);
    }

    if ($method === 'GET') {
        [$where, $params] = inquiryFilters();
        $limit = filter_var($_GET['limit'] ?? INQUIRY_PAGE_SIZE, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 200]]);
        $offset = filter_var($_GET['offset'] ?? 0, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
        if ($limit === false || $offset === false) {
            sendJson(['success' => false, 'error' => 'limit must be 1-200 and offset 0 or more'], 400);
        }
        $count = $pdo->prepare("SELECT COUNT(*) FROM inquiries {$where}");
        $count->execute($params);
        // ?before_at=&before_id= (the last loaded row) continue strictly after it, so rows another
        // admin deletes or re-statuses meanwhile can't shift the next page the way an offset does.
        $pageWhere = $where;
        $pageParams = $params;
        if (isset($_GET['before_id'])) {
            $beforeId = filter_var($_GET['before_id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            $beforeAt = is_string($_GET['before_at'] ?? null) ? $_GET['before_at'] : '';
            $at = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $beforeAt);
            if ($beforeId === false || $at === false || $at->format('Y-m-d H:i:s') !== $beforeAt) {
                sendJson(['success' => false, 'error' => 'before_id must be an id and before_at YYYY-MM-DD HH:MM:SS'], 400);
            }
            $pageWhere = ($where === '' ? 'WHERE ' : "{$where} AND ") . '(created_at < :before_at OR (created_at = :before_at2 AND id < :before_id))';
            $pageParams += [':before_at' => $beforeAt, ':before_at2' => $beforeAt, ':before_id' => $beforeId];
        }
        $stmt = $pdo->prepare('SELECT id, kind, enterprise_slug, name, email, phone, subject, LEFT(message, 240) AS excerpt, meta, status, created_at, updated_at
            FROM inquiries ' . $pageWhere . " ORDER BY created_at DESC, id DESC LIMIT {$limit} OFFSET {$offset}");
        $stmt->execute($pageParams);
        $rows = array_map(static function (array $row): array {
            $row['id'] = (int)$row['id'];
            $row['meta'] = inquiryMeta($row['meta']);
            // Sent reply bodies (up to 5000 chars each) are read only in the drawer, which loads ?id=.
            unset($row['meta']['replies']);
            return $row;
        }, $stmt->fetchAll());
        sendJson(['success' => true, 'data' => $rows, 'total' => (int)$count->fetchColumn(), 'limit' => $limit, 'offset' => $offset]);
    }

    if ($method === 'POST' && $action === 'reply') {
        require_once __DIR__ . '/../lib/Mailer.php';
        require_once __DIR__ . '/../lib/EmailTemplate.php';
        $data = jsonBody();
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        $body = trim(str_replace(["\0", "\r\n", "\r"], ['', "\n", "\n"], inputText($data, 'message')));
        if ($id === false) {
            sendJson(['success' => false, 'error' => 'Invalid inquiry ID'], 400);
        }
        if ($body === '' || mb_strlen($body) > 5000) {
            sendJson(['success' => false, 'error' => 'The reply must be 1 to 5000 characters.'], 400);
        }
        $stmt = $pdo->prepare('SELECT * FROM inquiries WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            sendJson(['success' => false, 'error' => 'Inquiry not found'], 404);
        }
        if ($row['kind'] === 'newsletter') {
            sendJson(['success' => false, 'error' => 'Newsletter sign-ups cannot be replied to.'], 400);
        }
        if (!rateLimit('inquiry-reply-' . (int)$_SESSION['admin_id'], 30, 3600)) {
            sendJson(['success' => false, 'error' => 'Too many replies sent in the last hour. Please wait and try again.'], 429);
        }

        $meta = inquiryMeta($row['meta']);
        $ticket = is_string($meta['ticket'] ?? null) ? $meta['ticket'] : '';
        $t = emailTheme((string)$row['enterprise_slug']);
        $subject = trim('Re: ' . ($ticket !== '' ? "[{$ticket}] " : '') . ($row['subject'] ?: "Your inquiry with {$t['name']}"));
        $rows = $ticket !== '' ? [emailRow('Reference', '<span style="font-variant-numeric:tabular-nums;">' . emailEsc($ticket) . '</span>')] : [];
        $rows[] = emailRow('Contact us', emailLink('mailto:' . $t['inbox'], $t['inbox'], $t));
        $html = emailRender($t, [
            'preheader' => mb_substr(preg_replace('/\s+/', ' ', $body), 0, 120),
            'eyebrow' => 'Reply from ' . $t['name'],
            'title' => 'Hi ' . emailSafeFirstName((string)$row['name']) . ',',
            'intro' => $body,
            'rows' => $rows,
            'quote' => $row['message'] ? ['Your message', (string)$row['message']] : null,
            'note' => 'Reply to this email to continue the conversation' . ($ticket !== '' ? ' and keep the reference number in the subject.' : '.'),
            'ref' => $ticket,
        ]);
        // The SMTP send takes seconds: release the session lock first so the admin's other requests
        // (sidebar poll, opening another screen) don't queue behind it. $_SESSION stays readable.
        session_write_close();
        // Reply-To is the enterprise's public inbox (one that receives mail), as on the visitor confirmation.
        if (!emailSend($t, (string)$row['email'], $subject, $html, $t['inbox'], $t['name'])) {
            sendJson(['success' => false, 'error' => 'The mail server did not accept the reply, so nothing was sent and the inquiry was not marked replied. Try again, or use "Open in mail app".'], 502);
        }

        $reply = ['at' => date('Y-m-d H:i:s'), 'by' => (string)($_SESSION['admin_name'] ?? 'Admin'), 'body' => $body];
        try {
            $pdo->beginTransaction();
            $lock = $pdo->prepare('SELECT meta FROM inquiries WHERE id = :id FOR UPDATE');
            $lock->execute([':id' => $id]);
            $meta = inquiryMeta($lock->fetchColumn() ?: null);
            $meta['replies'] = array_merge(is_array($meta['replies'] ?? null) ? $meta['replies'] : [], [$reply]);
            $pdo->prepare("UPDATE inquiries SET status = 'replied', meta = :meta WHERE id = :id")->execute([
                ':meta' => json_encode($meta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE),
                ':id' => $id,
            ]);
            $pdo->commit();
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('admin/inquiries reply: sent but not saved for #' . $id . ': ' . $e->getMessage());
            sendJson(['success' => false, 'error' => 'The reply was emailed, but saving it to the inbox failed.'], 500);
        }
        sendJson(['success' => true, 'data' => ['id' => $id, 'status' => 'replied', 'replies' => $meta['replies']]]);
    }

    // Bulk clean-up of handled inquiries, scoped by the same filters as the list the admin is looking at.
    if (($method === 'PUT' && $action === 'archive_replied') || ($method === 'DELETE' && $action === 'delete_archived')) {
        if ($method === 'DELETE') {
            requireAdminCapability('delete');
        }
        [$where, $params] = inquiryFilters();
        $scope = ($where === '' ? 'WHERE ' : "{$where} AND ") . "kind <> 'newsletter' AND status = "
            . ($method === 'PUT' ? "'replied'" : "'archived'");
        $stmt = $pdo->prepare($method === 'PUT'
            ? "UPDATE inquiries SET status = 'archived' {$scope}"
            : "DELETE FROM inquiries {$scope}");
        $stmt->execute($params);
        sendJson(['success' => true, 'count' => $stmt->rowCount()]);
    }

    if ($method === 'PUT') {
        $data = json_decode((string)file_get_contents('php://input'), true);
        $id = is_array($data) ? filter_var($data['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) : false;
        $status = is_array($data) && is_string($data['status'] ?? null) ? $data['status'] : '';
        if ($id === false || !in_array($status, INQUIRY_STATUSES, true)) {
            sendJson(['success' => false, 'error' => 'A valid id and status (new, read, replied, archived) are required'], 400);
        }
        $stmt = $pdo->prepare('UPDATE inquiries SET status = :status WHERE id = :id');
        $stmt->execute([':status' => $status, ':id' => $id]);
        $exists = $pdo->prepare('SELECT status, updated_at FROM inquiries WHERE id = :id');
        $exists->execute([':id' => $id]);
        $row = $exists->fetch();
        if (!$row) {
            sendJson(['success' => false, 'error' => 'Inquiry not found'], 404);
        }
        sendJson(['success' => true, 'data' => ['id' => $id] + $row]);
    }

    if ($method === 'DELETE') {
        requireAdminCapability('delete');
        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id === false) {
            sendJson(['success' => false, 'error' => 'Invalid inquiry ID'], 400);
        }
        $stmt = $pdo->prepare('DELETE FROM inquiries WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) {
            sendJson(['success' => false, 'error' => 'Inquiry not found'], 404);
        }
        sendJson(['success' => true]);
    }
} catch (PDOException $e) {
    error_log('admin/inquiries: ' . $e->getMessage());
    sendJson(['success' => false, 'error' => 'Database error'], 500);
}

sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
