<?php
/**
 * Daily ATS digest (CLI only):
 *   php api/cron/ats-digest.php
 *
 * 1. Backfills ATS scores for applicants never scored (ats_scored_at IS NULL).
 *    Only those submitted in the last 24h may trigger a shortlist email, so a
 *    first run over historical rows does not flood HR.
 * 2. Emails HR_EMAIL one ranked summary of the last 24h of applicants.
 *    Nothing is sent when there were no applicants.
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
    echo 'ats-digest: backfilled ' . count($pending) . " applicant(s)\n";

    $rows = $pdo->query('
        SELECT id, full_name, job_title, enterprise_slug, ats_score, ats_shortlisted, ats_summary, submitted_at
        FROM job_applicants
        WHERE submitted_at >= NOW() - INTERVAL 1 DAY
        ORDER BY ats_score IS NULL, ats_score DESC, submitted_at DESC
    ')->fetchAll();
} catch (Throwable $e) {
    fwrite(STDERR, 'ats-digest: ' . $e->getMessage() . "\n");
    exit(1);
}

if (!$rows) {
    echo "ats-digest: no applicants in the last 24h, nothing sent\n";
    exit(0);
}

$shortlisted = count(array_filter($rows, static fn($r) => (int)$r['ats_shortlisted'] === 1));
$adminUrl = 'https://alphapremiergroup.com/admin/applicants';
$cell = 'padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:13px;vertical-align:top;';
$tableRows = '';
foreach ($rows as $i => $r) {
    $details = atsDetails($r['ats_summary']);
    $score = $r['ats_score'] === null ? '—' : (int)$r['ats_score'];
    $scoreColor = $r['ats_score'] === null ? '#6b7280' : ((int)$r['ats_score'] >= atsThreshold() ? '#15803d' : ((int)$r['ats_score'] >= atsThreshold() - 20 ? '#a16207' : '#b91c1c'));
    $tableRows .= '<tr>'
        . '<td style="' . $cell . 'color:#6b7280;">' . ($i + 1) . '</td>'
        . '<td style="' . $cell . '"><strong>' . atsEsc($r['full_name']) . '</strong><br><span style="color:#6b7280;font-size:12px;">'
        . atsEsc($r['job_title']) . ' · ' . atsEsc(atsEnterpriseProfile((string)$r['enterprise_slug'])['name']) . '</span></td>'
        . '<td style="' . $cell . 'color:' . $scoreColor . ';font-weight:bold;text-align:center;">' . $score . '</td>'
        . '<td style="' . $cell . 'text-align:center;">' . ((int)$r['ats_shortlisted'] === 1 ? 'Yes' : 'No') . '</td>'
        . '<td style="' . $cell . 'color:#374151;">' . atsEsc($details['summary'] ?? 'Not scored') . '</td>'
        . '</tr>';
}

$th = 'padding:8px 10px;border-bottom:2px solid #c5a059;font-size:11px;text-transform:uppercase;color:#6b7280;text-align:left;';
$subject = sprintf('ATS daily digest — %d applicant%s, %d shortlisted (%s)', count($rows), count($rows) === 1 ? '' : 's', $shortlisted, date('M j, Y'));
$html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' . atsEsc($subject) . '</title></head>'
    . '<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">'
    . '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">'
    . '<tr><td style="padding:20px 24px;border-bottom:3px solid #c5a059;">'
    . '<div style="font-size:11px;letter-spacing:2px;color:#a16207;font-weight:bold;">APG ATS — DAILY DIGEST</div>'
    . '<div style="font-size:18px;font-weight:bold;margin-top:6px;">' . count($rows) . ' applicant(s) in the last 24 hours, ' . $shortlisted . ' shortlisted</div>'
    . '<div style="font-size:12px;color:#6b7280;margin-top:4px;">Ranked by ATS score. Shortlist threshold: ' . atsThreshold() . '/100.</div></td></tr>'
    . '<tr><td style="padding:16px 24px;"><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">'
    . '<tr><th style="' . $th . '">#</th><th style="' . $th . '">Candidate</th><th style="' . $th . 'text-align:center;">Score</th>'
    . '<th style="' . $th . 'text-align:center;">Shortlisted</th><th style="' . $th . '">Summary</th></tr>'
    . $tableRows . '</table>'
    . '<p style="margin:20px 0 0;"><a href="' . $adminUrl . '" style="display:inline-block;background:#c5a059;color:#000000;font-weight:bold;font-size:13px;text-decoration:none;padding:10px 18px;border-radius:6px;">Open applicants in admin</a></p>'
    . '</td></tr></table></body></html>';

$sent = (new Mailer())->send(atsHrEmail(), $subject, $html);
echo 'ats-digest: ' . ($sent ? 'sent' : 'FAILED to send') . ' digest of ' . count($rows) . ' applicant(s) to ' . atsHrEmail() . "\n";
exit($sent ? 0 : 1);
