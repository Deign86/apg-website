<?php
/**
 * /api/migrate.php
 *
 * Single idempotent migration for the cross-enterprise content work. Safe to run
 * repeatedly — every write is either a guarded ALTER or an upsert keyed on a
 * unique constraint.
 *
 * Run via CLI:   php api/migrate.php
 * Run over HTTP: /api/migrate.php?token=<SETUP_TOKEN>
 *
 * Both paths require SETUP_TOKEN to be configured in .env. Without it, HTTP
 * requests are refused with a 404. See requireSetupToken() in api/config.php.
 *
 * Delete this file from the server once the migration has run.
 *
 * What it does
 *   1. Additive schema changes: enterprise scoping, featured flags, and the
 *      columns needed to preserve content the subsidiary pages already render.
 *   2. Normalises legacy enterprise spellings (general / swift-clear / 88-prime /
 *      apg-main / altaventure) to the canonical slugs in src/data/enterprises.js.
 *   3. Backfills blog_posts from the articles formerly hardcoded in the
 *      subsidiary blog pages.
 *   4. Backfills job_openings from the formerly hardcoded careers arrays.
 *   5. Backfills service_items from the formerly hardcoded services arrays.
 *
 * The three payloads are embedded below so this file needs no companion data on
 * the server. Regenerate with:
 *   node tools/extract-blog-seed.mjs    > tools/blog-seed.json
 *   node tools/extract-content-seed.mjs > tools/content-seed.json
 *   node tools/embed-seed.mjs
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

requireSetupToken();

$pdo = getDbConnection();
if (!$pdo) {
    die("Database connection failed. Check DB_HOST, DB_NAME, DB_USER, DB_PASS in .env\n");
}

// Preflight: this migration assumes api/setup.php has already created the schema.
// Without this check a missing schema surfaces as an uncaught PDOException.
try {
    $pdo->query('SELECT 1 FROM blog_posts LIMIT 1');
} catch (PDOException $e) {
    die(
        "The database schema is missing (no blog_posts table).\n" .
        "Run api/setup.php first, then re-run this migration.\n" .
        "See DEPLOY.md section 4 for the full sequence.\n"
    );
}

$failures = 0;

// >>> EMBEDDED_BLOG_SEED_START
const EMBEDDED_BLOG_SEED_JSON = <<<'JSON'
[
  {
    "enterprise_slug": "realty",
    "source_file": "src/routes/subsidiaries/alpha-realty/app/data.ts",
    "slug": "the-future-of-commercial-real-estate-in-the-philippines",
    "title": "The Future of Commercial Real Estate in the Philippines",
    "excerpt": "As hybrid work reshapes demand, Grade-A office towers in BGC are seeing renewed absorption driven by corporate expansion.",
    "category": "Market Trends",
    "content": "Commercial real estate is undergoing a structural paradigm shift in the Philippines. As hybrid and remote models stabilize, companies are demanding more versatile and sustainable work environments. Grade-A office towers that offer LEED and WELL certifications are experiencing a major flight-to-quality.\n\nThe business landscape in main hubs like Bonifacio Global City (BGC) and Ortigas Center is being redefined. With the ongoing relocation of international firms, corporate space optimization is no longer just about floor counts—it's about building wellness, tech integration, and premium flexible amenities.",
    "read_time": null,
    "is_featured": 1,
    "published_at": "2025-06-14 09:00:00",
    "cover_image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  },
  {
    "enterprise_slug": "realty",
    "source_file": "src/routes/subsidiaries/alpha-realty/app/data.ts",
    "slug": "how-to-evaluate-commercial-property-investments-in-2026",
    "title": "How to Evaluate Commercial Property Investments in 2026",
    "excerpt": "Strategic asset evaluation requires analyzing CBD location growth, tenant retention, infrastructure pipelines, and exit liquidity.",
    "category": "Investment Guides",
    "content": "Investing in commercial real estate represents one of the most resilient wealth-building strategies. Prime locations secure robust recurring lease yields and strong long-term capital appreciation.\n\nSuccess is dependent on rigid screening. Always analyze occupancy rates, local infrastructure expansion, and corporate demand dynamics.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-05-28 09:00:00",
    "cover_image_url": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80"
  },
  {
    "enterprise_slug": "realty",
    "source_file": "src/routes/subsidiaries/alpha-realty/app/data.ts",
    "slug": "5-crucial-steps-in-real-estate-due-diligence-title-verification",
    "title": "5 Crucial Steps in Real Estate Due Diligence & Title Verification",
    "excerpt": "A clean title is non-negotiable. Our advisory team outlines the key steps to verify encumbrances and technical boundaries.",
    "category": "Property Tips",
    "content": "Securing a clear Transfer Certificate of Title (TCT) is the single most critical step in property acquisitions. Title verification ensures title integrity, tax compliance, and zoning alignment.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-05-12 09:00:00",
    "cover_image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"
  },
  {
    "enterprise_slug": "alta-venture",
    "source_file": "src/routes/subsidiaries/alta-venture/Blogs.jsx",
    "slug": "why-every-growing-business-needs-a-virtual-cfo-in-2025",
    "title": "Why Every Growing Business Needs a Virtual CFO in 2025",
    "excerpt": "",
    "category": "Finance",
    "content": "The days of waiting until Series B to hire senior financial leadership are over. Discover how fractional CFOs level the playing field for high-growth startups and middle-market companies worldwide.",
    "read_time": "5 min read",
    "is_featured": 1,
    "published_at": "2025-06-28 09:00:00",
    "cover_image_url": null
  },
  {
    "enterprise_slug": "alta-venture",
    "source_file": "src/routes/subsidiaries/alta-venture/Blogs.jsx",
    "slug": "the-hidden-cost-of-in-house-hiring-and-how-outsourcing-changes-the-math",
    "title": "The Hidden Cost of In-House Hiring (And How Outsourcing Changes the Math)",
    "excerpt": "",
    "category": "Operations",
    "content": "When you factor in benefits, hardware, training, and management overhead, full-time internal hires cost 1.5x to 2x their base salary. Here is how strategic outsourcing unlocks flexibility.",
    "read_time": "4 min read",
    "is_featured": 0,
    "published_at": "2025-06-14 09:00:00",
    "cover_image_url": null
  },
  {
    "enterprise_slug": "alta-venture",
    "source_file": "src/routes/subsidiaries/alta-venture/Blogs.jsx",
    "slug": "automating-your-back-office-a-2025-execution-roadmap",
    "title": "Automating Your Back-Office: A 2025 Execution Roadmap",
    "excerpt": "",
    "category": "Technology",
    "content": "From automated invoice matching to AI-assisted data entry, back-office operations are undergoing a massive transformation. Here is a step-by-step roadmap for growing firms.",
    "read_time": "6 min read",
    "is_featured": 0,
    "published_at": "2025-05-30 09:00:00",
    "cover_image_url": null
  },
  {
    "enterprise_slug": "alta-venture",
    "source_file": "src/routes/subsidiaries/alta-venture/Blogs.jsx",
    "slug": "building-remote-teams-that-drive-measurable-output",
    "title": "Building Remote Teams That Drive Measurable Output",
    "excerpt": "",
    "category": "People",
    "content": "Culture does not stop at office walls. HR specialists share actionable frameworks for onboarding, async communication, and talent retention across global remote teams.",
    "read_time": "3 min read",
    "is_featured": 0,
    "published_at": "2025-05-18 09:00:00",
    "cover_image_url": null
  },
  {
    "enterprise_slug": "alta-venture",
    "source_file": "src/routes/subsidiaries/alta-venture/Blogs.jsx",
    "slug": "customer-experience-in-the-ai-era-speed-meets-human-empathy",
    "title": "Customer Experience in the AI Era: Speed Meets Human Empathy",
    "excerpt": "",
    "category": "CX",
    "content": "AI support bots accelerate response times, but customers still demand genuine human resolution. How to balance automation and human support for high NPS.",
    "read_time": "5 min read",
    "is_featured": 0,
    "published_at": "2025-05-05 09:00:00",
    "cover_image_url": null
  },
  {
    "enterprise_slug": "alta-venture",
    "source_file": "src/routes/subsidiaries/alta-venture/Blogs.jsx",
    "slug": "90-day-cash-flow-forecasting-the-metric-that-saves-startups",
    "title": "90-Day Cash Flow Forecasting: The Metric That Saves Startups",
    "excerpt": "",
    "category": "Finance",
    "content": "Most company failures stem from unexpected cash flow crunches. Our Virtual CFO team shares essential 90-day runway forecasting models used by venture-backed startups.",
    "read_time": "4 min read",
    "is_featured": 0,
    "published_at": "2025-04-22 09:00:00",
    "cover_image_url": null
  },
  {
    "enterprise_slug": "dynamic-tree",
    "source_file": "src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx",
    "slug": "behind-the-scenes-ang-baybayin-live-production",
    "title": "Behind the Scenes: Ang Baybayin Live Production",
    "excerpt": "An inside look at producing one of the year's most talked-about cultural showcases, blending heritage with modern multimedia excellence.",
    "category": "Case Study",
    "content": "An inside look at producing one of the year's most talked-about cultural showcases, blending heritage with modern multimedia excellence.",
    "read_time": "6 min read",
    "is_featured": 0,
    "published_at": "2026-06-15 09:00:00",
    "cover_image_url": "/imports/model7.jpg"
  },
  {
    "enterprise_slug": "dynamic-tree",
    "source_file": "src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx",
    "slug": "casting-the-perfect-brand-ambassador-a-guide",
    "title": "Casting the Perfect Brand Ambassador: A Guide",
    "excerpt": "How to match talent with brand identity for campaigns that resonate authentically with your target audience.",
    "category": "Talent Management",
    "content": "How to match talent with brand identity for campaigns that resonate authentically with your target audience.",
    "read_time": "5 min read",
    "is_featured": 0,
    "published_at": "2026-05-30 09:00:00",
    "cover_image_url": "/imports/model1.jpg"
  },
  {
    "enterprise_slug": "dynamic-tree",
    "source_file": "src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx",
    "slug": "video-production-trends-what-s-working-in-2026",
    "title": "Video Production Trends: What's Working in 2026",
    "excerpt": "Short-form content, vertical video, and authentic storytelling lead the charge in today's digital landscape.",
    "category": "Video Production",
    "content": "Short-form content, vertical video, and authentic storytelling lead the charge in today's digital landscape.",
    "read_time": "7 min read",
    "is_featured": 0,
    "published_at": "2026-05-12 09:00:00",
    "cover_image_url": "/imports/model4.jpg"
  },
  {
    "enterprise_slug": "dynamic-tree",
    "source_file": "src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx",
    "slug": "maximizing-roi-on-fashion-photography-campaigns",
    "title": "Maximizing ROI on Fashion Photography Campaigns",
    "excerpt": "Strategic approaches to planning, shooting, and leveraging editorial imagery for multi-channel brand campaigns.",
    "category": "Photography",
    "content": "Strategic approaches to planning, shooting, and leveraging editorial imagery for multi-channel brand campaigns.",
    "read_time": "6 min read",
    "is_featured": 0,
    "published_at": "2026-04-28 09:00:00",
    "cover_image_url": "/imports/model3.jpg"
  },
  {
    "enterprise_slug": "dynamic-tree",
    "source_file": "src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx",
    "slug": "social-campaign-strategies-that-drive-engagement",
    "title": "Social Campaign Strategies That Drive Engagement",
    "excerpt": "Data-driven insights on building campaigns that don't just go viral—they convert and build lasting brand loyalty.",
    "category": "Social Media",
    "content": "Data-driven insights on building campaigns that don't just go viral—they convert and build lasting brand loyalty.",
    "read_time": "5 min read",
    "is_featured": 0,
    "published_at": "2026-04-10 09:00:00",
    "cover_image_url": "/imports/model2.jpg"
  },
  {
    "enterprise_slug": "dynamic-tree",
    "source_file": "src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx",
    "slug": "lighting-techniques-for-high-fashion-editorial-shoots",
    "title": "Lighting Techniques for High-Fashion Editorial Shoots",
    "excerpt": "Mastering the interplay of natural and studio lighting to create images that captivate and inspire.",
    "category": "Photography",
    "content": "Mastering the interplay of natural and studio lighting to create images that captivate and inspire.",
    "read_time": "8 min read",
    "is_featured": 0,
    "published_at": "2026-03-22 09:00:00",
    "cover_image_url": "/imports/model6.jpg"
  },
  {
    "enterprise_slug": "dynamic-tree",
    "source_file": "src/routes/subsidiaries/dynamic-tree/app/pages/Blogs.tsx",
    "slug": "the-future-of-fashion-multimedia-trends-shaping-2026",
    "title": "The Future of Fashion Multimedia: Trends Shaping 2026",
    "excerpt": "From AI-enhanced casting to immersive digital runways, discover the innovations transforming how brands connect with audiences through visual storytelling.",
    "category": "Industry Insights",
    "content": "From AI-enhanced casting to immersive digital runways, discover the innovations transforming how brands connect with audiences through visual storytelling.",
    "read_time": "8 min read",
    "is_featured": 1,
    "published_at": "2026-06-28 09:00:00",
    "cover_image_url": "/imports/model7.jpg"
  },
  {
    "enterprise_slug": "swiftclear",
    "source_file": "src/routes/subsidiaries/swift-clear/app/App.tsx",
    "slug": "why-regular-disinfection-matters-more-than-you-think",
    "title": "Why Regular Disinfection Matters More Than You Think",
    "excerpt": "Visible cleaning isn't enough: high-touch surfaces harbor active pathogens for up to 72 hours. Here is why hospital-grade EPA disinfection protects your family and workspace.",
    "category": "GENERAL",
    "content": "Most people associate cleaning with what they can see — visible dust, grime, and clutter. But the real threats are invisible: bacteria, viruses, and fungi that colonize surfaces within hours of cleaning.\n\nStudies by the CDC and WHO confirm that high-touch surfaces such as door handles, light switches, keyboards, and elevator buttons can harbor active pathogens for 24 to 72 hours. In offices and shared spaces, this creates a silent chain of transmission that conventional mopping and wiping simply cannot break.\n\nProfessional disinfection uses EPA-registered formulations at the correct dwell time — the duration the solution must remain wet on a surface to achieve the stated kill rate. Most consumer products are rinsed off too quickly or applied too sparsely to be effective. Our electrostatic spraying technology wraps coverage around objects from every angle, ensuring no surface is missed.\n\nFor households with children, the elderly, or immunocompromised individuals, scheduled disinfection isn't a luxury — it's a layer of protection that reduces sick days, medical costs, and anxiety. Businesses, meanwhile, demonstrate duty of care to employees and customers, reducing liability and boosting confidence.\n\nThe takeaway: regular disinfection, done correctly with professional-grade products, is the single highest-impact service you can invest in for the health of your space. Swift Clear recommends quarterly disinfection for homes and monthly for commercial properties with high foot traffic.",
    "read_time": null,
    "is_featured": 0,
    "published_at": null,
    "cover_image_url": "/imports/swiftclear-blog-1.png"
  },
  {
    "enterprise_slug": "swiftclear",
    "source_file": "src/routes/subsidiaries/swift-clear/app/App.tsx",
    "slug": "the-complete-guide-to-pest-prevention-in-philippine-homes",
    "title": "The Complete Guide to Pest Prevention in Philippine Homes",
    "excerpt": "The Philippine tropical climate fosters year-round breeding of termites, rodents, and cockroaches. Discover how integrated pest management protects your property before infestation strikes.",
    "category": "GENERAL",
    "content": "The tropical climate of the Philippines creates ideal breeding conditions for cockroaches, termites, rodents, and mosquitoes year-round. Understanding their behavior is the first step to keeping them out.\n\nCockroaches thrive in warm, moist environments and are primarily nocturnal. Seeing one during the day is a strong indicator of a heavy infestation, as daytime sightings mean the colony has grown large enough to push individuals out of hiding. They contaminate food, trigger asthma, and carry E. coli and Salmonella.\n\nTermites, often called silent destroyers, can hollow out structural wood for years before detection. Subterranean termites build mud tubes along walls and foundations; drywood termites leave behind frass (powdery droppings). Annual inspections are essential in wooden or mixed-construction homes.\n\nRodents — primarily the Philippine brown rat and roof rat — enter through gaps as small as 20mm. They gnaw electrical wiring (a leading cause of house fires), contaminate pantries, and carry leptospirosis.\n\nMosquitoes breed in as little as a tablespoon of standing water. Beyond dengue and malaria, Aedes aegypti is now implicated in Zika transmission. Eliminating breeding sites — flower pot saucers, unused containers, clogged gutters — is as important as chemical treatment.\n\nOur integrated pest management approach combines inspection, targeted treatment, and prevention planning. We don't just eliminate current infestations — we identify and seal entry points, recommend environmental modifications, and schedule follow-up visits to ensure lasting results.",
    "read_time": null,
    "is_featured": 0,
    "published_at": null,
    "cover_image_url": "/imports/swiftclear-blog-2.png"
  },
  {
    "enterprise_slug": "swiftclear",
    "source_file": "src/routes/subsidiaries/swift-clear/app/App.tsx",
    "slug": "what-lives-inside-your-sofa-mattress-and-carpets",
    "title": "What Lives Inside Your Sofa, Mattress, and Carpets",
    "excerpt": "Mattresses and carpets harbor over 10 million dust mites, pet dander, and allergen proteins. Learn how 100°C steam extraction restores indoor air purity and eliminates microscopic threats.",
    "category": "GENERAL",
    "content": "Your upholstered furniture and carpets are home to millions of dust mites, dead skin cells, pet dander, and potentially mold spores. Here's what professional deep cleaning removes — and why it matters.\n\nDust mites are microscopic arachnids that feed on shed human skin cells. A single mattress can harbor up to 10 million dust mites. Their feces contain a protein — Der p1 — that is one of the most common indoor allergens, triggering rhinitis, eczema, and asthma attacks. Vacuuming alone doesn't remove them; you need the heat and extraction pressure of professional steam cleaning.\n\nCarpets and rugs act as filters for indoor air, trapping particulates as air circulates. Over time, they become saturated and begin releasing those particles back into the breathing zone. A carpet that looks clean may contain soil loads 5–10 times its own weight.\n\nPet dander — tiny, lightweight flecks of skin from cats and dogs — is buoyant and clings to upholstery fibers electrostatically. Standard washing won't remove it; enzymatic pre-treatments are required to break down protein bonds.\n\nMold can grow inside mattress padding and sofa cushions when moisture from sweat, spills, or humidity is trapped. Mold exposure is linked to respiratory illness, headaches, and fatigue.\n\nOur deep cleaning process begins with a thorough pre-inspection and dry vacuuming, followed by targeted pre-treatment of stains and contamination zones. Hot-water extraction at 80–100°C kills dust mites and bacteria on contact. We finish with a deodorizing treatment and, optionally, a fabric protector that repels future spills. Most fabrics are dry within 2–4 hours.",
    "read_time": null,
    "is_featured": 0,
    "published_at": null,
    "cover_image_url": "/imports/swiftclear-blog-3.png"
  },
  {
    "enterprise_slug": "swiftclear",
    "source_file": "src/routes/subsidiaries/swift-clear/app/App.tsx",
    "slug": "how-often-should-you-clean-your-air-conditioner-and-why-it-matters",
    "title": "How Often Should You Clean Your Air Conditioner — And Why It Matters",
    "excerpt": "Dirty air conditioner coils increase electricity bills by 15% and circulate hidden mold spores. Learn the recommended professional cleaning schedule for optimal air purity and unit longevity.",
    "category": "GENERAL",
    "content": "An air conditioner with dirty filters works harder, uses more electricity, cools less effectively, and blows contaminated air into your space. The solution is simpler than you think.\n\nAir conditioners don't just cool air — they filter it, removing dust, pollen, and particulates as air passes through the evaporator coils. Over time, that debris accumulates and restricts airflow. A unit with a dirty filter uses 5–15% more electricity for the same output. In the Philippines, where air conditioners run for 8–16 hours daily, that adds meaningfully to monthly electricity bills.\n\nDirty coils are the leading cause of air conditioner failure. Accumulated grime acts as an insulating layer that prevents proper heat exchange, causing the compressor to work at elevated temperatures and pressure. Compressors are the most expensive component to replace — often costing 60–80% of a new unit.\n\nMold and bacteria that grow on wet evaporator coils get blown directly into the room with every cycle. This explains why air-conditioned rooms often smell musty and why people in heavily air-conditioned offices suffer disproportionately from respiratory infections.\n\nOur recommended schedule:\n- **Filter cleaning**: every 2–4 weeks (you can do this yourself between professional visits)\n- **Full professional cleaning** (coils, drain pan, blower fan): every 3 months for daily-use units\n- **Annual refrigerant check and electrical inspection**: once per year\n\nOur technicians clean and disinfect every internal component, check refrigerant charge and electrical connections, test performance, and advise on any parts approaching end of life. A properly maintained air conditioner runs 20–30% more efficiently and lasts 5–8 years longer.",
    "read_time": null,
    "is_featured": 0,
    "published_at": null,
    "cover_image_url": "/imports/swiftclear-blog-4.png"
  },
  {
    "enterprise_slug": "construction",
    "source_file": "src/routes/subsidiaries/Construction.jsx",
    "slug": "the-new-language-of-luxury-how-bespoke-fit-out-is-redefining-commercial-interiors-in-the-uae",
    "title": "The New Language of Luxury: How Bespoke Fit-Out is Redefining Commercial Interiors in the UAE",
    "excerpt": "As the UAE continues its trajectory as a global architectural showcase, the demand for distinguished, custom-crafted interior environments has never been more acute. We explore the defining trends, materials, and methodologies shaping the future of premium fit-out.",
    "category": "Industry Insight",
    "content": "As the UAE continues its trajectory as a global architectural showcase, the demand for distinguished, custom-crafted interior environments has never been more acute. We explore the defining trends, materials, and methodologies shaping the future of premium fit-out.",
    "read_time": "7 min read",
    "is_featured": 1,
    "published_at": "2025-06-18 09:00:00",
    "cover_image_url": "/assets/alpha-construction/The New Language of Luxury_blogs.avif"
  },
  {
    "enterprise_slug": "construction",
    "source_file": "src/routes/subsidiaries/Construction.jsx",
    "slug": "foundations-of-excellence-why-substructure-engineering-determines-every-project-s-future",
    "title": "Foundations of Excellence: Why Substructure Engineering Determines Every Project's Future",
    "excerpt": "Underground decisions made at the foundation stage carry consequences that reverberate through a building's entire lifecycle. Our structural team explains the non-negotiables.",
    "category": "Civil Works",
    "content": "Underground decisions made at the foundation stage carry consequences that reverberate through a building's entire lifecycle. Our structural team explains the non-negotiables.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-05-30 09:00:00",
    "cover_image_url": "/assets/alpha-construction/Foundations of Excellence.avif"
  },
  {
    "enterprise_slug": "construction",
    "source_file": "src/routes/subsidiaries/Construction.jsx",
    "slug": "residential-luxury-the-2025-material-palette-shaping-high-end-uae-homes",
    "title": "Residential Luxury: The 2025 Material Palette Shaping High-End UAE Homes",
    "excerpt": "From brushed unlacquered brass to smoked oak and fluted travertine — the materials defining this year's premium residential interiors.",
    "category": "Interior Design",
    "content": "From brushed unlacquered brass to smoked oak and fluted travertine — the materials defining this year's premium residential interiors.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-05-12 09:00:00",
    "cover_image_url": "/assets/alpha-construction/Residential Luxury.avif"
  },
  {
    "enterprise_slug": "construction",
    "source_file": "src/routes/subsidiaries/Construction.jsx",
    "slug": "vertical-ambition-engineering-the-next-generation-of-mixed-use-towers",
    "title": "Vertical Ambition: Engineering the Next Generation of Mixed-Use Towers",
    "excerpt": "As plot sizes shrink and urban density rises, vertical integration has become both an architectural and engineering discipline requiring unprecedented coordination.",
    "category": "Architecture",
    "content": "As plot sizes shrink and urban density rises, vertical integration has become both an architectural and engineering discipline requiring unprecedented coordination.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-04-28 09:00:00",
    "cover_image_url": "/assets/alpha-construction/Vertical Ambition.avif"
  },
  {
    "enterprise_slug": "construction",
    "source_file": "src/routes/subsidiaries/Construction.jsx",
    "slug": "net-zero-on-the-horizon-how-construction-firms-must-adapt-to-incoming-uae-climate-mandates",
    "title": "Net-Zero on the Horizon: How Construction Firms Must Adapt to Incoming UAE Climate Mandates",
    "excerpt": "Regulatory momentum is building rapidly. Here is what the construction sector needs to know about the incoming requirements — and how to get ahead of them.",
    "category": "Sustainability",
    "content": "Regulatory momentum is building rapidly. Here is what the construction sector needs to know about the incoming requirements — and how to get ahead of them.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-04-10 09:00:00",
    "cover_image_url": "/assets/alpha-construction/Net-Zero on the Horizon.avif"
  },
  {
    "enterprise_slug": "construction",
    "source_file": "src/routes/subsidiaries/Construction.jsx",
    "slug": "behind-the-threshold-a-deep-dive-into-hospitality-fit-out-at-the-highest-standards",
    "title": "Behind the Threshold: A Deep Dive into Hospitality Fit-Out at the Highest Standards",
    "excerpt": "From brief to unveiling, our design team walks through the anatomy of a five-star hospitality interior project from specification to handover.",
    "category": "Fit-Out",
    "content": "From brief to unveiling, our design team walks through the anatomy of a five-star hospitality interior project from specification to handover.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-03-22 09:00:00",
    "cover_image_url": "/assets/alpha-construction/Behind the Threshold.avif"
  },
  {
    "enterprise_slug": "construction",
    "source_file": "src/routes/subsidiaries/Construction.jsx",
    "slug": "mep-integration-in-luxury-builds-why-it-must-be-designed-in-not-bolted-on",
    "title": "MEP Integration in Luxury Builds: Why It Must Be Designed In, Not Bolted On",
    "excerpt": "Mechanical, electrical, and plumbing systems are too often an afterthought. We make the case for their role as primary design drivers in premium construction.",
    "category": "Engineering",
    "content": "Mechanical, electrical, and plumbing systems are too often an afterthought. We make the case for their role as primary design drivers in premium construction.",
    "read_time": null,
    "is_featured": 0,
    "published_at": "2025-03-05 09:00:00",
    "cover_image_url": "/assets/alpha-construction/MEP Integration in Luxury Builds.avif"
  },
  {
    "enterprise_slug": "88prime",
    "source_file": "src/routes/subsidiaries/Prime88.jsx",
    "slug": "how-direct-sourcing-cuts-cost-without-cutting-corners",
    "title": "How Direct Sourcing Cuts Cost Without Cutting Corners",
    "excerpt": "We break down the economics of B2B direct procurement and show exactly how smart supplier relationships translate to margin wins for your business.",
    "category": "Logistics",
    "content": "We break down the economics of B2B direct procurement and show exactly how smart supplier relationships translate to margin wins for your business.",
    "read_time": "6 min read",
    "is_featured": 1,
    "published_at": "2025-06-28 09:00:00",
    "cover_image_url": "/assets/88prime/Shipping_container_yard.jpg"
  },
  {
    "enterprise_slug": "88prime",
    "source_file": "src/routes/subsidiaries/Prime88.jsx",
    "slug": "wpc-vs-pvc-panels-which-is-right-for-your-fit-out",
    "title": "WPC vs PVC Panels: Which is Right for Your Fit-Out?",
    "excerpt": "A practical breakdown of both materials — comparing durability, moisture resistance, install time, and cost per sqm.",
    "category": "Product Spotlight",
    "content": "A practical breakdown of both materials — comparing durability, moisture resistance, install time, and cost per sqm.",
    "read_time": "5 min read",
    "is_featured": 0,
    "published_at": "2025-06-14 09:00:00",
    "cover_image_url": "/assets/88prime/Wood_panel_room.jpg"
  },
  {
    "enterprise_slug": "88prime",
    "source_file": "src/routes/subsidiaries/Prime88.jsx",
    "slug": "the-rise-of-inverter-hvac-in-philippine-commercial-spaces",
    "title": "The Rise of Inverter HVAC in Philippine Commercial Spaces",
    "excerpt": "Inverter technology is now the baseline expectation — here's what the shift means for facility managers and procurement teams.",
    "category": "Industry Trends",
    "content": "Inverter technology is now the baseline expectation — here's what the shift means for facility managers and procurement teams.",
    "read_time": "4 min read",
    "is_featured": 0,
    "published_at": "2025-06-03 09:00:00",
    "cover_image_url": "/assets/88prime/Business_newspaper.jpg"
  },
  {
    "enterprise_slug": "88prime",
    "source_file": "src/routes/subsidiaries/Prime88.jsx",
    "slug": "5-office-supply-procurement-mistakes-that-drain-budgets",
    "title": "5 Office Supply Procurement Mistakes That Drain Budgets",
    "excerpt": "From fragmented vendors to reactive restocking — the common patterns that silently inflate your procurement overhead.",
    "category": "Operations",
    "content": "From fragmented vendors to reactive restocking — the common patterns that silently inflate your procurement overhead.",
    "read_time": "5 min read",
    "is_featured": 0,
    "published_at": "2025-05-22 09:00:00",
    "cover_image_url": "/assets/88prime/Warehouse-boxes.jpg"
  },
  {
    "enterprise_slug": "88prime",
    "source_file": "src/routes/subsidiaries/Prime88.jsx",
    "slug": "88-prime-and-golden-dragon-deepen-hvac-partnership",
    "title": "88 Prime and Golden Dragon Deepen HVAC Partnership",
    "excerpt": "Our expanded agreement brings Golden Dragon's full commercial unit range to Philippine buyers, backed by local after-sales support.",
    "category": "Company News",
    "content": "Our expanded agreement brings Golden Dragon's full commercial unit range to Philippine buyers, backed by local after-sales support.",
    "read_time": "3 min read",
    "is_featured": 0,
    "published_at": "2025-05-10 09:00:00",
    "cover_image_url": "/assets/88prime/Coworkers_at_laptop.jpg"
  },
  {
    "enterprise_slug": "88prime",
    "source_file": "src/routes/subsidiaries/Prime88.jsx",
    "slug": "same-day-delivery-inside-our-metro-manila-dispatch-system",
    "title": "Same-Day Delivery: Inside Our Metro Manila Dispatch System",
    "excerpt": "How our logistics team maintains a 98% on-time rate across 17 cities in the National Capital Region.",
    "category": "Logistics",
    "content": "How our logistics team maintains a 98% on-time rate across 17 cities in the National Capital Region.",
    "read_time": "4 min read",
    "is_featured": 0,
    "published_at": "2025-04-30 09:00:00",
    "cover_image_url": "/assets/88prime/Cargo_containers.jpg"
  },
  {
    "enterprise_slug": "luxe-prime",
    "source_file": "src/routes/subsidiaries/luxe-prime/app/App.tsx",
    "slug": "curating-luxury",
    "title": "Curating Luxury: Inside Luxe Prime's Private Portfolio",
    "excerpt": "A rare look at the exclusive off-market listings that define our approach to high-prestige property curation — where discretion meets distinction.",
    "category": "Portfolio",
    "content": "At Luxe Prime Realty, every property in our private portfolio represents more than square footage — it embodies a philosophy. We seek assets that offer architectural distinction, exceptional location, and investment resilience. Our curators work directly with developers and legacy owners to surface properties before they ever reach the open market, giving our clients a decisive advantage in a landscape where timing is everything.",
    "read_time": "5 min read",
    "is_featured": 0,
    "published_at": "2026-06-28 09:00:00",
    "cover_image_url": "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85"
  },
  {
    "enterprise_slug": "luxe-prime",
    "source_file": "src/routes/subsidiaries/luxe-prime/app/App.tsx",
    "slug": "market-intelligence",
    "title": "Market Intelligence: Strategies for Distressed and Legacy Assets",
    "excerpt": "How data-driven insight and strategic partnerships unlock value in overlooked markets, turning legacy assets into high-yield opportunities.",
    "category": "Strategy",
    "content": "Distressed and legacy assets often carry the highest upside for informed investors — yet they demand a level of insight and patience that most overlook. Our analysts at Luxe Prime combine macroeconomic indicators, localized vacancy data, and developer pipeline intelligence to identify these windows before they close. The result: high-conviction moves in markets others have yet to discover.",
    "read_time": "6 min read",
    "is_featured": 0,
    "published_at": "2026-06-14 09:00:00",
    "cover_image_url": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=85"
  },
  {
    "enterprise_slug": "luxe-prime",
    "source_file": "src/routes/subsidiaries/luxe-prime/app/App.tsx",
    "slug": "prestige-practicality",
    "title": "Prestige & Practicality: Redefining High-End Lease Management",
    "excerpt": "Explore how Luxe Prime's co-managed subleasing model bridges the gap between luxury property ownership and modern rental flexibility.",
    "category": "Insights",
    "content": "The modern property owner faces a paradox: the desire for premium passive income and the demand for hands-off management. Luxe Prime's co-managed subleasing model resolves this tension entirely. By acting as a true operational partner — not just a listing agent — we maximize yield while ensuring the property is maintained to standards that protect long-term asset value. Prestige and practicality, finally in one place.",
    "read_time": "4 min read",
    "is_featured": 0,
    "published_at": "2026-05-30 09:00:00",
    "cover_image_url": "https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?w=1200&q=85"
  }
]
JSON;
// <<< EMBEDDED_BLOG_SEED_END

// >>> EMBEDDED_CONTENT_SEED_START
const EMBEDDED_CONTENT_SEED_JSON = <<<'JSON'
{
  "careers": [
    {
      "enterprise_slug": "realty",
      "title": "Licensed Commercial Real Estate Broker",
      "location": "Ortigas Center, Pasig City",
      "type": "Full-Time",
      "tag": "Commercial Brokerage",
      "description": "Represent high-net-worth clients and corporate tenants in commercial lease agreements and property acquisitions.",
      "requirements": [
        "Active PRC Real Estate Broker license",
        "Minimum 2 years experience in commercial or high-end residential sales",
        "Strong network of corporate decision-makers",
        "Outstanding negotiation and communication skills"
      ],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 1
    },
    {
      "enterprise_slug": "realty",
      "title": "Property Investment Analyst",
      "location": "Ortigas Center, Pasig City",
      "type": "Full-Time",
      "tag": "Research & Valuation",
      "description": "Perform market intelligence, financial modeling, and feasibility studies for prospective real estate portfolios.",
      "requirements": [
        "Bachelor degree in Real Estate Management, Finance, or Economics",
        "Strong proficiency in financial valuation and cash flow modeling",
        "Exceptional research, analytical, and presentation skills"
      ],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 2
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Senior Virtual CFO Analyst",
      "location": "Remote (Global)",
      "type": "Full-time",
      "tag": "Finance",
      "description": "Lead financial modeling, cash flow management, investor reporting packages, and strategic budgeting for venture-backed portfolio companies.",
      "requirements": [],
      "responsibilities": [],
      "salary": "$70k – $95k",
      "is_featured": 0,
      "sort_order": 1
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Global HR Business Partner",
      "location": "Manila / Remote",
      "type": "Full-time",
      "tag": "People",
      "description": "Oversee global talent acquisition, executive search, onboarding workflows, and payroll compliance for international enterprise clients.",
      "requirements": [],
      "responsibilities": [],
      "salary": "$50k – $70k",
      "is_featured": 0,
      "sort_order": 2
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Customer Operations Manager",
      "location": "Remote (APAC/US)",
      "type": "Full-time",
      "tag": "CX",
      "description": "Lead omnichannel customer experience delivery teams. Manage SLAs, CSAT tracking, quality audits, and key client escalation channels.",
      "requirements": [],
      "responsibilities": [],
      "salary": "$55k – $75k",
      "is_featured": 0,
      "sort_order": 3
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Senior Full-Stack Engineer",
      "location": "Remote (Global)",
      "type": "Contract / Full-time",
      "tag": "Tech",
      "description": "Architect internal automation workflows, client portals, and secure API integrations in a fast-paced async engineering environment.",
      "requirements": [],
      "responsibilities": [],
      "salary": "$85k – $125k",
      "is_featured": 0,
      "sort_order": 4
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Back-Office Operations Coordinator",
      "location": "Cebu / Remote",
      "type": "Full-time",
      "tag": "Ops",
      "description": "Coordinate back-office execution, document processing, and data workflows with meticulous attention to accuracy and process efficiency.",
      "requirements": [],
      "responsibilities": [],
      "salary": "$35k – $50k",
      "is_featured": 0,
      "sort_order": 5
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Enterprise Compliance Lead",
      "location": "Remote (US/EU)",
      "type": "Full-time",
      "tag": "Legal",
      "description": "Keep client operations audit-ready. Conduct risk assessments, enforce AML/KYC protocols, and oversee data privacy adherence.",
      "requirements": [],
      "responsibilities": [],
      "salary": "$65k – $90k",
      "is_featured": 0,
      "sort_order": 6
    },
    {
      "enterprise_slug": "construction",
      "title": "Senior Project Manager",
      "location": "Dubai, UAE",
      "type": "Full-time",
      "tag": "Construction Management",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 1,
      "sort_order": 1
    },
    {
      "enterprise_slug": "construction",
      "title": "Civil Engineer",
      "location": "Abu Dhabi, UAE",
      "type": "Full-time",
      "tag": "Civil & Structural",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 2
    },
    {
      "enterprise_slug": "construction",
      "title": "Interior Design Lead",
      "location": "Dubai, UAE",
      "type": "Full-time",
      "tag": "Architectural Fit-Out",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 3
    },
    {
      "enterprise_slug": "construction",
      "title": "MEP Engineer",
      "location": "Dubai, UAE",
      "type": "Full-time",
      "tag": "Engineering & MEP",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 4
    },
    {
      "enterprise_slug": "construction",
      "title": "Site Supervisor",
      "location": "Sharjah, UAE",
      "type": "Full-time",
      "tag": "Site Operations",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 5
    },
    {
      "enterprise_slug": "construction",
      "title": "Procurement & Sourcing Officer",
      "location": "Dubai, UAE",
      "type": "Full-time",
      "tag": "Material Sourcing",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 6
    },
    {
      "enterprise_slug": "construction",
      "title": "Client Relations Manager",
      "location": "Dubai, UAE",
      "type": "Full-time",
      "tag": "Business Development",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 7
    },
    {
      "enterprise_slug": "construction",
      "title": "QA / QC Inspector",
      "location": "Abu Dhabi, UAE",
      "type": "Contract",
      "tag": "Quality Assurance",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 8
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Creative Director",
      "location": "Manila, Philippines",
      "type": "Full Time",
      "tag": "Creative",
      "description": "Lead our creative vision and oversee multimedia campaigns from concept to execution. Guide a team of designers, photographers, and videographers.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 1
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Talent Scout & Manager",
      "location": "Manila, Philippines",
      "type": "Full Time",
      "tag": "Talent",
      "description": "Discover and nurture emerging talent while managing relationships with models, influencers, and brand ambassadors.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 2
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Senior Photographer",
      "location": "Manila, Philippines",
      "type": "Freelance",
      "tag": "Production",
      "description": "Capture stunning editorial and commercial imagery for fashion brands, product launches, and advertising campaigns.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 3
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Campaign Strategist",
      "location": "Manila, Philippines",
      "type": "Full Time",
      "tag": "Strategy",
      "description": "Develop integrated marketing strategies that drive brand awareness and engagement across multiple channels.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 4
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Video Producer & Editor",
      "location": "Manila, Philippines",
      "type": "Full Time",
      "tag": "Production",
      "description": "Produce and edit compelling video content for digital platforms, TV commercials, and social media campaigns.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 5
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Social Media Manager",
      "location": "Manila, Philippines",
      "type": "Full Time",
      "tag": "Digital",
      "description": "Manage social strategies and content creation for clients while staying ahead of platform trends and algorithm changes.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 6
    },
    {
      "enterprise_slug": "luxe-prime",
      "title": "Senior Luxury Property Broker / Advisory Partner",
      "location": "Ortigas Center, Pasig City / BGC, Taguig",
      "type": "Full-Time / Hybrid",
      "tag": "",
      "description": "Lead commercial office leasing deals, high-end residential acquisitions, and estate advisory for high-net-worth clients across Metro Manila.",
      "requirements": [
        "Licensed Real Estate Broker (PRC / DHSUD registration preferred).",
        "Minimum 3+ years of experience in commercial office leasing or luxury residential brokerage.",
        "Proven track record in closing high-value corporate or residential transactions.",
        "Exceptional negotiation, communication, and executive presentation skills."
      ],
      "responsibilities": [
        "Manage transactions for commercial leasing, office acquisitions, and high-value residential estates.",
        "Represent high-net-worth individuals, corporate tenants, and property developers.",
        "Formulate strategic property valuation, market trends analysis, and investment deal structures.",
        "Maintain client discretion and high standards of service excellence."
      ],
      "salary": "",
      "is_featured": 0,
      "sort_order": 1
    },
    {
      "enterprise_slug": "luxe-prime",
      "title": "Commercial Office Leasing & Corporate Specialist",
      "location": "Ortigas Business District / Makati CBD",
      "type": "Full-Time",
      "tag": "",
      "description": "Specialize in prime commercial office spaces, SEC business center registration, and corporate relocation advisory for expanding enterprises.",
      "requirements": [
        "Bachelor's Degree in Business Administration, Marketing, Real Estate Management, or related field.",
        "2+ years experience in commercial real estate or corporate leasing.",
        "Strong background in contract negotiation and corporate client management.",
        "Familiarity with Metro Manila CBD office towers and commercial developments."
      ],
      "responsibilities": [
        "Assist corporate clients in sourcing prime office spaces across Ortigas CBD, Makati, and BGC.",
        "Conduct site inspections, space planning assessments, and lease term negotiations.",
        "Collaborate with building administration and legal teams for SEC & lease compliance.",
        "Expand corporate tenant networks and maintain landlord relationships."
      ],
      "salary": "",
      "is_featured": 0,
      "sort_order": 2
    },
    {
      "enterprise_slug": "luxe-prime",
      "title": "Real Estate Digital Marketing & Portfolio Director",
      "location": "Ortigas Headquarters / Hybrid",
      "type": "Full-Time",
      "tag": "",
      "description": "Direct luxury real estate digital campaigns, high-end property showcase media, and corporate brand positioning for Luxe Prime Realty.",
      "requirements": [
        "3+ years experience in real estate digital marketing, agency account management, or luxury branding.",
        "Proficiency in digital ad platforms (Meta Ads, Google Ads), analytics, and creative tools.",
        "Strong visual design aesthetic and luxury copywriting capabilities.",
        "Proven track record of generating qualified leads for high-ticket properties."
      ],
      "responsibilities": [
        "Develop and execute high-impact digital marketing strategies for luxury properties.",
        "Oversee property photography, 3D virtual walkthroughs, and executive listing presentations.",
        "Manage targeted social media advertising, SEO, and lead generation funnels.",
        "Analyze campaign analytics and optimize conversion rates for estate inquiries."
      ],
      "salary": "",
      "is_featured": 0,
      "sort_order": 3
    },
    {
      "enterprise_slug": "88prime",
      "title": "B2B Sales Executive",
      "location": "Mandaluyong City",
      "type": "Full-time",
      "tag": "Sales & Business Development",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 1
    },
    {
      "enterprise_slug": "88prime",
      "title": "Procurement Specialist",
      "location": "Mandaluyong City",
      "type": "Full-time",
      "tag": "Supply Chain",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 2
    },
    {
      "enterprise_slug": "88prime",
      "title": "Logistics Coordinator",
      "location": "Metro Manila",
      "type": "Full-time",
      "tag": "Operations",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 3
    },
    {
      "enterprise_slug": "88prime",
      "title": "Interior Solutions Consultant",
      "location": "Hybrid",
      "type": "Full-time",
      "tag": "Industrial Materials",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 4
    },
    {
      "enterprise_slug": "88prime",
      "title": "HVAC Technical Sales Rep",
      "location": "Metro Manila",
      "type": "Full-time",
      "tag": "HVAC Solutions",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 5
    },
    {
      "enterprise_slug": "88prime",
      "title": "Marketing & Content Associate",
      "location": "Remote",
      "type": "Full-time",
      "tag": "Marketing",
      "description": "",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 6
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Cleaning Technician",
      "location": "",
      "type": "Full-time",
      "tag": "",
      "description": "Perform residential and commercial cleaning services including basic, general, deep, and post-construction cleaning. Must be physically fit, detail-oriented, and comfortable using professional equipment.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 1
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Pest Control Specialist",
      "location": "",
      "type": "Full-time",
      "tag": "",
      "description": "Conduct pest inspections, apply treatments, and advise clients on prevention strategies. TESDA certification in pest management is an advantage. Training provided for the right candidate.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 2
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Aircon Service Technician",
      "location": "",
      "type": "Full-time",
      "tag": "",
      "description": "Install, repair, and maintain air conditioning units of all types. Must be TESDA-certified or have verifiable field experience. Refrigerant handling certification is required.",
      "requirements": [],
      "responsibilities": [],
      "salary": "",
      "is_featured": 0,
      "sort_order": 3
    }
  ],
  "services": [
    {
      "enterprise_slug": "realty",
      "title": "Commercial Tower & Office Leasing",
      "summary": "",
      "tag": "",
      "description": "Exclusive tenant and landlord representation for Grade A office towers, corporate headquarters, and high-rise commercial floors in Ortigas, BGC, and Makati.",
      "price": "Custom Brokerage Terms",
      "image_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "features": [
        "Tenant Representation",
        "Lease Structuring",
        "Space Planning Advisory",
        "CBD Market Valuation"
      ],
      "photos": [],
      "sort_order": 1
    },
    {
      "enterprise_slug": "realty",
      "title": "Strategic Land & Asset Acquisition",
      "summary": "",
      "tag": "",
      "description": "High-value land banking, commercial site sourcing, and joint-venture advisory for commercial developers, corporate investors, and institutional funds.",
      "price": "Advisory Consultation",
      "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
      "features": [
        "Due Diligence & Title Verification",
        "Zoning & Permitting Assessment",
        "Feasibility Studies",
        "Negotiation Representation"
      ],
      "photos": [],
      "sort_order": 2
    },
    {
      "enterprise_slug": "realty",
      "title": "Industrial Parks & Logistics Warehousing",
      "summary": "",
      "tag": "",
      "description": "Specialized sourcing of high-clearance warehouses, logistics facilities, and industrial manufacturing sites across major transportation corridors.",
      "price": "Brokerage & Sourcing",
      "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "features": [
        "High-Bay Storage Sourcing",
        "Logistics Corridor Analysis",
        "Industrial Lease Agreements",
        "Build-to-Suit Sourcing"
      ],
      "photos": [],
      "sort_order": 3
    },
    {
      "enterprise_slug": "realty",
      "title": "Luxury Residential & Penthouse Advisory",
      "summary": "",
      "tag": "",
      "description": "Discreet, bespoke brokerage for luxury residential estates, sky villas, and prestige pre-selling residential portfolios.",
      "price": "Exclusive Portfolio",
      "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      "features": [
        "Private Client Advisory",
        "Prestige Penthouse Sourcing",
        "Portfolio Diversification",
        "Turnkey Handover Support"
      ],
      "photos": [],
      "sort_order": 4
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Virtual CFO Services",
      "summary": "",
      "tag": "FINANCE",
      "description": "Strategic financial leadership without the full-time executive cost. From cash flow management to investor reporting and board-level advisory.",
      "price": "",
      "image_url": "",
      "features": [
        "Financial planning & analysis",
        "Cash flow management",
        "Investor-ready reporting",
        "KPI dashboard setup",
        "Budgeting & forecasting",
        "M&A due diligence support"
      ],
      "photos": [],
      "sort_order": 1
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Talent & HR Outsourcing",
      "summary": "",
      "tag": "PEOPLE",
      "description": "Build world-class teams faster. We handle sourcing, vetting, onboarding, and ongoing HR administration so you can focus on core vision.",
      "price": "",
      "image_url": "",
      "features": [
        "Executive talent acquisition",
        "Onboarding workflows",
        "Global payroll processing",
        "Performance management",
        "HR compliance",
        "Benefits administration"
      ],
      "photos": [],
      "sort_order": 2
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Technology & IT Support",
      "summary": "",
      "tag": "TECH",
      "description": "From helpdesk to cloud infrastructure, our technology specialists keep your operations secure, resilient, and ready to scale.",
      "price": "",
      "image_url": "",
      "features": [
        "24/7 IT helpdesk support",
        "Cloud infrastructure setup",
        "Cybersecurity monitoring",
        "Software development",
        "QA & test automation",
        "System integrations"
      ],
      "photos": [],
      "sort_order": 3
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Customer Experience Operations",
      "summary": "",
      "tag": "CX",
      "description": "Delight your customers at every touchpoint. Omnichannel support that feels like an extension of your own in-house leadership.",
      "price": "",
      "image_url": "",
      "features": [
        "Live chat & email support",
        "24/7 phone desk",
        "Social media moderation",
        "Customer success programs",
        "NPS & CSAT tracking",
        "Escalation management"
      ],
      "photos": [],
      "sort_order": 4
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Back-Office Operations",
      "summary": "",
      "tag": "OPS",
      "description": "Streamline essential administrative functions. Data management, invoicing, document workflow, and process automation executed with precision.",
      "price": "",
      "image_url": "",
      "features": [
        "Data entry & cleansing",
        "Document management",
        "Accounts payable/receivable",
        "Compliance filing",
        "Research & analysis",
        "Workflow automation"
      ],
      "photos": [],
      "sort_order": 5
    },
    {
      "enterprise_slug": "alta-venture",
      "title": "Risk & Compliance Management",
      "summary": "",
      "tag": "LEGAL",
      "description": "Stay ahead of evolving regulatory standards. Our compliance specialists protect your business reputation and keep you audit-ready.",
      "price": "",
      "image_url": "",
      "features": [
        "Regulatory compliance audit",
        "AML & KYC verification",
        "Risk assessment frameworks",
        "Policy documentation",
        "Internal audit support",
        "GDPR & data privacy"
      ],
      "photos": [],
      "sort_order": 6
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Model & Influencer Casting",
      "summary": "",
      "tag": "",
      "description": "We curate and connect brands with the right faces—models, influencers, and personalities who embody your brand's vision and voice.",
      "price": "",
      "image_url": "/imports/model4.jpg",
      "features": [
        "Talent scouting and management",
        "Brand-talent matching and alignment",
        "Contract negotiation and coordination",
        "Campaign-specific casting calls"
      ],
      "photos": [],
      "sort_order": 1
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "TV, Digital & Online Advertising",
      "summary": "",
      "tag": "",
      "description": "From broadcast commercials to targeted digital campaigns, we craft media that performs across every screen and digital platform.",
      "price": "",
      "image_url": "/imports/model5.jpg",
      "features": [
        "Multi-channel advertising strategy",
        "Television commercial production",
        "Digital ad creation and optimization",
        "Performance tracking and analytics"
      ],
      "photos": [],
      "sort_order": 2
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Product Launches & Social Campaigns",
      "summary": "",
      "tag": "",
      "description": "Launch your product with strategic campaigns and buzz-building content that drives real engagement and lasting brand recall.",
      "price": "",
      "image_url": "/imports/model2.jpg",
      "features": [
        "Launch strategy and planning",
        "Social media campaign design",
        "Influencer partnership coordination",
        "Event production and execution"
      ],
      "photos": [],
      "sort_order": 3
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Fashion & Product Photography",
      "summary": "",
      "tag": "",
      "description": "We produce studio-grade visual assets that elevate your brand's identity with editorial precision and creative vision.",
      "price": "",
      "image_url": "/imports/model3.jpg",
      "features": [
        "Editorial fashion photography",
        "E-commerce product shoots",
        "Lifestyle and brand imagery",
        "Studio and on-location shoots"
      ],
      "photos": [],
      "sort_order": 4
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Video Direction & Production",
      "summary": "",
      "tag": "",
      "description": "From concept to final cut, we craft compelling video stories that captivate, convert, and endure beyond the campaign.",
      "price": "",
      "image_url": "/imports/model4.jpg",
      "features": [
        "Concept development and scripting",
        "Full-scale video production",
        "Post-production and editing",
        "Motion graphics and animation"
      ],
      "photos": [],
      "sort_order": 5
    },
    {
      "enterprise_slug": "dynamic-tree",
      "title": "Creative Campaign Development",
      "summary": "",
      "tag": "",
      "description": "End-to-end campaign design that connects your brand to your audience with clarity, emotion, and commercial power.",
      "price": "",
      "image_url": "/imports/model5.jpg",
      "features": [
        "Brand strategy and positioning",
        "Creative concept development",
        "Multi-touchpoint campaign design",
        "Brand identity and messaging"
      ],
      "photos": [],
      "sort_order": 6
    },
    {
      "enterprise_slug": "luxe-prime",
      "title": "Co-managed Subleasing",
      "summary": "",
      "tag": "",
      "description": "Flexible short and mid-term leasing that maximizes rental yield while maintaining total owner control.",
      "price": "",
      "image_url": "https://images.unsplash.com/photo-1780257562963-3389a4105371?w=800&q=80",
      "features": [
        "Verified Tenant Vetting",
        "Yield & Rate Optimization",
        "Turnkey Turnover Service",
        "Full HOA & Local Compliance"
      ],
      "photos": [
        "https://images.unsplash.com/photo-1780257562963-3389a4105371?w=1200&q=85",
        "https://images.unsplash.com/photo-1776362355123-ca966d36e29c?w=1200&q=85",
        "https://images.unsplash.com/photo-1780257562941-d9a6923befa1?w=1200&q=85"
      ],
      "sort_order": 1
    },
    {
      "enterprise_slug": "luxe-prime",
      "title": "End-to-End Property Administration",
      "summary": "",
      "tag": "",
      "description": "Comprehensive operational oversight — managing tenants, maintenance, and monthly accounting.",
      "price": "",
      "image_url": "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80",
      "features": [
        "Lease & Renewal Management",
        "24/7 Urgent Repair Dispatch",
        "Monthly Owner Statements",
        "Automated Rent Collection"
      ],
      "photos": [
        "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200&q=85",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85",
        "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85"
      ],
      "sort_order": 2
    },
    {
      "enterprise_slug": "luxe-prime",
      "title": "Short & Long-Term Leasing Strategies",
      "summary": "",
      "tag": "",
      "description": "Bespoke positioning strategies tailored to your property profile to capture premium occupancy rates.",
      "price": "",
      "image_url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "features": [
        "Dynamic Pricing Algorithms",
        "Dual-Market Positioning",
        "Targeted High-End Marketing",
        "Seasonal Yield Forecasting"
      ],
      "photos": [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85",
        "https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?w=1200&q=85",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=85"
      ],
      "sort_order": 3
    },
    {
      "enterprise_slug": "luxe-prime",
      "title": "Concierge-Level Service and Support",
      "summary": "",
      "tag": "",
      "description": "White-glove 24/7 concierge support curating luxury living experiences for occupants and total peace of mind for owners.",
      "price": "",
      "image_url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "features": [
        "24/7 Luxury Concierge Desk",
        "VIP Occupant Onboarding",
        "Physical Asset Audits",
        "Custom Owner Fulfillment"
      ],
      "photos": [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=85",
        "https://images.unsplash.com/photo-1758448756350-3d0eec02ba37?w=1200&q=85",
        "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=1200&q=85"
      ],
      "sort_order": 4
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Disinfection & Sanitation",
      "summary": "Professional-grade disinfection that eliminates 99.9% of bacteria, viruses, and pathogens from all surfaces.",
      "tag": "",
      "description": "Our disinfection and sanitation service uses hospital-grade EPA-approved solutions combined with electrostatic spraying technology to ensure complete coverage. We treat every surface — high-touch points, floors, ceilings, and HVAC vents — giving you a space that is not just clean but truly safe. Ideal for offices, healthcare facilities, schools, food establishments, and residential homes.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 1
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Pest Control Service",
      "summary": "Targeted elimination of cockroaches, rodents, termites, mosquitoes, bedbugs, and all common pests.",
      "tag": "",
      "description": "Swift Clear's integrated pest management begins with a thorough inspection to identify species, entry points, and infestation severity. We then apply targeted treatments — chemical, biological, or physical barriers depending on the situation — and provide a prevention plan to stop re-infestation. All chemicals used are child- and pet-safe when dry.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 2
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Basic Cleaning",
      "summary": "Routine surface cleaning, dusting, mopping, and sanitizing for a consistently tidy space.",
      "tag": "",
      "description": "Our basic cleaning covers all the essentials: dusting surfaces and furniture, wiping down countertops and appliances, vacuuming or sweeping floors, mopping, cleaning bathrooms, emptying bins, and tidying common areas. Perfect as a regular weekly or bi-weekly maintenance schedule to keep your home or office consistently presentable.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 3
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "General Cleaning",
      "summary": "A thorough top-to-bottom clean covering every room, surface, and corner of your property.",
      "tag": "",
      "description": "Going beyond the basics, our general cleaning service addresses every room and surface in your property. Cleaners scrub tiles, clean inside appliances, wipe cabinet interiors, wash windows from inside, detail baseboards, and remove grime build-up in hard-to-reach areas. Recommended for monthly upkeep or before/after hosting events.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 4
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Post-Construction Cleaning",
      "summary": "Specialized removal of construction dust, debris, paint splatters, and residue after renovation or building work.",
      "tag": "",
      "description": "Construction leaves behind fine dust that infiltrates every crack, along with paint splatters, adhesive residue, and debris. Our post-construction team uses industrial-grade equipment — HEPA vacuums, grout cleaners, and solvents — to restore the space to move-in condition. We handle residential renovations, commercial fit-outs, and new builds.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 5
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Deep Cleaning",
      "summary": "Intensive fabric cleaning for carpets, rugs, couches, chairs, curtains, mattresses, and upholstery.",
      "tag": "",
      "description": "Our deep cleaning service targets embedded dirt, allergens, dust mites, pet dander, and stains inside fabrics and upholstery. Using hot-water extraction (steam cleaning) and professional dry-cleaning agents, we restore carpets, rugs, sofas, armchairs, curtains, and mattresses to near-original condition. Service includes pre-treatment of stubborn stains and a deodorizing finish.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 6
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Aircon Cleaning, Repair & Installation",
      "summary": "Full aircon service: cleaning, maintenance, troubleshooting, repair, and new unit installation.",
      "tag": "",
      "description": "A dirty or malfunctioning air conditioner wastes energy and circulates contaminants. Swift Clear's certified technicians clean filters, coils, drain pans, and blower fans; recharge refrigerant; diagnose electrical and mechanical issues; and perform full system installations for split-type, window-type, and cassette units. We service all major brands.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 7
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Decluttering Service",
      "summary": "Organized removal and proper disposal of unwanted items, junk, and clutter from any space.",
      "tag": "",
      "description": "Our decluttering team works with you to sort, categorize, and decide what stays, what gets donated, and what gets disposed of — responsibly. We haul away junk, arrange items logically, and can coordinate with recycling or donation centers. This service pairs perfectly with a deep clean or move-out clean to fully reset a space.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 8
    },
    {
      "enterprise_slug": "swiftclear",
      "title": "Floor Scrubbing, Polishing & Waxing",
      "summary": "Professional restoration and protection of all hard floor types: tiles, marble, wood, vinyl, and concrete.",
      "tag": "",
      "description": "Floors take the most abuse in any property. Our floor care service begins with heavy-duty scrubbing to strip old wax, stains, and embedded grime, followed by machine polishing to restore sheen, then a protective wax or sealant coat that repels dirt and makes future maintenance easier. We work on ceramic tile, marble, granite, hardwood, vinyl, and polished concrete.",
      "price": "",
      "image_url": "",
      "features": [],
      "photos": [],
      "sort_order": 9
    }
  ]
}
JSON;
// <<< EMBEDDED_CONTENT_SEED_END

// ------------------------------------------------------------------ 1. schema

echo "1. Applying additive schema migrations...\n";

$schemaMigrations = [
    // blog_posts: enterprise scoping and card metadata
    "ALTER TABLE `blog_posts` ADD COLUMN `enterprise_slug` VARCHAR(100) NOT NULL DEFAULT 'corporate' AFTER `category`",
    "ALTER TABLE `blog_posts` ADD INDEX `idx_enterprise` (`enterprise_slug`)",
    "ALTER TABLE `blog_posts` ADD COLUMN `read_time` VARCHAR(50) DEFAULT NULL AFTER `cover_image_url`",
    "ALTER TABLE `blog_posts` ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `read_time`",
    "ALTER TABLE `blog_posts` ADD INDEX `idx_enterprise_status` (`enterprise_slug`, `status`)",

    // admins: role column for RBAC
    "ALTER TABLE `admins` ADD COLUMN `role` ENUM('superadmin', 'admin', 'recruiter', 'editor') NOT NULL DEFAULT 'admin' AFTER `name`",

    // job_openings: enterprise scoping plus fields the careers pages render
    "ALTER TABLE `job_openings` ADD COLUMN `enterprise_slug` VARCHAR(100) NOT NULL DEFAULT 'corporate' AFTER `requirements`",
    "ALTER TABLE `job_openings` ADD COLUMN `salary` VARCHAR(100) DEFAULT NULL AFTER `enterprise_slug`",
    "ALTER TABLE `job_openings` ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 AFTER `salary`",
    "ALTER TABLE `job_openings` ADD COLUMN `responsibilities` TEXT DEFAULT NULL AFTER `requirements`",
    "ALTER TABLE `job_openings` ADD INDEX `idx_job_enterprise_status` (`enterprise_slug`, `status`)",
    "ALTER TABLE `job_openings` ADD UNIQUE KEY `uq_job_enterprise_title` (`enterprise_slug`, `title`(191))",

    // service_items: enterprise-aligned categories plus rendered fields
    "ALTER TABLE `service_items` MODIFY COLUMN `category` ENUM('corporate','virtual-office','88prime','construction','swiftclear','alta-venture','realty','luxe-prime','dynamic-tree','altaventure') NOT NULL",
    "ALTER TABLE `service_items` ADD COLUMN `summary` VARCHAR(500) DEFAULT NULL AFTER `title`",
    "ALTER TABLE `service_items` ADD COLUMN `tag` VARCHAR(100) DEFAULT NULL AFTER `summary`",
    "ALTER TABLE `service_items` ADD COLUMN `features` TEXT DEFAULT NULL AFTER `image_url`",
    "ALTER TABLE `service_items` ADD COLUMN `photos` TEXT DEFAULT NULL AFTER `features`",
    "ALTER TABLE `service_items` ADD UNIQUE KEY `uq_service_category_title` (`category`, `title`(191))",
];

foreach ($schemaMigrations as $sql) {
    $label = substr($sql, 0, 72);
    try {
        $pdo->exec($sql);
        echo "   applied  {$label}...\n";
    } catch (PDOException $e) {
        $msg = $e->getMessage();
        $benign = str_contains($msg, 'Duplicate column')
            || str_contains($msg, 'Duplicate key name')
            || str_contains($msg, 'check that column/key exists')
            || str_contains($msg, 'already exists');
        if ($benign) {
            echo "   present  {$label}...\n";
        } else {
            echo "   WARN     {$label}...\n            {$msg}\n";
            $failures++;
        }
    }
}

// ------------------------------------------------------- 2. slug normalisation

echo "\n2. Normalising legacy enterprise slugs...\n";

// Maps a legacy column value onto its canonical slug. Uses the shared resolver so
// PHP and JS agree on the canonical list.
$slugTables = [
    'blog_posts'    => 'enterprise_slug',
    'job_applicants' => 'enterprise_slug',
    'job_openings'  => 'enterprise_slug',
    'chat_sessions' => 'enterprise_slug',
];

foreach ($slugTables as $table => $column) {
    try {
        $rows = $pdo->query("SELECT DISTINCT `{$column}` AS v FROM `{$table}` WHERE `{$column}` IS NOT NULL AND `{$column}` <> ''")->fetchAll();
    } catch (PDOException $e) {
        echo "   skip     {$table} ({$e->getMessage()})\n";
        continue;
    }

    $changed = 0;
    foreach ($rows as $row) {
        $legacy = $row['v'];
        $canonical = resolveEnterpriseSlug($legacy, '');
        if ($canonical === '' || $canonical === $legacy) {
            continue;
        }
        $stmt = $pdo->prepare("UPDATE `{$table}` SET `{$column}` = :new WHERE `{$column}` = :old");
        $stmt->execute([':new' => $canonical, ':old' => $legacy]);
        $changed += $stmt->rowCount();
        echo "   {$table}: {$legacy} -> {$canonical} ({$stmt->rowCount()} rows)\n";
    }
    if ($changed === 0) {
        echo "   {$table}: already canonical\n";
    }
}

// service_items.category uses its own enum rather than the enterprise_slug column.
try {
    $stmt = $pdo->prepare("UPDATE `service_items` SET `category` = 'alta-venture' WHERE `category` = 'altaventure'");
    $stmt->execute();
    echo $stmt->rowCount() > 0
        ? "   service_items: altaventure -> alta-venture ({$stmt->rowCount()} rows)\n"
        : "   service_items: already canonical\n";
} catch (PDOException $e) {
    echo "   service_items: skipped ({$e->getMessage()})\n";
}

// ---------------------------------------------------------------- 3. blogs

echo "\n3. Backfilling blog_posts...\n";

$blogArticles = json_decode(EMBEDDED_BLOG_SEED_JSON, true);
if (!is_array($blogArticles) || $blogArticles === []) {
    echo "   ERROR embedded blog seed is empty. Run: node tools/embed-seed.mjs\n";
    $failures++;
    $blogArticles = [];
}

$blogUpsert = $pdo->prepare('
    INSERT INTO blog_posts
        (slug, title, excerpt, category, enterprise_slug, content, status, published_at, cover_image_url, read_time, is_featured)
    VALUES
        (:slug, :title, :excerpt, :category, :enterprise_slug, :content, :status, :published_at, :cover_image_url, :read_time, :is_featured)
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        excerpt = VALUES(excerpt),
        category = VALUES(category),
        enterprise_slug = VALUES(enterprise_slug),
        content = VALUES(content),
        status = VALUES(status),
        cover_image_url = VALUES(cover_image_url),
        read_time = VALUES(read_time),
        is_featured = VALUES(is_featured)
');

$blogCount = 0;
foreach ($blogArticles as $a) {
    $slug = trim($a['slug'] ?? '');
    $title = trim($a['title'] ?? '');
    if ($slug === '' || $title === '') {
        continue;
    }
    $enterprise = resolveEnterpriseSlug($a['enterprise_slug'] ?? '', 'corporate');
    try {
        $blogUpsert->execute([
            ':slug'            => $slug,
            ':title'           => $title,
            ':excerpt'         => $a['excerpt'] ?? '',
            ':category'        => $a['category'] ?? 'GENERAL',
            ':enterprise_slug' => $enterprise,
            ':content'         => $a['content'] ?? $title,
            ':status'          => 'published',
            ':published_at'    => $a['published_at'] ?: date('Y-m-d H:i:s'),
            ':cover_image_url' => $a['cover_image_url'] ?? '',
            ':read_time'       => $a['read_time'] ?? null,
            ':is_featured'     => (int)($a['is_featured'] ?? 0),
        ]);
        $blogCount++;
    } catch (PDOException $e) {
        echo "   FAILED {$slug}: {$e->getMessage()}\n";
        $failures++;
    }
}
echo "   {$blogCount} articles upserted\n";

// --------------------------------------------------------------- 4. careers

echo "\n4. Backfilling job_openings...\n";

$contentSeed = json_decode(EMBEDDED_CONTENT_SEED_JSON, true);
$careers = is_array($contentSeed['careers'] ?? null) ? $contentSeed['careers'] : [];
if ($careers === []) {
    echo "   ERROR embedded content seed is empty. Run: node tools/embed-seed.mjs\n";
    $failures++;
}

$jobUpsert = $pdo->prepare('
    INSERT INTO job_openings
        (title, location, type, tag, description, requirements, responsibilities, salary, is_featured, enterprise_slug, status, sort_order)
    VALUES
        (:title, :location, :type, :tag, :description, :requirements, :responsibilities, :salary, :is_featured, :enterprise_slug, :status, :sort_order)
    ON DUPLICATE KEY UPDATE
        location = VALUES(location),
        type = VALUES(type),
        tag = VALUES(tag),
        description = VALUES(description),
        requirements = VALUES(requirements),
        responsibilities = VALUES(responsibilities),
        salary = VALUES(salary),
        is_featured = VALUES(is_featured),
        sort_order = VALUES(sort_order)
');

$jobCount = 0;
foreach ($careers as $job) {
    $title = trim($job['title'] ?? '');
    if ($title === '') {
        continue;
    }
    $encode = static function ($value) {
        return is_array($value) && $value !== [] ? json_encode(array_values($value), JSON_UNESCAPED_UNICODE) : null;
    };
    try {
        $jobUpsert->execute([
            ':title'            => $title,
            ':location'         => $job['location'] ?? '',
            ':type'             => $job['type'] ?? 'Full-Time',
            ':tag'              => $job['tag'] ?: null,
            ':description'      => $job['description'] ?? '',
            ':requirements'     => $encode($job['requirements'] ?? []),
            ':responsibilities' => $encode($job['responsibilities'] ?? []),
            ':salary'           => $job['salary'] ?: null,
            ':is_featured'      => (int)($job['is_featured'] ?? 0),
            ':enterprise_slug'  => resolveEnterpriseSlug($job['enterprise_slug'] ?? '', 'corporate'),
            ':status'           => 'active',
            ':sort_order'       => (int)($job['sort_order'] ?? 0),
        ]);
        $jobCount++;
    } catch (PDOException $e) {
        echo "   FAILED {$title}: {$e->getMessage()}\n";
        $failures++;
    }
}
echo "   {$jobCount} job openings upserted\n";

// -------------------------------------------------------------- 5. services

echo "\n5. Backfilling service_items...\n";

$services = is_array($contentSeed['services'] ?? null) ? $contentSeed['services'] : [];

$serviceUpsert = $pdo->prepare('
    INSERT INTO service_items
        (category, title, summary, tag, description, price, image_url, features, photos, sort_order, is_published)
    VALUES
        (:category, :title, :summary, :tag, :description, :price, :image_url, :features, :photos, :sort_order, 1)
    ON DUPLICATE KEY UPDATE
        summary = VALUES(summary),
        tag = VALUES(tag),
        description = VALUES(description),
        price = VALUES(price),
        image_url = VALUES(image_url),
        features = VALUES(features),
        photos = VALUES(photos),
        sort_order = VALUES(sort_order)
');

$serviceCount = 0;
foreach ($services as $item) {
    $title = trim($item['title'] ?? '');
    if ($title === '') {
        continue;
    }
    $encode = static function ($value) {
        return is_array($value) && $value !== [] ? json_encode(array_values($value), JSON_UNESCAPED_UNICODE) : null;
    };
    try {
        $serviceUpsert->execute([
            ':category'    => resolveEnterpriseSlug($item['enterprise_slug'] ?? '', 'corporate'),
            ':title'       => $title,
            ':summary'     => $item['summary'] ?: null,
            ':tag'         => $item['tag'] ?: null,
            ':description' => $item['description'] ?? '',
            ':price'       => $item['price'] ?: null,
            ':image_url'   => $item['image_url'] ?: null,
            ':features'    => $encode($item['features'] ?? []),
            ':photos'      => $encode($item['photos'] ?? []),
            ':sort_order'  => (int)($item['sort_order'] ?? 0),
        ]);
        $serviceCount++;
    } catch (PDOException $e) {
        echo "   FAILED {$title}: {$e->getMessage()}\n";
        $failures++;
    }
}
echo "   {$serviceCount} services upserted\n";

// ------------------------------------------------------------ 6. verification

echo "\n6. Verification\n";

$report = static function (PDO $pdo, string $label, string $sql) {
    try {
        $rows = $pdo->query($sql)->fetchAll();
        echo "\n   {$label}\n";
        foreach ($rows as $row) {
            $name = $row['k'] ?? $row[array_key_first($row)];
            $count = $row['n'] ?? $row[array_key_last($row)];
            printf("     %-16s %s\n", $name, $count);
        }
    } catch (PDOException $e) {
        echo "   {$label} failed: {$e->getMessage()}\n";
    }
};

$report($pdo, 'blog_posts by enterprise (published)', "SELECT enterprise_slug AS k, COUNT(*) AS n FROM blog_posts WHERE status = 'published' GROUP BY enterprise_slug ORDER BY enterprise_slug");
$report($pdo, 'job_openings by enterprise (active)', "SELECT enterprise_slug AS k, COUNT(*) AS n FROM job_openings WHERE status = 'active' GROUP BY enterprise_slug ORDER BY enterprise_slug");
$report($pdo, 'service_items by category (published)', "SELECT category AS k, COUNT(*) AS n FROM service_items WHERE is_published = 1 GROUP BY category ORDER BY category");
$report($pdo, 'job_applicants by enterprise', "SELECT enterprise_slug AS k, COUNT(*) AS n FROM job_applicants GROUP BY enterprise_slug ORDER BY enterprise_slug");

foreach (['blog_posts', 'job_openings', 'service_items', 'job_applicants'] as $table) {
    try {
        $total = $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
        echo "\n   total {$table}: {$total}\n";
    } catch (PDOException $e) {
        // table may not exist on a partial schema
    }
}

echo "\n" . ($failures === 0
    ? "Migration complete with no failures.\n"
    : "Migration complete with {$failures} warning(s) — review the output above.\n");

if (PHP_SAPI !== 'cli') {
    echo "\nSECURITY: delete api/migrate.php and api/setup.php from the server now.\n";
}
