<?php
/**
 * GET /api/blogs.php                          (list)
 * GET /api/blogs.php?slug=xxx                 (single post)
 * GET /api/blogs.php?enterprise=<slug>        (list scoped to an enterprise)
 * GET /api/blogs.php?summary=1                (either list without `content`, except posts with no excerpt)
 *
 * Public endpoint to fetch published blog posts.
 *
 * A scoped request returns only that enterprise's published posts (an empty
 * list when it has none); corporate posts are never substituted.
 *
 * summary=1 leaves the article body out of a list (it is most of the payload and
 * grows with every post); a reader loads the one post it opens with ?slug=.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$slug = is_string($_GET['slug'] ?? null) ? trim($_GET['slug']) : '';
$pdo = getDbConnection();

if (!$pdo) {
    sendJson(['success' => false, 'data' => [], 'message' => 'Database unavailable, using fallback'], 200);
}

$cardColumns = 'id, slug, title, excerpt, category, enterprise_slug, published_at, cover_image_url, read_time, is_featured';
// A post without an excerpt keeps its body in the summary: list cards fall back to it for their teaser.
$columns = ($_GET['summary'] ?? '') === '1'
    ? "{$cardColumns}, IF(excerpt IS NULL OR excerpt = '', content, NULL) AS content"
    : "{$cardColumns}, content";

try {
    if (!empty($slug)) {
        $stmt = $pdo->prepare("SELECT {$cardColumns}, content, updated_at FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        $post = $stmt->fetch();
        if ($post) {
            sendJson(['success' => true, 'data' => $post]);
        } else {
            sendJson(['success' => false, 'error' => 'Blog post not found'], 404);
        }
    }

    $enterprise = $_GET['enterprise'] ?? $_GET['enterprise_slug'] ?? '';
    $enterprise = is_string($enterprise) ? trim($enterprise) : '';

    if ($enterprise === '' || $enterprise === 'all') {
        $stmt = $pdo->prepare("SELECT {$columns} FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC, id DESC");
        $stmt->execute();
        $posts = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT {$columns} FROM blog_posts WHERE status = 'published' AND enterprise_slug = :enterprise ORDER BY published_at DESC, id DESC");
        $stmt->execute([':enterprise' => $enterprise]);
        $posts = $stmt->fetchAll();
    }

    sendJson(['success' => true, 'data' => $posts]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch blogs', 'data' => []], 500);
}
