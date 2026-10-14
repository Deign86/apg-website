<?php
/**
 * PDO Database Singleton
 * Uses prepared statements and secure PDO connection parameters.
 */
require_once __DIR__ . '/config.php';

function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME);
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            // DATETIMEs are Manila wall-clock time (PHP writes date() in Asia/Manila and the admin
            // reads them as +08:00). Hostinger's MySQL runs in UTC, so without this NOW() and
            // CURRENT_TIMESTAMP defaults were stored 8 hours behind. The Philippines has no DST.
            $pdo->exec("SET time_zone = '+08:00'");
        } catch (PDOException $e) {
            error_log('Database Connection Error: ' . $e->getMessage());
            $pdo = null;
            // Return null or throw exception based on caller context
            return null;
        }
    }
    return $pdo;
}
