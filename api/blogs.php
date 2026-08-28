<?php
/**
 * GET /api/blogs.php (list) or /api/blogs.php?slug=xxx (single post)
 * Public endpoint to fetch published blog posts.
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

try {
    if (!empty($slug)) {
        $stmt = $pdo->prepare('SELECT id, slug, title, excerpt, category, content, published_at, cover_image_url, updated_at FROM blog_posts WHERE slug = :slug AND status = "published" LIMIT 1');
        $stmt->execute([':slug' => $slug]);
        $post = $stmt->fetch();
        if ($post) {
            sendJson(['success' => true, 'data' => $post]);
        } else {
            sendJson(['success' => false, 'error' => 'Blog post not found'], 404);
        }
    } else {
        $enterprise = trim($_GET['enterprise'] ?? $_GET['enterprise_slug'] ?? '');
        if (!empty($enterprise) && $enterprise !== 'all') {
            $stmt = $pdo->prepare('SELECT id, slug, title, excerpt, category, enterprise_slug, content, published_at, cover_image_url FROM blog_posts WHERE status = "published" AND (enterprise_slug = :enterprise OR enterprise_slug = "corporate") ORDER BY published_at DESC, id DESC');
            $stmt->execute([':enterprise' => $enterprise]);
        } else {
            $stmt = $pdo->prepare('SELECT id, slug, title, excerpt, category, enterprise_slug, content, published_at, cover_image_url FROM blog_posts WHERE status = "published" ORDER BY published_at DESC, id DESC');
            $stmt->execute();
        }
        $posts = $stmt->fetchAll();
        sendJson(['success' => true, 'data' => $posts]);
    }
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Failed to fetch blogs', 'data' => []], 500);
}
