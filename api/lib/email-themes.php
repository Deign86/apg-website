<?php
/**
 * Email themes, one per enterprise, taken from the colours/fonts each enterprise WEBSITE renders
 * (not enterpriseConfig.js where they differ). Alpha borders are flattened to opaque colours;
 * "accentInk" is the accent darkened where needed so small text keeps WCAG contrast on the surface.
 * Web fonts load in clients that allow them; the stacks fall back to email-safe faces.
 */

$sans = "'Plus Jakarta Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
$cinzel = "'Cinzel', Georgia, 'Times New Roman', serif";
$jakartaUrl = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap';

$base = [
    'radius' => 12, 'buttonRadius' => 8, 'buttonUpper' => false, 'headingUpper' => false, 'headingWeight' => 700,
    'bodyFont' => $sans, 'headingFont' => $sans, 'fontsUrl' => $jakartaUrl, 'logoWidth' => 80,
];

$themes = [
    // Main APG site: warm black + gold (#D4AF37 as rendered by the redesign).
    'corporate' => [
        'name' => 'Alpha Premier Group', 'mode' => 'dark', 'url' => 'https://alphapremiergroup.com',
        'tagline' => 'Where Connections Grow Into Success', 'inbox' => 'contact@alphapremier.com',
        'pageBg' => '#0A0803', 'surface' => '#14100A', 'soft' => '#1E1810', 'border' => '#3A3020',
        'text' => '#F5F5F5', 'heading' => '#FFFFFF', 'muted' => '#A3A3A3',
        'accent' => '#D4AF37', 'accentText' => '#0A0A0A', 'accentInk' => '#E2B857', 'link' => '#E2B857',
        'headerBg' => '#000000', 'headerText' => '#FFFFFF', 'footerText' => '#8A8270', 'footerStrong' => '#D4AF37',
        'logo' => 'assets/images/apgopc.png', 'logoWidth' => 116, 'headingWeight' => 800,
    ],
    // Alpha Premier Realty: near-black + #C5A85C, Cinzel headings, square CTAs.
    'realty' => [
        'name' => 'Alpha Premier Realty', 'mode' => 'dark', 'url' => 'https://realty.alphapremiergroup.com',
        'tagline' => 'Connecting You to Alpha Premier, Building What Matters', 'inbox' => 'contact@alphapremier.com',
        'pageBg' => '#020203', 'surface' => '#0D0E14', 'soft' => '#15161E', 'border' => '#2E2B22',
        'text' => '#FFFFFF', 'heading' => '#FFFFFF', 'muted' => '#A3A3A3',
        'accent' => '#C5A85C', 'accentText' => '#06070A', 'accentInk' => '#DFC47B', 'link' => '#DFC47B',
        'headerBg' => '#020203', 'headerText' => '#FFFFFF', 'footerText' => '#7D7B74', 'footerStrong' => '#C5A85C',
        'headingFont' => $cinzel, 'bodyFont' => $sans, 'headingWeight' => 600, 'headingUpper' => false,
        'fontsUrl' => 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap',
        'logo' => 'images/realty-banner-logo.png', 'logoWidth' => 200,
        'radius' => 4, 'buttonRadius' => 0, 'buttonUpper' => true,
    ],
    // Luxe Prime Realty: black + #C49A2A, Cinzel uppercase headings, Cormorant body.
    'luxe-prime' => [
        'name' => 'Luxe Prime Realty', 'mode' => 'dark', 'url' => 'https://luxe-prime.alphapremiergroup.com',
        'tagline' => 'Where Prestige Meets Practicality', 'inbox' => 'contact@alphapremier.com',
        'pageBg' => '#050505', 'surface' => '#0B0904', 'soft' => '#15110A', 'border' => '#3A2E14',
        'text' => '#F5F0E8', 'heading' => '#F5F0E8', 'muted' => '#A6A29A',
        'accent' => '#C49A2A', 'accentText' => '#000000', 'accentInk' => '#E0B850', 'link' => '#FFDF73',
        'headerBg' => '#050505', 'headerText' => '#F5F0E8', 'footerText' => '#857F72', 'footerStrong' => '#C49A2A',
        'headingFont' => $cinzel, 'bodyFont' => "'Montserrat', 'Segoe UI', Helvetica, Arial, sans-serif",
        'headingWeight' => 600, 'headingUpper' => true,
        'fontsUrl' => 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Montserrat:wght@400;600;700&display=swap',
        'logo' => 'assets/luxe-prime/7._LOGO_LUXE_PRIME-png.png', 'logoWidth' => 112,
        'radius' => 4, 'buttonRadius' => 4, 'buttonUpper' => true,
    ],
    // SwiftClear: light blue-white page, deep-navy hero, #0F4CBF pill buttons.
    'swiftclear' => [
        'name' => 'SwiftClear Facility & Cleaning', 'mode' => 'light', 'url' => 'https://swiftclear.alphapremiergroup.com',
        'tagline' => 'It Matters.', 'inbox' => 'contact@swiftclear.com',
        'pageBg' => '#EEF4FF', 'surface' => '#FFFFFF', 'soft' => '#F2F6FF', 'border' => '#D6E1F5',
        'text' => '#1E293B', 'heading' => '#000F98', 'muted' => '#475569',
        'accent' => '#0F4CBF', 'accentText' => '#FFFFFF', 'accentInk' => '#0F4CBF', 'link' => '#0F4CBF',
        'headerBg' => '#000E37', 'headerText' => '#FFFFFF', 'footerText' => '#5B6B85', 'footerStrong' => '#0A2160',
        'logo' => 'images/swiftclear-logo.png', 'logoWidth' => 150, 'headingWeight' => 800,
        'radius' => 16, 'buttonRadius' => 999,
    ],
    // Dynamic Tree: blush page, #C84A72 pill buttons, Playfair headings, Outfit body.
    'dynamic-tree' => [
        'name' => 'Dynamic Tree Multimedia', 'mode' => 'light', 'url' => 'https://dynamic-tree.alphapremiergroup.com',
        'tagline' => 'Elevate Your Brand, One Frame at a Time', 'inbox' => 'contact@alphapremier.com',
        'pageBg' => '#FDF4F7', 'surface' => '#FFFFFF', 'soft' => '#FFF6F9', 'border' => '#E8C8D4',
        'text' => '#1C1814', 'heading' => '#1C1814', 'muted' => '#6B5D65',
        'accent' => '#C84A72', 'accentText' => '#FFFFFF', 'accentInk' => '#A0305A', 'link' => '#A0305A',
        'headerBg' => '#FFFBFC', 'headerText' => '#1C1814', 'footerText' => '#8A7078', 'footerStrong' => '#A0305A',
        'headingFont' => "'Playfair Display', Georgia, 'Times New Roman', serif", 'bodyFont' => "'Outfit', 'Segoe UI', Helvetica, Arial, sans-serif",
        'headingWeight' => 700, 'headingUpper' => false,
        'fontsUrl' => 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Outfit:wght@400;600;700&display=swap',
        'logo' => 'assets/dynamic-tree/Dynamic_Tree_Logo-1.png', 'logoWidth' => 96,
        'radius' => 18, 'buttonRadius' => 999, 'buttonUpper' => false,
    ],
    // Alta Venture: mint-white page, deep teal text, teal buttons (darkened for contrast).
    'alta-venture' => [
        'name' => 'Alta Venture Outsourcing', 'mode' => 'light', 'url' => 'https://alta-venture.alphapremiergroup.com',
        'tagline' => 'Empowering Business Through Comprehensive Outsourcing', 'inbox' => 'contact@alphapremier.com',
        'pageBg' => '#F0FDF8', 'surface' => '#FFFFFF', 'soft' => '#F2FBF8', 'border' => '#D3E3E6',
        'text' => '#082636', 'heading' => '#082636', 'muted' => '#3B626E',
        'accent' => '#0F7A67', 'accentText' => '#FFFFFF', 'accentInk' => '#0F7A67', 'link' => '#0F7A67',
        'headerBg' => '#FFFFFF', 'headerText' => '#082636', 'footerText' => '#527280', 'footerStrong' => '#082636',
        'logo' => 'assets/alta-venture/3._Alta_Venture_-_Logo.png', 'logoWidth' => 160, 'headingWeight' => 800,
    ],
    // Alpha Premier Construction: charcoal + #D4AF37, Cinzel uppercase, Jost body, square buttons.
    'construction' => [
        'name' => 'Alpha Premier Construction', 'mode' => 'dark', 'url' => 'https://construction.alphapremiergroup.com',
        'tagline' => 'Where Vision Becomes Structure', 'inbox' => 'contact@alphapremier.com',
        'pageBg' => '#121212', 'surface' => '#181818', 'soft' => '#212121', 'border' => '#3A3322',
        'text' => '#FFFFFF', 'heading' => '#FFFFFF', 'muted' => '#A0A0A0',
        'accent' => '#D4AF37', 'accentText' => '#121212', 'accentInk' => '#D4AF37', 'link' => '#E2C25A',
        'headerBg' => '#0C0C0C', 'headerText' => '#FFFFFF', 'footerText' => '#888888', 'footerStrong' => '#D4AF37',
        'headingFont' => $cinzel, 'bodyFont' => "'Jost', 'Segoe UI', Helvetica, Arial, sans-serif",
        'headingWeight' => 600, 'headingUpper' => true,
        'fontsUrl' => 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Jost:wght@400;600;700&display=swap',
        'logo' => 'assets/images/construction.png', 'logoWidth' => 130,
        'radius' => 2, 'buttonRadius' => 0, 'buttonUpper' => true,
    ],
    // 88 Prime: white page, navy buttons and headings, gold labels, 4px corners.
    '88prime' => [
        'name' => '88 Prime', 'mode' => 'light', 'url' => 'https://88prime.alphapremiergroup.com',
        'tagline' => 'Everyday Essentials, Delivered Exceptionally', 'inbox' => 'info@88prime.com.ph',
        'pageBg' => '#F4F6F9', 'surface' => '#FFFFFF', 'soft' => '#F4F6F9', 'border' => '#DCE1E8',
        'text' => '#0C1F3F', 'heading' => '#0C1F3F', 'muted' => '#64748B',
        'accent' => '#0C1F3F', 'accentText' => '#FFFFFF', 'accentInk' => '#8A6A1F', 'link' => '#0C1F3F',
        'headerBg' => '#FFFFFF', 'headerText' => '#0C1F3F', 'footerText' => '#64748B', 'footerStrong' => '#0C1F3F',
        'logo' => 'assets/images/sstcompany-88prime11.png', 'logoWidth' => 84, 'headingWeight' => 800,
        'radius' => 6, 'buttonRadius' => 4,
    ],
    // Virtual Office: the corporate black frame, #C5A059 accent, Orbitron uppercase headings.
    'virtual-office' => [
        'name' => 'Alpha Premier Virtual Office', 'mode' => 'dark', 'url' => 'https://virtual-office.alphapremiergroup.com',
        'tagline' => 'Premium business addresses and flexible workspaces at Ortigas Center', 'inbox' => 'contact@alphapremier.com',
        'pageBg' => '#0A0803', 'surface' => '#0E0E0E', 'soft' => '#181818', 'border' => '#2A2A2A',
        'text' => '#FFFFFF', 'heading' => '#FFFFFF', 'muted' => '#A0A0A0',
        'accent' => '#C5A059', 'accentText' => '#000000', 'accentInk' => '#D4AF37', 'link' => '#D4AF37',
        'headerBg' => '#000000', 'headerText' => '#FFFFFF', 'footerText' => '#888888', 'footerStrong' => '#C5A059',
        'headingFont' => "'Orbitron', 'Segoe UI', Helvetica, Arial, sans-serif", 'headingUpper' => true, 'headingWeight' => 700,
        'fontsUrl' => 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap',
        'logo' => 'assets/images/apgopc.png', 'logoWidth' => 116, 'radius' => 10, 'buttonRadius' => 5,
    ],
];

// Theme values win over the shared defaults.
return array_map(static fn(array $theme): array => $theme + $base, $themes);
