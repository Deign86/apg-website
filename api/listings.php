<?php
/**
 * GET /api/listings.php
 * Public endpoint to fetch property listings (filterable, searchable, paginated).
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

// Fallback mock listings dataset if database is offline
$fallbackListings = [
    [
        'id' => 1,
        'title' => 'Premium Ortigas Central Logistics Warehouse',
        'slug' => 'premium-ortigas-central-logistics-warehouse',
        'property_type' => 'warehouse',
        'price' => 185000000.00,
        'price_display' => '₱ 185,000,000',
        'address' => 'Amang Rodriguez Ave',
        'city' => 'Pasig City',
        'location' => 'Pasig City, Metro Manila',
        'floor_area' => 3200.00,
        'lot_area' => 4500.00,
        'bedrooms' => null,
        'bathrooms' => 6,
        'status' => 'FOR SALE',
        'featured' => 1,
        'is_published' => 1,
        'description' => 'High-ceiling industrial logistics warehouse strategically situated with direct arterial access to C-5, Ortigas Avenue, and Marcos Highway. Features 12-meter clear heights, multi-bay loading docks with hydraulic levelers, heavy-duty concrete flooring (5000 PSI), 3-phase high-voltage power substation, and 24/7 guarded security perimeter.',
        'sort_order' => 1,
        'primary_image' => '/assets/images/realty-warehouse.png',
        'images' => [
            ['id' => 1, 'image_url' => '/assets/images/realty-warehouse.png', 'caption' => 'Exterior View & Loading Bay', 'sort_order' => 1, 'is_primary' => 1],
            ['id' => 2, 'image_url' => '/images/ware.jpg', 'caption' => 'Interior Warehouse Floor', 'sort_order' => 2, 'is_primary' => 0]
        ]
    ],
    [
        'id' => 2,
        'title' => 'Tektite East Tower Grade-A Commercial Office',
        'slug' => 'tektite-east-tower-grade-a-commercial-office',
        'property_type' => 'office',
        'price' => 420000.00,
        'price_display' => '₱ 420,000 / mo',
        'address' => 'Philippine Stock Exchange Centre, Exchange Road',
        'city' => 'Pasig City',
        'location' => 'Ortigas Center, Pasig City',
        'floor_area' => 450.00,
        'lot_area' => 450.00,
        'bedrooms' => null,
        'bathrooms' => 4,
        'status' => 'FOR LEASE',
        'featured' => 1,
        'is_published' => 1,
        'description' => 'Fully fitted corporate headquarters on a high floor overlooking the Ortigas skyline. Comes equipped with executive corner suites, 20-seat main boardroom with video conferencing infrastructure, acoustic open-plan workstations, private server room with dedicated precision cooling, and biometric access control.',
        'sort_order' => 2,
        'primary_image' => '/assets/images/realty-officespaces.png',
        'images' => [
            ['id' => 3, 'image_url' => '/assets/images/realty-officespaces.png', 'caption' => 'Executive Conference Room', 'sort_order' => 1, 'is_primary' => 1],
            ['id' => 4, 'image_url' => '/images/office.jpg', 'caption' => 'Open Plan Workspace', 'sort_order' => 2, 'is_primary' => 0]
        ]
    ],
    [
        'id' => 3,
        'title' => 'BGC High Street Retail Commercial Space',
        'slug' => 'bgc-high-street-retail-commercial-space',
        'property_type' => 'commercial',
        'price' => 280000.00,
        'price_display' => '₱ 280,000 / mo',
        'address' => 'Bonifacio High Street Block',
        'city' => 'Taguig City',
        'location' => 'Bonifacio Global City, Taguig',
        'floor_area' => 210.00,
        'lot_area' => 210.00,
        'bedrooms' => null,
        'bathrooms' => 2,
        'status' => 'FOR LEASE',
        'featured' => 1,
        'is_published' => 1,
        'description' => 'Prime ground-floor commercial and retail storefront boasting maximum pedestrian foot traffic along Bonifacio Global City. Double-height glass facade, grease trap provision, commercial exhaust shaft, 3-phase power, and dedicated alfresco seating entitlement.',
        'sort_order' => 3,
        'primary_image' => '/assets/images/realty-officespaces.png',
        'images' => [
            ['id' => 5, 'image_url' => '/assets/images/realty-officespaces.png', 'caption' => 'Storefront & High Foot-Traffic Corridor', 'sort_order' => 1, 'is_primary' => 1],
            ['id' => 6, 'image_url' => '/images/commercial.jpg', 'caption' => 'Commercial Interior Fit-out', 'sort_order' => 2, 'is_primary' => 0]
        ]
    ],
    [
        'id' => 4,
        'title' => 'The Grand Sapphire Luxury Sky Penthouse',
        'slug' => 'the-grand-sapphire-luxury-sky-penthouse',
        'property_type' => 'condominium',
        'price' => 68000000.00,
        'price_display' => '₱ 68,000,000',
        'address' => 'Emerald Avenue Cor. Sapphire Road',
        'city' => 'Pasig City',
        'location' => 'Ortigas Center, Pasig City',
        'floor_area' => 320.00,
        'lot_area' => 320.00,
        'bedrooms' => 4,
        'bathrooms' => 5,
        'status' => 'FOR SALE',
        'featured' => 1,
        'is_published' => 1,
        'description' => 'Ultra-luxury bi-level corner penthouse with panoramic 270-degree views of Metro Manila and the Sierra Madre mountains. Custom Italian marble finishes, gourmet chef kitchen with Gaggenau appliances, private plunge pool terrace, smart home automation, and 4 dedicated basement parking slots.',
        'sort_order' => 4,
        'primary_image' => '/assets/images/realty-condominium.png',
        'images' => [
            ['id' => 7, 'image_url' => '/assets/images/realty-condominium.png', 'caption' => 'Sky Penthouse Living Area', 'sort_order' => 1, 'is_primary' => 1],
            ['id' => 8, 'image_url' => '/images/condo.jpg', 'caption' => 'Master Suite & Skyline View', 'sort_order' => 2, 'is_primary' => 0]
        ]
    ],
    [
        'id' => 5,
        'title' => 'Valenzuela Industrial Park Modern Warehouse Complex',
        'slug' => 'valenzuela-industrial-park-modern-warehouse-complex',
        'property_type' => 'warehouse',
        'price' => 350000.00,
        'price_display' => '₱ 350,000 / mo',
        'address' => 'Paso de Blas Road',
        'city' => 'Valenzuela City',
        'location' => 'Valenzuela City, Metro Manila',
        'floor_area' => 2500.00,
        'lot_area' => 3000.00,
        'bedrooms' => null,
        'bathrooms' => 4,
        'status' => 'FOR LEASE',
        'featured' => 0,
        'is_published' => 1,
        'description' => 'Modern warehouse facility with wide container maneuverability, insulated roofing, fire sprinkler systems, dedicated administrative mezzanine office, and rapid access to NLEX Harbor Link.',
        'sort_order' => 5,
        'primary_image' => '/assets/images/realty-warehouse.png',
        'images' => [
            ['id' => 9, 'image_url' => '/assets/images/realty-warehouse.png', 'caption' => 'Warehouse Loading Bay & Gate', 'sort_order' => 1, 'is_primary' => 1]
        ]
    ],
    [
        'id' => 6,
        'title' => 'Makati CBD Prime Commercial Corner Space',
        'slug' => 'makati-cbd-prime-commercial-corner-space',
        'property_type' => 'commercial',
        'price' => 95000000.00,
        'price_display' => '₱ 95,000,000',
        'address' => 'Ayala Avenue Cor. Paseo de Roxas',
        'city' => 'Makati City',
        'location' => 'Makati CBD, Makati City',
        'floor_area' => 380.00,
        'lot_area' => 380.00,
        'bedrooms' => null,
        'bathrooms' => 3,
        'status' => 'FOR SALE',
        'featured' => 1,
        'is_published' => 1,
        'description' => 'Rare commercial property investment along the premier Ayala Avenue corridor. Suitable for private banking branches, luxury flagship showrooms, or corporate advisory firms.',
        'sort_order' => 6,
        'primary_image' => '/assets/images/realty-officespaces.png',
        'images' => [
            ['id' => 10, 'image_url' => '/assets/images/realty-officespaces.png', 'caption' => 'Makati CBD Commercial Showroom', 'sort_order' => 1, 'is_primary' => 1]
        ]
    ]
];

// Helper to normalize taxonomy types
function normalizeType(string $type): string {
    $clean = strtolower(trim($type));
    if ($clean === 'commercial_spaces' || $clean === 'commercial space') return 'commercial';
    if ($clean === 'office_spaces' || $clean === 'office space') return 'office';
    if ($clean === 'condo') return 'condominium';
    if ($clean === 'virtual' || $clean === 'virtual office') return 'virtual_office';
    return $clean;
}

$rawType = trim($_GET['type'] ?? $_GET['property_type'] ?? $_GET['category'] ?? '');
$typeFilter = !empty($rawType) && $rawType !== 'all' ? normalizeType($rawType) : '';
$search = trim($_GET['search'] ?? $_GET['q'] ?? '');
$city = trim($_GET['city'] ?? '');
$status = trim($_GET['status'] ?? '');
$featured = isset($_GET['featured']) ? (int)$_GET['featured'] : null;
$slug = trim($_GET['slug'] ?? '');
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 24)));
$offset = ($page - 1) * $limit;

$pdo = getDbConnection();

if (!$pdo) {
    // Filter fallback data in memory
    $filtered = array_filter($fallbackListings, function($item) use ($typeFilter, $search, $city, $status, $featured, $slug, $id) {
        if ($id && (int)$item['id'] !== $id) return false;
        if ($slug && $item['slug'] !== $slug) return false;
        if ($typeFilter && normalizeType($item['property_type']) !== $typeFilter) return false;
        if ($city && strcasecmp($item['city'], $city) !== 0) return false;
        if ($status && strcasecmp($item['status'], $status) !== 0) return false;
        if ($featured !== null && (int)$item['featured'] !== $featured) return false;
        if ($search) {
            $haystack = strtolower($item['title'] . ' ' . $item['location'] . ' ' . $item['address'] . ' ' . $item['description']);
            if (!str_contains($haystack, strtolower($search))) return false;
        }
        return true;
    });

    $total = count($filtered);
    $data = array_values(array_slice($filtered, $offset, $limit));

    sendJson([
        'success' => true,
        'source' => 'fallback',
        'data' => $data,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
}

try {
    $where = ['l.is_published = 1'];
    $params = [];

    if ($id) {
        $where[] = 'l.id = :id';
        $params[':id'] = $id;
    }

    if ($slug) {
        $where[] = 'l.slug = :slug';
        $params[':slug'] = $slug;
    }

    if ($typeFilter) {
        $where[] = 'l.property_type = :property_type';
        $params[':property_type'] = $typeFilter;
    }

    if ($city) {
        $where[] = 'l.city = :city';
        $params[':city'] = $city;
    }

    if ($status) {
        $where[] = 'l.status = :status';
        $params[':status'] = $status;
    }

    if ($featured !== null) {
        $where[] = 'l.featured = :featured';
        $params[':featured'] = $featured;
    }

    if ($search) {
        $where[] = '(l.title LIKE :search OR l.location LIKE :search OR l.address LIKE :search OR l.description LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    $whereSql = implode(' AND ', $where);

    // Get total count
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM listings l WHERE {$whereSql}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    // Query listings
    $sql = "
        SELECT l.* 
        FROM listings l 
        WHERE {$whereSql} 
        ORDER BY l.featured DESC, l.sort_order ASC, l.id DESC 
        LIMIT {$limit} OFFSET {$offset}
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no records from database but total count 0 and no filters, fallback check
    if (empty($listings) && $total === 0 && !$id && !$slug && empty($search) && empty($typeFilter)) {
        $total = count($fallbackListings);
        $data = array_slice($fallbackListings, $offset, $limit);
        sendJson([
            'success' => true,
            'source' => 'fallback',
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    // Attach images for the returned listings
    if (!empty($listings)) {
        $listingIds = array_column($listings, 'id');
        $inPlaceholders = implode(',', array_fill(0, count($listingIds), '?'));
        
        $imgStmt = $pdo->prepare("
            SELECT id, listing_id, image_url, caption, sort_order, is_primary 
            FROM listing_images 
            WHERE listing_id IN ({$inPlaceholders}) 
            ORDER BY is_primary DESC, sort_order ASC, id ASC
        ");
        $imgStmt->execute($listingIds);
        $allImages = $imgStmt->fetchAll(PDO::FETCH_ASSOC);

        $imagesByListing = [];
        foreach ($allImages as $img) {
            $imagesByListing[$img['listing_id']][] = $img;
        }

        foreach ($listings as &$item) {
            $itemImages = $imagesByListing[$item['id']] ?? [];
            $item['images'] = $itemImages;
            $primaryImg = !empty($itemImages) ? $itemImages[0]['image_url'] : '/assets/images/placeholder.svg';
            $item['primary_image'] = $primaryImg;
        }
    }

    sendJson([
        'success' => true,
        'data' => $listings,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
} catch (PDOException $e) {
    sendJson(['success' => false, 'error' => 'Database error occurred: ' . $e->getMessage(), 'data' => []], 500);
}
