<?php
/**
 * Shared by the crawler HTML pages (api/properties-page.php, api/careers-page.php, api/blog-page.php): the shape of
 * the tools/prerender.mjs snapshots, i.e. the SPA shell with the page's head tags (data-rh, so react-helmet-async
 * replaces them) and its content in #prerender. Unlike a snapshot, src/main.jsx never mounts the app over these
 * pages (#root[data-server-page]): a crawler's renderer would run it on a stale cached copy of the API.
 */
const DEFAULT_OG_IMAGE = 'https://alphapremiergroup.com/og-image.jpg'; // 1376x768
const JSON_LD_FLAGS = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP;
// [name, logo] of each company site: names as the SPA shows them (src/data/enterprises.js), logos as ENTERPRISE_META in
// src/components/Seo.tsx. The group ('corporate') is named by each page; email-themes.php uses longer brand names.
const COMPANIES = [
    'virtual-office' => ['Virtual Office', '/assets/images/logo2025.png'],
    'realty' => ['Alpha Premier Realty', '/images/realty-banner-logo.png'],
    'luxe-prime' => ['Luxe Prime Realty', '/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png'],
    'swiftclear' => ['SwiftClear', '/images/swiftclear-logo.png'],
    '88prime' => ['88 Prime', '/assets/images/sstcompany-88prime11.png'],
    'alta-venture' => ['Alta Venture', '/assets/images/3. Alta Venture - Logo.png'],
    'dynamic-tree' => ['Dynamic Tree', '/assets/dynamic-tree/Dynamic_Tree_Logo-1.png'],
    'construction' => ['Alpha Premier Construction', '/assets/images/construction.png'],
];

function esc(string $text): string {
    return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function metaTag(string $attr, string $key, string $content): string {
    return '<meta data-rh="true" ' . $attr . '="' . $key . '" content="' . esc($content) . "\" />\n";
}

/**
 * The page's head tags, matching what src/components/Seo.tsx renders client-side; a null $url is its noindex page,
 * a null $image the default OG image (with its size), an empty $graph no JSON-LD.
 */
function headTags(string $title, string $description, ?string $url, ?string $image, array $graph): string {
    $img = $image ?? DEFAULT_OG_IMAGE;
    return '<title>' . esc($title) . "</title>\n"
        . metaTag('name', 'description', $description)
        . ($url === null ? metaTag('name', 'robots', 'noindex, follow') : '<link data-rh="true" rel="canonical" href="' . esc($url) . "\" />\n")
        . metaTag('property', 'og:site_name', 'Alpha Premier Group')
        . metaTag('property', 'og:locale', 'en_PH')
        . metaTag('property', 'og:type', 'website')
        . metaTag('property', 'og:title', $title)
        . metaTag('property', 'og:description', $description)
        . ($url === null ? '' : metaTag('property', 'og:url', $url))
        . metaTag('property', 'og:image', $img)
        . ($image === null ? metaTag('property', 'og:image:width', '1376') . metaTag('property', 'og:image:height', '768') : '')
        . metaTag('name', 'twitter:card', 'summary_large_image')
        . metaTag('name', 'twitter:title', $title)
        . metaTag('name', 'twitter:description', $description)
        . metaTag('name', 'twitter:image', $img)
        . ($graph === [] ? '' : '<script data-rh="true" type="application/ld+json">'
            . json_encode(['@context' => 'https://schema.org', '@graph' => $graph], JSON_LD_FLAGS) . "</script>\n");
}

/** The SPA shell (built index.html) with its default head tags swapped for $head and the content in #prerender. */
function sendPage(int $status, string $head, string $body): void {
    $shell = @file_get_contents(dirname(__DIR__, 2) . '/index.html');
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
        '<div id="root"></div>' => '<div id="root" data-server-page></div><div id="prerender">' . $body . '</div>',
    ]);
    exit;
}
