<?php
/**
 * Alpha Premier Group — API Configuration
 * Supports Hostinger MySQL, PHPMailer / SMTP, and Session configurations.
 */

// Timezone
date_default_timezone_set('Asia/Manila');

// Start session if not already active
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.cookie_secure', 1);
    session_start();
}

// Load .env if it exists in project root or api folder
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            $value = trim($value, '"\'');
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("$name=$value");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

loadEnv(__DIR__ . '/../.env');
loadEnv(__DIR__ . '/../.env.local');

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'apg_website');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') !== false ? getenv('DB_PASS') : '');

// SMTP / Email Configuration (Hostinger SMTP / Business Email)
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.hostinger.com');
define('SMTP_PORT', getenv('SMTP_PORT') ?: 465);
define('SMTP_SECURE', getenv('SMTP_SECURE') ?: 'ssl'); // ssl or tls
define('SMTP_USER', getenv('SMTP_USER') ?: 'contact@alphapremiergroup.com');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');
define('MAIL_FROM_EMAIL', getenv('MAIL_FROM_EMAIL') ?: (getenv('SMTP_USER') ?: 'contact@alphapremiergroup.com'));
define('MAIL_FROM_NAME', getenv('MAIL_FROM_NAME') ?: 'Alpha Premier Group');
define('MAIL_TO_EMAIL', getenv('MAIL_TO_EMAIL') ?: 'contact@alphapremiergroup.com');

// Helper to send JSON responses. No CORS headers: the SPA is same-origin
// (production) or proxied through Vite (dev).
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Reject automated public-form submissions and cap repeated requests per IP. */
function guardPublicFormSubmission(array $data) {
    if (!empty($data['website'])) {
        sendJson(['success' => false, 'error' => 'Unable to process submission.'], 400);
    }

    $startedAt = filter_var($data['form_started_at'] ?? null, FILTER_VALIDATE_INT);
    $elapsed = $startedAt === false ? -1 : (int)floor(microtime(true) * 1000) - $startedAt;
    if ($elapsed < 3000 || $elapsed > 14400000) {
        sendJson(['success' => false, 'error' => 'Please review the form and try again.'], 400);
    }

    if (!rateLimit('form-' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 600)) {
        sendJson(['success' => false, 'error' => 'Too many submissions. Please try again in a few minutes.'], 429);
    }
}

/**
 * Sliding-window limiter backed by a flock'd temp file per bucket.
 * Returns false when $bucket already has $max hits inside $windowSeconds.
 * With $record = false it only checks (used to count failures, not attempts).
 */
function rateLimit($bucket, $max, $windowSeconds, $record = true) {
    $rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'apg-rl-' . hash('sha256', (string)$bucket) . '.json';
    $handle = fopen($rateFile, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        if (is_resource($handle)) fclose($handle);
        sendJson(['success' => false, 'error' => 'Unable to process request. Please try again later.'], 503);
    }

    $raw = stream_get_contents($handle);
    $hits = json_decode($raw ?: '[]', true);
    $now = time();
    $hits = is_array($hits) ? array_values(array_filter($hits, static fn($time) => is_int($time) && $time > $now - $windowSeconds)) : [];
    $allowed = count($hits) < $max;

    if ($allowed && $record) {
        $hits[] = $now;
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($hits));
        fflush($handle);
    }
    flock($handle, LOCK_UN);
    fclose($handle);
    return $allowed;
}

/**
 * Rejects cross-site state-changing requests: a present Origin header must be
 * this site (or localhost for dev). Browsers always send Origin on POST/PUT/DELETE fetches.
 */
function requireSameOrigin() {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($method === 'GET' || $method === 'HEAD' || $method === 'OPTIONS' || $origin === '') {
        return;
    }
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $allowed = [
        'https://alphapremiergroup.com',
        'https://www.alphapremiergroup.com',
        $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? ''),
    ];
    if (in_array($origin, $allowed, true) || preg_match('#^http://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin)) {
        return;
    }
    sendJson(['success' => false, 'error' => 'Cross-origin request rejected.'], 403);
}

/**
 * Directory the site is served from: the Vite `public/` dir in dev (repo root
 * has one), or public_html itself in production where api/ sits beside index.html.
 */
function webRootDir() {
    $root = dirname(__DIR__);
    return is_dir($root . '/public') ? $root . '/public' : $root;
}

function destroyAdminSession() {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
}

// Helper to verify admin session. The role is re-read from the database on
// every request so a deleted or demoted admin loses access immediately.
function requireAdminAuth() {
    if (empty($_SESSION['admin_logged_in']) || empty($_SESSION['admin_id'])) {
        sendJson(['success' => false, 'error' => 'Unauthorized. Please log in.'], 401);
    }
    requireSameOrigin();
    if (currentAdminRole() === '') {
        destroyAdminSession();
        sendJson(['success' => false, 'error' => 'Unauthorized. Please log in.'], 401);
    }
}

/**
 * Current admin's role, read from the `admins` table for the session's admin_id
 * (memoized per request). Returns '' when there is no session or the admin row
 * no longer exists.
 */
function currentAdminRole() {
    static $role = null;
    if ($role !== null) {
        return $role;
    }

    if (empty($_SESSION['admin_id'])) {
        return '';
    }

    $pdo = getDbConnection();
    if (!$pdo) {
        sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
    }

    try {
        $stmt = $pdo->prepare('SELECT role FROM admins WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $_SESSION['admin_id']]);
        $role = (string)($stmt->fetchColumn() ?: '');
    } catch (PDOException $e) {
        error_log('currentAdminRole: ' . $e->getMessage());
        sendJson(['success' => false, 'error' => 'Database error'], 500);
    }

    $_SESSION['admin_role'] = $role;
    return $role;
}

/**
 * Requires an authenticated admin whose role is in $allowed.
 *
 * Policy note: article management currently allows any authenticated admin for
 * any enterprise (see api/admin/blogs.php). This helper exists so future
 * endpoints can tighten that without re-plumbing auth.
 */
function requireAdminRole(array $allowed) {
    requireAdminAuth();

    $role = currentAdminRole();
    if ($role === '') {
        sendJson(['success' => false, 'error' => 'Session role could not be resolved. Please log in again.'], 403);
    }
    if (!in_array($role, $allowed, true)) {
        sendJson([
            'success' => false,
            'error' => 'Your role (' . $role . ') is not permitted to perform this action.',
        ], 403);
    }
}

/**
 * Capability map — the single source of truth for admin RBAC.
 *
 * Reads: every authenticated role may GET most endpoints (requireAdminAuth()
 * alone). Exceptions holding visitor/candidate PII — applicants and chat —
 * also require their capability on GET. Capabilities otherwise gate non-GET
 * (write/delete) access via requireAdminCapability().
 *
 * MUST stay in sync with src/data/permissions.js (UI-only mirror; the
 * server is the enforcement point).
 */
function adminCapabilities() {
    return [
        'blogs'      => ['superadmin', 'admin', 'editor'],
        'content'    => ['superadmin', 'admin', 'editor'],
        'services'   => ['superadmin', 'admin', 'editor'],
        'listings'   => ['superadmin', 'admin'],
        'careers'    => ['superadmin', 'admin', 'recruiter'],
        'applicants' => ['superadmin', 'admin', 'recruiter'],
        'chat'       => ['superadmin', 'admin', 'recruiter'],
        'delete'     => ['superadmin', 'admin'],
        'users'      => ['superadmin'],
    ];
}

function adminRoleCan($role, $capability) {
    $map = adminCapabilities();
    if (!isset($map[$capability])) {
        return false;
    }
    return in_array((string)$role, $map[$capability], true);
}

/**
 * Requires the current admin's role to hold $capability.
 * Calls requireAdminAuth() first (unauthenticated -> 401), then 403 on
 * denial. Never fails open: an unresolvable role is a 403 with a
 * "please log in again" message.
 */
function requireAdminCapability($capability) {
    requireAdminAuth();

    $role = currentAdminRole();
    if ($role === '') {
        sendJson(['success' => false, 'error' => 'Session role could not be resolved. Please log in again.'], 403);
    }
    if (!adminRoleCan($role, $capability)) {
        sendJson(['success' => false, 'error' => 'Your role (' . $role . ') is not permitted to ' . $capability . '.'], 403);
    }
}

/** Convenience guard for admin account management: superadmin only. */
function requireSuperadmin() {
    requireAdminCapability('users');
}

/**
 * Canonical enterprise slugs. Mirrors src/data/enterprises.js and the
 * /subsidiaries/<slug> URL segments in src/App.jsx. Keep all three in sync.
 */
function enterpriseSlugs() {
    return [
        'corporate',
        'virtual-office',
        'realty',
        'luxe-prime',
        'swiftclear',
        '88prime',
        'alta-venture',
        'dynamic-tree',
        'construction',
    ];
}

function isValidEnterpriseSlug($slug) {
    return in_array($slug, enterpriseSlugs(), true);
}

/**
 * Legacy and human-readable spellings mapped to their canonical slug.
 *
 * The codebase accumulated several divergent spellings before src/data/enterprises.js
 * became the single source of truth. Rows written by older code (and by the
 * free-text enterprise field on public forms) still carry these, so they must
 * keep resolving rather than silently defaulting to corporate.
 */
function enterpriseAliases() {
    return [
        // corporate
        'general'      => 'corporate',
        'apg-main'     => 'corporate',
        'apg'          => 'corporate',
        'group'        => 'corporate',
        'parent'       => 'corporate',
        // swiftclear
        'swift-clear'  => 'swiftclear',
        'swift_clear'  => 'swiftclear',
        'swift clear'  => 'swiftclear',
        'clean'        => 'swiftclear',
        'facility'     => 'swiftclear',
        // 88prime
        '88-prime'     => '88prime',
        '88_prime'     => '88prime',
        '88 prime'     => '88prime',
        'prime88'      => '88prime',
        '88'           => '88prime',
        // alta-venture
        'altaventure'  => 'alta-venture',
        'alta_venture' => 'alta-venture',
        'alta venture' => 'alta-venture',
        'alta'         => 'alta-venture',
        'outsource'    => 'alta-venture',
        'bpo'          => 'alta-venture',
        // virtual-office
        'virtualoffice'  => 'virtual-office',
        'virtual_office' => 'virtual-office',
        'virtual office' => 'virtual-office',
        'virtual'        => 'virtual-office',
        // dynamic-tree
        'dynamictree'  => 'dynamic-tree',
        'dynamic_tree' => 'dynamic-tree',
        'dynamic tree' => 'dynamic-tree',
        'dynamic'      => 'dynamic-tree',
        'media'        => 'dynamic-tree',
        'talent'       => 'dynamic-tree',
        // luxe-prime
        'luxeprime'    => 'luxe-prime',
        'luxe_prime'   => 'luxe-prime',
        'luxe prime'   => 'luxe-prime',
        'luxe'         => 'luxe-prime',
        // realty
        'alpha-realty' => 'realty',
        'alpha realty' => 'realty',
    ];
}

/**
 * Resolves arbitrary enterprise input to a canonical slug.
 *
 * Accepts a canonical slug, a legacy alias, or free text such as
 * "Swift Clear Facility & Cleaning" from a public form field.
 *
 * Returns $default when nothing matches. Order matters: 'luxe' is tested before
 * 'realty' because "Luxe Prime Realty" contains both.
 */
function resolveEnterpriseSlug($raw, $default = 'corporate') {
    $value = strtolower(trim((string)$raw));
    if ($value === '') {
        return $default;
    }

    if (isValidEnterpriseSlug($value)) {
        return $value;
    }

    $aliases = enterpriseAliases();
    if (isset($aliases[$value])) {
        return $aliases[$value];
    }

    // Free text: longest alias first so 'alta venture' beats 'alta', and the
    // ordered list below keeps 'luxe' ahead of the 'realty' substring.
    $keywords = array_keys($aliases);
    usort($keywords, fn($a, $b) => strlen($b) <=> strlen($a));

    // Canonical slugs that are also useful as keywords, plus short aliases.
    // Order matters: 'luxe' must be tested before 'realty' because
    // "Luxe Prime Realty" contains both.
    $priority = ['luxe-prime', 'luxe', 'swiftclear', 'swift', '88prime', '88',
                 'alta-venture', 'alta', 'dynamic-tree', 'dynamic',
                 'virtual-office', 'virtual', 'construction', 'contract',
                 'realty', 'corporate'];

    foreach ($priority as $needle) {
        if (!str_contains($value, $needle)) {
            continue;
        }
        if (isValidEnterpriseSlug($needle)) {
            return $needle;
        }
        if (isset($aliases[$needle])) {
            return $aliases[$needle];
        }
        // A keyword that maps to nothing on its own (e.g. bare 'swift') must not
        // stop the search — fall through so longer aliases still get a chance.
    }

    foreach ($keywords as $needle) {
        if (str_contains($value, $needle)) {
            return $aliases[$needle];
        }
    }

    return $default;
}

/**
 * Guards the one-shot migration utilities (setup.php, migrate-blogs.php).
 *
 * These endpoints run schema migrations and can create admin accounts, so they
 * must never be publicly runnable. Fail-closed by design: if SETUP_TOKEN is not
 * configured, every HTTP request is refused.
 *
 * Allowed:
 *   - CLI (`php api/setup.php`) — always permitted, used for local dev and SSH deploys.
 *   - HTTP with a matching `X-Setup-Token` header (query-string tokens leak into logs).
 *
 * Refusals return 404 rather than 401/403 so the endpoint's existence is not disclosed.
 */
function requireSetupToken() {
    if (PHP_SAPI === 'cli') {
        return;
    }

    $expected = (string)(getenv('SETUP_TOKEN') ?: '');
    $given = $_SERVER['HTTP_X_SETUP_TOKEN'] ?? '';
    if (!is_string($given)) {
        $given = '';
    }

    if ($expected === '' || !hash_equals($expected, $given)) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Not Found';
        exit;
    }
}
