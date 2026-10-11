<?php
/**
 * /api/admin/content.php
 * Gated admin endpoint for the content registry (api/data/content-schema.json):
 *   GET    ?page=slug                                       stored rows of a page (all pages when omitted)
 *   POST   { page_slug, values: { key: value } }            validated batch save (guided editor)
 *   POST   { page_slug, raw: { section_key, type, value } } superadmin raw save (Advanced view)
 *   DELETE ?page=slug&key=key                               reset one field to its default (deletes the row)
 *   POST   ?action=upload_image                             image upload -> { url }
 * The private `_private` page (inboxes, chat notes) needs the private_settings capability.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/ContentRegistry.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// -------------------------------------------------------------
// Action: Upload Image (multipart, shared helper: images only, 5MB, getimagesize)
// -------------------------------------------------------------
if ($action === 'upload_image' || ($method === 'POST' && isset($_FILES['image']))) {
    requireAdminCapability('content');
    require_once __DIR__ . '/../lib/upload-image.php';
    handleAdminImageUpload('content', 'content');
}

/** Capability needed to read/write a page; unknown pages are rejected. */
function contentPageCapability(string $page): string {
    if (!isset(contentRegistry()[$page])) {
        sendJson(['success' => false, 'error' => 'Unknown page'], 400);
    }
    return $page === CONTENT_PRIVATE_PAGE ? 'private_settings' : 'content';
}

function contentFail(string $error, ?string $key = null, int $status = 400): void {
    sendJson(['success' => false, 'error' => $error] + ($key !== null ? ['key' => $key] : []), $status);
}

function contentUpsert(PDO $pdo, string $page, string $key, string $type, string $value): void {
    $stmt = $pdo->prepare('
        INSERT INTO content_blocks (page_slug, section_key, type, value, sort_order)
        VALUES (:page_slug, :section_key, :type, :value, 0)
        ON DUPLICATE KEY UPDATE type = VALUES(type), value = VALUES(value), updated_at = NOW()
    ');
    $stmt->execute([':page_slug' => $page, ':section_key' => $key, ':type' => $type, ':value' => $value]);
}

if ($method === 'GET') {
    $page = is_string($_GET['page'] ?? null) ? trim($_GET['page']) : '';
    try {
        if ($page !== '') {
            requireAdminCapability(contentPageCapability($page));
            $stmt = $pdo->prepare('SELECT * FROM content_blocks WHERE page_slug = :page ORDER BY sort_order ASC, id ASC');
            $stmt->execute([':page' => $page]);
        } elseif (adminRoleCan(currentAdminRole(), 'private_settings')) {
            $stmt = $pdo->query('SELECT * FROM content_blocks ORDER BY page_slug ASC, sort_order ASC, id ASC');
        } else {
            $stmt = $pdo->prepare('SELECT * FROM content_blocks WHERE page_slug <> :private ORDER BY page_slug ASC, sort_order ASC, id ASC');
            $stmt->execute([':private' => CONTENT_PRIVATE_PAGE]);
        }
        sendJson(['success' => true, 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        contentFail('A server error occurred. Please try again.', null, 500);
    }
}

if ($method === 'POST' || $method === 'PUT') {
    $data = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($data)) {
        contentFail('Invalid JSON body');
    }
    $page = is_string($data['page_slug'] ?? null) ? trim($data['page_slug']) : '';
    requireAdminCapability(contentPageCapability($page));

    // Advanced (raw keys): superadmin only, any key on a registered page.
    if (array_key_exists('raw', $data)) {
        requireSuperadmin();
        $raw = is_array($data['raw']) ? $data['raw'] : [];
        $key = is_string($raw['section_key'] ?? null) ? trim($raw['section_key']) : '';
        $type = $raw['type'] ?? '';
        $value = $raw['value'] ?? null;
        if (!preg_match('/^[A-Za-z0-9_.-]{1,100}$/', $key) || !in_array($type, ['text', 'richtext', 'image', 'card'], true) || !is_string($value)) {
            contentFail('Key (letters, digits, _ . -), type and a text value are required');
        }
        if (mb_strlen($value) > CONTENT_MAX_TEXT * 5) {
            contentFail('Value is too long', $key);
        }
        $field = contentField($page, $key);
        if ($field !== null && contentStorageType((string)$field['type']) !== $type) {
            contentFail("This key is a registered {$field['type']} field; store it as type " . contentStorageType((string)$field['type']), $key);
        }
        $input = $value;
        if ($type === 'card') {
            $input = json_decode($value, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                contentFail('Value is not valid JSON', $key);
            }
        }
        if ($field !== null) {
            $checked = contentValidateField($field, $input);
            if (isset($checked['error'])) {
                contentFail($checked['error'], $key);
            }
            $value = $checked[1];
        }
        try {
            contentUpsert($pdo, $page, $key, $type, $value);
            sendJson(['success' => true, 'message' => 'Saved']);
        } catch (PDOException $e) {
            error_log(basename(__FILE__) . ': ' . $e->getMessage());
            contentFail('A server error occurred. Please try again.', null, 500);
        }
    }

    // Guided editor: validate every field first, then write them all in one transaction.
    $values = $data['values'] ?? null;
    if (!is_array($values) || $values === [] || contentIsList($values) || count($values) > 300) {
        contentFail('values must be an object of field values');
    }
    $rows = [];
    foreach ($values as $key => $value) {
        $key = (string)$key;
        $field = contentField($page, $key);
        if ($field === null) {
            contentFail("Unknown field: $key", $key);
        }
        $checked = contentValidateField($field, $value);
        if (isset($checked['error'])) {
            contentFail($checked['error'], $key);
        }
        $rows[$key] = $checked;
    }
    try {
        $pdo->beginTransaction();
        foreach ($rows as $key => [$type, $stored]) {
            contentUpsert($pdo, $page, $key, $type, $stored);
        }
        $pdo->commit();
        sendJson(['success' => true, 'message' => count($rows) . ' field(s) saved']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        contentFail('A server error occurred. Please try again.', null, 500);
    }
}

// Reset to default: removes the stored value so the registry default renders again.
if ($method === 'DELETE') {
    $page = is_string($_GET['page'] ?? null) ? trim($_GET['page']) : '';
    $key = is_string($_GET['key'] ?? null) ? trim($_GET['key']) : '';
    requireAdminCapability(contentPageCapability($page));
    if ($key === '') {
        contentFail('key is required');
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM content_blocks WHERE page_slug = :page AND section_key = :key');
        $stmt->execute([':page' => $page, ':key' => $key]);
        sendJson(['success' => true, 'message' => 'Reset to default']);
    } catch (PDOException $e) {
        error_log(basename(__FILE__) . ': ' . $e->getMessage());
        contentFail('A server error occurred. Please try again.', null, 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
