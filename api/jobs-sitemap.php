<?php
/**
 * GET /sitemap-jobs.xml (.htaccess → api/jobs-sitemap.php)
 * Live sitemap of every active job opening's page (https://alphapremiergroup.com/careers/{id}-{title-slug},
 * rendered for crawlers by api/careers-page.php), lastmod = the opening's last edit. Listed in robots.txt.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/JobPages.php';

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(['error' => 'Method not allowed'], 405);
}

$pdo = getDbConnection();
try {
    $jobs = $pdo ? $pdo->query("SELECT id, title, updated_at FROM job_openings WHERE status = 'active' ORDER BY sort_order ASC, id DESC")->fetchAll() : null;
} catch (PDOException $e) {
    $jobs = null;
}
if ($jobs === null) {
    // Crawlers retry a 503 later instead of treating the job pages as gone.
    http_response_code(503);
    header('Retry-After: 600');
    exit;
}

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=900');
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
foreach ($jobs as $job) {
    $updated = strtotime((string)$job['updated_at']); // Manila wall-clock time, the default time zone (config.php)
    echo '  <url><loc>' . htmlspecialchars(jobPageUrl((int)$job['id'], (string)$job['title']), ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>'
        . ($updated ? '<lastmod>' . date(DATE_W3C, $updated) . '</lastmod>' : '') . "</url>\n";
}
echo "</urlset>\n";
