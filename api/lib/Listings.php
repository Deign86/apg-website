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
