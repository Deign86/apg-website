<?php
/**
 * /api/admin/inquiries.php — Inquiries inbox (capability 'inquiries'; visitor PII, so GET is gated too).
 *
 * GET                     list, newest first (max 500 rows; `total` is the full match count)
 *                         filters: kind, enterprise, status, from/to (YYYY-MM-DD), q (name/email/phone/subject/message)
 * GET ?id=N               one inquiry with the full message
 * GET ?action=summary     unread counts for the dashboard and sidebar
 * GET ?action=export      CSV of the filtered list (UTF-8 BOM, formula-injection safe)
 * PUT { id, status }      new | read | replied | archived
 * DELETE ?id=N            permanent delete (also needs capability 'delete')
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
const INQUIRY_LIST_LIMIT = 500;

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
        $count = $pdo->prepare("SELECT COUNT(*) FROM inquiries {$where}");
        $count->execute($params);
        $stmt = $pdo->prepare('SELECT id, kind, enterprise_slug, name, email, phone, subject, LEFT(message, 240) AS excerpt, meta, status, created_at, updated_at
            FROM inquiries ' . $where . ' ORDER BY created_at DESC, id DESC LIMIT ' . INQUIRY_LIST_LIMIT);
        $stmt->execute($params);
        $rows = array_map(static function (array $row): array {
            $row['id'] = (int)$row['id'];
            $row['meta'] = inquiryMeta($row['meta']);
            return $row;
        }, $stmt->fetchAll());
        sendJson(['success' => true, 'data' => $rows, 'total' => (int)$count->fetchColumn(), 'limit' => INQUIRY_LIST_LIMIT]);
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
