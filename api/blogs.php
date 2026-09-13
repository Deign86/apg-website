<?php
/**
 * GET /api/blogs.php                          (list)
 * GET /api/blogs.php?slug=xxx                 (single post)
 * GET /api/blogs.php?enterprise=<slug>        (list scoped to an enterprise)
 *
 * Public endpoint to fetch published blog posts.
 *
 * Enterprise scoping is FALLBACK-ONLY: a scoped request returns that
 * enterprise's own posts, and only if it has none does it return corporate
 * posts instead. Corporate posts are never merged into a non-empty result.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$pdo = getDbConnection();

if (!$pdo) {
    sendJson(['success' => false, 'data' => [], 'message' => 'Database unavailable, using fallback'], 200);
}

$columns = 'id, slug, title, excerpt, category, enterprise_slug, content, published_at, cover_image_url, read_time, is_featured';

try {
    if (!empty($slug)) {
        $stmt = $pdo->prepare("SELECT {$columns}, updated_at FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        $post = $stmt->fetch();
        if ($post) {
            sendJson(['success' => true, 'data' => $post]);
        } else {
            sendJson(['success' => false, 'error' => 'Blog post not found'], 404);
        }
    }

    $enterprise = trim($_GET['enterprise'] ?? $_GET['enterprise_slug'] ?? '');
    $fallback = false;

    if ($enterprise === '' || $enterprise === 'all') {
        $stmt = $pdo->prepare("SELECT {$columns} FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC, id DESC");
        $stmt->execute();
        $posts = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT {$columns} FROM blog_posts WHERE status = 'published' AND enterprise_slug = :enterprise ORDER BY published_at DESC, id DESC");
        $stmt->execute([':enterprise' => $enterprise]);
        $posts = $stmt->fetchAll();

        if (empty($posts) && $enterprise !== 'corporate') {
            $stmt = $pdo->prepare("SELECT {$columns} FROM blog_posts WHERE status = 'published' AND enterprise_slug = 'corporate' ORDER BY published_at DESC, id DESC");
            $stmt->execute();
            $posts = $stmt->fetchAll();
            $fallback = true;
        }
    }

    sendJson(['success' => true, 'data' => $posts, 'fallback' => $fallback]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch blogs', 'data' => []], 500);
}
