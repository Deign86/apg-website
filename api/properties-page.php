<?php
/**
 * GET /api/properties-page.php                      all available properties
 * GET /api/properties-page.php?listing=APR-XXXXXX   one property (410 once gone)
 * GET /api/properties-page.php?listing=warehouse-for-lease[/cavite]   a browse page (listingHubs()); anything else 404
 * GET /api/properties-page.php?ref=APR-XXXXXX       old shared link → 301 to the listing's own URL
 *
 * Crawler HTML for realty.alphapremiergroup.com/properties[/APR-XXXXXX | /{type}-for-{deal}[/{area}]] (.htaccess rule 0). The Drive feed
 * changes every 15 minutes, so these pages are rendered per request from the public view of the feed
 * (same as api/listings.php) instead of a build-time snapshot (tools/prerender.mjs), in the
 * snapshot's shape (api/lib/CrawlerPage.php).
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/Listings.php';
require_once __DIR__ . '/lib/CrawlerPage.php';

const PROPERTIES_URL = REALTY_ORIGIN . '/properties';
const PROPERTIES_TITLE = 'Available Properties for Lease & Sale | Alpha Premier Realty';
const PROPERTIES_DESCRIPTION = 'Office spaces, commercial spaces, warehouses and lots for lease or sale across Metro Manila and nearby provinces, updated live from Alpha Premier Realty.';

/** Public view of the Drive feed (hidden listings dropped, price overrides applied), reduced to text fields. */
function publicListings(): array {
    $feed = listingsFeed();
    if ($feed === null) {
        return [];
    }
    $text = static fn($v): string => is_string($v) ? $v : '';
    $texts = static fn($v): array => is_array($v) ? array_values(array_filter(array_map($text, $v), static fn(string $s): bool => trim($s) !== '')) : [];
    $rows = [];
    foreach (applyListingOverrides($feed['listings'], listingOverrides(getDbConnection())) as $l) {
        $row = ['terms' => $texts($l['terms'] ?? null), 'photos' => $texts($l['photos'] ?? null)];
        foreach (['ref', 'title', 'type', 'type_label', 'deal', 'area', 'size', 'price', 'added', 'updated'] as $key) {
            $row[$key] = $text($l[$key] ?? null);
        }
        if (preg_match(LISTING_REF_PATTERN, $row['ref'])) {
            $rows[] = $row;
        }
    }
    return $rows;
}

function priceText(array $l): string {
    return $l['price'] !== '' ? $l['price'] : 'Rate on request';
}

/** "Title, size. Price. Term. Term", cut at a word to fit 160 characters. */
function listingDescription(array $l): string {
    $parts = [$l['title'] . ($l['size'] !== '' ? ", {$l['size']}" : ''), priceText($l), ...$l['terms']];
    $parts = array_filter(array_map(static fn(string $p): string => rtrim(trim($p), '.'), $parts), static fn(string $p): bool => $p !== '');
    $text = implode('. ', $parts);
    if (mb_strlen($text) > 160) {
        $cut = mb_substr($text, 0, 159);
        $space = mb_strrpos($cut, ' ');
        $text = ($space === false ? $cut : mb_substr($cut, 0, $space)) . '…';
    }
    return $text;
}

function breadcrumbJsonLd(array $items): array {
    $items = [['Alpha Premier Realty', REALTY_ORIGIN . '/'], ['Available Properties', PROPERTIES_URL], ...$items];
    return ['@type' => 'BreadcrumbList', 'itemListElement' => array_map(
        static fn(array $item, int $i): array => ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $item[0], 'item' => $item[1]],
        $items,
        array_keys($items)
    )];
}

function listingItem(array $l): string {
    $details = array_filter([$l['area'], $l['size'], priceText($l)], static fn(string $s): bool => $s !== '');
    return '<li><a href="' . esc(listingUrl($l['ref'])) . '">' . esc($l['title']) . '</a> · ' . esc(implode(' · ', $details)) . "</li>\n";
}

function hubItem(array $hub): string {
    return '<li><a href="' . esc($hub['path']) . '">' . esc($hub['h1']) . "</a></li>\n";
}

function listingPage(array $l, array $listings, array $hubs): void {
    $url = listingUrl($l['ref']);
    $description = listingDescription($l);
    $photos = array_map(static fn(string $p): string => REALTY_ORIGIN . $p, $l['photos']);
    $filled = static fn(array $a): array => array_filter($a, static fn($v): bool => $v !== '' && $v !== [] && $v !== null);
    $graph = [
        $filled([
            '@type' => 'RealEstateListing',
            '@id' => "{$url}#listing",
            'url' => $url,
            'name' => $l['title'],
            'description' => $description,
            'identifier' => $l['ref'],
            'image' => $photos,
            'datePosted' => $l['added'],
            'dateModified' => $l['updated'],
            'contentLocation' => $l['area'] === '' ? null : [
                '@type' => 'Place',
                'name' => $l['area'],
                'address' => ['@type' => 'PostalAddress', 'addressLocality' => $l['area'], 'addressCountry' => 'PH'],
            ],
            'offers' => $filled([
                '@type' => 'Offer',
                'businessFunction' => ['lease' => 'http://purl.org/goodrelations/v1#LeaseOut', 'sale' => 'http://purl.org/goodrelations/v1#Sell'][$l['deal']] ?? null,
                'description' => priceText($l),
                'availability' => 'https://schema.org/InStock',
                'seller' => ['@id' => REALTY_ORIGIN . '/#organization', 'name' => 'Alpha Premier Realty'],
            ]),
        ]),
        breadcrumbJsonLd([[$l['title'], $url]]),
    ];
    $title = $l['title'] . ($l['size'] !== '' ? " ({$l['size']})" : '') . ' | Alpha Premier Realty';
    $head = headTags($title, $description, $url, $photos[0] ?? null, $graph);

    $facts = array_filter(['Type' => $l['type_label'], 'Location' => $l['area'], 'Size' => $l['size']], static fn(string $s): bool => $s !== '')
        + ['Price' => priceText($l)];
    $body = '<main><nav aria-label="Breadcrumb"><ol><li><a href="/">Alpha Premier Realty</a></li>'
        . '<li><a href="/properties">Available Properties</a></li><li aria-current="page">' . esc($l['title']) . "</li></ol></nav>\n"
        . '<article><h1>' . esc($l['title']) . '</h1><p>' . (['lease' => 'For Lease', 'sale' => 'For Sale'][$l['deal']] ?? 'Available') . "</p>\n<dl>";
    foreach ($facts as $label => $value) {
        $body .= "<dt>{$label}</dt><dd>" . esc($value) . '</dd>';
    }
    $body .= "</dl>\n";
    if ($l['terms'] !== []) {
        $body .= '<ul>' . implode('', array_map(static fn(string $t): string => '<li>' . esc($t) . '</li>', $l['terms'])) . "</ul>\n";
    }
    foreach ($l['photos'] as $i => $photo) {
        $body .= '<img src="' . esc($photo) . '" alt="' . esc($l['title'] . ', photo ' . ($i + 1)) . "\" loading=\"lazy\" />\n";
    }
    $body .= '<p>Exact location and viewing schedule are shared by our team after you inquire. Rates and availability are subject to confirmation.</p>'
        . '<p>Ref ' . esc($l['ref']) . "</p>\n"
        . '<p><a href="/inquire">Inquire about this property</a>, call <a href="tel:+639158889482">0915 888 9482</a>'
        . " or email <a href=\"mailto:contact@alphapremiergroup.com\">contact@alphapremiergroup.com</a>.</p></article>\n";
    // "More …" points at the listing's area browse page once that is indexable, else its type + deal page.
    $byPath = array_column($hubs, null, 'path');
    [$typeHub, $areaHub] = array_map(static fn(?string $path): ?array => $byPath[$path ?? ''] ?? null, listingHubPaths($l) + [null, null]);
    $more = $areaHub !== null && $areaHub['indexable'] ? $areaHub : $typeHub;
    if ($more !== null) {
        $body .= '<p><a href="' . esc($more['path']) . '">More ' . esc($more['h1']) . "</a></p>\n";
    }
    $others = array_slice(array_values(array_filter($listings, static fn(array $o): bool => $o['ref'] !== $l['ref'])), 0, 8);
    if ($others !== []) {
        $body .= "<section><h2>Other available properties</h2><ul>\n" . implode('', array_map('listingItem', $others)) . '</ul></section>';
    }
    sendPage(200, $head, $body . '</main>');
}

function indexPage(array $listings, array $hubs): void {
    $head = headTags(PROPERTIES_TITLE, PROPERTIES_DESCRIPTION, PROPERTIES_URL, null, [breadcrumbJsonLd([])]);
    $list = $listings === []
        ? '<p>Our listings are being updated. <a href="/inquire">Tell us what you need</a> and our team will send matching properties.</p>'
        : "<ul>\n" . implode('', array_map('listingItem', $listings)) . '</ul>';
    $browse = array_filter($hubs, static fn(array $h): bool => $h['indexable']);
    if ($browse !== []) {
        $list .= "\n<section><h2>Browse by type and area</h2><ul>\n" . implode('', array_map('hubItem', $browse)) . '</ul></section>';
    }
    sendPage(200, $head, '<main><h1>Available Properties</h1><p>' . esc(PROPERTIES_DESCRIPTION) . "</p>\n" . $list . '</main>');
}

/** A browse page: the listings of one type + deal (+ area) hub, then links to the related hubs. */
function hubPage(array $hub, array $hubs, array $listings): void {
    $parent = null;
    foreach ($hubs as $h) {
        if ($hub['area_slug'] !== '' && $h['area_slug'] === '' && $h['type'] === $hub['type'] && $h['deal'] === $hub['deal']) {
            $parent = $h;
        }
    }
    $url = REALTY_ORIGIN . $hub['path'];
    $crumbs = $parent === null ? [] : [[$parent['h1'], REALTY_ORIGIN . $parent['path']]];
    $head = headTags($hub['title'], $hub['description'], $hub['indexable'] ? $url : null, null, [breadcrumbJsonLd([...$crumbs, [$hub['h1'], $url]])]);

    $members = array_filter($listings, static fn(array $l): bool => in_array($hub['path'], listingHubPaths($l), true));
    // A type + deal page links its area pages; an area page its type + deal page and the other pages for that area.
    $related = array_filter($hubs, static fn(array $h): bool => $h['indexable'] && $h['path'] !== $hub['path'] && ($hub['area_slug'] === ''
        ? $h['area_slug'] !== '' && $h['type'] === $hub['type'] && $h['deal'] === $hub['deal']
        : $h['area_slug'] === $hub['area_slug']));
    $related = $parent === null ? $related : [$parent, ...$related];

    $body = '<main><nav aria-label="Breadcrumb"><ol><li><a href="/">Alpha Premier Realty</a></li><li><a href="/properties">Available Properties</a></li>'
        . ($parent === null ? '' : '<li><a href="' . esc($parent['path']) . '">' . esc($parent['h1']) . '</a></li>')
        . '<li aria-current="page">' . esc($hub['h1']) . "</li></ol></nav>\n"
        . '<h1>' . esc($hub['h1']) . '</h1><p>' . esc($hub['description']) . "</p>\n"
        . "<ul>\n" . implode('', array_map('listingItem', $members)) . '</ul>';
    if ($related !== []) {
        $body .= "\n<section><h2>" . ($hub['area_slug'] === '' ? 'Browse by area' : 'Related properties') . "</h2><ul>\n"
            . implode('', array_map('hubItem', $related)) . '</ul></section>';
    }
    sendPage(200, $head, $body . '</main>');
}

/** 410 for a listing that was leased, sold or hidden; 404 for anything else (malformed ref, unknown browse page). */
function gonePage(int $status): void {
    $head = "<title>Property not available | Alpha Premier Realty</title>\n" . metaTag('name', 'robots', 'noindex');
    sendPage($status, $head, '<main><h1>This property is no longer available</h1><p>It may have been leased or sold. '
        . '<a href="/properties">See all available properties</a>.</p></main>');
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(['error' => 'Method not allowed'], 405);
}

$listing = $_GET['listing'] ?? null;
if ($listing === null) {
    $ref = $_GET['ref'] ?? null;
    if (is_string($ref) && preg_match(LISTING_REF_PATTERN, $ref)) {
        header('Location: ' . listingUrl($ref), true, 301);
        exit;
    }
    $listings = publicListings();
    indexPage($listings, listingHubs($listings));
}
if (!is_string($listing)) {
    gonePage(404);
}
$listings = publicListings();
$hubs = listingHubs($listings);
if (preg_match(LISTING_REF_PATTERN, $listing)) {
    foreach ($listings as $l) {
        if ($l['ref'] === $listing) {
            listingPage($l, $listings, $hubs);
        }
    }
    gonePage(410);
}
foreach ($hubs as $hub) {
    if ($hub['path'] === "/properties/$listing") {
        hubPage($hub, $hubs, $listings);
    }
}
gonePage(404);
