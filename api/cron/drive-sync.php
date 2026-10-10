<?php
/**
 * APR Drive -> website listings + chatbot sync (CLI only, run every 15 minutes by cron):
 *   php api/cron/drive-sync.php
 *
 * Reads ONLY the APR listing folder (DRIVE_FOLDER_ID) through the service account in
 * GOOGLE_SA_KEY_B64. Each property folder ("City, sqm, street/building") and the Google
 * Doc inside it become one client-safe listing: area, size, type, rate and key terms.
 * Allow-list, not redaction: street/building/unit, owner/broker names, phone numbers and
 * emails are never written, so neither the website nor the chat bot can repeat them.
 *
 * Outputs (on any Drive failure the previous files are kept):
 *   api/data/listings.generated.md    chat knowledge (all listings, SOLD marked)
 *   api/data/listings.generated.json  website feed (available listings only) served by api/listings.php
 *   uploads/drive/<ref>/*.jpg          listing photos, re-encoded (EXIF/GPS stripped) and resized
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
const PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 120000;
const MAX_PHOTOS = 12;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const PHOTO_WIDTH = 1600;

// Cron fires every 15 minutes; never let a slow run overlap the next one.
$lock = fopen(sys_get_temp_dir() . '/apg-drive-sync.lock', 'c');
if ($lock === false || !flock($lock, LOCK_EX | LOCK_NB)) {
    exit(0);
}

$folderId = getenv('DRIVE_FOLDER_ID') ?: '1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll';
$token = googleDriveToken();
if ($token === null) {
    fwrite(STDERR, "drive-sync: no access token (check GOOGLE_SA_KEY_B64 and folder sharing)\n");
    exit(1);
}

/**
 * Folder naming convention "City, <sqm> <street/building>": "Valenzuela, 1,000 Lingunan" ->
 * ['area' => 'Valenzuela', 'size' => '1,000 sqm']. Only the first comma separates the city, because
 * sizes use thousands separators. The street/building after the size is dropped.
 */
function folderFacts(string $name): array {
    [$area, $rest] = array_pad(explode(',', ltrim($name, '* '), 2), 2, '');
    $size = '';
    if (preg_match('/(\d[\d.,]*(?:\s*[-–]\s*\d[\d.,]*)?)\s*(sqm|sq\.?\s*m|square meters?)/i', $rest, $m)
        || preg_match('/^\s*(\d[\d.,]*(?:\s*[-–]\s*\d[\d.,]*)?)/', $rest, $m)) {
        $size = rtrim($m[1], ' ,.') . ' sqm';
    }
    $area = trim(preg_replace('/\s+/', ' ', $area), " -");
    return ['area' => mb_convert_case(mb_strtolower($area), MB_CASE_TITLE), 'size' => $size];
}

/** Client-safe terms from a listing doc: only lines about price, dues, deposits, lease length, parking. */
function docTerms(string $text, int $max = 5): array {
    $keep = [];
    foreach (preg_split('/\R/', $text) as $line) {
        $line = trim(preg_replace('/\s+/', ' ', $line));
        if ($line === '' || mb_strlen($line) > 160) {
            continue;
        }
        // Never keep anything that identifies people, contacts or exact locations.
        if (preg_match('/\d{4}[\s-]?\d{3}[\s-]?\d{4}|\+63|@|https?:|www\.|\b(owner|broker|agent|contact|landlord|lessor|call|text|viber|address|street|st\.|ave|avenue|road|rd\.|blvd|unit|floor|flr|bldg|building|tower|lot|block|blk|phase|village|subd)\b/i', $line)) {
            continue;
        }
        if (preg_match('/(₱|php|\bp\s?\d|\/\s*(sqm|mo|month)|\brent|\brate|\bprice|\bcusa|\bdues|\bassoc|\badvance|\bdeposit|\bsecurity|\bvat\b|\bmin(imum)?\b.*\b(lease|year|month)|\blease term|\bparking|\bfurnish|\bwarm shell|\bbare|\bfitted|\bpeza\b)/iu', $line)) {
            $keep[] = rtrim(ltrim($line, '-•* '), '.;, ');
        }
        if (count($keep) >= $max) {
            break;
        }
    }
    return $keep;
}

/** Folder path + name -> [type key, label]; the team files listings under OFFICE SPACE, COMMERCIAL SPACE, etc. */
function listingType(array $path, string $name): array {
    $text = strtolower(implode(' ', $path) . ' ' . $name);
    foreach ([
        'warehouse'   => ['/warehouse|industrial/', 'Warehouse'],
        'office'      => ['/office/', 'Office Space'],
        'commercial'  => ['/commercial|retail/', 'Commercial Space'],
        'lot'         => ['/\b(lot|land)\b/', 'Lot'],
        'residential' => ['/condo|house|residential/', 'Residential'],
    ] as $key => [$pattern, $label]) {
        if (preg_match($pattern, $text)) {
            return [$key, $label];
        }
    }
    return ['property', 'Property'];
}

/** Depth-first walk; returns false on an API error so the previous files are kept. */
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
        // Virtual-office marketing folders are not property listings; /virtual-office covers them.
        $public = !$sold && !preg_grep('/^(vo|virtual office.*)$/i', $path);
        $terms = [];
        $photos = [];
        $updated = (string)($child['modifiedTime'] ?? '');
        if (!$sold) {
            foreach (googleDriveChildren($token, $child['id']) ?? [] as $file) {
                $mime = (string)($file['mimeType'] ?? '');
                if ($mime === DOC_MIME && $terms === []) {
                    $terms = docTerms((string)googleDriveDocText($token, $file['id']), 8);
                    $updated = max($updated, (string)($file['modifiedTime'] ?? ''));
                } elseif ($public && in_array($mime, PHOTO_MIMES, true) && (int)($file['size'] ?? 0) <= MAX_PHOTO_BYTES) {
                    $photos[] = $file;
                }
            }
        }
        usort($photos, static fn($a, $b) => strcmp($a['name'], $b['name']));
        $out[] = [
            'id' => (string)$child['id'],
            'path' => $path,
            'name' => $name,
            'sold' => $sold,
            'public' => $public,
            'facts' => folderFacts($name),
            'terms' => $terms,
            'photos' => array_slice($photos, 0, MAX_PHOTOS),
            'added' => (string)($child['createdTime'] ?? ''),
            'updated' => $updated,
        ];
    }
    return true;
}

/** Download, auto-rotate, resize and re-encode one photo; re-encoding drops EXIF (incl. GPS). */
function savePhoto(string $token, array $file, string $target): bool {
    $bytes = googleDriveDownload($token, $file['id']);
    if ($bytes === null) {
        return false;
    }
    $img = @imagecreatefromstring($bytes);
    if ($img === false) {
        return false;
    }
    if (function_exists('exif_read_data') && ($file['mimeType'] ?? '') === 'image/jpeg') {
        $tmp = tempnam(sys_get_temp_dir(), 'apg');
        $exif = $tmp !== false && file_put_contents($tmp, $bytes) !== false ? @exif_read_data($tmp) : false;
        if ($tmp !== false) {
            @unlink($tmp);
        }
        $rotate = [3 => 180, 6 => 270, 8 => 90][(int)($exif['Orientation'] ?? 1)] ?? 0;
        if ($rotate !== 0) {
            $img = imagerotate($img, $rotate, 0) ?: $img;
        }
    }
    if (imagesx($img) > PHOTO_WIDTH) {
        $img = imagescale($img, PHOTO_WIDTH) ?: $img;
    }
    $ok = imagejpeg($img, $target . '.tmp', 82) && rename($target . '.tmp', $target);
    imagedestroy($img);
    return $ok;
}

/** Mirror a listing's photos into $dir; returns their public URLs. Unchanged photos are not re-downloaded. */
function syncPhotos(string $token, string $ref, array $photos, string $dir): array {
    if ($photos === [] || !function_exists('imagecreatefromstring')) {
        return [];
    }
    $listingDir = $dir . '/' . $ref;
    if (!is_dir($listingDir) && !mkdir($listingDir, 0755, true)) {
        return [];
    }
    $urls = [];
    $keep = [];
    foreach ($photos as $file) {
        $base = preg_replace('/[^A-Za-z0-9_-]/', '', (string)$file['id']) . '.jpg';
        $target = $listingDir . '/' . $base;
        $fresh = is_file($target) && filemtime($target) >= strtotime((string)($file['modifiedTime'] ?? 'now'));
        if ($fresh || savePhoto($token, $file, $target)) {
            $keep[] = $base;
            $urls[] = '/uploads/drive/' . $ref . '/' . $base . '?v=' . filemtime($target);
        }
    }
    foreach (glob($listingDir . '/*') ?: [] as $old) {
        if (!in_array(basename($old), $keep, true)) {
            @unlink($old);
        }
    }
    return $urls;
}

$listings = [];
if (!walk($token, $folderId, [], $listings)) {
    fwrite(STDERR, "drive-sync: folder walk failed; keeping previous files\n");
    exit(1);
}

$writeAtomic = static function (string $target, string $contents): void {
    if (file_put_contents($target . '.tmp', $contents) === false || !rename($target . '.tmp', $target)) {
        fwrite(STDERR, "drive-sync: could not write $target\n");
        exit(1);
    }
};

// Website feed: available listings only, newest first.
$photoDir = webRootDir() . '/uploads/drive';
$feed = [];
$listingRefs = [];
foreach ($listings as $l) {
    if (!$l['public']) {
        continue;
    }
    $ref = 'APR-' . strtoupper(substr(md5($l['id']), 0, 6));
    [$type, $typeLabel] = listingType($l['path'], $l['name']);
    $pathText = strtolower(implode(' ', $l['path']));
    $deal = preg_match('/\bsale\b/', $pathText) ? 'sale' : (preg_match('/\b(lease|rent)\b/', $pathText) ? 'lease' : '');
    $area = $l['facts']['area'] ?: 'Metro Manila';
    $price = '';
    $terms = $l['terms'];
    foreach ($terms as $i => $term) {
        if (preg_match('/\b(rate|price|rent(al)?)\b|₱|\bphp\b/iu', $term)) {
            $price = $term;
            array_splice($terms, $i, 1);
            break;
        }
    }
    $feed[] = [
        'ref' => $ref,
        'title' => $typeLabel . ($deal !== '' ? ' for ' . ucfirst($deal) : '') . ' in ' . $area,
        'type' => $type,
        'type_label' => $typeLabel,
        'deal' => $deal,
        'area' => $area,
        'size' => $l['facts']['size'],
        'price' => $price,
        'terms' => $terms,
        'photos' => syncPhotos($token, $ref, $l['photos'], $photoDir),
        'added' => $l['added'],
        'updated' => $l['updated'],
        'drive_folder' => $l['id'], // staff-only: added to inquiry emails, stripped by api/listings.php
    ];
    $listingRefs[$l['id']] = $ref;
}
usort($feed, static fn($a, $b) => strcmp($b['added'], $a['added']));

// Photos of listings that were sold, moved or deleted go with them.
foreach (glob($photoDir . '/APR-*', GLOB_ONLYDIR) ?: [] as $dir) {
    if (!in_array(basename($dir), array_column($feed, 'ref'), true)) {
        array_map('unlink', glob($dir . '/*') ?: []);
        @rmdir($dir);
    }
}

$writeAtomic(__DIR__ . '/../data/listings.generated.json', json_encode(
    ['synced_at' => date(DATE_ATOM), 'listings' => $feed],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT
));

// Chat knowledge: every listing, grouped by Drive folder, SOLD ones without terms.
$groups = [];
foreach ($listings as $l) {
    $key = $l['sold'] ? 'SOLD / no longer available' : (implode(' > ', $l['path']) ?: 'Other listings');
    $groups[$key][] = $l;
}
ksort($groups);

$out = '# APR listings from the Drive (auto-synced ' . date('Y-m-d H:i') . " Asia/Manila)\n\n"
    . "Client-safe summary: area, size, rate and key terms only. Exact addresses, buildings, units and owner/contact\n"
    . "details are deliberately NOT included — for those, viewings or availability, hand the visitor to the APG team.\n"
    . "All rates and availability are subject to confirmation by the team.\n"
    . "Available listings (with photos and an Inquire button) are on https://alphapremiergroup.com/properties;\n"
    . "a listing's [APR-XXXXXX] ref opens it directly at https://alphapremiergroup.com/properties?ref=APR-XXXXXX\n";
foreach ($groups as $group => $items) {
    usort($items, static fn($a, $b) => strcmp($a['facts']['area'], $b['facts']['area']));
    $out .= "\n## " . $group . ' (' . count($items) . ")\n";
    foreach ($items as $l) {
        $line = '- ' . (isset($listingRefs[$l['id']]) ? '[' . $listingRefs[$l['id']] . '] ' : '')
            . ($l['facts']['area'] ?: 'Area on request') . ($l['facts']['size'] !== '' ? ', ' . $l['facts']['size'] : '');
        if (!$l['sold'] && $l['terms'] !== []) {
            $line .= ' — ' . implode('; ', array_slice($l['terms'], 0, 5));
        }
        $out .= $line . "\n";
    }
}

if (strlen($out) > MAX_BYTES) {
    $out = mb_strcut($out, 0, MAX_BYTES) . "\n\n(Truncated; ask the APG team for the full list.)\n";
}
$writeAtomic(__DIR__ . '/../data/listings.generated.md', $out);

echo 'drive-sync: ' . count($listings) . ' listing folders, ' . count($feed) . ' on the website, '
    . array_sum(array_map(static fn($l) => count($l['photos']), $feed)) . " photos\n";
