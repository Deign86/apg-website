<?php
/**
 * Content registry (api/data/content-schema.json, shared with src/data/contentSchema.js):
 * page/field definitions, save-time validation, and server-side reads of stored values
 * (site settings + the private `_private` page: inquiry/HR inboxes, chat notes).
 *
 * Storage: content_blocks(page_slug, section_key, type, value). Field types map to the
 * column ENUM: list/repeater/choices/toggle are stored as JSON with type 'card'.
 * A missing row means "use the registry default" (reset to default = delete the row).
 */
require_once __DIR__ . '/../db.php';

const CONTENT_PRIVATE_PAGE = '_private';
const CONTENT_MAX_TEXT = 20000;
const CONTENT_MAX_ITEMS = 60;

function contentRegistry(): array {
    static $registry = null;
    if ($registry === null) {
        $raw = @file_get_contents(__DIR__ . '/../data/content-schema.json');
        $decoded = is_string($raw) ? json_decode($raw, true) : null;
        $registry = is_array($decoded) ? $decoded : [];
    }
    return $registry;
}

/** Registered field definition for page/key, or null. */
function contentField(string $page, string $key): ?array {
    foreach (contentRegistry()[$page]['sections'] ?? [] as $section) {
        foreach ($section['fields'] ?? [] as $field) {
            if (($field['key'] ?? null) === $key) {
                return $field;
            }
        }
    }
    return null;
}

function contentStorageType(string $fieldType): string {
    return match ($fieldType) {
        'richtext' => 'richtext',
        'image' => 'image',
        'list', 'repeater', 'choices', 'toggle' => 'card',
        default => 'text',
    };
}

/** http(s) URL, a site-relative path, or mailto:/tel:/viber: link (never javascript: and friends). */
function contentIsSafeUrl(string $url): bool {
    if ($url === '') {
        return true;
    }
    if (preg_match('#^/(?!/)#', $url)) {
        return !preg_match('/[\s<>"]/', $url);
    }
    if (preg_match('/^(mailto|tel|viber):[^\s<>"]+$/i', $url)) {
        return true;
    }
    return (bool)preg_match('#^https?://#i', $url) && filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Validates one scalar value against a field type. Returns an error message or null.
 */
function contentScalarError(string $type, $value, array $field): ?string {
    if (!is_string($value)) {
        return 'must be text';
    }
    if (mb_strlen($value) > CONTENT_MAX_TEXT) {
        return 'is too long';
    }
    switch ($type) {
        case 'email':
            return ($value === '' || filter_var($value, FILTER_VALIDATE_EMAIL)) ? null : 'must be a valid email address';
        case 'url':
        case 'image':
            return contentIsSafeUrl(trim($value)) ? null : 'must be a full https:// link or a /site path';
        case 'phone':
            return preg_match('/^[0-9+()\/.\-\s|,]*$/', $value) ? null : 'may only contain digits, spaces and + ( ) / - | ,';
        case 'select':
            return ($value === '' || in_array($value, $field['options'] ?? [], true)) ? null : 'is not an allowed option';
        default:
            return null;
    }
}

/**
 * Validates $value for a registered field. On success returns [storageType, storedString];
 * on failure returns ['error' => message].
 */
function contentValidateField(array $field, $value): array {
    $type = (string)($field['type'] ?? 'text');
    $label = (string)($field['label'] ?? $field['key'] ?? 'Field');
    $storage = contentStorageType($type);

    if ($type === 'toggle') {
        if (!is_bool($value)) {
            return ['error' => "$label must be on or off"];
        }
        return [$storage, json_encode($value)];
    }

    if ($type === 'list' || $type === 'choices') {
        if (!is_array($value) || !contentIsList($value) || count($value) > CONTENT_MAX_ITEMS) {
            return ['error' => "$label must be a list"];
        }
        $allowed = array_map(static fn($o) => is_array($o) ? ($o['value'] ?? null) : $o, $field['options'] ?? []);
        foreach ($value as $item) {
            if (!is_string($item) || mb_strlen($item) > 1000) {
                return ['error' => "$label contains an invalid entry"];
            }
            if ($type === 'choices' && !in_array($item, $allowed, true)) {
                return ['error' => "$label contains an option that does not exist"];
            }
        }
        return [$storage, json_encode(array_values($value), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)];
    }

    if ($type === 'repeater') {
        if (!is_array($value) || !contentIsList($value) || count($value) > CONTENT_MAX_ITEMS) {
            return ['error' => "$label must be a list of items"];
        }
        $itemFields = [];
        foreach ($field['itemFields'] ?? [] as $itemField) {
            $itemFields[$itemField['key']] = $itemField;
        }
        $clean = [];
        foreach ($value as $i => $item) {
            if (!is_array($item) || contentIsList($item) && $item !== []) {
                return ['error' => "$label item " . ($i + 1) . ' is invalid'];
            }
            $row = [];
            foreach ($itemFields as $key => $itemField) {
                $v = $item[$key] ?? '';
                $err = contentScalarError((string)($itemField['type'] ?? 'text'), $v, $itemField);
                if ($err !== null) {
                    return ['error' => "$label item " . ($i + 1) . ': ' . ($itemField['label'] ?? $key) . " $err"];
                }
                $row[$key] = in_array($itemField['type'] ?? 'text', ['url', 'image', 'email'], true) ? trim($v) : $v;
            }
            $clean[] = $row;
        }
        return [$storage, json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)];
    }

    $err = contentScalarError($type, $value, $field);
    if ($err !== null) {
        return ['error' => "$label $err"];
    }
    return [$storage, in_array($type, ['url', 'image', 'email'], true) ? trim($value) : $value];
}

/** Decodes a stored row value for consumers ('card' rows hold JSON). */
function contentDecodeValue(string $storageType, ?string $value) {
    if ($storageType === 'card') {
        $decoded = json_decode((string)$value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }
    return (string)$value;
}

/** Stored (customized) values of a page, decoded; [] when the DB is unavailable. */
function contentStoredValues(string $page): array {
    static $cache = [];
    if (array_key_exists($page, $cache)) {
        return $cache[$page];
    }
    $values = [];
    $pdo = getDbConnection();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare('SELECT section_key, type, value FROM content_blocks WHERE page_slug = :page');
            $stmt->execute([':page' => $page]);
            foreach ($stmt->fetchAll() as $row) {
                $values[$row['section_key']] = contentDecodeValue($row['type'], $row['value']);
            }
        } catch (PDOException $e) {
            error_log('ContentRegistry: ' . $e->getMessage());
        }
    }
    return $cache[$page] = $values;
}

/** First valid email among the stored private keys (in order), else $fallback. */
function contentPrivateEmail(array $keys, string $fallback): string {
    $private = contentStoredValues(CONTENT_PRIVATE_PAGE);
    foreach ($keys as $key) {
        $email = trim((string)($private[$key] ?? ''));
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $email;
        }
    }
    return $fallback;
}

/** Inbox that receives website inquiries for an enterprise (private setting, else MAIL_TO_EMAIL). */
function inquiryInbox(string $slug): string {
    return contentPrivateEmail(["inquiry_inbox_$slug", 'inquiry_inbox'], MAIL_TO_EMAIL);
}

/** Inbox that receives job applications for an enterprise (private setting, else $fallback). */
function hrInbox(string $slug, string $fallback): string {
    return contentPrivateEmail(["hr_inbox_$slug", 'hr_inbox'], $fallback);
}

/** A `site` setting as the SPA sees it: the saved value, else the registry default ('' if neither). */
function siteSettingValue(array $stored, string $key): string {
    $value = $stored[$key] ?? (contentField('site', $key)['default'] ?? '');
    return is_string($value) ? trim($value) : '';
}

/**
 * Public contact email shown for an enterprise, same precedence as the SPA's companyContact():
 * company override (saved or default), else the main site email, else $fallback.
 */
function siteContactEmail(string $slug, string $fallback): string {
    $site = contentStoredValues('site');
    foreach (["co_{$slug}_email", 'email'] as $key) {
        $email = siteSettingValue($site, $key);
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $email;
        }
    }
    return $fallback;
}

/**
 * Public phone line(s) shown for an enterprise, same precedence as the SPA's companyContact():
 * company override (saved or default), else the main site phone, else $fallback.
 */
function siteContactPhone(string $slug, string $fallback): string {
    $site = contentStoredValues('site');
    foreach (["co_{$slug}_phone", 'phone'] as $key) {
        $phone = siteSettingValue($site, $key);
        if ($phone !== '') {
            return $phone;
        }
    }
    return $fallback;
}

/** array_is_list() polyfill (PHP 8.0 hosts). */
function contentIsList(array $value): bool {
    return $value === [] || array_keys($value) === range(0, count($value) - 1);
}
