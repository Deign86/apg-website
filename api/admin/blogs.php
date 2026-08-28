<?php
/**
 * /api/admin/blogs.php
 * Gated admin endpoint to manage blog articles (create, edit, publish/draft, delete).
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET (list all blogs)
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare('SELECT * FROM blog_posts ORDER BY id DESC');
        $stmt->execute();
        sendJson(['success' => true, 'data' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 2. POST (Create new blog post)
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $title          = trim($data['title'] ?? '');
    $slug           = trim($data['slug'] ?? '');
    $excerpt        = trim($data['excerpt'] ?? '');
    $category       = trim($data['category'] ?? 'CORPORATE');
    $enterpriseSlug = trim($data['enterprise_slug'] ?? 'corporate');
    $content        = trim($data['content'] ?? '');
    $status         = in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : 'draft';
    $coverImageUrl  = trim($data['cover_image_url'] ?? '');

    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Blog title is required'], 400);
    }

    if (empty($slug)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    }

    $publishedAt = ($status === 'published') ? date('Y-m-d H:i:s') : null;

    try {
        $stmt = $pdo->prepare('
            INSERT INTO blog_posts (slug, title, excerpt, category, enterprise_slug, content, status, published_at, cover_image_url)
            VALUES (:slug, :title, :excerpt, :category, :enterprise_slug, :content, :status, :published_at, :cover_image_url)
        ');
        $stmt->execute([
            ':slug'            => $slug,
            ':title'           => $title,
            ':excerpt'         => $excerpt,
            ':category'        => $category,
            ':enterprise_slug' => $enterpriseSlug,
            ':content'         => $content,
            ':status'          => $status,
            ':published_at'    => $publishedAt,
            ':cover_image_url' => $coverImageUrl,
        ]);

        sendJson(['success' => true, 'message' => 'Blog post created', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 3. PUT (Update existing blog post)
if ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id             = (int)($data['id'] ?? 0);
    $title          = trim($data['title'] ?? '');
    $slug           = trim($data['slug'] ?? '');
    $excerpt        = trim($data['excerpt'] ?? '');
    $category       = trim($data['category'] ?? 'CORPORATE');
    $enterpriseSlug = trim($data['enterprise_slug'] ?? 'corporate');
    $content        = trim($data['content'] ?? '');
    $status         = in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : 'draft';
    $coverImageUrl  = trim($data['cover_image_url'] ?? '');

    if (!$id || empty($title)) {
        sendJson(['success' => false, 'error' => 'Valid ID and Title are required'], 400);
    }

    if (empty($slug)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    }

    try {
        // Check existing published status
        $checkStmt = $pdo->prepare('SELECT published_at FROM blog_posts WHERE id = :id');
        $checkStmt->execute([':id' => $id]);
        $existing = $checkStmt->fetch();

        $publishedAt = $existing['published_at'] ?? null;
        if ($status === 'published' && empty($publishedAt)) {
            $publishedAt = date('Y-m-d H:i:s');
        } elseif ($status === 'draft') {
            $publishedAt = null;
        }

        $stmt = $pdo->prepare('
            UPDATE blog_posts
            SET slug = :slug,
                title = :title,
                excerpt = :excerpt,
                category = :category,
                enterprise_slug = :enterprise_slug,
                content = :content,
                status = :status,
                published_at = :published_at,
                cover_image_url = :cover_image_url,
                updated_at = NOW()
            WHERE id = :id
        ');
        $stmt->execute([
            ':id'              => $id,
            ':slug'            => $slug,
            ':title'           => $title,
            ':excerpt'         => $excerpt,
            ':category'        => $category,
            ':enterprise_slug' => $enterpriseSlug,
            ':content'         => $content,
            ':status'          => $status,
            ':published_at'    => $publishedAt,
            ':cover_image_url' => $coverImageUrl,
        ]);

        sendJson(['success' => true, 'message' => 'Blog post updated']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// 4. DELETE
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'Valid ID is required'], 400);
    }
    try {
        $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = :id');
        $stmt->execute([':id' => $id]);
        sendJson(['success' => true, 'message' => 'Blog post deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
