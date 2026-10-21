<?php
/**
 * GET /api/properties-page.php                      all available properties
 * GET /api/properties-page.php?listing=APR-XXXXXX   one property (410 once gone, 404 for a malformed ref)
 * GET /api/properties-page.php?ref=APR-XXXXXX       old shared link → 301 to the listing's own URL
 *
 * Crawler HTML for realty.alphapremiergroup.com/properties[/APR-XXXXXX] (.htaccess rule 0). The Drive feed
 * changes every 15 minutes, so these pages are rendered per request from the public view of the feed
 * (same as api/listings.php) instead of a build-time snapshot (tools/prerender.mjs). Output has the
 * snapshot's shape: the SPA shell with this page's head tags (data-rh, so react-helmet-async replaces
 * them) and the content in #prerender, which src/main.jsx swaps for the live app when a crawler runs JS.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/Listings.php';

const PROPERTIES_URL = REALTY_ORIGIN . '/properties';
const DEFAULT_OG_IMAGE = 'https://alphapremiergroup.com/og-image.jpg'; // 1376x768
const PROPERTIES_TITLE = 'Available Properties for Lease & Sale | Alpha Premier Realty';
const PROPERTIES_DESCRIPTION = 'Office spaces, commercial spaces, warehouses and lots for lease or sale across Metro Manila and nearby provinces, updated live from Alpha Premier Realty.';
const JSON_LD_FLAGS = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP;

function esc(string $text): string {
    return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function metaTag(string $attr, string $key, string $content): string {
    return '<meta data-rh="true" ' . $attr . '="' . $key . '" content="' . esc($content) . "\" />\n";
}

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
        foreach (['ref', 'title', 'type_label', 'deal', 'area', 'size', 'price', 'added', 'updated'] as $key) {
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

/** The page's head tags, matching what src/components/Seo.tsx renders client-side. */
function headTags(string $title, string $description, string $url, ?string $image, array $graph): string {
    $img = $image ?? DEFAULT_OG_IMAGE;
    return '<title>' . esc($title) . "</title>\n"
        . metaTag('name', 'description', $description)
        . '<link data-rh="true" rel="canonical" href="' . esc($url) . "\" />\n"
        . metaTag('property', 'og:site_name', 'Alpha Premier Group')
        . metaTag('property', 'og:locale', 'en_PH')
        . metaTag('property', 'og:type', 'website')
        . metaTag('property', 'og:title', $title)
        . metaTag('property', 'og:description', $description)
        . metaTag('property', 'og:url', $url)
        . metaTag('property', 'og:image', $img)
        . ($image === null ? metaTag('property', 'og:image:width', '1376') . metaTag('property', 'og:image:height', '768') : '')
        . metaTag('name', 'twitter:card', 'summary_large_image')
        . metaTag('name', 'twitter:title', $title)
        . metaTag('name', 'twitter:description', $description)
        . metaTag('name', 'twitter:image', $img)
        . '<script data-rh="true" type="application/ld+json">'
        . json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_LD_FLAGS) . "</script>\n";
}

function listingItem(array $l): string {
    $details = array_filter([$l['area'], $l['size'], priceText($l)], static fn(string $s): bool => $s !== '');
    return '<li><a href="' . esc(listingUrl($l['ref'])) . '">' . esc($l['title']) . '</a> · ' . esc(implode(' · ', $details)) . "</li>\n";
}

function listingPage(array $l, array $listings): void {
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
    $others = array_slice(array_values(array_filter($listings, static fn(array $o): bool => $o['ref'] !== $l['ref'])), 0, 8);
    if ($others !== []) {
        $body .= "<section><h2>Other available properties</h2><ul>\n" . implode('', array_map('listingItem', $others)) . '</ul></section>';
    }
    sendPage(200, $head, $body . '</main>');
}

function indexPage(array $listings): void {
    $head = headTags(PROPERTIES_TITLE, PROPERTIES_DESCRIPTION, PROPERTIES_URL, null, [breadcrumbJsonLd([])]);
    $list = $listings === []
        ? '<p>Our listings are being updated. <a href="/inquire">Tell us what you need</a> and our team will send matching properties.</p>'
        : "<ul>\n" . implode('', array_map('listingItem', $listings)) . '</ul>';
    sendPage(200, $head, '<main><h1>Available Properties</h1><p>' . esc(PROPERTIES_DESCRIPTION) . "</p>\n" . $list . '</main>');
}

/** 410 for a listing that was leased, sold or hidden; 404 for a malformed ref. */
function gonePage(int $status): void {
    $head = "<title>Property not available | Alpha Premier Realty</title>\n" . metaTag('name', 'robots', 'noindex');
    sendPage($status, $head, '<main><h1>This property is no longer available</h1><p>It may have been leased or sold. '
        . '<a href="/properties">See all available properties</a>.</p></main>');
}

/** The SPA shell (built index.html) with its default head tags swapped for $head and the content in #prerender. */
function sendPage(int $status, string $head, string $body): void {
    $shell = @file_get_contents(dirname(__DIR__) . '/index.html');
    if (!is_string($shell) || !str_contains($shell, '</head>') || !str_contains($shell, '<div id="root"></div>')) {
        $shell = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\" />\n"
            . "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n</head>\n<body>\n<div id=\"root\"></div>\n</body>\n</html>\n";
    }
    $shell = preg_replace(['#<title>.*?</title>\s*#s', '#<meta data-rh="true"[^>]*>\s*#'], '', $shell);
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-cache');
    header('Vary: User-Agent');
    echo strtr($shell, [
        '</head>' => $head . '</head>',
        '<div id="root"></div>' => '<div id="root" style="visibility:hidden;position:absolute;top:0;left:0;right:0"></div><div id="prerender">' . $body . '</div>',
    ]);
    exit;
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
    indexPage(publicListings());
}
if (!is_string($listing) || !preg_match(LISTING_REF_PATTERN, $listing)) {
    gonePage(404);
}
$listings = publicListings();
foreach ($listings as $l) {
    if ($l['ref'] === $listing) {
        listingPage($l, $listings);
    }
}
gonePage(410);
