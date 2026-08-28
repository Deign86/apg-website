<?php
/**
 * /api/admin/listings.php
 * Gated admin endpoint to manage property listings and listing images (CRUD + Upload).
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

requireAdminAuth();
$pdo = getDbConnection();
if (!$pdo) {
    sendJson(['success' => false, 'error' => 'Database connection failed'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Helper to normalize property type
function normalizeType(string $type): string {
    $clean = strtolower(trim($type));
    if ($clean === 'commercial_spaces' || $clean === 'commercial space') return 'commercial';
    if ($clean === 'office_spaces' || $clean === 'office space') return 'office';
    if ($clean === 'condo') return 'condominium';
    if ($clean === 'virtual' || $clean === 'virtual office') return 'virtual_office';
    return $clean;
}

// -------------------------------------------------------------
// Action: Upload Image Endpoint (Multipart file upload)
// -------------------------------------------------------------
if ($action === 'upload_image' || ($method === 'POST' && isset($_FILES['image']))) {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        sendJson(['success' => false, 'error' => 'No valid image file uploaded'], 400);
    }

    $file = $_FILES['image'];
    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedMimes)) {
        sendJson(['success' => false, 'error' => 'Invalid file format. Allowed: JPG, PNG, WebP, GIF, SVG'], 400);
    }

    // Determine upload directory
    $uploadDir = __DIR__ . '/../../public/uploads/listings';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }
    if (!is_dir($uploadDir)) {
        $uploadDir = __DIR__ . '/../uploads/listings';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'listing_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . ($ext ?: 'jpg');
    $targetPath = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        sendJson(['success' => false, 'error' => 'Failed to save uploaded image file'], 500);
    }

    $publicUrl = '/uploads/listings/' . $filename;
    $listingId = isset($_POST['listing_id']) ? (int)$_POST['listing_id'] : null;

    if ($listingId) {
        try {
            $sortStmt = $pdo->prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM listing_images WHERE listing_id = :id');
            $sortStmt->execute([':id' => $listingId]);
            $nextSort = (int)$sortStmt->fetchColumn();

            $imgStmt = $pdo->prepare('
                INSERT INTO listing_images (listing_id, image_url, caption, sort_order, is_primary)
                VALUES (:listing_id, :image_url, :caption, :sort_order, :is_primary)
            ');
            $imgStmt->execute([
                ':listing_id' => $listingId,
                ':image_url'  => $publicUrl,
                ':caption'    => trim($_POST['caption'] ?? ''),
                ':sort_order' => $nextSort,
                ':is_primary' => !empty($_POST['is_primary']) ? 1 : 0,
            ]);
            $newImgId = $pdo->lastInsertId();

            sendJson([
                'success'   => true,
                'message'   => 'Image uploaded and attached',
                'image_id'  => $newImgId,
                'image_url' => $publicUrl
            ]);
        } catch (PDOException $e) {
            sendJson(['success' => true, 'image_url' => $publicUrl, 'warning' => 'File saved but DB record failed: ' . $e->getMessage()]);
        }
    }

    sendJson([
        'success'   => true,
        'message'   => 'Image uploaded successfully',
        'image_url' => $publicUrl
    ]);
}

// -------------------------------------------------------------
// 1. GET: List all listings or fetch single listing with images
// -------------------------------------------------------------
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    try {
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM listings WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $listing = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$listing) {
                sendJson(['success' => false, 'error' => 'Listing not found'], 404);
            }

            $imgStmt = $pdo->prepare('SELECT * FROM listing_images WHERE listing_id = :id ORDER BY is_primary DESC, sort_order ASC, id ASC');
            $imgStmt->execute([':id' => $id]);
            $listing['images'] = $imgStmt->fetchAll(PDO::FETCH_ASSOC);

            sendJson(['success' => true, 'data' => $listing]);
        } else {
            $category = trim($_GET['category'] ?? $_GET['type'] ?? '');
            $status = trim($_GET['status'] ?? '');

            $where = ['1=1'];
            $params = [];

            if (!empty($category) && $category !== 'all') {
                $where[] = 'l.property_type = :property_type';
                $params[':property_type'] = normalizeType($category);
            }

            if (!empty($status) && $status !== 'all') {
                $where[] = 'l.status = :status';
                $params[':status'] = $status;
            }

            $whereSql = implode(' AND ', $where);

            $stmt = $pdo->prepare("
                SELECT l.*, 
                       (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image,
                       (SELECT COUNT(*) FROM listing_images WHERE listing_id = l.id) as image_count
                FROM listings l
                WHERE {$whereSql}
                ORDER BY l.featured DESC, l.sort_order ASC, l.id DESC
            ");
            $stmt->execute($params);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendJson(['success' => true, 'data' => $items]);
        }
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// -------------------------------------------------------------
// 2. POST: Create New Listing
// -------------------------------------------------------------
if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: $_POST;

    $title        = trim($data['title'] ?? '');
    $slug         = trim($data['slug'] ?? '');
    $propertyType = normalizeType($data['property_type'] ?? 'condominium');
    $price        = !empty($data['price']) ? (float)$data['price'] : null;
    $priceDisplay = trim($data['price_display'] ?? '');
    $address      = trim($data['address'] ?? '');
    $city         = trim($data['city'] ?? 'Pasig City');
    $location     = trim($data['location'] ?? 'Ortigas Center, Pasig City');
    $floorArea    = !empty($data['floor_area']) ? (float)$data['floor_area'] : null;
    $lotArea      = !empty($data['lot_area']) ? (float)$data['lot_area'] : null;
    $bedrooms     = !empty($data['bedrooms']) ? (int)$data['bedrooms'] : null;
    $bathrooms    = !empty($data['bathrooms']) ? (int)$data['bathrooms'] : null;
    $status       = in_array($data['status'] ?? '', ['FOR SALE', 'FOR LEASE', 'PRE-SELLING', 'AVAILABLE']) ? $data['status'] : 'FOR SALE';
    $featured     = !empty($data['featured']) ? 1 : 0;
    $isPublished  = isset($data['is_published']) ? (int)$data['is_published'] : 1;
    $description  = trim($data['description'] ?? '');
    $sortOrder    = (int)($data['sort_order'] ?? 0);
    $images       = $data['images'] ?? [];

    if (empty($title)) {
        sendJson(['success' => false, 'error' => 'Property title is required'], 400);
    }

    if (empty($slug)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    }

    // Auto-generate price display if empty but price number provided
    if (empty($priceDisplay) && $price !== null) {
        $priceDisplay = '₱ ' . number_format($price, 2);
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('
            INSERT INTO listings (
                title, slug, property_type, price, price_display, address, city, location,
                floor_area, lot_area, bedrooms, bathrooms, status, featured, is_published,
                description, sort_order
            ) VALUES (
                :title, :slug, :property_type, :price, :price_display, :address, :city, :location,
                :floor_area, :lot_area, :bedrooms, :bathrooms, :status, :featured, :is_published,
                :description, :sort_order
            )
        ');
        $stmt->execute([
            ':title'         => $title,
            ':slug'          => $slug,
            ':property_type' => $propertyType,
            ':price'         => $price,
            ':price_display' => $priceDisplay,
            ':address'       => $address,
            ':city'          => $city,
            ':location'      => $location,
            ':floor_area'    => $floorArea,
            ':lot_area'      => $lotArea,
            ':bedrooms'      => $bedrooms,
            ':bathrooms'     => $bathrooms,
            ':status'        => $status,
            ':featured'      => $featured,
            ':is_published'  => $isPublished,
            ':description'   => $description,
            ':sort_order'    => $sortOrder,
        ]);

        $newId = (int)$pdo->lastInsertId();

        // Insert attached images
        if (is_array($images) && count($images) > 0) {
            $imgStmt = $pdo->prepare('
                INSERT INTO listing_images (listing_id, image_url, caption, sort_order, is_primary)
                VALUES (:listing_id, :image_url, :caption, :sort_order, :is_primary)
            ');

            foreach ($images as $idx => $img) {
                $url = is_array($img) ? trim($img['image_url'] ?? '') : trim((string)$img);
                if (!empty($url)) {
                    $caption = is_array($img) ? trim($img['caption'] ?? '') : '';
                    $isPrimary = is_array($img) && !empty($img['is_primary']) ? 1 : ($idx === 0 ? 1 : 0);
                    $sort = is_array($img) ? (int)($img['sort_order'] ?? ($idx + 1)) : ($idx + 1);

                    $imgStmt->execute([
                        ':listing_id' => $newId,
                        ':image_url'  => $url,
                        ':caption'    => $caption,
                        ':sort_order' => $sort,
                        ':is_primary' => $isPrimary,
                    ]);
                }
            }
        }

        $pdo->commit();
        sendJson(['success' => true, 'message' => 'Property listing created successfully', 'id' => $newId]);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// -------------------------------------------------------------
// 3. PUT: Update Existing Listing
// -------------------------------------------------------------
if ($method === 'PUT') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $id           = (int)($data['id'] ?? 0);
    $title        = trim($data['title'] ?? '');
    $slug         = trim($data['slug'] ?? '');
    $propertyType = normalizeType($data['property_type'] ?? 'condominium');
    $price        = !empty($data['price']) ? (float)$data['price'] : null;
    $priceDisplay = trim($data['price_display'] ?? '');
    $address      = trim($data['address'] ?? '');
    $city         = trim($data['city'] ?? 'Pasig City');
    $location     = trim($data['location'] ?? 'Ortigas Center, Pasig City');
    $floorArea    = !empty($data['floor_area']) ? (float)$data['floor_area'] : null;
    $lotArea      = !empty($data['lot_area']) ? (float)$data['lot_area'] : null;
    $bedrooms     = !empty($data['bedrooms']) ? (int)$data['bedrooms'] : null;
    $bathrooms    = !empty($data['bathrooms']) ? (int)$data['bathrooms'] : null;
    $status       = in_array($data['status'] ?? '', ['FOR SALE', 'FOR LEASE', 'PRE-SELLING', 'AVAILABLE']) ? $data['status'] : 'FOR SALE';
    $featured     = !empty($data['featured']) ? 1 : 0;
    $isPublished  = isset($data['is_published']) ? (int)$data['is_published'] : 1;
    $description  = trim($data['description'] ?? '');
    $sortOrder    = (int)($data['sort_order'] ?? 0);
    $images       = $data['images'] ?? null;

    if (!$id || empty($title)) {
        sendJson(['success' => false, 'error' => 'Valid ID and Title are required'], 400);
    }

    if (empty($slug)) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    }

    if (empty($priceDisplay) && $price !== null) {
        $priceDisplay = '₱ ' . number_format($price, 2);
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('
            UPDATE listings
            SET title = :title,
                slug = :slug,
                property_type = :property_type,
                price = :price,
                price_display = :price_display,
                address = :address,
                city = :city,
                location = :location,
                floor_area = :floor_area,
                lot_area = :lot_area,
                bedrooms = :bedrooms,
                bathrooms = :bathrooms,
                status = :status,
                featured = :featured,
                is_published = :is_published,
                description = :description,
                sort_order = :sort_order
            WHERE id = :id
        ');
        $stmt->execute([
            ':id'            => $id,
            ':title'         => $title,
            ':slug'          => $slug,
            ':property_type' => $propertyType,
            ':price'         => $price,
            ':price_display' => $priceDisplay,
            ':address'       => $address,
            ':city'          => $city,
            ':location'      => $location,
            ':floor_area'    => $floorArea,
            ':lot_area'      => $lotArea,
            ':bedrooms'      => $bedrooms,
            ':bathrooms'     => $bathrooms,
            ':status'        => $status,
            ':featured'      => $featured,
            ':is_published'  => $isPublished,
            ':description'   => $description,
            ':sort_order'    => $sortOrder,
        ]);

        // If images array passed, synchronize listing_images
        if (is_array($images)) {
            $delStmt = $pdo->prepare('DELETE FROM listing_images WHERE listing_id = :id');
            $delStmt->execute([':id' => $id]);

            $imgStmt = $pdo->prepare('
                INSERT INTO listing_images (listing_id, image_url, caption, sort_order, is_primary)
                VALUES (:listing_id, :image_url, :caption, :sort_order, :is_primary)
            ');

            foreach ($images as $idx => $img) {
                $url = is_array($img) ? trim($img['image_url'] ?? '') : trim((string)$img);
                if (!empty($url)) {
                    $caption = is_array($img) ? trim($img['caption'] ?? '') : '';
                    $isPrimary = is_array($img) && !empty($img['is_primary']) ? 1 : ($idx === 0 ? 1 : 0);
                    $sort = is_array($img) ? (int)($img['sort_order'] ?? ($idx + 1)) : ($idx + 1);

                    $imgStmt->execute([
                        ':listing_id' => $id,
                        ':image_url'  => $url,
                        ':caption'    => $caption,
                        ':sort_order' => $sort,
                        ':is_primary' => $isPrimary,
                    ]);
                }
            }
        }

        $pdo->commit();
        sendJson(['success' => true, 'message' => 'Property listing updated successfully']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// -------------------------------------------------------------
// 4. DELETE: Remove Listing
// -------------------------------------------------------------
if ($method === 'DELETE') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];
    $id = (int)($data['id'] ?? $_GET['id'] ?? 0);

    if (!$id) {
        sendJson(['success' => false, 'error' => 'Listing ID is required'], 400);
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM listings WHERE id = :id');
        $stmt->execute([':id' => $id]);

        sendJson(['success' => true, 'message' => 'Property listing deleted successfully']);
    } catch (PDOException $e) {
        sendJson(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJson(['error' => 'Invalid request method'], 400);
