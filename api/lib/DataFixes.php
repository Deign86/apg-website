<?php
/**
 * One-off data corrections that production needs when a release ships, not only when someone runs
 * api/migrate.php (which never reaches the server). Each fix runs once per database and is recorded
 * in `migration_seeds`, and each leaves alone what staff wrote themselves.
 *
 * Run by: tools/hostinger-update.sh -> php api/cron/data-fixes.php (every deploy), and api/migrate.php.
 */

/**
 * Virtual Office 2026 V3.0 plans (APR Drive "2026 V3.0 NEW VIRTUAL OFFICE": posters and caption doc).
 * Each plan is found by its 2026 name or the name it had before (staff may have renamed it already);
 * when both exist the 2026 name wins. The plan gets its 2026 name and photo (public/assets/images/
 * virtual-office/); its description and inclusions are filled only when empty or still the seed text.
 */
const VO_2026_PLANS = [
    [
        'match' => ['Premier Access', 'Bronze Virtual Office Package'],
        'description' => 'Ideal for startups, freelancers and remote businesses: a prestigious business address with mail handling and coworking access once a month.',
        'features' => ['Use of prestigious business address', 'Access to shared coworking space (once per month)', 'Mail receiving and handling', 'Company name display on digital signage', 'Complimentary internet access (during coworking use)'],
        'image_url' => '/assets/images/virtual-office/premier-access.webp',
        'photos' => null,
    ],
    [
        'match' => ['Premier Prestige', 'Silver Business Address & Call Handling'],
        'description' => 'A business address that looks established: digital signage, printing and the board room once a month.',
        'features' => ['Use of prestigious business address', 'Access to shared coworking space (once per month)', 'Mail handling', 'Company name displayed on digital signage', 'Complimentary internet access', 'Free water', 'Access to admin printing services (10 pages)', 'Use of board room once a month'],
        'image_url' => '/assets/images/virtual-office/premier-prestige.webp',
        'photos' => null,
    ],
    [
        'match' => ['Alpha Premier', 'Gold Executive Workspace Suite'],
        'description' => "The full executive package: front desk reception, the board room twice a month, and the CEO's office for contract signing with your clients.",
        'features' => ['Use of prestigious business address', 'Front desk reception access', 'Mail receiving and handling', 'Complimentary internet access', 'Free drinking water', 'Access to admin printing services (up to 10 pages per month)', 'Use of board room (twice per month)', "Access to CEO's office (for contract signing with your client)"],
        'image_url' => '/assets/images/virtual-office/alpha-premier.webp',
        'photos' => ['/assets/images/virtual-office/alpha-premier.webp', '/assets/images/virtual-office/alpha-premier-2.webp', '/assets/images/virtual-office/alpha-premier-3.webp'],
    ],
    [
        'match' => ['Custom Solutions', 'Platinum Enterprise Custom Suite'],
        'description' => "Tailored to your needs: tell us what your business requires and we'll put together the right package.",
        'features' => null,
        'image_url' => '/assets/images/virtual-office/custom-solutions.webp',
        'photos' => null,
    ],
];

/** Descriptions the plans were seeded with (api/schema.sql before 2026 V3.0); replaced, never staff text. */
const VO_SEEDED_DESCRIPTIONS = [
    'Prestigious business address for SEC/DTI registration, basic mail handling, and 2 hours complimentary meeting room credits monthly.',
    'Everything in Bronze plus dedicated local phone number, personalized call answering, call patching, and 4 hours meeting room usage.',
    'All Silver features plus unlimited mail & parcel forwarding, 8 hours conference room usage, high-speed fiber internet, and executive lounge access.',
    'Fully tailored corporate solution with multi-entity address support, priority boardroom bookings, dedicated receptionist, and concierge services.',
];

function dataFixVirtualOffice2026(PDO $pdo): int {
    $changed = 0;
    foreach (VO_2026_PLANS as $plan) {
        [$title, $oldTitle] = $plan['match'];
        $find = $pdo->prepare("SELECT `id`, `description`, `features` FROM `service_items`
            WHERE `category` = 'virtual-office' AND `title` IN (:title, :old) ORDER BY (`title` = :title2) DESC, `id` LIMIT 1");
        $find->execute([':title' => $title, ':old' => $oldTitle, ':title2' => $title]);
        $row = $find->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            continue; // deleted by staff: not re-created
        }
        $description = trim((string)$row['description']);
        $features = json_decode((string)$row['features'], true);
        $update = $pdo->prepare('UPDATE `service_items` SET `title` = :title, `image_url` = :image_url, `photos` = :photos,
            `description` = :description, `features` = :features WHERE `id` = :id');
        $update->execute([
            ':title' => $title,
            ':image_url' => $plan['image_url'],
            ':photos' => $plan['photos'] === null ? null : json_encode($plan['photos'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ':description' => $description === '' || in_array($description, VO_SEEDED_DESCRIPTIONS, true) ? $plan['description'] : $row['description'],
            ':features' => is_array($features) && $features !== [] ? $row['features']
                : ($plan['features'] === null ? null : json_encode($plan['features'], JSON_UNESCAPED_UNICODE)),
            ':id' => $row['id'],
        ]);
        $changed += $update->rowCount();
    }
    return $changed;
}

/**
 * Columns that only MySQL ever filled (CURRENT_TIMESTAMP defaults / NOW()), so before db.php set the
 * session time zone to +08:00 they hold the server's zone (UTC on Hostinger), not Manila. Columns PHP
 * writes from date()/user input (blog published_at, applicant interview_at) are already Manila and
 * are not listed. Other tables' created/updated stamps are only ever shown as dates and are left alone.
 */
const SERVER_TZ_COLUMNS = [
    'chat_sessions' => ['created_at', 'updated_at', 'closed_at'],
    'chat_messages' => ['created_at'],
    'inquiries' => ['created_at', 'updated_at'],
    'job_applicants' => ['submitted_at', 'updated_at', 'ats_notified_at', 'ats_scored_at', 'auto_rejected_at', 'decision_emailed_at'],
];

/**
 * Moves the SERVER_TZ_COLUMNS stamps from the MySQL server's default zone to Manila time. A no-op where
 * the server already runs at +08:00 (local Windows installs). Only values at or before the server's
 * "now" are moved: anything written by the new code during the deploy is already ahead of that.
 */
function dataFixManilaTimestamps(PDO $pdo): int {
    $pdo->exec('SET time_zone = DEFAULT');
    try {
        [$serverNow, $serverOffset] = $pdo->query('SELECT NOW(), TIMESTAMPDIFF(MINUTE, UTC_TIMESTAMP(), NOW())')->fetch(PDO::FETCH_NUM);
    } finally {
        $pdo->exec("SET time_zone = '+08:00'");
    }
    $shift = 480 - (int)$serverOffset;
    if ($shift === 0) {
        return 0;
    }
    $changed = 0;
    foreach (SERVER_TZ_COLUMNS as $table => $columns) {
        $cols = $pdo->prepare('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?');
        $cols->execute([$table]);
        $existing = $cols->fetchAll(PDO::FETCH_COLUMN); // [] when the table doesn't exist yet
        $now = $pdo->quote((string)$serverNow);
        // Assigning every listed column (updated_at included) stops ON UPDATE CURRENT_TIMESTAMP firing.
        $sets = array_map(
            static fn(string $c): string => "`{$c}` = IF(`{$c}` <= {$now}, `{$c}` + INTERVAL {$shift} MINUTE, `{$c}`)",
            array_values(array_intersect($columns, $existing))
        );
        if ($sets !== []) {
            $changed += $pdo->exec("UPDATE `{$table}` SET " . implode(', ', $sets));
        }
    }
    return $changed;
}

/**
 * Blog covers seeded as full-size PNG/JPG originals (0.1-2.9 MB, up to 6000 px wide) although a WebP
 * copy of the same picture ships beside each one (4-20x smaller). Only rows still holding the exact
 * seed path move, and only when the WebP is deployed; covers staff picked or uploaded are kept.
 */
const BLOG_COVER_SEED_ORIGINALS = [
    '/imports/swiftclear-blog-1.png', '/imports/swiftclear-blog-2.png', '/imports/swiftclear-blog-3.png', '/imports/swiftclear-blog-4.png',
    '/imports/model1.jpg',
    '/assets/88prime/Shipping_container_yard.jpg', '/assets/88prime/Wood_panel_room.jpg', '/assets/88prime/Business_newspaper.jpg',
    '/assets/88prime/Warehouse-boxes.jpg', '/assets/88prime/Coworkers_at_laptop.jpg', '/assets/88prime/Cargo_containers.jpg',
];

function dataFixBlogCoverWebp(PDO $pdo): int {
    $update = $pdo->prepare('UPDATE `blog_posts` SET `cover_image_url` = :webp WHERE `cover_image_url` = :original');
    $changed = 0;
    foreach (BLOG_COVER_SEED_ORIGINALS as $original) {
        $webp = preg_replace('/\.(png|jpg)$/', '.webp', $original);
        if (is_file(webRootDir() . $webp)) {
            $update->execute([':webp' => $webp, ':original' => $original]);
            $changed += $update->rowCount();
        }
    }
    return $changed;
}

const DATA_FIXES = [
    'fix:virtual-office-2026-plans' => 'dataFixVirtualOffice2026',
    'fix:manila-timestamps' => 'dataFixManilaTimestamps',
    'fix:blog-cover-webp' => 'dataFixBlogCoverWebp',
];

/** Applies every pending fix; $log receives one line per fix. Returns the number that failed. */
function runDataFixes(PDO $pdo, callable $log): int {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `migration_seeds` (
        `name` VARCHAR(64) NOT NULL PRIMARY KEY,
        `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $done = $pdo->prepare('SELECT 1 FROM `migration_seeds` WHERE `name` = :name');
    $mark = $pdo->prepare('INSERT IGNORE INTO `migration_seeds` (`name`) VALUES (:name)');
    $failures = 0;
    foreach (DATA_FIXES as $name => $fix) {
        $done->execute([':name' => $name]);
        if ($done->fetchColumn()) {
            $log("{$name}: already applied, skipped");
            continue;
        }
        try {
            $pdo->beginTransaction();
            $changed = $fix($pdo);
            $mark->execute([':name' => $name]);
            $pdo->commit();
            $log("{$name}: {$changed} row(s) corrected");
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $log("WARN {$name}: {$e->getMessage()}");
            $failures++;
        }
    }
    return $failures;
}
