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
    if (!empty($_SESSION['admin_logged_in']) && !empty($_SESSION['admin_id'])) {
        sendJson([
            'authenticated' => true,
            'user' => [
                'id' => $_SESSION['admin_id'],
                'email' => $_SESSION['admin_email'],
                'name' => $_SESSION['admin_name'] ?? 'Administrator',
                'role' => 'admin'
            ]
        ]);
    } else {
        sendJson(['authenticated' => false, 'user' => null]);
    }
}

// Logout
if ($action === 'logout' || ($method === 'POST' && $action === 'logout')) {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    sendJson(['success' => true, 'message' => 'Logged out successfully']);
}

// Login
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $email = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');

    if (empty($email) || empty($password)) {
        sendJson(['success' => false, 'error' => 'Email and password are required'], 400);
    }

    $pdo = getDbConnection();
    if (!$pdo) {
        sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
    }

    try {
        $stmt = $pdo->prepare('SELECT id, email, password_hash, name FROM admins WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            // Success
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_email'] = $admin['email'];
            $_SESSION['admin_name'] = $admin['name'];

            sendJson([
                'success' => true,
                'user' => [
                    'id' => $admin['id'],
                    'email' => $admin['email'],
                    'name' => $admin['name'],
                    'role' => 'admin'
                ]
            ]);
        } else {
            sendJson(['success' => false, 'error' => 'Invalid email or password'], 401);
        }
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Authentication query failed'], 500);
    }
}

sendJson(['error' => 'Invalid request'], 400);
