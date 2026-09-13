<?php
/**
 * /api/admin/blogs.php
 * Gated admin endpoint to manage blog articles across all APG enterprises.
 *
 *   GET    ?enterprise=&status=&category=&search=&page=&per_page=   list
 *   POST   create
 *   PUT    full update by id
 *   PATCH  partial update by id
 *   DELETE ?id=                                                     hard delete
 *
 * Auth: admin session cookie via requireAdminAuth() — identical to every other
 * api/admin/*.php endpoint. Any authenticated admin may manage articles for any
 * enterprise; per-enterprise RBAC is deliberately NOT enforced here because
 * api/admin/auth.php still hardcodes role='admin' and never reads admins.role.
 *
 * Deleting is a hard delete, matching api/admin/careers.php and
 * api/admin/services.php. blog_posts has no soft-delete column.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------------- helpers

function blogSlugify($text) {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text), '-'));
    return trim(preg_replace('/-+/', '-', $slug), '-');
}

/**
 * Returns [value, error]. On error, error is a non-empty message string.
 */
function readEnterpriseSlug($data, $default = 'corporate') {
    $slug = trim($data['enterprise_slug'] ?? '');
    if ($slug === '') {
        return [$default, null];
    }
    if (!isValidEnterpriseSlug($slug)) {
        return [null, 'Unknown enterprise_slug "' . $slug . '". Allowed: ' . implode(', ', enterpriseSlugs())];
    }
    return [$slug, null];
}

function readStatus($data, $default = 'draft') {
    $status = trim($data['status'] ?? '');
    if ($status === '') {
        return [$default, null];
    }
    if (!in_array($status, ['draft', 'published'], true)) {
        return [null, 'status must be either "draft" or "published"'];
    }
    return [$status, null];
}

function isDuplicateKeyError(PDOException $e) {
    return $e->getCode() === '23000';
}

// ---------------------------------------------------------------- GET (list)

if ($method === 'GET') {
    $where  = [];
    $params = [];

    $enterprise = trim($_GET['enterprise'] ?? $_GET['enterprise_slug'] ?? '');
    if ($enterprise !== '' && $enterprise !== 'all') {
        if (!isValidEnterpriseSlug($enterprise)) {
            sendJson(['success' => false, 'error' => 'Unknown enterprise_slug "' . $enterprise . '"'], 422);
        }
        $where[] = 'enterprise_slug = :enterprise';
        $params[':enterprise'] = $enterprise;
    }

    $status = trim($_GET['status'] ?? '');
    if ($status !== '' && $status !== 'all') {
        if (!in_array($status, ['draft', 'published'], true)) {
            sendJson(['success' => false, 'error' => 'status filter must be "draft" or "published"'], 422);
        }
        $where[] = 'status = :status';
        $params[':status'] = $status;
    }

    $category = trim($_GET['category'] ?? '');
    if ($category !== '' && $category !== 'all') {
        $where[] = 'category = :category';
        $params[':category'] = $category;
    }

    $search = trim($_GET['search'] ?? '');
    if ($search !== '') {
        $where[] = '(title LIKE :search OR slug LIKE :search OR excerpt LIKE :search OR category LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    $sql = 'SELECT * FROM blog_posts';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY COALESCE(published_at, created_at) DESC, id DESC';

    // Pagination is opt-in: no per_page means "return everything", which is what
    // the current admin UI expects.
    $perPage = (int)($_GET['per_page'] ?? 0);
    $page    = max(1, (int)($_GET['page'] ?? 1));
    $total   = null;

    if ($perPage > 0) {
        $perPage = min($perPage, 200);
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM blog_posts' . ($where ? ' WHERE ' . implode(' AND ', $where) : ''));
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();
        $sql .= ' LIMIT ' . $perPage . ' OFFSET ' . (($page - 1) * $perPage);
    }

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $response = ['success' => true, 'data' => $stmt->fetchAll()];
        if ($total !== null) {
            $response['total'] = $total;
            $response['page'] = $page;
            $response['per_page'] = $perPage;
        }
        sendJson($response);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to list blog posts'], 500);
    }
}

// ---------------------------------------------------------------- POST (create)

if ($method === 'POST') {
    requireAdminCapability('blogs');
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $title   = trim($data['title'] ?? '');
    $content = trim($data['content'] ?? '');

    if ($title === '') {
        sendJson(['success' => false, 'error' => 'Blog title is required'], 400);
    }
    if ($content === '') {
        sendJson(['success' => false, 'error' => 'Blog content is required'], 400);
    }

    [$enterpriseSlug, $err] = readEnterpriseSlug($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }
    [$status, $err] = readStatus($data);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    $slug = trim($data['slug'] ?? '');
    if ($slug === '') {
        $slug = blogSlugify($title);
    } else {
        $slug = blogSlugify($slug);
    }
    if ($slug === '') {
        sendJson(['success' => false, 'error' => 'Could not derive a valid slug from the title'], 400);
    }

    $excerpt       = trim($data['excerpt'] ?? '');
    $category      = trim($data['category'] ?? '') ?: 'CORPORATE';
    $coverImageUrl = trim($data['cover_image_url'] ?? '');
    $readTime      = trim($data['read_time'] ?? '') ?: null;
    $isFeatured    = !empty($data['is_featured']) ? 1 : 0;

    $publishedAt = null;
    if ($status === 'published') {
        $requested = trim($data['published_at'] ?? '');
        $publishedAt = $requested !== '' ? date('Y-m-d H:i:s', strtotime($requested)) : date('Y-m-d H:i:s');
    }

    try {
        $dupe = $pdo->prepare('SELECT id FROM blog_posts WHERE slug = :slug LIMIT 1');
        $dupe->execute([':slug' => $slug]);
        if ($dupe->fetch()) {
            sendJson(['success' => false, 'error' => 'An article with the slug "' . $slug . '" already exists'], 409);
        }

        $stmt = $pdo->prepare('
            INSERT INTO blog_posts (slug, title, excerpt, category, enterprise_slug, content, status, published_at, cover_image_url, read_time, is_featured)
            VALUES (:slug, :title, :excerpt, :category, :enterprise_slug, :content, :status, :published_at, :cover_image_url, :read_time, :is_featured)
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
            ':read_time'       => $readTime,
            ':is_featured'     => $isFeatured,
        ]);

        sendJson(['success' => true, 'message' => 'Blog post created', 'id' => (int)$pdo->lastInsertId()], 201);
    } catch (PDOException $e) {
        if (isDuplicateKeyError($e)) {
            sendJson(['success' => false, 'error' => 'An article with the slug "' . $slug . '" already exists'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to create blog post'], 500);
    }
}

// ---------------------------------------------------------------- PUT / PATCH

if ($method === 'PUT' || $method === 'PATCH') {
    requireAdminCapability('blogs');
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id = (int)($data['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid article id is required'], 400);
    }

    try {
        $existingStmt = $pdo->prepare('SELECT * FROM blog_posts WHERE id = :id LIMIT 1');
        $existingStmt->execute([':id' => $id]);
        $existing = $existingStmt->fetch();
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to load blog post'], 500);
    }

    if (!$existing) {
        sendJson(['success' => false, 'error' => 'Blog post not found'], 404);
    }

    // PATCH merges onto the stored row; PUT treats missing fields as empty.
    $isPatch = ($method === 'PATCH');
    $pick = function ($key, $fallback) use ($data, $isPatch) {
        if ($isPatch && !array_key_exists($key, $data)) {
            return $fallback;
        }
        return $data[$key] ?? $fallback;
    };

    $title   = trim($pick('title', $existing['title']));
    $content = trim($pick('content', $existing['content']));

    if ($title === '') {
        sendJson(['success' => false, 'error' => 'Blog title is required'], 400);
    }
    if ($content === '') {
        sendJson(['success' => false, 'error' => 'Blog content is required'], 400);
    }

    [$enterpriseSlug, $err] = readEnterpriseSlug($data, $existing['enterprise_slug']);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }
    [$status, $err] = readStatus($data, $existing['status']);
    if ($err) {
        sendJson(['success' => false, 'error' => $err], 422);
    }

    $slug = trim($pick('slug', $existing['slug']));
    $slug = $slug === '' ? blogSlugify($title) : blogSlugify($slug);
    if ($slug === '') {
        sendJson(['success' => false, 'error' => 'Could not derive a valid slug from the title'], 400);
    }

    $excerpt       = trim($pick('excerpt', $existing['excerpt'] ?? ''));
    $category      = trim($pick('category', $existing['category'] ?? 'CORPORATE')) ?: 'CORPORATE';
    $coverImageUrl = trim($pick('cover_image_url', $existing['cover_image_url'] ?? ''));
    $readTime      = trim($pick('read_time', $existing['read_time'] ?? '')) ?: null;
    $isFeatured    = !empty($pick('is_featured', $existing['is_featured'] ?? 0)) ? 1 : 0;

    // Preserve the original publish date; stamp one only on first publish.
    $publishedAt = $existing['published_at'];
    if ($status === 'published') {
        $requested = trim($data['published_at'] ?? '');
        if ($requested !== '') {
            $publishedAt = date('Y-m-d H:i:s', strtotime($requested));
        } elseif (empty($publishedAt)) {
            $publishedAt = date('Y-m-d H:i:s');
        }
    } else {
        $publishedAt = null;
    }

    try {
        $dupe = $pdo->prepare('SELECT id FROM blog_posts WHERE slug = :slug AND id <> :id LIMIT 1');
        $dupe->execute([':slug' => $slug, ':id' => $id]);
        if ($dupe->fetch()) {
            sendJson(['success' => false, 'error' => 'Another article already uses the slug "' . $slug . '"'], 409);
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
                read_time = :read_time,
                is_featured = :is_featured,
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
            ':read_time'       => $readTime,
            ':is_featured'     => $isFeatured,
        ]);

        sendJson(['success' => true, 'message' => 'Blog post updated']);
    } catch (PDOException $e) {
        if (isDuplicateKeyError($e)) {
            sendJson(['success' => false, 'error' => 'Another article already uses the slug "' . $slug . '"'], 409);
        }
        sendJson(['success' => false, 'error' => 'Failed to update blog post'], 500);
    }
}

// ---------------------------------------------------------------- DELETE

if ($method === 'DELETE') {
    requireAdminCapability('delete');
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendJson(['success' => false, 'error' => 'A valid article id is required'], 400);
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            sendJson(['success' => false, 'error' => 'Blog post not found'], 404);
        }
        sendJson(['success' => true, 'message' => 'Blog post deleted']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => 'Failed to delete blog post'], 500);
    }
}

sendJson(['error' => 'Method not allowed'], 405);
