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
