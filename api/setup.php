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
    echo "   Note during schema execution: " . $e->getMessage() . "\n";
}

// 1.1 Idempotent column migrations on existing tables
echo "\n1.1 Running column and index migrations...\n";
$migrations = [
    "ALTER TABLE `blog_posts` ADD COLUMN `enterprise_slug` VARCHAR(100) NOT NULL DEFAULT 'corporate' AFTER `category`",
    "ALTER TABLE `blog_posts` ADD INDEX `idx_enterprise` (`enterprise_slug`)",
    "ALTER TABLE `admins` ADD COLUMN `role` ENUM('superadmin', 'admin', 'recruiter', 'editor') NOT NULL DEFAULT 'admin' AFTER `name`",
    "CREATE TABLE IF NOT EXISTS `chat_sessions` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `session_token` VARCHAR(64) NOT NULL UNIQUE,
      `enterprise_slug` VARCHAR(100) NOT NULL DEFAULT 'apg-main',
      `visitor_name` VARCHAR(255) DEFAULT NULL,
      `visitor_email` VARCHAR(255) DEFAULT NULL,
      `visitor_phone` VARCHAR(100) DEFAULT NULL,
      `status` ENUM('bot', 'waiting_for_agent', 'agent_active', 'closed') NOT NULL DEFAULT 'bot',
      `assigned_admin_id` INT DEFAULT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `closed_at` DATETIME DEFAULT NULL,
      INDEX `idx_chat_status` (`status`),
      INDEX `idx_chat_token` (`session_token`),
      INDEX `idx_chat_enterprise` (`enterprise_slug`),
      CONSTRAINT `fk_chat_sessions_admin` FOREIGN KEY (`assigned_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    "CREATE TABLE IF NOT EXISTS `chat_messages` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `session_id` INT NOT NULL,
      `sender` ENUM('visitor', 'bot', 'admin') NOT NULL,
      `sender_admin_id` INT DEFAULT NULL,
      `body` TEXT NOT NULL,
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX `idx_chat_messages_session` (`session_id`),
      INDEX `idx_chat_messages_created` (`created_at`),
      CONSTRAINT `fk_chat_messages_session` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE,
      CONSTRAINT `fk_chat_messages_admin` FOREIGN KEY (`sender_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
];

foreach ($migrations as $migrationSql) {
    try {
        $pdo->exec($migrationSql);
        echo "   Applied migration: " . substr($migrationSql, 0, 50) . "...\n";
    } catch (PDOException $e) {
        // Ignore duplicate column/index errors silently or log note
        if (!str_contains($e->getMessage(), 'Duplicate column') && !str_contains($e->getMessage(), 'Duplicate key name')) {
            // Other non-fatal note
        }
    }
}

// 1.2 Initialize secure uploads directory
$uploadDir = __DIR__ . '/../uploads/resumes';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
    echo "   Created uploads directory: uploads/resumes\n";
}
$htaccessFile = $uploadDir . '/.htaccess';
if (!file_exists($htaccessFile)) {
    file_put_contents($htaccessFile, "# Prevent PHP script execution in uploads\n<FilesMatch \"\\.(php|phtml|php3|php4|php5|phps)$\">\n    Order Deny,Allow\n    Deny from all\n</FilesMatch>\nOptions -Indexes\n");
    echo "   Created security .htaccess in uploads/resumes\n";
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
