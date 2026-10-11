<?php
/**
 * /api/admin/users.php
 * Superadmin-only admin account management.
 *
 *   GET          list all admins (id, email, name, role, created_at)
 *   POST         create (email, name, role, password)
 *   PUT          update by id (name, role, password?, email?)
 *   DELETE ?id=  delete the admin row
 *
 * Auth: requireSuperadmin() end to end (superadmin role only).
 * password_hash is NEVER returned.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireSuperadmin();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$allowedRoles = ['superadmin', 'admin', 'recruiter', 'editor'];

/** Counts how many superadmin accounts currently exist. */
function countSuperadmins($pdo) {
    $stmt = $pdo->query("SELECT COUNT(*) FROM admins WHERE role = 'superadmin'");
    return (int)$stmt->fetchColumn();
}

// ---------------------------------------------------------------- GET (list)

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare('SELECT id, email, name, role, created_at FROM admins ORDER BY created_at ASC, id ASC');
        $stmt->execute();
        sendJson(['success' => true, 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to list admin accounts'], 500);
    }
}

// ---------------------------------------------------------------- POST (create)

if ($method === 'POST') {
    $data = jsonBody() ?: $_POST;

    $email = is_string($data['email'] ?? null) ? trim($data['email']) : '';
    $name  = is_string($data['name'] ?? null) ? trim($data['name']) : '';
    $role  = is_string($data['role'] ?? null) ? trim($data['role']) : '';
    $pw    = is_string($data['password'] ?? null) ? $data['password'] : '';

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJson(['success' => false, 'error' => 'A valid email address is required'], 400);
    }
    if ($name === '') {
        sendJson(['success' => false, 'error' => 'Name is required'], 400);
    }
    if (!in_array($role, $allowedRoles, true)) {
        sendJson(['success' => false, 'error' => 'Unknown role "' . $role . '". Allowed: ' . implode(', ', $allowedRoles)], 422);
    }
    if (strlen($pw) < 10) {
        sendJson(['success' => false, 'error' => 'Password must be at least 10 characters'], 400);
    }

    try {
        $dupe = $pdo->prepare('SELECT id FROM admins WHERE email = :email LIMIT 1');
        $dupe->execute([':email' => $email]);
        if ($dupe->fetch()) {
            sendJson(['success' => false, 'error' => 'An admin with the email "' . $email . '" already exists'], 409);
        }

        $stmt = $pdo->prepare('
            INSERT INTO admins (email, name, role, password_hash)
            VALUES (:email, :name, :role, :password_hash)
        ');
        $stmt->execute([
            ':email'         => $email,
            ':name'          => $name,
            ':role'          => $role,
            ':password_hash' => password_hash($pw, PASSWORD_DEFAULT),
        ]);

        sendJson(['success' => true, 'message' => 'Admin account created', 'id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            sendJson(['success' => false, 'error' => 'An admin with the email "' . $email . '" already exists'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to create admin account'], 500);
    }
}

// ---------------------------------------------------------------- PUT (update)

if ($method === 'PUT') {
    $data = jsonBody();

    $id = (int)($data['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid admin id is required'], 400);
    }

    try {
        $existingStmt = $pdo->prepare('SELECT * FROM admins WHERE id = :id LIMIT 1');
        $existingStmt->execute([':id' => $id]);
        $existing = $existingStmt->fetch();
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to load admin account'], 500);
    }

    if (!$existing) {
        sendJson(['success' => false, 'error' => 'Admin account not found'], 404);
    }

    $email = inputText($data, 'email', $existing['email']);
    $name  = inputText($data, 'name', $existing['name']);
    $role  = inputText($data, 'role', $existing['role']);
    if (isset($data['password']) && !is_string($data['password'])) {
        sendJson(['success' => false, 'error' => 'Field "password" must be text.'], 422);
    }
    $hasNewPassword = isset($data['password']) && $data['password'] !== '';

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendJson(['success' => false, 'error' => 'A valid email address is required'], 400);
    }
    if ($name === '') {
        sendJson(['success' => false, 'error' => 'Name is required'], 400);
    }
    if (!in_array($role, $allowedRoles, true)) {
        sendJson(['success' => false, 'error' => 'Unknown role "' . $role . '". Allowed: ' . implode(', ', $allowedRoles)], 422);
    }
    if ($hasNewPassword && strlen((string)$data['password']) < 10) {
        sendJson(['success' => false, 'error' => 'Password must be at least 10 characters'], 400);
    }

    // Cannot demote the last remaining superadmin (including your own account).
    if ($existing['role'] === 'superadmin' && $role !== 'superadmin' && countSuperadmins($pdo) <= 1) {
        sendJson(['success' => false, 'error' => 'Cannot demote the last remaining superadmin'], 403);
    }

    try {
        if ($email !== $existing['email']) {
            $dupe = $pdo->prepare('SELECT id FROM admins WHERE email = :email AND id <> :id LIMIT 1');
            $dupe->execute([':email' => $email, ':id' => $id]);
            if ($dupe->fetch()) {
                sendJson(['success' => false, 'error' => 'Another admin already uses the email "' . $email . '"'], 409);
            }
        }

        $sql = 'UPDATE admins SET email = :email, name = :name, role = :role';
        $params = [':id' => $id, ':email' => $email, ':name' => $name, ':role' => $role];
        if ($hasNewPassword) {
            $sql .= ', password_hash = :password_hash';
            $params[':password_hash'] = password_hash((string)$data['password'], PASSWORD_DEFAULT);
        }
        $sql .= ' WHERE id = :id';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        if ($hasNewPassword) {
            bumpAdminSessionVersion($pdo, $id); // a reset password signs that admin out elsewhere
        }

        sendJson(['success' => true, 'message' => 'Admin account updated']);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            sendJson(['success' => false, 'error' => 'Another admin already uses the email "' . $email . '"'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to update admin account'], 500);
    }
}

// ---------------------------------------------------------------- DELETE

if ($method === 'DELETE') {
    $data = jsonBody();
    $id = (int)($data['id'] ?? $_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid admin id is required'], 400);
    }

    $currentId = (int)($_SESSION['admin_id'] ?? 0);
    if ($id === $currentId) {
        sendJson(['success' => false, 'error' => 'You cannot delete your own account'], 403);
    }

    try {
        $existingStmt = $pdo->prepare('SELECT role FROM admins WHERE id = :id LIMIT 1');
        $existingStmt->execute([':id' => $id]);
        $existing = $existingStmt->fetch();

        if (!$existing) {
            sendJson(['success' => false, 'error' => 'Admin account not found'], 404);
        }

        if ($existing['role'] === 'superadmin' && countSuperadmins($pdo) <= 1) {
            sendJson(['success' => false, 'error' => 'Cannot delete the last remaining superadmin'], 403);
        }

        $stmt = $pdo->prepare('DELETE FROM admins WHERE id = :id');
        $stmt->execute([':id' => $id]);

        sendJson(['success' => true, 'message' => 'Admin account deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to delete admin account'], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
