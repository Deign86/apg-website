<?php
/**
 * Production self-test (CLI only):
 *   php api/cron/selftest.php [--mail]
 *
 * Reports whether required settings are present (never their values), checks the
 * database, makes one real Gemini call grounded in the chat knowledge base, and with
 * --mail sends one test email to MAIL_TO_EMAIL through the site mailer.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../lib/Gemini.php';
require_once __DIR__ . '/../lib/Mailer.php';

$line = static fn(string $label, $ok, string $detail = '') =>
    print(str_pad($label, 22) . ($ok ? 'OK  ' : 'FAIL') . ($detail !== '' ? "  $detail" : '') . "\n");

echo 'APG self-test ' . date('c') . "\n";
foreach (['DB_PASS', 'SMTP_PASS', 'GEMINI_API_KEY', 'SETUP_TOKEN'] as $key) {
    $line("env $key", (string)getenv($key) !== '', (string)getenv($key) !== '' ? 'set' : 'missing');
}

$pdo = getDbConnection();
if ($pdo) {
    $counts = [];
    foreach (['blog_posts', 'job_openings', 'service_items', 'job_applicants', 'admins'] as $table) {
        $counts[] = $table . '=' . (int)$pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    }
    $line('database', true, implode(' ', $counts));
} else {
    $line('database', false, 'connection failed');
}

$knowledge = @file_get_contents(__DIR__ . '/../data/knowledge.md');
$line('knowledge base', is_string($knowledge) && $knowledge !== '', is_string($knowledge) ? strlen($knowledge) . ' bytes' : 'missing');

if (geminiEnabled() && is_string($knowledge)) {
    $schema = ['type' => 'OBJECT', 'properties' => ['reply' => ['type' => 'STRING'], 'needs_human' => ['type' => 'BOOLEAN']], 'required' => ['reply', 'needs_human']];
    $answer = geminiGenerate(
        "You are APG's website assistant. Answer only from the knowledge base, at most 60 words.\n<knowledge_base>\n$knowledge\n</knowledge_base>",
        [['text' => 'What virtual office packages do you offer and where is the office?']],
        $schema,
        [],
        30
    );
    $ok = is_array($answer) && is_string($answer['reply'] ?? null) && $answer['reply'] !== '';
    $line('gemini (grounded)', $ok, $ok ? 'reply: ' . mb_substr(preg_replace('/\s+/', ' ', $answer['reply']), 0, 160) : 'no reply (see error_log)');
} else {
    $line('gemini (grounded)', false, geminiEnabled() ? 'knowledge base missing' : 'GEMINI_API_KEY not set');
}

if (in_array('--mail', $argv, true)) {
    $to = MAIL_TO_EMAIL;
    $sent = (new Mailer())->send($to, 'APG website self-test', '<p>This is an automated self-test from alphapremiergroup.com. If you received it, website email is working.</p>');
    $line('mail', (bool)$sent, $sent ? "sent to $to" : 'send failed (see error_log)');
}
