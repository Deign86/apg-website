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

const DATA_FIXES = [
    'fix:virtual-office-2026-plans' => 'dataFixVirtualOffice2026',
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
