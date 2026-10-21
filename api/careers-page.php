<?php
/**
 * GET /api/careers-page.php                           the careers page: every active opening
 * GET /api/careers-page.php?job=39-marketing-intern   one opening (job = the path segment after /careers/)
 *
 * Crawler HTML for https://alphapremiergroup.com/careers[/{id}-{title-slug}] (.htaccess rule 0), rendered per request
 * from job_openings, so an opening is findable as soon as HR publishes it (a build-time snapshot, tools/prerender.mjs,
 * would wait for the next deploy). Same shape as the snapshots (api/lib/CrawlerPage.php), with the head the SPA
 * renders (src/lib/jobSeo.ts, CAREERS_SEO).
 * A closed opening is 410, an unknown one 404 (both noindex, listing the open positions); a missing or outdated
 * slug is a 301 to the opening's URL.
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/lib/CrawlerPage.php';
require_once __DIR__ . '/lib/JobPages.php';

const CAREERS_TITLE = 'Careers | Alpha Premier Group';
const CAREERS_DESCRIPTION = 'Explore job openings across Alpha Premier Group companies in real estate, construction, facility services, outsourcing, and more. Apply online.';
const GENERAL_APPLICATION = '<a href="/careers/apply?job=general">send a general application</a>';

/** "Title · Company · Location · Type" linking to the opening's page, or a note when nothing is open. */
function openPositions(array $jobs): string {
    if ($jobs === []) {
        return "<p>There are no open roles right now.</p>\n";
    }
    $item = static fn(array $job): string => '<li><a href="' . esc(jobPageUrl($job['id'], $job['title'])) . '">' . esc($job['title']) . '</a> · '
        . esc(implode(' · ', [jobHiringOrganization($job['enterprise_slug'])['name'], $job['location'], $job['type']])) . "</li>\n";
    return "<ul>\n" . implode('', array_map($item, $jobs)) . "</ul>\n";
}

function indexPage(array $jobs): void {
    sendPage(200, headTags(CAREERS_TITLE, CAREERS_DESCRIPTION, CAREERS_URL, null, []),'<main><h1>Careers at Alpha Premier Group</h1><p>' . esc(CAREERS_DESCRIPTION)
        . "</p>\n<h2>Open positions</h2>\n" . openPositions($jobs) . "<p>Don't see a role that fits? You can " . GENERAL_APPLICATION . '.</p></main>');
}

function jobPage(array $job): void {
    $seo = jobPageSeo($job);
    $apply = '<p><a href="/careers/apply?job=' . $job['id'] . "\">Apply for this position</a></p>\n";
    $facts = ['Location' => $job['location'], 'Employment type' => $job['type']] + ($job['salary'] === '' ? [] : ['Salary' => $job['salary']]);
    $body = '<main><nav aria-label="Breadcrumb"><ol><li><a href="/careers">Careers</a></li><li aria-current="page">' . esc($job['title']) . "</li></ol></nav>\n"
        . '<article><p>' . esc($seo['graph'][0]['hiringOrganization']['name']) . '</p><h1>' . esc($job['title']) . "</h1>\n<dl>";
    foreach ($facts as $label => $value) {
        $body .= "<dt>$label</dt><dd>" . esc($value) . '</dd>';
    }
    $body .= "</dl>\n" . $apply;
    if (trim($job['description']) !== '') {
        $body .= '<h2>About the role</h2><p>' . nl2br(esc(trim($job['description'])), false) . "</p>\n";
    }
    foreach (['Responsibilities' => $job['responsibilities'], 'Requirements' => $job['requirements']] as $heading => $items) {
        $items = array_filter($items, static fn(string $s): bool => trim($s) !== '');
        if ($items !== []) {
            $body .= "<h2>$heading</h2><ul>" . implode('', array_map(static fn(string $s): string => '<li>' . esc($s) . '</li>', $items)) . "</ul>\n";
        }
    }
    sendPage(200, headTags($seo['title'], $seo['description'], $seo['url'], null, $seo['graph']),
        $body . $apply . "</article>\n<p><a href=\"/careers\">See all open positions</a></p></main>");
}

/** 410 for an opening that was closed, 404 for any other id; both point to the openings that are still open. */
function notOpenPage(int $status, array $jobs): void {
    $head = headTags('Position no longer open | Alpha Premier Group Careers',
        'This job opening is no longer accepting applications. See the current openings at Alpha Premier Group companies.', null, null, []);
    sendPage($status, $head, '<main><h1>This position is no longer open</h1><p>It may have been filled or closed. Here are our current openings.</p>'
        . "\n" . openPositions($jobs) . '<p><a href="/careers">See all careers</a> or ' . GENERAL_APPLICATION . '.</p></main>');
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
    sendJson(['error' => 'Method not allowed'], 405);
}

$segment = $_GET['job'] ?? null;
// The id of /careers/39, /careers/39-any-slug (a trailing slash allowed), as src/lib/jobSeo.ts jobIdFromPath reads it.
$id = is_string($segment) && preg_match('#^([0-9]{1,10})(?:-[^/]*)?/?$#', $segment, $m) ? (int)$m[1] : null;
$pdo = getDbConnection();
try {
    if (!$pdo) {
        throw new RuntimeException('Database unavailable');
    }
    $jobs = array_map('jobOpening', $pdo->query("SELECT id, title, location, type, description, requirements, responsibilities, salary, enterprise_slug, created_at
        FROM job_openings WHERE status = 'active' ORDER BY sort_order ASC, id DESC")->fetchAll());
    $closed = false;
    if ($id !== null) {
        $stmt = $pdo->prepare("SELECT 1 FROM job_openings WHERE id = :id AND status <> 'active'");
        $stmt->execute([':id' => $id]);
        $closed = $stmt->fetchColumn() !== false;
    }
} catch (Throwable $e) {
    // A crawler retries a 503 later instead of dropping the pages.
    header('Retry-After: 600');
    sendPage(503, '<title>' . esc(CAREERS_TITLE) . "</title>\n", '<main><h1>Careers</h1><p>Our job openings could not be loaded right now. Please try again shortly.</p></main>');
}

if ($segment === null) {
    indexPage($jobs);
}
foreach ($jobs as $job) {
    if ($job['id'] === $id) {
        $url = jobPageUrl($id, $job['title']);
        if (CAREERS_URL . "/$segment" !== $url) {
            header("Location: $url", true, 301);
            exit;
        }
        jobPage($job);
    }
}
notOpenPage($closed ? 410 : 404, $jobs);
