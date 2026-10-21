<?php
/**
 * GET /sitemap-blogs.xml (.htaccess → api/blogs-sitemap.php)
 * Live sitemap of every published blog article's own page (https://alphapremiergroup.com/blogs/{slug},
 * any company's post), lastmod = its last edit (updated_at is never NULL; Manila time, +08:00).
 * Listed in robots.txt.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(['error' => 'Method not allowed'], 405);
}

$pdo = getDbConnection();
try {
    $posts = $pdo
        ? $pdo->query("SELECT slug, updated_at AS lastmod FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC, id DESC")->fetchAll()
        : null;
} catch (PDOException $e) {
    error_log('blogs-sitemap: ' . $e->getMessage());
    $posts = null;
}
if ($posts === null) {
    // An empty sitemap would read as "no articles"; a 503 makes crawlers keep the last one and retry.
    http_response_code(503);
    header('Retry-After: 600');
    exit;
}

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=900');
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
foreach ($posts as $p) {
    $updated = is_string($p['lastmod']) ? strtotime($p['lastmod']) : false;
    echo '  <url><loc>' . htmlspecialchars("https://alphapremiergroup.com/blogs/{$p['slug']}", ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>'
        . ($updated ? '<lastmod>' . date(DATE_W3C, $updated) . '</lastmod>' : '') . "</url>\n";
}
echo "</urlset>\n";
