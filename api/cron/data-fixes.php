<?php
/**
 * Deploy-time data fixes (CLI only), run by tools/hostinger-update.sh after each release is copied:
 *   php api/cron/data-fixes.php
 * Applies the pending one-off corrections in api/lib/DataFixes.php; already-applied ones are skipped.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/DataFixes.php';

$pdo = getDbConnection();
if (!$pdo) {
    fwrite(STDERR, "data-fixes: database connection failed
");
    exit(1);
}
$failures = runDataFixes($pdo, static function (string $line): void { echo "data-fixes: {$line}
"; });
exit($failures > 0 ? 1 : 0);
