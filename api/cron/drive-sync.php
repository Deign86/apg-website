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
const MAX_BYTES = 3000000; // chat picks the matching lines per question (api/chat/message.php relevantListings)
const MAX_PHOTOS = 12;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const PHOTO_WIDTH = 1600;
const MAX_RAW_PHOTO_BYTES = 5 * 1024 * 1024; // no GD = no resize, so keep unprocessed photos page-friendly

// Cron fires every 15 minutes; never let a slow run overlap the next one.
$lock = fopen(sys_get_temp_dir() . '/apg-drive-sync.lock', 'c');
if ($lock === false || !flock($lock, LOCK_EX | LOCK_NB)) {
    exit(0);
}
// Hostinger kills cron jobs at 30 minutes. A cold run (empty doc cache, e.g. after a wipe) needs
// longer, so doc exports and photo downloads stop here; outputs and the cache are still written
// and the next run picks up the rest.
define('SLOW_WORK_DEADLINE', time() + 15 * 60);

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

// Never kept in listing terms: anything that identifies people, contacts or exact locations, and
// broker-side money (commissions, referral fees) that is internal to the team.
const PRIVATE_LINE = '/\d{4}[\s-]?\d{3}[\s-]?\d{4}|\+63|@|https?:|www\.|\b(owner|broker|agent|contact|landlord|lessor|call|text|viber|address|street|st\.|ave|avenue|road|rd\.|blvd|unit|floor|flr|bldg|building|tower|lot|block|blk|phase|village|subd|commissions?|co-?broke|referral fee|finder\'?s fee)\b/i';

/** Client-safe terms from a listing doc: only lines about price, dues, deposits, lease length, parking. */
function docTerms(string $text, int $max = 5): array {
    $keep = [];
    foreach (preg_split('/\R/', $text) as $line) {
        $line = trim(preg_replace('/\s+/', ' ', $line));
        if ($line === '' || mb_strlen($line) > 160) {
            continue;
        }
        if (preg_match(PRIVATE_LINE, $line)) {
            continue;
        }
        if (preg_match('/(₱|php|\bp\s?\d|\/\s*(sqm|mo|month)|\brent|\brate|\bprice|\bcusa|\bdues|\bassoc|\badvance|\bdeposit|\bsecurity|\bvat\b|\bmin(imum)?\b.*\b(lease|year|month)|\blease term|\bparking|\bfurnish|\bwarm shell|\bbare|\bfitted|\bpeza\b)/iu', $line)) {
            // Not ltrim(): it strips "•" byte by byte and leaves invalid UTF-8 that json_encode rejects.
            $keep[] = rtrim(preg_replace('/^[-•*\s]+/u', '', $line) ?? $line, '.;, ');
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

/**
 * Whole folder tree in a few API calls: the service account can only see the APR folder, so one
 * search returns every folder, doc and photo in it. Returns parent id => children, or null on error.
 */
function driveIndex(string $token): ?array {
    $mimes = array_merge([FOLDER_MIME, DOC_MIME], PHOTO_MIMES);
    $files = googleDriveList($token, 'trashed = false and (' . implode(' or ', array_map(static fn($m) => "mimeType = '$m'", $mimes)) . ')');
    if ($files === null) {
        return null;
    }
    $byParent = [];
    foreach ($files as $file) {
        foreach ($file['parents'] ?? [] as $parent) {
            $byParent[$parent][] = $file;
        }
    }
    return $byParent;
}

/**
 * Depth-first walk over $childrenOf(id) (index lookup or API call); $termsOf(docFile) returns a
 * listing doc's terms. False on an API error so the previous files are kept.
 */
function walk(callable $childrenOf, callable $termsOf, string $id, array $path, array &$out, int $depth = 0): bool {
    if ($depth > 4) {
        return true;
    }
    $children = $childrenOf($id);
    if ($children === null) {
        return false;
    }
    foreach ($children as $child) {
        if (($child['mimeType'] ?? '') !== FOLDER_MIME) {
            continue;
        }
        $name = trim((string)$child['name']);
        if (!preg_match('/\d/', $name) || strpos($name, ',') === false) {
            if (!walk($childrenOf, $termsOf, $child['id'], array_merge($path, [$name]), $out, $depth + 1)) {
                return false;
            }
            continue;
        }
        $sold = (bool)preg_grep('/\bsold\b/i', $path);
        // Virtual-office marketing folders are not property listings; /virtual-office covers them.
        $public = !$sold && !preg_grep('/^(vo|virtual office.*)$/i', $path);
        $terms = [];
        $photos = [];
        $docRead = false;
        $updated = (string)($child['modifiedTime'] ?? '');
        // Only listings shown on the site need their doc and photos (doc exports are the slow calls).
        if ($public) {
            foreach ($childrenOf($child['id']) ?? [] as $file) {
                $mime = (string)($file['mimeType'] ?? '');
                if ($mime === DOC_MIME && !$docRead) {
                    $docRead = true;
                    $terms = $termsOf($file);
                    $updated = max($updated, (string)($file['modifiedTime'] ?? ''));
                } elseif (in_array($mime, PHOTO_MIMES, true) && (int)($file['size'] ?? 0) <= MAX_PHOTO_BYTES) {
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

/**
 * JPEG without its metadata: drops APP1–APP15 (EXIF incl. GPS, XMP, IPTC) and COM segments, keeps
 * the image data untouched. Returns null for anything that is not a well-formed JPEG.
 */
function stripJpegMetadata(string $jpeg): ?string {
    if (strncmp($jpeg, "\xFF\xD8", 2) !== 0) {
        return null;
    }
    $out = "\xFF\xD8";
    $pos = 2;
    $len = strlen($jpeg);
    while ($pos + 4 <= $len && $jpeg[$pos] === "\xFF") {
        $marker = ord($jpeg[$pos + 1]);
        if ($marker === 0xDA) { // start of scan: the rest is image data
            return $out . substr($jpeg, $pos);
        }
        $size = unpack('n', substr($jpeg, $pos + 2, 2))[1];
        if ($size < 2 || $pos + 2 + $size > $len) {
            return null;
        }
        if (!($marker >= 0xE1 && $marker <= 0xEF) && $marker !== 0xFE) {
            $out .= substr($jpeg, $pos, 2 + $size);
        }
        $pos += 2 + $size;
    }
    return null;
}

/**
 * Save one listing photo with no location metadata. With GD: auto-rotate, resize to PHOTO_WIDTH and
 * re-encode (drops all EXIF). Without GD: JPEGs only (≤ MAX_RAW_PHOTO_BYTES), metadata segments
 * stripped, original pixels and size kept; other formats are skipped rather than published unstripped.
 */
function savePhoto(string $token, array $file, string $target): bool {
    $gd = function_exists('imagecreatefromstring');
    if (!$gd && (($file['mimeType'] ?? '') !== 'image/jpeg' || (int)($file['size'] ?? 0) > MAX_RAW_PHOTO_BYTES)) {
        return false;
    }
    $bytes = googleDriveDownload($token, $file['id']);
    if ($bytes === null) {
        return false;
    }
    if (!$gd) {
        $clean = stripJpegMetadata($bytes);
        return $clean !== null && file_put_contents($target . '.tmp', $clean) !== false && rename($target . '.tmp', $target);
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
    if ($photos === []) {
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
        $fresh = is_file($target) && (filemtime($target) >= strtotime((string)($file['modifiedTime'] ?? 'now')) || time() > SLOW_WORK_DEADLINE);
        if ($fresh || (time() <= SLOW_WORK_DEADLINE && savePhoto($token, $file, $target))) {
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

$started = microtime(true);
$index = driveIndex($token);
// Fall back to one API call per folder if the search did not return the APR tree.
$childrenOf = $index !== null && isset($index[$folderId])
    ? static fn(string $id): array => $index[$id] ?? []
    : static fn(string $id): ?array => googleDriveChildren($token, $id);

// Doc exports are slow (several seconds, sometimes the 30s timeout), so terms are cached per doc
// and a doc is only exported again when its modifiedTime changes. A failed export is not cached.
$docCacheFile = __DIR__ . '/../data/drive-doc-cache.json';
$docCache = json_decode((string)@file_get_contents($docCacheFile), true);
$docCache = is_array($docCache) ? $docCache : [];
// Re-filter cached terms so a tightened PRIVATE_LINE applies without re-exporting every doc.
foreach ($docCache as &$entry) {
    $entry['terms'] = array_values(preg_grep(PRIVATE_LINE, (array)($entry['terms'] ?? []), PREG_GREP_INVERT));
}
unset($entry);
$docsUsed = [];
$exports = 0;
$termsOf = static function (array $doc) use ($token, &$docCache, &$docsUsed, &$exports): array {
    $id = (string)$doc['id'];
    $modified = (string)($doc['modifiedTime'] ?? '');
    $docsUsed[$id] = true;
    if (isset($docCache[$id]) && $docCache[$id]['modified'] === $modified && $modified !== '') {
        return $docCache[$id]['terms'];
    }
    if (time() > SLOW_WORK_DEADLINE) {
        return $docCache[$id]['terms'] ?? []; // out of time: the next run exports it
    }
    $exports++;
    $text = googleDriveDocText($token, $id);
    if ($text === null) {
        return $docCache[$id]['terms'] ?? []; // keep the last good terms rather than blanking the listing
    }
    $docCache[$id] = ['modified' => $modified, 'terms' => docTerms($text, 8)];
    return $docCache[$id]['terms'];
};

$listings = [];
if (!walk($childrenOf, $termsOf, $folderId, [], $listings)) {
    fwrite(STDERR, "drive-sync: folder walk failed; keeping previous files\n");
    exit(1);
}

$writeAtomic = static function (string $target, string|false $contents): void {
    if ($contents === false || file_put_contents($target . '.tmp', $contents) === false || !rename($target . '.tmp', $target)) {
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
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_INVALID_UTF8_SUBSTITUTE
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
    . "Available listings (with photos and an Inquire button) are on https://realty.alphapremiergroup.com/properties;\n"
    . "a listing's [APR-XXXXXX] ref opens it directly at https://realty.alphapremiergroup.com/properties?ref=APR-XXXXXX\n";
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
// Only docs still in use stay cached.
$writeAtomic($docCacheFile, json_encode(array_intersect_key($docCache, $docsUsed), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE));

echo 'drive-sync: ' . count($listings) . ' listing folders, ' . count($feed) . ' on the website, '
    . $exports . ' doc export(s), '
    . array_sum(array_map(static fn($l) => count($l['photos']), $feed)) . ' photos ('
    . (function_exists('imagecreatefromstring') ? 'GD: resized, re-encoded' : 'no GD: JPEG metadata stripped, not resized') . '), '
    . ($index !== null && isset($index[$folderId]) ? 'indexed' : 'per-folder walk') . ', '
    . round(microtime(true) - $started) . "s\n";
