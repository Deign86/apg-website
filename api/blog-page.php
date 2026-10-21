<?php
/**
 * GET /api/blog-page.php              the blog index (every published post)
 * GET /api/blog-page.php?slug=xxx     one published post (404 noindex otherwise)
 *
 * Crawler HTML for https://alphapremiergroup.com/blogs[/{slug}] (.htaccess rule 0): every company's
 * articles have their own page on the apex. Rendered per request from blog_posts, so a post an admin
 * publishes is crawlable at once. Output has the prerender snapshot's shape (api/lib/CrawlerPage.php),
 * with the head src/lib/blogSeo.ts renders client-side, so a change here must be made there too.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/CrawlerPage.php';

const SITE = 'https://alphapremiergroup.com';
const BLOGS_URL = SITE . '/blogs';
const BLOGS_TITLE = 'Blogs & News | Alpha Premier Group';
const BLOGS_DESCRIPTION = 'News, real estate insights, and company updates from Alpha Premier Group of Companies and its enterprises.';
const POST_COLUMNS = 'slug, title, excerpt, category, enterprise_slug, published_at, updated_at, cover_image_url, read_time';

/** A row's columns as text ('' for NULL). */
function textRow(array $row): array {
    return array_map(static fn($v): string => $v === null ? '' : (string)$v, $row);
}

/** [name, site URL] of the company a post belongs to; an unknown slug is the group itself. */
function company(string $slug): array {
    return isset(COMPANIES[$slug]) ? [COMPANIES[$slug][0], "https://{$slug}.alphapremiergroup.com/"] : ['Alpha Premier Group', SITE . '/'];
}

/** Admin text as one line of prose: heading / "- " markers and **bold** / *italic* marks dropped. */
function plainText(string $text): string {
    $text = preg_replace(['/^[ \t]*(?:#{1,3}|-) /m', '/\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/', '/[ \t\r\n]+/'], ['', '$1$2', ' '], $text);
    return trim($text, ' ');
}

/** At most $max characters, cut at a word with '…'. */
function clip(string $text, int $max): string {
    if (mb_strlen($text) <= $max) {
        return $text;
    }
    $cut = mb_substr($text, 0, $max - 1);
    $space = mb_strrpos($cut, ' ');
    return ($space === false ? $cut : mb_substr($cut, 0, $space)) . '…';
}

/** A stored date-time ("2026-10-09 19:06:03", Manila wall-clock time) as ISO 8601 +08:00; '' otherwise. */
function manilaIso(string $value): string {
    return preg_match('/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/', $value, $m) ? "{$m[1]}T{$m[2]}+08:00" : '';
}

/** "October 9, 2026", as the SPA shows it. */
function displayDate(string $value): string {
    $time = strtotime($value);
    return $time === false ? $value : date('F j, Y', $time);
}

/** Site paths become absolute on the apex, encoded like JavaScript's encodeURI (Seo.tsx). */
function absoluteUrl(string $src): string {
    if (str_starts_with($src, 'http')) {
        return $src;
    }
    $kept = ['%3B' => ';', '%2C' => ',', '%2F' => '/', '%3F' => '?', '%3A' => ':', '%40' => '@', '%26' => '&', '%3D' => '=',
        '%2B' => '+', '%24' => '$', '%21' => '!', '%2A' => '*', '%27' => "'", '%28' => '(', '%29' => ')', '%23' => '#'];
    return SITE . strtr(rawurlencode($src), $kept);
}

/** Inline **bold** / *italic* as src/components/RichText.tsx renders it; everything else is escaped text. */
function inlineHtml(string $text): string {
    $html = '';
    foreach (preg_split('/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/', $text, -1, PREG_SPLIT_DELIM_CAPTURE) as $part) {
        if (strlen($part) > 4 && str_starts_with($part, '**') && str_ends_with($part, '**')) {
            $html .= '<strong>' . esc(substr($part, 2, -2)) . '</strong>';
        } elseif (strlen($part) > 2 && str_starts_with($part, '*') && str_ends_with($part, '*')) {
            $html .= '<em>' . esc(substr($part, 1, -1)) . '</em>';
        } else {
            $html .= esc($part);
        }
    }
    return $html;
}

/**
 * The article body as src/components/BlogBody.tsx renders it: blank line = new paragraph, "# " / "## " = h2,
 * "### " = h3, "- " lines = a list. The admin writes text, never HTML, so only those tags (plus strong/em)
 * come out and every text run is escaped.
 */
function bodyHtml(string $content): string {
    $html = '';
    $paragraph = [];
    $list = [];
    $flush = static function () use (&$html, &$paragraph, &$list): void {
        $text = trim(implode(' ', $paragraph));
        if ($text !== '') {
            $html .= '<p>' . inlineHtml($text) . "</p>\n";
        }
        if ($list !== []) {
            $html .= '<ul>' . implode('', array_map(static fn(string $item): string => '<li>' . inlineHtml($item) . '</li>', $list)) . "</ul>\n";
        }
        $paragraph = [];
        $list = [];
    };
    foreach (explode("\n", $content) as $raw) {
        $line = trim($raw);
        if ($line === '') {
            $flush();
        } elseif (preg_match('/^(#{1,3}) (.*)$/', $line, $heading)) {
            $flush();
            $tag = strlen($heading[1]) === 3 ? 'h3' : 'h2';
            $html .= "<{$tag}>" . esc($heading[2]) . "</{$tag}>\n";
        } elseif (str_starts_with($line, '- ')) {
            if ($paragraph !== []) {
                $flush();
            }
            $list[] = substr($line, 2);
        } else {
            if ($list !== []) {
                $flush();
            }
            $paragraph[] = $line;
        }
    }
    $flush();
    return $html;
}

/** "Company · October 9, 2026[ · 5 min read]" */
function postMeta(array $p, bool $readTime): string {
    $parts = [company($p['enterprise_slug'])[0], $p['published_at'] === '' ? '' : displayDate($p['published_at']), $readTime ? $p['read_time'] : ''];
    return esc(implode(' · ', array_filter($parts, static fn(string $s): bool => $s !== '')));
}

function postItem(array $p): string {
    return '<li><a href="/blogs/' . esc($p['slug']) . '">' . esc($p['title']) . '</a> · ' . postMeta($p, false)
        . ($p['excerpt'] === '' ? '' : '<p>' . esc($p['excerpt']) . '</p>') . "</li>\n";
}

function articlePage(array $p, array $related): void {
    $url = BLOGS_URL . '/' . $p['slug'];
    [$companyName, $companyUrl] = company($p['enterprise_slug']);
    $description = clip(plainText($p['excerpt']) ?: plainText($p['content']) ?: $p['title'], 160);
    $image = $p['cover_image_url'] === '' ? null : absoluteUrl($p['cover_image_url']);
    $published = manilaIso($p['published_at']);
    $filled = static fn(array $a): array => array_filter($a, static fn($v): bool => $v !== '' && $v !== []);
    $crumbs = [['Alpha Premier Group', SITE . '/'], ['Blogs', BLOGS_URL], [$p['title'], $url]];
    $graph = [
        $filled([
            '@type' => 'BlogPosting',
            'headline' => clip($p['title'], 110),
            'description' => $description,
            'image' => $image === null ? [] : [$image],
            'datePublished' => $published,
            'dateModified' => manilaIso($p['updated_at']) ?: $published,
            'author' => ['@type' => 'Organization', 'name' => $companyName, 'url' => $companyUrl],
            'publisher' => ['@id' => SITE . '/#organization'],
            'mainEntityOfPage' => $url,
            'articleSection' => trim($p['category']),
        ]),
        ['@type' => 'BreadcrumbList', 'itemListElement' => array_map(
            static fn(array $c, int $i): array => ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[0], 'item' => $c[1]],
            $crumbs,
            array_keys($crumbs)
        )],
    ];
    $head = headTags("{$p['title']} | {$companyName}", $description, $url, $image, $graph);

    $body = '<main><nav aria-label="Breadcrumb"><ol><li><a href="/">Alpha Premier Group</a></li><li><a href="/blogs">Blogs</a></li>'
        . '<li aria-current="page">' . esc($p['title']) . "</li></ol></nav>\n"
        . '<article><h1>' . esc($p['title']) . '</h1><p>' . postMeta($p, true) . "</p>\n"
        . ($p['cover_image_url'] === '' ? '' : '<img src="' . esc($p['cover_image_url']) . '" alt="' . esc($p['title']) . "\" />\n")
        . bodyHtml($p['content'])
        . '<p><a href="/inquire">Inquire with Alpha Premier Group</a></p></article>' . "\n";
    if ($related !== []) {
        $body .= "<section><h2>More articles</h2><ul>\n" . implode('', array_map('postItem', $related)) . "</ul></section>\n";
    }
    sendPage(200, $head, $body . '<p><a href="/blogs">All articles</a></p></main>');
}

function indexPage(array $posts): void {
    $list = $posts === [] ? '<p>New articles are on the way.</p>' : "<ul>\n" . implode('', array_map('postItem', $posts)) . '</ul>';
    sendPage(200, headTags(BLOGS_TITLE, BLOGS_DESCRIPTION, BLOGS_URL, null, []), '<main><h1>Blogs &amp; News</h1><p>' . esc(BLOGS_DESCRIPTION) . "</p>\n" . $list . '</main>');
}

/** 404 for a slug with no published post; 503 when the database can't be read (crawlers retry, nothing is dropped). */
function errorPage(int $status): void {
    $title = $status === 404 ? "This article isn't available" : 'Our articles are temporarily unavailable';
    if ($status === 503) {
        header('Retry-After: 600');
    }
    sendPage($status, '<title>' . esc($title) . " | Alpha Premier Group</title>\n" . metaTag('name', 'robots', 'noindex'),
        '<main><h1>' . esc($title) . '</h1><p><a href="/blogs">See all articles</a>.</p></main>');
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(['error' => 'Method not allowed'], 405);
}

$slug = $_GET['slug'] ?? null;
if ($slug !== null && (!is_string($slug) || !preg_match('/^[a-z0-9-]+$/', $slug))) {
    errorPage(404);
}
$pdo = getDbConnection();
if (!$pdo) {
    errorPage(503);
}
try {
    if ($slug === null) {
        $stmt = $pdo->query("SELECT " . POST_COLUMNS . " FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC, id DESC");
        indexPage(array_map('textRow', $stmt->fetchAll()));
    }
    $stmt = $pdo->prepare("SELECT " . POST_COLUMNS . ", content FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1");
    $stmt->execute([':slug' => $slug]);
    $post = $stmt->fetch();
    if (!$post) {
        errorPage(404);
    }
    $post = textRow($post);
    // More reading, as on the SPA page: the same company's latest posts first, then everyone else's.
    $stmt = $pdo->prepare("SELECT " . POST_COLUMNS . " FROM blog_posts WHERE status = 'published' AND slug <> :slug "
        . 'ORDER BY enterprise_slug = :enterprise DESC, published_at DESC, id DESC LIMIT 3');
    $stmt->execute([':slug' => $slug, ':enterprise' => $post['enterprise_slug']]);
    articlePage($post, array_map('textRow', $stmt->fetchAll()));
} catch (PDOException $e) {
    error_log('blog-page: ' . $e->getMessage());
    errorPage(503);
}
