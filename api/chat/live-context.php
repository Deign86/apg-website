<?php
/**
 * Live site data for the chat assistant (api/chat/message.php): active job openings, published
 * services/products/packages, site contact settings and the staff's private assistant notes, read
 * from MySQL on each request so answers follow admin edits without touching api/data/knowledge.md.
 *
 * Every reader is defensive: a missing table, page or key yields the current hardcoded defaults
 * (or nothing), never an error. Lists are capped to keep the prompt small.
 */

/** Current public contact details; site settings (content_blocks page 'site') override them. */
const CHAT_DEFAULT_CONTACTS = [
    'phone' => '0915 888 9482',
    'landline' => '(02) 8 650 2540',
    'email' => 'contact@alphapremiergroup.com',
];

/** Virtual Office plans used by the FAQ bot when the database cannot be read. */
const CHAT_DEFAULT_VO_PACKAGES = [
    ['title' => 'Premier Access', 'price' => '₱2,899 / mo'],
    ['title' => 'Premier Prestige', 'price' => '₱3,499 / mo'],
    ['title' => 'Alpha Premier', 'price' => '₱4,999 / mo'],
    ['title' => 'Custom Solutions', 'price' => 'Contact for Price'],
];

/**
 * One content_blocks page as key => value (JSON values decoded), or [] when the page, table or
 * database is unavailable. Memoized per request.
 */
function chatContentPage(?PDO $pdo, string $page): array {
    static $cache = [];
    if (array_key_exists($page, $cache)) {
        return $cache[$page];
    }
    $values = [];
    if ($pdo) {
        try {
            $stmt = $pdo->prepare('SELECT section_key, value FROM content_blocks WHERE page_slug = :page ORDER BY sort_order ASC, id ASC');
            $stmt->execute([':page' => $page]);
            foreach ($stmt->fetchAll() as $row) {
                $raw = trim((string)$row['value']);
                if ($raw === '') {
                    continue;
                }
                $decoded = json_decode($raw, true);
                $values[(string)$row['section_key']] = is_array($decoded) ? $decoded : $raw;
            }
        } catch (PDOException $e) {
            error_log('Chat live context: content page ' . $page . ' unreadable: ' . $e->getMessage());
        }
    }
    return $cache[$page] = $values;
}

/** First non-empty string among the given setting keys (a list value yields its first string). */
function chatSettingValue(array $settings, array $keys): ?string {
    foreach ($keys as $key) {
        $value = $settings[$key] ?? null;
        if (is_array($value)) {
            $value = array_values(array_filter($value, static fn($v) => is_string($v) && trim($v) !== ''))[0] ?? null;
        }
        if (is_string($value) && trim($value) !== '') {
            return mb_substr(trim($value), 0, 120);
        }
    }
    return null;
}

/** Main phone / landline / email: site settings when set, otherwise today's values. */
function chatSiteContacts(?PDO $pdo): array {
    $site = chatContentPage($pdo, 'site');
    return [
        'phone' => chatSettingValue($site, ['main_phone', 'phone', 'phone_main', 'mobile', 'main_mobile', 'phones', 'main_phones']) ?? CHAT_DEFAULT_CONTACTS['phone'],
        'landline' => chatSettingValue($site, ['main_landline', 'landline', 'phone_landline']) ?? CHAT_DEFAULT_CONTACTS['landline'],
        'email' => chatSettingValue($site, ['main_email', 'email', 'email_main', 'contact_email']) ?? CHAT_DEFAULT_CONTACTS['email'],
    ];
}

/** Published Virtual Office plans (title + price), or the defaults when unreadable or none. */
function chatVirtualOfficePackages(?PDO $pdo): array {
    static $packages = null;
    if ($packages !== null) {
        return $packages;
    }
    $packages = CHAT_DEFAULT_VO_PACKAGES;
    if ($pdo) {
        try {
            $rows = $pdo->query("SELECT title, price FROM service_items WHERE category = 'virtual-office' AND is_published = 1 ORDER BY sort_order ASC, id ASC LIMIT 12")->fetchAll();
            if ($rows !== []) {
                $packages = $rows;
            }
        } catch (PDOException $e) {
            error_log('Chat live context: virtual office packages unreadable: ' . $e->getMessage());
        }
    }
    return $packages;
}

/** One line of plain text from a setting value (lists joined, objects as compact JSON). */
function chatSettingText($value, int $max = 400): string {
    if (is_array($value)) {
        $isList = array_is_list($value) && array_filter($value, static fn($v) => !is_scalar($v)) === [];
        $value = $isList ? implode(', ', array_map('strval', $value)) : json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
    $text = preg_replace('/\s+/u', ' ', trim((string)$value));
    return mb_substr($text, 0, $max);
}

/**
 * The live data block appended to the assistant's knowledge base. $titles maps enterprise slugs to
 * company names. Each section is skipped when its source is empty or unreadable.
 */
function chatLiveContext(?PDO $pdo, array $titles): string {
    if (!$pdo) {
        return '';
    }
    $name = static fn($slug) => $titles[$slug] ?? (string)$slug;
    $sections = [];

    // Contact details and other public site settings (content_blocks page 'site').
    $contacts = chatSiteContacts($pdo);
    $lines = [
        "- Main mobile: {$contacts['phone']}. Landline: {$contacts['landline']}.",
        "- Main email: {$contacts['email']}.",
    ];
    $count = 0;
    foreach (chatContentPage($pdo, 'site') as $key => $value) {
        if ($count++ >= 40) {
            break;
        }
        $text = chatSettingText($value);
        if ($text !== '') {
            $lines[] = '- ' . str_replace('_', ' ', mb_substr((string)$key, 0, 60)) . ': ' . $text;
        }
    }
    $sections[] = "### Contact details and site settings (current; these replace older contact details above)\n" . implode("\n", $lines);

    // Published services, catalog products and priced packages.
    try {
        $rows = $pdo->query('SELECT category, kind, title, price FROM service_items WHERE is_published = 1 ORDER BY category ASC, kind ASC, sort_order ASC, id ASC LIMIT 120')->fetchAll();
        if ($rows !== []) {
            $kindLabel = ['service' => 'service', 'product' => 'product', 'package' => 'plan'];
            $lines = [];
            foreach ($rows as $row) {
                $price = trim((string)($row['price'] ?? ''));
                $lines[] = '- ' . $name($row['category']) . ' — ' . mb_substr($row['title'], 0, 120)
                    . ' (' . ($kindLabel[$row['kind'] ?? 'service'] ?? 'service') . ')'
                    . ($price !== '' ? ': ' . mb_substr($price, 0, 80) : '');
            }
            $sections[] = "### Services, products and plans published on the website (current prices; these override any other price above)\n" . implode("\n", $lines);
        }
    } catch (PDOException $e) {
        error_log('Chat live context: services unreadable: ' . $e->getMessage());
    }

    // Active job openings.
    try {
        $rows = $pdo->query("SELECT title, enterprise_slug, type, location FROM job_openings WHERE status = 'active' ORDER BY enterprise_slug ASC, sort_order ASC, id ASC LIMIT 60")->fetchAll();
        $sections[] = "### Open job positions (current; apply at /careers or on the company's own site)\n" . ($rows === []
            ? '- No openings are posted right now; visitors can send a general application at /careers.'
            : implode("\n", array_map(static function ($row) use ($name) {
                $details = array_filter([mb_substr(trim((string)$row['type']), 0, 40), mb_substr(trim((string)$row['location']), 0, 80)], 'strlen');
                return '- ' . $name($row['enterprise_slug']) . ' — ' . mb_substr($row['title'], 0, 120)
                    . ($details !== [] ? ' (' . implode(', ', $details) . ')' : '');
            }, $rows)));
    } catch (PDOException $e) {
        error_log('Chat live context: job openings unreadable: ' . $e->getMessage());
    }

    // Private notes from staff for the assistant (never shown on the public site).
    $notes = chatContentPage($pdo, '_private')['chat_notes'] ?? null;
    if ($notes !== null) {
        $text = is_array($notes) ? chatSettingText($notes, 2000) : mb_substr(trim((string)$notes), 0, 2000);
        if ($text !== '') {
            $sections[] = "### Notes from the APG team (reference information)\n" . $text;
        }
    }

    return "## Live website data (read from the website database just now; newer than anything above)\n\n" . implode("\n\n", $sections) . "\n";
}
