<?php
/**
 * /api/setup.php
 * One-time setup utility to execute schema.sql and create initial admin user.
 * Can be run via CLI (`php api/setup.php`) or accessed once in browser with security token.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
if (!$pdo) {
    die("Database connection failed. Please check DB_HOST, DB_NAME, DB_USER, and DB_PASS in .env\n");
}

echo "1. Initializing schema from schema.sql...\n";
$sql = file_get_contents(__DIR__ . '/schema.sql');

try {
    $pdo->exec($sql);
    echo "   Schema applied successfully!\n";
} catch (PDOException $e) {
    echo "   Error executing schema: " . $e->getMessage() . "\n";
}

echo "\n2. Checking default admin account...\n";
$defaultEmail = 'admin@alphapremiergroup.com';
$defaultPassword = 'AlphaPremier2026!'; // Change after initial login

try {
    $stmt = $pdo->prepare('SELECT id, email FROM admins WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $defaultEmail]);
    $admin = $stmt->fetch();

    if (!$admin) {
        $hash = password_hash($defaultPassword, PASSWORD_DEFAULT);
        $insert = $pdo->prepare('INSERT INTO admins (email, password_hash, name) VALUES (:email, :hash, :name)');
        $insert->execute([
            ':email' => $defaultEmail,
            ':hash' => $hash,
            ':name' => 'APG Administrator',
        ]);
        echo "   Admin user created:\n   Email: {$defaultEmail}\n   Password: {$defaultPassword}\n";
    } else {
        echo "   Admin user already exists ({$defaultEmail}).\n";
    }
} catch (PDOException $e) {
    echo "   Error checking admin user: " . $e->getMessage() . "\n";
}

echo "\nSetup Complete!\n";
