<?php
/**
 * Test database lifecycle (CLI only; run by tests/support/stack.mjs with DB_NAME=<test db> in the env).
 *
 *   php tests/support/reset-db.php create   drop + recreate the test DB and apply api/schema.sql
 *   php tests/support/reset-db.php seed     seed the role accounts the suites log in as
 *
 * api/migrate.php runs between the two (as on a fresh production install). Refuses to touch any
 * database whose name does not end in "_test", so it can never drop the dev or production data.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../../api/config.php';

$step = $argv[1] ?? '';
if (!preg_match('/_test$/', DB_NAME)) {
    fwrite(STDERR, "Refusing to reset '" . DB_NAME . "': test database names must end in _test.\n");
    exit(2);
}

$dsn = sprintf('mysql:host=%s;port=%s;charset=utf8mb4', DB_HOST, DB_PORT);
$pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

if ($step === 'create') {
    $pdo->exec('DROP DATABASE IF EXISTS `' . DB_NAME . '`');
    $pdo->exec('CREATE DATABASE `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $pdo->exec('USE `' . DB_NAME . '`');
    $sql = (string)file_get_contents(__DIR__ . '/../../api/schema.sql');
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    foreach (preg_split('/;\s*\n/', $sql) as $statement) {
        if (trim($statement) !== '') {
            $pdo->exec($statement);
        }
    }
    echo "schema applied to " . DB_NAME . "\n";
    exit(0);
}

if ($step === 'seed') {
    $pdo->exec('USE `' . DB_NAME . '`');
    $qaEmail = (string)getenv('LOCAL_QA_ADMIN_EMAIL');
    $qaPassword = (string)getenv('LOCAL_QA_ADMIN_PASSWORD');
    $rolePassword = (string)getenv('APG_TEST_ROLE_PASSWORD');
    if ($qaEmail === '' || $qaPassword === '' || strlen($rolePassword) < 10) {
        fwrite(STDERR, "LOCAL_QA_ADMIN_EMAIL/PASSWORD (.env.local) and APG_TEST_ROLE_PASSWORD are required.\n");
        exit(1);
    }
    $insert = $pdo->prepare('INSERT INTO admins (email, password_hash, name, role) VALUES (:email, :hash, :name, :role)');
    $accounts = [
        [$qaEmail, $qaPassword, 'QA Superadmin', 'superadmin'],
        ['qa-admin@apg.test', $rolePassword, 'QA Admin', 'admin'],
        ['qa-editor@apg.test', $rolePassword, 'QA Editor', 'editor'],
        ['qa-recruiter@apg.test', $rolePassword, 'QA Recruiter', 'recruiter'],
    ];
    foreach ($accounts as [$email, $password, $name, $role]) {
        $insert->execute([':email' => $email, ':hash' => password_hash($password, PASSWORD_DEFAULT), ':name' => $name, ':role' => $role]);
    }
    echo count($accounts) . " admin accounts seeded\n";
    exit(0);
}

fwrite(STDERR, "usage: php tests/support/reset-db.php create|seed\n");
exit(1);
