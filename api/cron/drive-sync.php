<?php
/**
 * Daily APR Drive -> chatbot listings sync (CLI only):
 *   php api/cron/drive-sync.php
 *
 * Reads ONLY the APR listing folder (DRIVE_FOLDER_ID) through the service account in
 * GOOGLE_SA_KEY_B64. Each property folder ("City, sqm, street/building") and the Google
 * Doc inside it become one client-safe line: area, size, type, rate and key terms.
 * Allow-list, not redaction: street/building/unit, owner/broker names, phone numbers and
 * emails are never written, so the chat bot cannot repeat them. Output goes to
 * api/data/listings.generated.md; on any failure the previous file is kept.
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
const MAX_BYTES = 120000;

$folderId = getenv('DRIVE_FOLDER_ID') ?: '1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll';
$token = googleDriveToken();
if ($token === null) {
    fwrite(STDERR, "drive-sync: no access token (check GOOGLE_SA_KEY_B64 and folder sharing)\n");
    exit(1);
}

/** "Makati, 120 sqm, Ayala Ave cor. X St" -> ['area' => 'Makati', 'size' => '120 sqm']; street/building dropped. */
function folderFacts(string $name): array {
    $parts = array_map('trim', explode(',', ltrim($name, '* ')));
    $area = $parts[0] ?? '';
    $size = '';
    foreach ($parts as $part) {
        if (preg_match('/([\d.,\s\-–]+)\s*(sqm|sq\.?\s*m|square meters?)/i', $part, $m)) {
            $size = trim($m[1], " ,-–") . ' sqm';
            break;
        }
        if ($size === '' && preg_match('/^[\d.,\s\-–]+$/', $part)) {
            $size = trim($part) . ' sqm';
        }
    }
    return ['area' => trim(preg_replace('/\s+/', ' ', $area), " -"), 'size' => $size];
}

/** Client-safe terms from a listing doc: only lines about price, dues, deposits, lease length, parking. */
function docTerms(string $text): string {
    $keep = [];
    foreach (preg_split('/\R/', $text) as $line) {
        $line = trim(preg_replace('/\s+/', ' ', $line));
        if ($line === '' || mb_strlen($line) > 160) {
            continue;
        }
        // Never keep anything that identifies people, contacts or exact locations.
        if (preg_match('/\d{4}[\s-]?\d{3}[\s-]?\d{4}|\+63|@|\b(owner|broker|agent|contact|landlord|lessor|call|text|viber|address|street|st\.|ave|avenue|road|rd\.|blvd|unit|floor|flr|bldg|building|tower|lot|block|blk|phase|village|subd)\b/i', $line)) {
            continue;
        }
        if (preg_match('/(₱|php|\bp\s?\d|\/\s*(sqm|mo|month)|\brent|\brate|\bprice|\bcusa|\bdues|\bassoc|\badvance|\bdeposit|\bsecurity|\bvat\b|\bmin(imum)?\b.*\b(lease|year|month)|\blease term|\bparking|\bfurnish|\bwarm shell|\bbare|\bfitted|\bpeza\b)/iu', $line)) {
            $keep[] = rtrim($line, '. ');
        }
        if (count($keep) >= 5) {
            break;
        }
    }
    return implode('; ', $keep);
}

/** Depth-first walk; returns false on an API error so the previous file is kept. */
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
        if (!preg_match('/\d/', $name) || strpos($name, ',') === false) {
            if (!walk($token, $child['id'], array_merge($path, [$name]), $out, $depth + 1)) {
                return false;
            }
            continue;
        }
        $sold = (bool)preg_grep('/\bsold\b/i', $path);
        $terms = '';
        if (!$sold) {
            foreach (googleDriveChildren($token, $child['id']) ?? [] as $file) {
                if (($file['mimeType'] ?? '') === DOC_MIME) {
                    $terms = docTerms((string)googleDriveDocText($token, $file['id']));
                    break;
                }
            }
        }
        $out[] = ['path' => $path, 'sold' => $sold, 'facts' => folderFacts($name), 'terms' => $terms];
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
    $key = $l['sold'] ? 'SOLD / no longer available' : (implode(' > ', $l['path']) ?: 'Other listings');
    $groups[$key][] = $l;
}
ksort($groups);

$out = '# APR listings from the Drive (auto-synced ' . date('Y-m-d H:i') . " Asia/Manila)\n\n"
    . "Client-safe summary: area, size, rate and key terms only. Exact addresses, buildings, units and owner/contact\n"
    . "details are deliberately NOT included — for those, viewings or availability, hand the visitor to the APG team.\n"
    . "All rates and availability are subject to confirmation by the team.\n";
foreach ($groups as $group => $items) {
    usort($items, static fn($a, $b) => strcmp($a['facts']['area'], $b['facts']['area']));
    $out .= "\n## " . $group . ' (' . count($items) . ")\n";
    foreach ($items as $l) {
        $line = '- ' . ($l['facts']['area'] ?: 'Area on request') . ($l['facts']['size'] !== '' ? ', ' . $l['facts']['size'] : '');
        if (!$l['sold'] && $l['terms'] !== '') {
            $line .= ' — ' . $l['terms'];
        }
        $out .= $line . "\n";
    }
}

if (strlen($out) > MAX_BYTES) {
    $out = mb_strcut($out, 0, MAX_BYTES) . "\n\n(Truncated; ask the APG team for the full list.)\n";
}
$target = __DIR__ . '/../data/listings.generated.md';
if (file_put_contents($target . '.tmp', $out) === false || !rename($target . '.tmp', $target)) {
    fwrite(STDERR, "drive-sync: could not write $target\n");
    exit(1);
}
echo 'drive-sync: ' . count($listings) . ' listing folders, ' . strlen($out) . " bytes written\n";
