<?php
/**
 * Daily APR Drive -> chatbot listings sync (CLI only):
 *   php api/cron/drive-sync.php
 *
 * Walks the APR listing folder (DRIVE_FOLDER_ID) and exports the master listing docs
 * (DRIVE_DOC_IDS, comma-separated) through the service account in GOOGLE_SA_KEY_B64,
 * redacts private contact details, and writes api/data/listings.generated.md, which the
 * chat assistant reads next to knowledge.md. On any failure the previous file is kept.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not Found';
    exit;
}

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/GoogleDrive.php';

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DOC_MIME = 'application/vnd.google-apps.document';
const MAX_BYTES = 60000;

$folderId = getenv('DRIVE_FOLDER_ID') ?: '1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll';
$docIds = array_filter(array_map('trim', explode(',', getenv('DRIVE_DOC_IDS')
    ?: '1XA-Wf1ymnGRxk-Xj4U_qiKEH_59OamWKswV2nx4wmkc,10DTb9mAL3swae2d1y7G3g7967NvqP_eIWSl-16_d38Q')));

$token = googleDriveToken();
if ($token === null) {
    fwrite(STDERR, "drive-sync: no access token (check GOOGLE_SA_KEY_B64 and folder sharing)\n");
    exit(1);
}

// Only the company's own business lines and mailboxes may appear in bot answers.
$knowledge = (string)@file_get_contents(__DIR__ . '/../data/knowledge.md');
preg_match_all('/(?:\+?63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}/', $knowledge, $m);
$allowedPhones = array_unique(array_map(static fn($p) => substr(preg_replace('/\D/', '', $p), -10), $m[0]));

function redact(string $text, array $allowedPhones): string {
    $lines = [];
    foreach (preg_split('/\R/', $text) as $line) {
        // Drop lines that name owners/brokers/contact persons outright.
        if (preg_match('/\b(owner|broker|contact person|landlord|lessor|agent)\b\s*[:\-]/i', $line)) {
            continue;
        }
        $line = preg_replace_callback('/(?:\+?63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}/', static function ($p) use ($allowedPhones) {
            return in_array(substr(preg_replace('/\D/', '', $p[0]), -10), $allowedPhones, true) ? $p[0] : '[contact the APG team]';
        }, $line);
        $line = preg_replace_callback('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', static fn($e) =>
            preg_match('/@alphapremiergroup\.com$/i', $e[0]) ? $e[0] : '[contact the APG team]', $line);
        $lines[] = rtrim($line);
    }
    return trim(preg_replace("/\n{3,}/", "\n\n", implode("\n", $lines)));
}

/** Depth-first walk collecting listing folders with their category path. */
function walk(string $token, string $id, array $path, array &$out, int $depth = 0): bool {
    if ($depth > 4) {
        return true;
    }
    $children = googleDriveChildren($token, $id);
    if ($children === null) {
        return false;
    }
    foreach ($children as $child) {
        if (($child['mimeType'] ?? '') !== FOLDER_MIME) {
            continue;
        }
        $name = trim((string)$child['name']);
        // Property folders are named "City, sqm, street/building" (digits + comma).
        if (preg_match('/\d/', $name) && strpos($name, ',') !== false) {
            $out[] = ['path' => $path, 'name' => ltrim($name, '* '), 'modified' => substr((string)$child['modifiedTime'], 0, 10)];
        } elseif (!walk($token, $child['id'], array_merge($path, [$name]), $out, $depth + 1)) {
            return false;
        }
    }
    return true;
}

$listings = [];
if (!walk($token, $folderId, [], $listings)) {
    fwrite(STDERR, "drive-sync: folder walk failed; keeping previous file\n");
    exit(1);
}

$groups = [];
foreach ($listings as $l) {
    $sold = (bool)preg_grep('/\bsold\b/i', $l['path']);
    $key = $sold ? 'SOLD / unavailable' : (implode(' > ', $l['path']) ?: 'Uncategorised');
    $groups[$key][] = $l;
}
ksort($groups);
$out = "# APR Drive listings (auto-synced " . date('Y-m-d H:i') . " Asia/Manila)\n\n"
    . "Generated daily from the Alpha Premier Realty listing Drive. Folder names are \"City, size (sqm), street/building\". "
    . "Items under SOLD are unavailable. Rates and availability must be confirmed with the APG team.\n";
foreach ($groups as $group => $items) {
    usort($items, static fn($a, $b) => strcmp($a['name'], $b['name']));
    $out .= "\n## " . $group . ' (' . count($items) . ")\n";
    foreach ($items as $l) {
        $out .= '- ' . redact($l['name'], $allowedPhones) . "\n";
    }
}

foreach ($docIds as $docId) {
    $text = googleDriveDocText($token, $docId);
    if ($text === null) {
        fwrite(STDERR, "drive-sync: could not export doc $docId; skipping it\n");
        continue;
    }
    $out .= "\n## Master listing document\n" . mb_substr(redact($text, $allowedPhones), 0, 20000) . "\n";
}

if (strlen($out) > MAX_BYTES) {
    $out = mb_strcut($out, 0, MAX_BYTES) . "\n\n(Truncated; ask the APG team for the full list.)\n";
}
$target = __DIR__ . '/../data/listings.generated.md';
if (file_put_contents($target . '.tmp', $out) === false || !rename($target . '.tmp', $target)) {
    fwrite(STDERR, "drive-sync: could not write $target\n");
    exit(1);
}
echo 'drive-sync: ' . count($listings) . ' listing folders, ' . count($docIds) . ' docs, ' . strlen($out) . " bytes written\n";
