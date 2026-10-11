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

/** Decoded JSON request body; [] when it is missing, invalid, or a scalar (never a non-array). */
function jsonBody(): array {
    $data = json_decode((string)file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

/**
 * Text field from decoded request input (JSON body, $_POST or $_GET): trimmed string, or $default
 * when missing/null. An array/object value ends the request with 422 instead of a TypeError fatal.
 */
function inputText(array $source, string $key, string $default = ''): string {
    $value = $source[$key] ?? null;
    if ($value === null) {
        return $default;
    }
    if (!is_scalar($value)) {
        sendJson(['success' => false, 'error' => "Field \"{$key}\" must be text."], 422);
    }
    return trim((string)$value);
}

// Cloudflare Turnstile (free bot check on public forms). Blank secret = check disabled.
define('TURNSTILE_SECRET_KEY', getenv('TURNSTILE_SECRET_KEY') ?: '');

// Published at https://www.cloudflare.com/ips/ — only these proxies may set CF-Connecting-IP.
const CLOUDFLARE_PROXY_RANGES = [
    '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
    '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
    '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
    '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
    '2a06:98c0::/29', '2c0f:f248::/32',
];

function ipInCidr(string $ip, string $cidr): bool {
    [$subnet, $bits] = explode('/', $cidr);
    $ipBin = @inet_pton($ip);
    $subnetBin = @inet_pton($subnet);
    if ($ipBin === false || $subnetBin === false || strlen($ipBin) !== strlen($subnetBin)) {
        return false;
    }
    $fullBytes = intdiv((int)$bits, 8);
    $remainder = (int)$bits % 8;
    if (substr($ipBin, 0, $fullBytes) !== substr($subnetBin, 0, $fullBytes)) {
        return false;
    }
    if ($remainder === 0) {
        return true;
    }
    $mask = chr((0xFF << (8 - $remainder)) & 0xFF);
    return ($ipBin[$fullBytes] & $mask) === ($subnetBin[$fullBytes] & $mask);
}

/**
 * Visitor IP for rate limiting. Behind the Cloudflare proxy REMOTE_ADDR is a shared
 * Cloudflare edge, so the real address comes from CF-Connecting-IP — trusted only
 * when the request really arrived from a Cloudflare range (otherwise it is spoofable).
 */
function clientIp(): string {
    $remote = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $forwarded = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '';
    if ($forwarded === '' || filter_var($forwarded, FILTER_VALIDATE_IP) === false) {
        return $remote;
    }
    foreach (CLOUDFLARE_PROXY_RANGES as $range) {
        if (ipInCidr($remote, $range)) {
            return $forwarded;
        }
    }
    return $remote;
}

/**
 * Verifies a Turnstile token with Cloudflare. A definite "not human" fails; if Cloudflare
 * itself is unreachable the submission is let through (logged) so real leads are never lost.
 */
function verifyTurnstile(string $token): bool {
    if (TURNSTILE_SECRET_KEY === '') {
        return true;
    }
    if ($token === '' || strlen($token) > 2048) {
        return false;
    }

    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => TURNSTILE_SECRET_KEY,
            'response' => $token,
            'remoteip' => clientIp(),
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = is_string($body) ? json_decode($body, true) : null;
    if ($status !== 200 || !is_array($result)) {
        error_log('Turnstile siteverify unreachable (HTTP ' . $status . '); allowing submission.');
        return true;
    }
    return ($result['success'] ?? false) === true;
}

/** Per-IP rate-limit bucket for one public form kind (inquiry, newsletter, feedback, application). */
function publicFormBucket(string $kind): string {
    return 'form-' . $kind . '-' . clientIp();
}

/**
 * Reject automated public-form submissions and cap repeated requests per IP. The cap (5 accepted
 * submissions per 10 minutes, per form kind) is only checked here; the caller counts a submission
 * with recordPublicFormSubmission() once it has passed validation, so typos never use up the budget.
 */
function guardPublicFormSubmission(array $data, string $kind) {
    if (!empty($data['website'])) {
        sendJson(['success' => false, 'error' => 'Unable to process submission.'], 400);
    }

    $startedAt = filter_var($data['form_started_at'] ?? null, FILTER_VALIDATE_INT);
    $elapsed = $startedAt === false ? -1 : (int)floor(microtime(true) * 1000) - $startedAt;
    if ($elapsed < 3000 || $elapsed > 14400000) {
        sendJson(['success' => false, 'error' => 'Please review the form and try again.'], 400);
    }

    // Link spam: real leads don't put URLs in their name or paste a pile of links.
    $linkPattern = '~https?://|www\.|\[url~i';
    $name = $data['name'] ?? $data['fullName'] ?? $data['full_name'] ?? '';
    $text = implode(' ', array_filter($data, 'is_string'));
    if ((is_string($name) && preg_match($linkPattern, $name)) || preg_match_all($linkPattern, $text) > 2) {
        sendJson(['success' => false, 'error' => 'Please remove links from your message and try again.'], 400);
    }

    if (!rateLimit(publicFormBucket($kind), 5, 600, false)) {
        sendJson(['success' => false, 'error' => 'Too many submissions. Please try again in a few minutes.'], 429);
    }

    $token = $data['turnstile_token'] ?? '';
    if (!verifyTurnstile(is_string($token) ? $token : '')) {
        sendJson(['success' => false, 'error' => 'Security check failed. Please refresh the page and try again.'], 403);
    }
}

/** Counts one accepted submission of $kind against this IP's budget (see guardPublicFormSubmission). */
function recordPublicFormSubmission(string $kind): void {
    if (!rateLimit(publicFormBucket($kind), 5, 600)) {
        // Parallel requests can slip past the check in the guard; the recording call is authoritative.
        sendJson(['success' => false, 'error' => 'Too many submissions. Please try again in a few minutes.'], 429);
    }
}

/**
 * Sliding-window limiter backed by a flock'd temp file per bucket.
 * Returns false when $bucket already has $max hits inside $windowSeconds.
 * With $record = false it only checks (used to count failures, not attempts).
 */
function rateLimitFile($bucket) {
    return rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'apg-rl-' . hash('sha256', (string)$bucket) . '.json';
}

// Automated test servers only (tests/support/stack.mjs): lifts every rateLimit() cap so a suite can
// submit many forms from 127.0.0.1. Honoured only by PHP's built-in dev server (`php -S`, never
// Apache/LiteSpeed in production) and only when the process env sets APG_TEST_MODE=1.
define('APG_TEST_MODE', PHP_SAPI === 'cli-server' && getenv('APG_TEST_MODE') === '1');

function rateLimit($bucket, $max, $windowSeconds, $record = true) {
    if (APG_TEST_MODE) {
        return true;
    }
    $handle = fopen(rateLimitFile($bucket), 'c+');
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
 * CSRF guard for the cookie-authenticated admin API (requireAdminAuth() and the login/logout/reset
 * actions in admin/auth.php). Every state-changing request must name this site (or localhost for
 * dev) in its Origin header or, when a browser leaves Origin out, in its Referer.
 * Browsers send Origin on every cross-origin request and on same-origin POST/PUT/DELETE fetches, and
 * the site's Referrer-Policy (strict-origin-when-cross-origin) keeps a same-origin Referer, so the
 * admin SPA always passes. A request with neither header is refused: it can only come from a
 * non-browser client, and these endpoints act on the session cookie, so "no header" is never taken
 * as proof of same-origin. Public forms (inquire, applicants, chat) deliberately do not call this:
 * they carry no session authority, so there is nothing to forge, and they are protected by
 * guardPublicFormSubmission() (honeypot, timing, rate limit, Turnstile) instead.
 */
function requireSameOrigin() {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET' || $method === 'HEAD' || $method === 'OPTIONS') {
        return;
    }
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === '') {
        $referer = parse_url((string)($_SERVER['HTTP_REFERER'] ?? ''));
        if (is_array($referer) && isset($referer['scheme'], $referer['host'])) {
            $origin = strtolower($referer['scheme']) . '://' . strtolower($referer['host']) . (isset($referer['port']) ? ':' . $referer['port'] : '');
        }
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

/** Clears a rateLimit() bucket (e.g. an account's failed-login count after it signs in). */
function rateLimitReset($bucket) {
    @unlink(rateLimitFile($bucket));
}

/**
 * Ends every session of $adminId issued before now (password changed): sessions carry the
 * admins.session_version they were issued with and currentAdminRole() rejects stale ones.
 * The caller's own session is kept when it belongs to that admin.
 */
function bumpAdminSessionVersion(PDO $pdo, int $adminId) {
    $pdo->prepare('UPDATE admins SET session_version = session_version + 1 WHERE id = :id')
        ->execute([':id' => $adminId]);
    if ((int)($_SESSION['admin_id'] ?? 0) === $adminId) {
        $stmt = $pdo->prepare('SELECT session_version FROM admins WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $adminId]);
        $_SESSION['admin_session_version'] = (int)$stmt->fetchColumn();
    }
}

// Helper to verify admin session. The role is re-read from the database on
// every request so a deleted or demoted admin (or a session from before a
// password change) loses access immediately.
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
        $stmt = $pdo->prepare('SELECT role, email, name, session_version FROM admins WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $_SESSION['admin_id']]);
        $admin = $stmt->fetch();
        // A session issued before the admin's last password change is no longer valid.
        if ($admin && (int)$admin['session_version'] !== (int)($_SESSION['admin_session_version'] ?? 0)) {
            $admin = false;
        }
        $role = (string)($admin['role'] ?? '');
        if ($admin) {
            // Keep the session's display identity in step with edits made in Users.
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_name'] = $admin['name'];
        }
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
 * alone). Exceptions holding visitor/candidate PII — applicants, chat and
 * inquiries — also require their capability on GET (listings too: Drive ids). Capabilities otherwise gate non-GET
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
        'careers'    => ['superadmin', 'admin', 'recruiter'],
        'applicants' => ['superadmin', 'admin', 'recruiter'],
        'chat'       => ['superadmin', 'admin', 'recruiter'],
        'delete'     => ['superadmin', 'admin'],
        'users'      => ['superadmin'],
        'listings'   => ['superadmin', 'admin', 'editor'],
        'inquiries'  => ['superadmin', 'admin'],
        'private_settings' => ['superadmin', 'admin'], // _private content page: inboxes, chat notes
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
    $value = is_scalar($raw) ? strtolower(trim((string)$raw)) : '';
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
 * Guards the one-shot migration utilities (setup.php, migrate.php).
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
