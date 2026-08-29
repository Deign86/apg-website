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
  `enterprise_slug` VARCHAR(100) NOT NULL DEFAULT 'corporate',
  `content` LONGTEXT,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `published_at` DATETIME NULL DEFAULT NULL,
  `cover_image_url` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status_published` (`status`, `published_at`),
  INDEX `idx_enterprise` (`enterprise_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Job Applicants (Talent Acquisition & ATS)
CREATE TABLE IF NOT EXISTS `job_applicants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `job_id` INT DEFAULT NULL,
  `job_title` VARCHAR(255) NOT NULL DEFAULT 'General Application',
  `enterprise_slug` VARCHAR(100) NOT NULL DEFAULT 'general',
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(100) NOT NULL,
  `cover_letter` TEXT DEFAULT NULL,
  `resume_path` VARCHAR(255) NOT NULL,
  `resume_filename` VARCHAR(255) NOT NULL,
  `status` ENUM('new', 'reviewed', 'interviewing', 'hired', 'rejected') NOT NULL DEFAULT 'new',
  `internal_notes` TEXT DEFAULT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_applicant_status` (`status`),
  INDEX `idx_applicant_enterprise` (`enterprise_slug`),
  INDEX `idx_applicant_job` (`job_id`),
  INDEX `idx_submitted_at` (`submitted_at`),
  CONSTRAINT `fk_job_applicants_job` FOREIGN KEY (`job_id`) REFERENCES `job_openings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Admin Users
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL DEFAULT 'Administrator',
  `role` ENUM('superadmin', 'admin', 'recruiter', 'editor') NOT NULL DEFAULT 'admin',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Property Listings
CREATE TABLE IF NOT EXISTS `listings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `property_type` ENUM('condominium', 'commercial', 'office', 'warehouse', 'house', 'virtual_office') NOT NULL,
  `price` DECIMAL(15,2) DEFAULT NULL,
  `price_display` VARCHAR(100) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Pasig City',
  `location` VARCHAR(255) NOT NULL DEFAULT 'Ortigas Center, Pasig City',
  `floor_area` DECIMAL(10,2) DEFAULT NULL,
  `lot_area` DECIMAL(10,2) DEFAULT NULL,
  `bedrooms` INT DEFAULT NULL,
  `bathrooms` INT DEFAULT NULL,
  `status` ENUM('FOR SALE', 'FOR LEASE', 'PRE-SELLING', 'AVAILABLE') NOT NULL DEFAULT 'FOR SALE',
  `featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `description` TEXT DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type_status` (`property_type`, `status`, `is_published`),
  INDEX `idx_city` (`city`),
  INDEX `idx_sort` (`sort_order`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Listing Images (Multiple images per property listing)
CREATE TABLE IF NOT EXISTS `listing_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT NOT NULL,
  `image_url` TEXT NOT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_listing_sort` (`listing_id`, `sort_order`),
  CONSTRAINT `fk_listing_images_listing` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Live Chat Sessions
CREATE TABLE IF NOT EXISTS `chat_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_token` VARCHAR(64) NOT NULL UNIQUE,
  `enterprise_slug` VARCHAR(100) NOT NULL DEFAULT 'apg-main',
  `visitor_name` VARCHAR(255) DEFAULT NULL,
  `visitor_email` VARCHAR(255) DEFAULT NULL,
  `visitor_phone` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('bot', 'waiting_for_agent', 'agent_active', 'closed') NOT NULL DEFAULT 'bot',
  `assigned_admin_id` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `closed_at` DATETIME DEFAULT NULL,
  INDEX `idx_chat_status` (`status`),
  INDEX `idx_chat_token` (`session_token`),
  INDEX `idx_chat_enterprise` (`enterprise_slug`),
  CONSTRAINT `fk_chat_sessions_admin` FOREIGN KEY (`assigned_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Live Chat Messages
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` INT NOT NULL,
  `sender` ENUM('visitor', 'bot', 'admin') NOT NULL,
  `sender_admin_id` INT DEFAULT NULL,
  `body` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_chat_messages_session` (`session_id`),
  INDEX `idx_chat_messages_created` (`created_at`),
  CONSTRAINT `fk_chat_messages_session` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_chat_messages_admin` FOREIGN KEY (`sender_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
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
INSERT INTO `blog_posts` (`slug`, `title`, `excerpt`, `category`, `enterprise_slug`, `content`, `status`, `published_at`, `cover_image_url`)
VALUES
('commercial-real-estate-trends-2026', 'Metro Manila Commercial Real Estate Outlook 2026', 'How high-grade office spaces, flexible virtual offices, and logistics hubs are shaping Philippine commercial growth this year.', 'MARKET UPDATE', 'corporate', 'As the Philippine economy continues its robust expansion in 2026, demand for premium office spaces and flexible workspaces in Ortigas, BGC, and Makati has reached new milestones.\n\nBusinesses are adopting agile workspace models that combine prestigious corporate addresses with on-demand physical boardroom access. Alpha Premier Group is at the forefront of providing seamless enterprise solutions to help growing firms expand with efficiency.', 'published', NOW(), '/assets/images/placeholder.svg'),
('scaling-with-virtual-office-infrastructure', 'Strategic Advantages of Virtual Office Infrastructure for Modern Enterprises', 'Why high-growth companies leverage virtual offices to achieve regulatory compliance and corporate prestige without prohibitive overhead.', 'BUSINESS HUB', 'virtual-office', 'In the modern business landscape, establishing a reputable corporate presence is essential for regulatory compliance, banking relationships, and client confidence.\n\nVirtual offices provide businesses with SEC-compliant business addresses in premier central business districts like Ortigas Center, coupled with professional mail and call handling. This enables organizations to allocate capital strategically toward core growth while projecting an established corporate image.', 'published', NOW(), '/assets/images/placeholder.svg'),
('realty-strategic-leasing-guide-2026', 'Strategic Office Leasing in Ortigas CBD: A Tenant Playbook', 'A comprehensive breakdown of lease terms, tenant allowances, and facility management for corporate tenants in 2026.', 'REAL ESTATE', 'realty', 'Selecting corporate office headquarters in Ortigas Center requires aligning lease commitments with employee mobility, technology infrastructure, and long-term scalability. Learn the key commercial terms and floor plate considerations.', 'published', NOW(), '/assets/images/placeholder.svg'),
('global-workforce-optimization-bpo', 'Unlocking Efficiency: The 2026 Global Workforce Outsourcing Playbook', 'How modern enterprises scale back-office finance, IT support, and customer operations with Philippine talent.', 'OPERATIONS', 'alta-venture', 'Philippine outsourcing has transitioned from simple cost-arbitrage into high-value knowledge services, analytics, and 24/7 technical infrastructure management.', 'published', NOW(), '/assets/images/placeholder.svg'),
('creative-campaign-trends-digital-era', 'Visual Storytelling in Multi-Platform Brand Campaigns', 'From short-form video to cinematic 3D visual campaigns, how top Philippine brands build enduring digital recall.', 'CREATIVE', 'dynamic-tree', 'Modern digital audiences demand authentic narratives, rapid visual pacing, and cohesive cross-platform brand aesthetics that resonate emotionally.', 'published', NOW(), '/assets/images/placeholder.svg')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Property Listings
INSERT INTO `listings` (`id`, `title`, `slug`, `property_type`, `price`, `price_display`, `address`, `city`, `location`, `floor_area`, `lot_area`, `bedrooms`, `bathrooms`, `status`, `featured`, `is_published`, `description`, `sort_order`)
VALUES
(1, 'Premium Ortigas Central Logistics Warehouse', 'premium-ortigas-central-logistics-warehouse', 'warehouse', 185000000.00, '₱ 185,000,000', 'Amang Rodriguez Ave', 'Pasig City', 'Pasig City, Metro Manila', 3200.00, 4500.00, NULL, 6, 'FOR SALE', 1, 1, 'High-ceiling industrial logistics warehouse strategically situated with direct arterial access to C-5, Ortigas Avenue, and Marcos Highway. Features 12-meter clear heights, multi-bay loading docks with hydraulic levelers, heavy-duty concrete flooring (5000 PSI), 3-phase high-voltage power substation, and 24/7 guarded security perimeter.', 1),
(2, 'Tektite East Tower Grade-A Commercial Office', 'tektite-east-tower-grade-a-commercial-office', 'office', 420000.00, '₱ 420,000 / mo', 'Philippine Stock Exchange Centre, Exchange Road', 'Pasig City', 'Ortigas Center, Pasig City', 450.00, 450.00, NULL, 4, 'FOR LEASE', 1, 1, 'Fully fitted corporate headquarters on a high floor overlooking the Ortigas skyline. Comes equipped with executive corner suites, 20-seat main boardroom with video conferencing infrastructure, acoustic open-plan workstations, private server room with dedicated precision cooling, and biometric access control.', 2),
(3, 'BGC High Street Retail Commercial Space', 'bgc-high-street-retail-commercial-space', 'commercial', 280000.00, '₱ 280,000 / mo', 'Bonifacio High Street Block', 'Taguig City', 'Bonifacio Global City, Taguig', 210.00, 210.00, NULL, 2, 'FOR LEASE', 1, 1, 'Prime ground-floor commercial and retail storefront boasting maximum pedestrian foot traffic along Bonifacio Global City. Double-height glass facade, grease trap provision, commercial exhaust shaft, 3-phase power, and dedicated alfresco seating entitlement.', 3),
(4, 'The Grand Sapphire Luxury Sky Penthouse', 'the-grand-sapphire-luxury-sky-penthouse', 'condominium', 68000000.00, '₱ 68,000,000', 'Emerald Avenue Cor. Sapphire Road', 'Pasig City', 'Ortigas Center, Pasig City', 320.00, 320.00, 4, 5, 'FOR SALE', 1, 1, 'Ultra-luxury bi-level corner penthouse with panoramic 270-degree views of Metro Manila and the Sierra Madre mountains. Custom Italian marble finishes, gourmet chef kitchen with Gaggenau appliances, private plunge pool terrace, smart home automation, and 4 dedicated basement parking slots.', 4),
(5, 'Valenzuela Industrial Park Modern Warehouse Complex', 'valenzuela-industrial-park-modern-warehouse-complex', 'warehouse', 350000.00, '₱ 350,000 / mo', 'Paso de Blas Road', 'Valenzuela City', 'Valenzuela City, Metro Manila', 2500.00, 3000.00, NULL, 4, 'FOR LEASE', 0, 1, 'Modern warehouse facility with wide container maneuverability, insulated roofing, fire sprinkler systems, dedicated administrative mezzanine office, and rapid access to NLEX Harbor Link.', 5),
(6, 'Makati CBD Prime Commercial Corner Space', 'makati-cbd-prime-commercial-corner-space', 'commercial', 95000000.00, '₱ 95,000,000', 'Ayala Avenue Cor. Paseo de Roxas', 'Makati City', 'Makati CBD, Makati City', 380.00, 380.00, NULL, 3, 'FOR SALE', 1, 1, 'Rare commercial property investment along the premier Ayala Avenue corridor. Suitable for private banking branches, luxury flagship showrooms, or corporate advisory firms.', 6)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Listing Images
INSERT INTO `listing_images` (`listing_id`, `image_url`, `caption`, `sort_order`, `is_primary`)
VALUES
(1, '/assets/images/realty-warehouse.png', 'Exterior View & Loading Bay', 1, 1),
(1, '/images/ware.jpg', 'Interior Warehouse Floor', 2, 0),
(2, '/assets/images/realty-officespaces.png', 'Executive Conference Room', 1, 1),
(2, '/images/office.jpg', 'Open Plan Workspace', 2, 0),
(3, '/assets/images/realty-officespaces.png', 'Storefront & High Foot-Traffic Corridor', 1, 1),
(3, '/images/commercial.jpg', 'Commercial Interior Fit-out', 2, 0),
(4, '/assets/images/realty-condominium.png', 'Sky Penthouse Living Area', 1, 1),
(4, '/images/condo.jpg', 'Master Suite & Skyline View', 2, 0),
(5, '/assets/images/realty-warehouse.png', 'Warehouse Loading Bay & Gate', 1, 1),
(6, '/assets/images/realty-officespaces.png', 'Makati CBD Commercial Showroom', 1, 1)
ON DUPLICATE KEY UPDATE `id`=`id`;

SET FOREIGN_KEY_CHECKS = 1;
