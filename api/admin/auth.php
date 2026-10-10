<?php
/**
 * /api/admin/auth.php
 * Handles Admin login, logout, and session check using native PHP session cookies.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    sendJson(['status' => 'ok']);
}

// Check session status
if ($action === 'check' || ($method === 'GET' && empty($action))) {
    if (!empty($_SESSION['admin_logged_in']) && !empty($_SESSION['admin_id']) && currentAdminRole() !== '') {
        sendJson([
            'authenticated' => true,
            'user' => [
                'id' => $_SESSION['admin_id'],
                'email' => $_SESSION['admin_email'],
                'name' => $_SESSION['admin_name'] ?? 'Administrator',
                'role' => currentAdminRole()
            ]
        ]);
    } else {
        if (!empty($_SESSION['admin_id'])) {
            destroyAdminSession();
        }
        sendJson(['authenticated' => false, 'user' => null]);
    }
}

// Logout (POST only so a cross-site link/image cannot log an admin out)
if ($action === 'logout') {
    if ($method !== 'POST') {
        sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
    }
    requireSameOrigin();
    destroyAdminSession();
    sendJson(['success' => true, 'message' => 'Logged out successfully']);
}

// Change own password (any role), two steps:
//   1. action=password-code {current_password}: verifies it, emails a one-time 6-digit
//      code to SECURITY_EMAIL (default thealphapremiergroup@gmail.com).
//   2. action=password {code, new_password}: code is single-use, 10 min, 5 attempts.
if ($action === 'password-code' || $action === 'password') {
    if ($method !== 'POST') {
        sendJson(['success' => false, 'error' => 'Method not allowed'], 405);
    }
    requireAdminAuth();
    $adminId = (int)$_SESSION['admin_id'];
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    $pdo = getDbConnection();
    if (!$pdo) {
        sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
    }
    $stmt = $pdo->prepare('SELECT password_hash FROM admins WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $adminId]);
    $hash = (string)$stmt->fetchColumn();

    if ($action === 'password-code') {
        $current = is_string($data['current_password'] ?? null) ? $data['current_password'] : '';
        $bucket = 'pwcode-' . $adminId;
        if (!rateLimit($bucket, 3, 900, false)) {
            sendJson(['success' => false, 'error' => 'Too many code requests. Please try again in 15 minutes.'], 429);
        }
        rateLimit($bucket, 3, 900);
        if ($hash === '' || !password_verify($current, $hash)) {
            sendJson(['success' => false, 'error' => 'Current password is incorrect'], 403);
        }

        $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        require_once __DIR__ . '/../lib/Mailer.php';
        $to = getenv('SECURITY_EMAIL') ?: 'thealphapremiergroup@gmail.com';
        $who = htmlspecialchars((string)($_SESSION['admin_email'] ?? ''), ENT_QUOTES, 'UTF-8');
        $body = '<p>A password change was requested for the APG admin account <strong>' . $who . '</strong>.</p>'
            . '<p style="font-size:28px;letter-spacing:6px;font-weight:bold">' . $code . '</p>'
            . '<p>This code expires in 10 minutes. If you did not request this, ignore this email and review your admin accounts.</p>';
        if (!(new Mailer())->send($to, 'APG admin password change code', $body)) {
            sendJson(['success' => false, 'error' => 'Could not send the verification email. Check the site email settings.'], 502);
        }
        $_SESSION['pw_code'] = ['hash' => password_hash($code, PASSWORD_DEFAULT), 'expires' => time() + 600, 'tries' => 0];
        sendJson(['success' => true, 'message' => 'Verification code sent']);
    }

    // action === 'password'
    $code = is_string($data['code'] ?? null) ? trim($data['code']) : '';
    $new = is_string($data['new_password'] ?? null) ? $data['new_password'] : '';
    $pending = $_SESSION['pw_code'] ?? null;
    if (!is_array($pending) || $pending['expires'] < time() || $pending['tries'] >= 5) {
        unset($_SESSION['pw_code']);
        sendJson(['success' => false, 'error' => 'The code has expired. Request a new one.'], 400);
    }
    if (!password_verify($code, $pending['hash'])) {
        $_SESSION['pw_code']['tries']++;
        sendJson(['success' => false, 'error' => 'Incorrect verification code'], 403);
    }
    if (mb_strlen($new) < 10) {
        sendJson(['success' => false, 'error' => 'New password must be at least 10 characters'], 400);
    }
    if ($hash !== '' && password_verify($new, $hash)) {
        sendJson(['success' => false, 'error' => 'New password must be different from the current one'], 400);
    }

    $pdo->prepare('UPDATE admins SET password_hash = :hash WHERE id = :id')
        ->execute([':hash' => password_hash($new, PASSWORD_DEFAULT), ':id' => $adminId]);
    unset($_SESSION['pw_code']);
    session_regenerate_id(true);
    sendJson(['success' => true, 'message' => 'Password updated']);
}

// Login
if ($method === 'POST') {
    requireSameOrigin();
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $email = is_string($data['email'] ?? null) ? trim($data['email']) : '';
    $password = is_string($data['password'] ?? null) ? trim($data['password']) : '';

    if (empty($email) || empty($password)) {
        sendJson(['success' => false, 'error' => 'Email and password are required'], 400);
    }

    // Brute-force throttle: 5 failed attempts per IP and per email per 15 minutes.
    $ipBucket = 'login-ip-' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $emailBucket = 'login-email-' . strtolower($email);
    if (!rateLimit($ipBucket, 5, 900, false) || !rateLimit($emailBucket, 5, 900, false)) {
        sendJson(['success' => false, 'error' => 'Too many failed login attempts. Please try again in 15 minutes.'], 429);
    }

    $pdo = getDbConnection();
    if (!$pdo) {
        sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
    }

    try {
        $stmt = $pdo->prepare('SELECT id, email, password_hash, name, role FROM admins WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            $role = !empty($admin['role']) ? $admin['role'] : 'admin';

            // Bootstrap: a site with no superadmin can never manage users. Promote the
            // original setup account (lowest id) — and only that one — when it signs in.
            if ($role !== 'superadmin'
                && (int)$pdo->query("SELECT COUNT(*) FROM admins WHERE role = 'superadmin'")->fetchColumn() === 0
                && (int)$pdo->query('SELECT MIN(id) FROM admins')->fetchColumn() === (int)$admin['id']) {
                $pdo->prepare("UPDATE admins SET role = 'superadmin' WHERE id = :id")->execute([':id' => (int)$admin['id']]);
                $role = 'superadmin';
            }

            // Success: new session id to prevent fixation
            session_regenerate_id(true);
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_name'] = $admin['name'];
            $_SESSION['admin_role'] = $role;

            sendJson([
                'success' => true,
                'user' => [
                    'id' => $admin['id'],
                    'email' => $admin['email'],
                    'name' => $admin['name'],
                    'role' => $role
                ]
            ]);
        } else {
            rateLimit($ipBucket, 5, 900);
            rateLimit($emailBucket, 5, 900);
            sendJson(['success' => false, 'error' => 'Invalid email or password'], 401);
        }
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Authentication query failed'], 500);
    }
}

sendJson(['error' => 'Invalid request'], 400);
