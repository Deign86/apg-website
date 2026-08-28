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
    ini_set('session.cookie_samesite', 'Lax');
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', 1);
    }
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

// Helper to send JSON responses with CORS headers
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Helper to verify admin session
function requireAdminAuth() {
    if (empty($_SESSION['admin_logged_in']) || empty($_SESSION['admin_id'])) {
        sendJson(['success' => false, 'error' => 'Unauthorized. Please log in.'], 401);
    }
}
