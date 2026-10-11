<?php
/**
 * Shared admin image upload: validates the multipart `image` field, stores it under
 * <web root>/uploads/<dir>/ with a random name, and responds with its public URL.
 *
 * Images only (JPG, PNG, WebP), checked with getimagesize() because shared hosting
 * and local PHP may lack the fileinfo extension; 5 MB cap. Always ends the request
 * via sendJson(). Callers run requireAdminAuth() and their capability check first.
 */
function handleAdminImageUpload(string $dir, string $prefix): void {
    if (!isset($_FILES['image']) || !is_array($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        sendJson(['success' => false, 'error' => 'No valid image file uploaded'], 400);
    }

    $file = $_FILES['image'];
    if ($file['size'] > 5 * 1024 * 1024) {
        sendJson(['success' => false, 'error' => 'Image too large. Max 5MB'], 400);
    }

    // getimagesize() parses the image header (core PHP, no fileinfo extension needed).
    $imageInfo = @getimagesize($file['tmp_name']);
    $mimeType = $imageInfo['mime'] ?? '';

    $allowedMimes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($allowedMimes[$mimeType])) {
        sendJson(['success' => false, 'error' => 'Invalid file format. Allowed: JPG, PNG, WebP'], 400);
    }

    $uploadDir = webRootDir() . '/uploads/' . $dir;
    if (!is_dir($uploadDir) && !@mkdir($uploadDir, 0755, true)) {
        sendJson(['success' => false, 'error' => 'Upload directory unavailable'], 500);
    }

    $filename = $prefix . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $allowedMimes[$mimeType];
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $filename)) {
        sendJson(['success' => false, 'error' => 'Failed to save uploaded image file'], 500);
    }

    $publicUrl = '/uploads/' . $dir . '/' . $filename;
    sendJson(['success' => true, 'message' => 'Image uploaded successfully', 'url' => $publicUrl, 'image_url' => $publicUrl]);
}
