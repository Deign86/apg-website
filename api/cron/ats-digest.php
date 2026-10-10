<?php
/**
 * ATS safety net (CLI only; the filename is kept for the existing cron job):
 *   php api/cron/ats-digest.php
 *
 * Applications are emailed to HR the moment they are submitted (api/applicants.php). This job only
 * catches what that missed; there is no pooled digest email.
 * 1. Scores applicants never scored (ats_scored_at IS NULL). Only those submitted in the last 24h
 *    may email HR, so a run over historical rows does not flood the inbox.
 * 2. Re-sends the HR email for any application from the last 24h that was never delivered
 *    (ats_notified_at IS NULL, e.g. an SMTP outage at submission time).
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/Ats.php';

$pdo = getDbConnection();
if (!$pdo) {
    fwrite(STDERR, "ats-digest: database connection failed\n");
    exit(1);
}

try {
    atsEnsureSchema($pdo);

    $pending = $pdo->query('
        SELECT id, submitted_at >= NOW() - INTERVAL 1 DAY AS recent
        FROM job_applicants
        WHERE ats_scored_at IS NULL
        ORDER BY id
        LIMIT 500
    ')->fetchAll();
    foreach ($pending as $row) {
        atsScreenSafely($pdo, (int)$row['id'], (bool)$row['recent']);
    }

    $undelivered = $pdo->query('
        SELECT id FROM job_applicants
        WHERE ats_notified_at IS NULL AND submitted_at >= NOW() - INTERVAL 1 DAY
        ORDER BY id
    ')->fetchAll(PDO::FETCH_COLUMN);
    foreach ($undelivered as $id) {
        if (atsScreenSafely($pdo, (int)$id) === null) {
            atsNotifyUnscored($pdo, (int)$id);
        }
    }

    $stillMissing = (int)$pdo->query('
        SELECT COUNT(*) FROM job_applicants
        WHERE ats_notified_at IS NULL AND submitted_at >= NOW() - INTERVAL 1 DAY
    ')->fetchColumn();
} catch (Throwable $e) {
    fwrite(STDERR, 'ats-digest: ' . $e->getMessage() . "\n");
    exit(1);
}

echo 'ats-digest: scored ' . count($pending) . ', retried ' . count($undelivered) . ' undelivered HR email(s), '
    . $stillMissing . " still undelivered\n";
exit($stillMissing > 0 ? 1 : 0);
