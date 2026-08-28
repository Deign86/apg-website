-- ==========================================================
-- Alpha Premier Group (APG) Database Schema
-- Native MySQL Schema for Hostinger Shared/Business Hosting
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Content Blocks (Flat key-value text/cards for site pages)
CREATE TABLE IF NOT EXISTS `content_blocks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `page_slug` VARCHAR(100) NOT NULL,
  `section_key` VARCHAR(100) NOT NULL,
  `type` ENUM('text', 'richtext', 'image', 'card') NOT NULL DEFAULT 'text',
  `value` TEXT,
  `sort_order` INT NOT NULL DEFAULT 0,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_page_section` (`page_slug`, `section_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Service Items (Virtual Office packages & subsidiary service cards)
CREATE TABLE IF NOT EXISTS `service_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('virtual-office', '88prime', 'construction', 'swiftclear', 'altaventure', 'realty') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` VARCHAR(100) DEFAULT NULL,
  `image_url` TEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_published` (`category`, `is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Job Openings (Careers manager)
CREATE TABLE IF NOT EXISTS `job_openings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL DEFAULT 'Ortigas Center, Pasig City',
  `type` VARCHAR(100) NOT NULL DEFAULT 'Full-Time',
  `tag` VARCHAR(100) DEFAULT NULL,
  `description` TEXT,
  `requirements` TEXT DEFAULT NULL, -- JSON array of strings
  `status` ENUM('active', 'closed') NOT NULL DEFAULT 'active',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Blog Posts (Newsroom / Articles)
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT,
  `category` VARCHAR(100) DEFAULT 'CORPORATE',
  `content` LONGTEXT,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME NULL DEFAULT NULL,
  `cover_image_url` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status_published` (`status`, `published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Admin Users
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT 'Administrator',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- Initial Seed Data
-- ==========================================================

-- Seed Virtual Office Packages
INSERT INTO `service_items` (`category`, `title`, `description`, `price`, `image_url`, `sort_order`, `is_published`)
VALUES
('virtual-office', 'Bronze Virtual Office Package', 'Prestigious business address for SEC/DTI registration, basic mail handling, and 2 hours complimentary meeting room credits monthly.', '₱1,500 / mo', '/assets/images/placeholder.svg', 1, 1),
('virtual-office', 'Silver Business Address & Call Handling', 'Everything in Bronze plus dedicated local phone number, personalized call answering, call patching, and 4 hours meeting room usage.', '₱3,000 / mo', '/assets/images/placeholder.svg', 2, 1),
('virtual-office', 'Gold Executive Workspace Suite', 'All Silver features plus unlimited mail & parcel forwarding, 8 hours conference room usage, high-speed fiber internet, and executive lounge access.', '₱5,500 / mo', '/assets/images/placeholder.svg', 3, 1),
('virtual-office', 'Platinum Enterprise Custom Suite', 'Fully tailored corporate solution with multi-entity address support, priority boardroom bookings, dedicated receptionist, and concierge services.', 'Contact for Price', '/assets/images/placeholder.svg', 4, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Job Openings
INSERT INTO `job_openings` (`title`, `location`, `type`, `tag`, `description`, `requirements`, `status`, `sort_order`)
VALUES
('Senior Commercial Real Estate Broker', 'Ortigas Center, Pasig City', 'Full-Time', 'Real Estate', 'Lead leasing and asset advisory negotiations for top-tier office towers, warehouses, and prime commercial developments across Metro Manila.', '["Active PRC Real Estate Broker License","3+ years experience in commercial real estate leasing or sales","Strong enterprise network in Metro Manila CBDs","Excellent negotiation and communication skills"]', 'active', 1),
('Site Operations & Construction Engineer', 'Metro Manila / On-Site', 'Full-Time', 'Construction', 'Oversee fit-out operations, structural compliance, material staging, and contractor safety across ongoing residential and commercial construction projects.', '["BS Civil Engineering or Architecture","Licensed Civil Engineer preferred","2+ years on-site fit-out or construction management experience","Proficiency with AutoCAD and project tracking tools"]', 'active', 2),
('Virtual Office Executive Concierge', 'Ortigas Center, Pasig City', 'Full-Time', 'Operations', 'Provide front-of-house hospitality, handle incoming client communications, coordinate boardroom schedules, and assist virtual office tenants.', '["Bachelor degree in Hospitality, Business, or Communications","Exceptional verbal and written English proficiency","Customer-first mindset and executive presence","Familiarity with PBX systems and corporate front-desk workflows"]', 'active', 3),
('Digital Media Specialist & Creative Producer', 'Ortigas Center, Pasig City / Hybrid', 'Full-Time', 'Creative', 'Drive brand storytelling, video production, graphic design, and social media campaigns across APG subsidiaries.', '["Proven portfolio of commercial video/graphic design projects","Proficient in Adobe Creative Cloud (Premiere, After Effects, Photoshop)","Strong understanding of social growth strategies","Ability to manage multi-brand content calendars"]', 'active', 4)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Sample Published Blog Posts
INSERT INTO `blog_posts` (`slug`, `title`, `excerpt`, `category`, `content`, `status`, `published_at`, `cover_image_url`)
VALUES
('commercial-real-estate-trends-2026', 'Metro Manila Commercial Real Estate Outlook 2026', 'How high-grade office spaces, flexible virtual offices, and logistics hubs are shaping Philippine commercial growth this year.', 'MARKET UPDATE', 'As the Philippine economy continues its robust expansion in 2026, demand for premium office spaces and flexible workspaces in Ortigas, BGC, and Makati has reached new milestones.\n\nBusinesses are adopting agile workspace models that combine prestigious corporate addresses with on-demand physical boardroom access. Alpha Premier Group is at the forefront of providing seamless enterprise solutions to help growing firms expand with efficiency.', 'published', NOW(), '/assets/images/placeholder.svg'),
('scaling-with-virtual-office-infrastructure', 'Strategic Advantages of Virtual Office Infrastructure for Modern Enterprises', 'Why high-growth companies leverage virtual offices to achieve regulatory compliance and corporate prestige without prohibitive overhead.', 'BUSINESS HUB', 'In the modern business landscape, establishing a reputable corporate presence is essential for regulatory compliance, banking relationships, and client confidence.\n\nVirtual offices provide businesses with SEC-compliant business addresses in premier central business districts like Ortigas Center, coupled with professional mail and call handling. This enables organizations to allocate capital strategically toward core growth while projecting an established corporate image.', 'published', NOW(), '/assets/images/placeholder.svg')
ON DUPLICATE KEY UPDATE `id`=`id`;

SET FOREIGN_KEY_CHECKS = 1;
