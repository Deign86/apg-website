<?php
/**
 * IndexNow client (https://www.indexnow.org): tells Bing (and through it ChatGPT search, Copilot,
 * DuckDuckGo, Yahoo) and Yandex which listing pages changed, so they are recrawled within minutes.
 * Called by api/cron/drive-sync.php after each sync. The key is public by protocol design: the
 * search engines verify it at public/<INDEXNOW_KEY>.txt, served on the Realty host (shared docroot).
 */

require_once __DIR__ . '/Listings.php';

const INDEXNOW_KEY = '91ac74e8226eac97e32a53cb3bf3a72e';
const INDEXNOW_MAX_URLS = 10000; // protocol limit per request
// What a listing page shows; timestamps and the staff-only drive_folder are not page changes.
const INDEXNOW_FIELDS = ['title', 'deal', 'area', 'size', 'price', 'terms', 'photos'];

/** Refs added, removed, or with a changed public field between two feeds' listings; sorted, unique. */
function indexNowChangedRefs(array $oldListings, array $newListings): array {
    $byRef = static function (array $listings): array {
        $out = [];
        foreach ($listings as $l) {
            if (is_string($l['ref'] ?? null)) {
                $out[$l['ref']] = array_map(static fn(string $k) => $l[$k] ?? null, INDEXNOW_FIELDS);
            }
        }
        return $out;
    };
    $old = $byRef($oldListings);
    $new = $byRef($newListings);
    $changed = array_keys(array_diff_key($old, $new) + array_diff_key($new, $old));
    foreach (array_intersect_key($new, $old) as $ref => $fields) {
        if ($fields !== $old[$ref]) {
            $changed[] = $ref;
        }
    }
    sort($changed, SORT_STRING);
    return $changed;
}

/** IndexNow request body for URLs on the Realty host (first INDEXNOW_MAX_URLS unique ones). */
function indexNowPayload(array $urls): array {
    return [
        'host' => parse_url(REALTY_ORIGIN, PHP_URL_HOST),
        'key' => INDEXNOW_KEY,
        'keyLocation' => REALTY_ORIGIN . '/' . INDEXNOW_KEY . '.txt',
        'urlList' => array_slice(array_values(array_unique($urls)), 0, INDEXNOW_MAX_URLS),
    ];
}

/** Submits the URLs; null when accepted (HTTP 200/202), otherwise a short error for the cron log. */
function indexNowSubmit(array $urls): ?string {
    $ch = curl_init('https://api.indexnow.org/indexnow');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8'],
        CURLOPT_POSTFIELDS => json_encode(indexNowPayload($urls), JSON_UNESCAPED_SLASHES),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
    ]);
    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($body !== false && ($status === 200 || $status === 202)) {
        return null;
    }
    return trim("HTTP $status $err " . substr(trim((string)$body), 0, 120));
}
