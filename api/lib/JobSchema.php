<?php
/**
 * Columns added after launch to job_openings / job_applicants. Production has no migration runner,
 * so every endpoint that reads or writes them calls jobSchemaEnsure() first (idempotent, once per
 * request). schema.sql carries the same columns for fresh installs.
 */
const JOB_SCHEMA_COLUMNS = [
    'job_openings' => [
        'require_photo' => 'TINYINT(1) NOT NULL DEFAULT 0', // applicants must attach a 2x2 photo
        'ask_portfolio' => 'TINYINT(1) NOT NULL DEFAULT 0', // form asks for portfolio links (optional)
    ],
    'job_applicants' => [
        'ats_score'           => 'TINYINT NULL',
        'ats_summary'         => 'TEXT NULL',
        'ats_method'          => 'VARCHAR(16) NULL',
        'ats_shortlisted'     => 'TINYINT(1) NOT NULL DEFAULT 0',
        'ats_notified_at'     => 'DATETIME NULL',
        'ats_scored_at'       => 'DATETIME NULL',
        'photo_path'          => 'VARCHAR(255) NULL',
        'portfolio_links'     => 'TEXT NULL',     // JSON list of URLs
        'interview_at'        => 'DATETIME NULL',
        'interview_note'      => 'TEXT NULL',
        'auto_rejected_at'    => 'DATETIME NULL', // ATS rejected it; the daily cron emails the applicant
        'decision_emailed_at' => 'DATETIME NULL', // rejection or interview invite sent
    ],
];

function jobSchemaEnsure(PDO $pdo): void {
    static $done = false;
    if ($done) {
        return;
    }
    $stmt = $pdo->prepare('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :t');
    foreach (JOB_SCHEMA_COLUMNS as $table => $columns) {
        $stmt->execute([':t' => $table]);
        $existing = array_map('strtolower', $stmt->fetchAll(PDO::FETCH_COLUMN));
        foreach ($columns as $column => $definition) {
            if (!in_array($column, $existing, true)) {
                $pdo->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$definition}");
            }
        }
    }
    $done = true;
}
