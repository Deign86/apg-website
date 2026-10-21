<?php
/**
 * Each active job opening's own page, https://alphapremiergroup.com/careers/{id}-{title-slug}: its URL and the
 * head metadata + JobPosting JSON-LD of api/careers-page.php (crawler HTML), also used by api/jobs-sitemap.php.
 * The SPA builds the same in src/lib/jobSeo.ts; tests/unit/job-seo.test.mjs checks that both agree.
 */
const CAREERS_URL = 'https://alphapremiergroup.com/careers';

/** "/careers/39-marketing-intern" as a full URL: the title's ASCII letters and digits in lowercase, other runs '-'. */
function jobPageUrl(int $id, string $title): string {
    $slug = trim(strtolower(preg_replace('/[^A-Za-z0-9]+/', '-', $title)), '-');
    return CAREERS_URL . '/' . $id . ($slug === '' ? '' : "-$slug");
}

/** A job_openings row as the SPA maps a GET /api/careers.php row (views/CareersView toJobPosition): defaults, text lists. */
function jobOpening(array $row): array {
    $text = static fn($v): string => is_string($v) ? $v : '';
    // As api/careers.php decodes them; the SPA takes each item as text (String()), here the text and number items.
    $list = static function ($json): array {
        if (empty($json)) {
            return [];
        }
        $decoded = json_decode((string)$json, true);
        $items = array_filter(is_array($decoded) ? $decoded : [$json], static fn($v): bool => is_string($v) || is_int($v) || is_float($v));
        return array_values(array_map('strval', $items));
    };
    return [
        'id' => (int)$row['id'],
        'title' => $text($row['title'] ?? null),
        'location' => $text($row['location'] ?? null) === '' ? 'Ortigas Center, Pasig City' : $row['location'],
        'type' => $text($row['type'] ?? null) === '' ? 'Full-time' : $row['type'],
        'description' => $text($row['description'] ?? null),
        'responsibilities' => $list($row['responsibilities'] ?? null),
        'requirements' => $list($row['requirements'] ?? null),
        'salary' => trim($text($row['salary'] ?? null)),
        'enterprise_slug' => $text($row['enterprise_slug'] ?? null),
        'created_at' => $text($row['created_at'] ?? null),
    ];
}

/**
 * The hiring company: its name (src/data/enterprises.js), site and logo (ENTERPRISE_META in src/components/Seo.tsx,
 * spaces URL-encoded as encodeURI does); 'corporate' or an unknown slug is the group.
 */
function jobHiringOrganization(string $slug): array {
    $companies = [
        'virtual-office' => ['Virtual Office', '/assets/images/logo2025.png'],
        'realty' => ['Alpha Premier Realty', '/images/realty-banner-logo.png'],
        'luxe-prime' => ['Luxe Prime Realty', '/assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png'],
        'swiftclear' => ['SwiftClear', '/images/swiftclear-logo.png'],
        '88prime' => ['88 Prime', '/assets/images/sstcompany-88prime11.png'],
        'alta-venture' => ['Alta Venture', '/assets/images/3. Alta Venture - Logo.png'],
        'dynamic-tree' => ['Dynamic Tree', '/assets/dynamic-tree/Dynamic_Tree_Logo-1.png'],
        'construction' => ['Alpha Premier Construction', '/assets/images/construction.png'],
    ];
    [$name, $site, $logo] = isset($companies[$slug])
        ? [$companies[$slug][0], "https://$slug.alphapremiergroup.com/", $companies[$slug][1]]
        : ['Alpha Premier Group of Companies', 'https://alphapremiergroup.com/', '/favicon.png'];
    return ['@type' => 'Organization', 'name' => $name, 'sameAs' => $site, 'logo' => 'https://alphapremiergroup.com' . str_replace(' ', '%20', $logo)];
}

function jobEscape(string $text): string {
    return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Line breaks, tabs and repeated spaces become one space; no leading or trailing space. */
function jobOneLine(string $text): string {
    return trim(preg_replace('/[ \t\r\n]+/', ' ', $text), ' ');
}

/** "<h3>Heading</h3><ul><li>…</li></ul>" of the non-blank items, or '' when there are none. */
function jobHtmlList(string $heading, array $items): string {
    $lines = array_filter(array_map('jobOneLine', $items), static fn(string $s): bool => $s !== '');
    return $lines === [] ? '' : "<h3>$heading</h3><ul>" . implode('', array_map(static fn(string $s): string => '<li>' . jobEscape($s) . '</li>', $lines)) . '</ul>';
}

/** Canonical URL, title, description (cut at a word to 160 characters) and JobPosting JSON-LD of a jobOpening(). */
function jobPageSeo(array $job): array {
    $org = jobHiringOrganization($job['enterprise_slug']);
    $summary = jobOneLine($job['description']);
    if ($summary === '') {
        $summary = "{$job['title']} at {$org['name']}, {$job['location']}.";
    }
    $description = $summary;
    if (mb_strlen($description) > 160) {
        $cut = mb_substr($description, 0, 159);
        $space = mb_strrpos($cut, ' ');
        $description = ($space === false ? $cut : mb_substr($cut, 0, $space)) . '…';
    }
    $types = [];
    foreach (['/full/i' => 'FULL_TIME', '/part/i' => 'PART_TIME', '/intern|ojt/i' => 'INTERN', '/contract|project/i' => 'CONTRACTOR', '/temp/i' => 'TEMPORARY'] as $pattern => $type) {
        if (preg_match($pattern, $job['type'])) {
            $types[] = $type;
        }
    }
    $remote = preg_match('/remote|work from home|wfh/i', $job['location']) === 1;
    $address = preg_match('/ortigas|pasig/i', $job['location'])
        ? [
            '@type' => 'PostalAddress',
            'streetAddress' => 'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center',
            'addressLocality' => 'Pasig City',
            'addressRegion' => 'Metro Manila',
            'addressCountry' => 'PH',
        ]
        : ($remote ? null : ['@type' => 'PostalAddress', 'addressLocality' => $job['location'], 'addressCountry' => 'PH']);

    $posting = [
        '@type' => 'JobPosting',
        'title' => $job['title'],
        'description' => '<p>' . jobEscape($summary) . '</p>' . jobHtmlList('Responsibilities', $job['responsibilities']) . jobHtmlList('Requirements', $job['requirements']),
        'identifier' => ['@type' => 'PropertyValue', 'name' => $org['name'], 'value' => (string)$job['id']],
    ];
    if (preg_match('/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/', $job['created_at'])) {
        $posting['datePosted'] = str_replace(' ', 'T', $job['created_at']) . '+08:00';
    }
    if ($types !== []) {
        $posting['employmentType'] = count($types) === 1 ? $types[0] : $types;
    }
    $posting['hiringOrganization'] = $org;
    if ($address !== null) {
        $posting['jobLocation'] = ['@type' => 'Place', 'address' => $address];
    }
    if ($remote) {
        $posting['jobLocationType'] = 'TELECOMMUTE';
        $posting['applicantLocationRequirements'] = ['@type' => 'Country', 'name' => 'Philippines'];
    }
    $posting['directApply'] = true;

    return [
        'url' => jobPageUrl($job['id'], $job['title']),
        'title' => "{$job['title']} – {$org['name']} | Careers",
        'description' => $description,
        'graph' => [$posting],
    ];
}
