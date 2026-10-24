<?php
/**
 * Drive listings feed + website-side overrides, shared by api/listings.php (public),
 * api/admin/listings.php and api/chat/message.php.
 *
 * The feed (api/data/listings.generated.json) is written by api/cron/drive-sync.php; the
 * `listing_overrides` table holds what admins control per ref (hide, feature, order, price, note).
 */

const LISTINGS_FEED_FILE = __DIR__ . '/../data/listings.generated.json';
const LISTINGS_STATUS_FILE = __DIR__ . '/../data/listings.status.json';
const LISTING_REF_PATTERN = '/^APR-[0-9A-F]{6}$/';
const REALTY_ORIGIN = 'https://realty.alphapremiergroup.com';

/** Canonical public URL of one listing: its own page on the Realty site. */
function listingUrl(string $ref): string {
    return REALTY_ORIGIN . '/properties/' . rawurlencode($ref);
}

/** Decoded feed {synced_at, listings[]}, or null before the first sync. */
function listingsFeed(): ?array {
    $feed = json_decode((string)@file_get_contents(LISTINGS_FEED_FILE), true);
    return is_array($feed) && is_array($feed['listings'] ?? null) ? $feed : null;
}

/**
 * Overrides keyed by ref. A missing table or database (fresh install, DB outage) means no
 * overrides, so the public site keeps serving the plain Drive feed.
 */
function listingOverrides(?PDO $pdo): array {
    if ($pdo === null) {
        return [];
    }
    try {
        $rows = $pdo->query('SELECT ref, hidden, featured, sort_order, price_override, note, updated_at, updated_by FROM listing_overrides')->fetchAll();
    } catch (PDOException $e) {
        error_log('listingOverrides: ' . $e->getMessage());
        return [];
    }
    $out = [];
    foreach ($rows as $row) {
        $out[$row['ref']] = [
            'hidden' => (int)$row['hidden'] === 1,
            'featured' => (int)$row['featured'] === 1,
            'sort_order' => $row['sort_order'] === null ? null : (int)$row['sort_order'],
            'price_override' => $row['price_override'],
            'note' => $row['note'],
            'updated_at' => $row['updated_at'],
            'updated_by' => $row['updated_by'] === null ? null : (int)$row['updated_by'],
        ];
    }
    return $out;
}

/** Refs an admin hid from the website (also kept out of the chat assistant's answers). */
function hiddenListingRefs(?PDO $pdo): array {
    return array_keys(array_filter(listingOverrides($pdo), static fn(array $o): bool => $o['hidden']));
}

/**
 * Public view of the feed: hidden listings dropped, price overrides applied, featured first, then
 * sort_order (unset last), then feed order (newest first). Adds `featured`.
 */
function applyListingOverrides(array $listings, array $overrides): array {
    $rows = [];
    foreach (array_values($listings) as $i => $l) {
        $o = $overrides[$l['ref'] ?? ''] ?? null;
        if ($o !== null && $o['hidden']) {
            continue;
        }
        if ($o !== null && is_string($o['price_override']) && trim($o['price_override']) !== '') {
            $l['price'] = $o['price_override'];
        }
        $l['featured'] = $o !== null && $o['featured'];
        $rows[] = [$l['featured'] ? 0 : 1, $o['sort_order'] ?? PHP_INT_MAX, $i, $l];
    }
    usort($rows, static fn(array $a, array $b): int => [$a[0], $a[1], $a[2]] <=> [$b[0], $b[1], $b[2]]);
    return array_column($rows, 3);
}

// Browse pages ("hubs") group the public listings by type + deal, and by type + deal + area:
// /properties/warehouse-for-lease and /properties/warehouse-for-lease/cavite. A hub with fewer than
// HUB_MIN_LISTINGS listings still renders but is noindex and left out of the sitemap.
const HUB_MIN_LISTINGS = 3;
const HUB_TYPE_PLURALS = [
    'warehouse' => 'Warehouses',
    'office' => 'Office Spaces',
    'commercial' => 'Commercial Spaces',
    'house-lot' => 'House and Lot Properties',
    'condo' => 'Condos and Houses',
    'lot' => 'Lots',
];

/**
 * [type key, label] of a listing from the APR Drive folders it is filed under. Each top folder (OFFICE SPACE,
 * WAREHOUSE, ...) is one type, whatever area or building folders sit below it; CONDO / HOUSE AND LOT is split
 * by its own subfolders, most specific first: CONDO / HOUSE AND LOT > FOR SALE > Lot is a Lot. The listing
 * folder's own name is not used: its street/building part ("Lot 5 Blk 2", "Office Tower") would mislabel it.
 */
function listingType(array $path): array {
    $top = (string)($path[0] ?? '');
    foreach (preg_match('/condo/i', $top) ? array_reverse($path) : [$top] as $folder) {
        foreach ([
            'warehouse' => ['/warehouse|industrial/i', 'Warehouse'],
            'office' => ['/office/i', 'Office Space'],
            'commercial' => ['/commercial|retail/i', 'Commercial Space'],
            'house-lot' => ['/house\W*(and|&)\W*lot/i', 'House and Lot'],
            'condo' => ['/condo|house/i', 'Condo / House'],
            'lot' => ['/\b(lots?|land)\b/i', 'Lot'],
        ] as $key => [$pattern, $label]) {
            if (preg_match($pattern, (string)$folder)) {
                return [$key, $label];
            }
        }
    }
    return ['property', 'Property'];
}

/** Drive area as shown on browse pages: "Pasig City" -> "Pasig", "Bgc" -> "BGC" (Quezon City keeps "City"; Quezon is a province). */
function listingAreaName(string $area): string {
    $area = trim((string)preg_replace('/\s+/u', ' ', $area));
    if (strcasecmp($area, 'Quezon City') !== 0) {
        $area = (string)preg_replace('/\s+City$/iu', '', $area);
    }
    return strcasecmp($area, 'bgc') === 0 ? 'BGC' : $area;
}

/** URL slug: "Las Piñas" -> "las-pinas", "Office Space" -> "office-space". */
function listingSlug(string $text): string {
    $text = strtr(mb_strtolower($text, 'UTF-8'), ['ñ' => 'n', 'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u']);
    return trim((string)preg_replace('/[^a-z0-9]+/', '-', $text), '-');
}

/** [type + deal hub path, type + deal + area hub path or null] for a listing; [] when it belongs to no hub. */
function listingHubPaths(array $l): array {
    $type = (string)($l['type'] ?? '');
    $deal = (string)($l['deal'] ?? '');
    if (!isset(HUB_TYPE_PLURALS[$type]) || !in_array($deal, ['lease', 'sale'], true)) {
        return [];
    }
    $base = '/properties/' . listingSlug((string)($l['type_label'] ?? $type)) . '-for-' . $deal;
    $area = listingSlug(listingAreaName((string)($l['area'] ?? '')));
    return [$base, $area === '' ? null : "$base/$area"];
}

/**
 * Browse pages for the public listings: {path, type, deal, area, area_slug, count, indexable, h1, title,
 * description}. Type + deal hubs first, then area hubs by size. An area's name is its most common spelling.
 */
function listingHubs(array $listings): array {
    $names = [];
    foreach ($listings as $l) {
        $name = listingAreaName((string)($l['area'] ?? ''));
        $names[listingSlug($name)][$name] = ($names[listingSlug($name)][$name] ?? 0) + 1;
    }
    $hubs = [];
    foreach ($listings as $l) {
        $paths = listingHubPaths($l);
        foreach (array_filter($paths) as $i => $path) {
            $areaSlug = $i === 0 ? '' : listingSlug(listingAreaName((string)$l['area']));
            $hubs[$path] ??= ['path' => $path, 'type' => $l['type'], 'deal' => $l['deal'], 'area_slug' => $areaSlug,
                'area' => $areaSlug === '' ? '' : (string)array_search(max($names[$areaSlug]), $names[$areaSlug], true),
                'singular' => (string)$l['type_label'], 'count' => 0];
            $hubs[$path]['count']++;
        }
    }
    $hubs = array_map(static function (array $h): array {
        $where = $h['area'] === '' ? '' : " in {$h['area']}";
        $plural = HUB_TYPE_PLURALS[$h['type']];
        $h1 = $plural . ' for ' . ucfirst($h['deal']) . $where;
        $noun = mb_strtolower($h['count'] === 1 ? $h['singular'] : $plural, 'UTF-8');
        unset($h['singular']);
        return $h + [
            'indexable' => $h['count'] >= HUB_MIN_LISTINGS,
            'h1' => $h1,
            'title' => "$h1 | Alpha Premier Realty",
            'description' => "{$h['count']} $noun for {$h['deal']}$where from Alpha Premier Realty, with sizes, rates and photos. Inquire for a viewing.",
        ];
    }, array_values($hubs));
    usort($hubs, static fn(array $a, array $b): int => [$a['area_slug'] !== '', -$a['count'], $a['path']] <=> [$b['area_slug'] !== '', -$b['count'], $b['path']]);
    return $hubs;
}

/**
 * Last Drive sync run as written by drive-sync.php {last_run, ok, error, count}. Before the cron has
 * ever written it (older deploys), the feed's synced_at stands in as the last good run.
 */
function listingsSyncStatus(?array $feed): array {
    $status = json_decode((string)@file_get_contents(LISTINGS_STATUS_FILE), true);
    if (is_array($status) && isset($status['last_run'])) {
        return [
            'last_run' => (string)$status['last_run'],
            'ok' => ($status['ok'] ?? false) === true,
            'error' => is_string($status['error'] ?? null) ? $status['error'] : null,
            'count' => isset($status['count']) ? (int)$status['count'] : null,
            'synced_at' => $feed['synced_at'] ?? null,
        ];
    }
    return [
        'last_run' => $feed['synced_at'] ?? null,
        'ok' => $feed !== null,
        'error' => $feed === null ? 'No sync has completed yet.' : null,
        'count' => $feed === null ? null : count($feed['listings']),
        'synced_at' => $feed['synced_at'] ?? null,
    ];
}
