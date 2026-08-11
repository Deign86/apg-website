import { useState, useRef } from "react";
import { motion } from "motion/react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { Shield, Bug, Sparkles, Home, HardHat, Layers, Wind, PackageOpen, Grid3X3, ChevronRight, Upload, CheckCircle, X, Menu } from "lucide-react";

// Asset imports
import logoNameImg from "../imports/SwiftClearBlogs/03bb49ece6b6df1464abea0f50bf17b4547eab39.png";
import bgPattern from "../imports/SwiftClearBlogs/8f0946c828868f434a0dd60d9b149052fd9b4103.png";
import logoSymbol from "../imports/SwiftClearFrontPage/a1454d6c1bddc9c0d186795f111c95ae9e81b779.png";
import blog1Img from "../imports/SwiftClearBlogs/e37ecc76491557d15255aac6b6c04e285864e61e.png";
import blog2Img from "../imports/SwiftClearBlogs/c734e6325c8d79b846af60e604ca04de036b398f.png";
import blog3Img from "../imports/SwiftClearBlogs/ff36c38fb4be97975f034ab6d32b6873411c2878.png";
import blog4Img from "../imports/SwiftClearBlogs/785410424d3d8f9a868acef3fc0dd199e65b3c0f.png";

// ─── Data ───────────────────────────────────────────────────────────────────

const services = [
  {
    id: "disinfection",
    title: "Disinfection & Sanitation",
    icon: Shield,
    short: "Professional-grade disinfection that eliminates 99.9% of bacteria, viruses, and pathogens from all surfaces.",
    long: "Our disinfection and sanitation service uses hospital-grade EPA-approved solutions combined with electrostatic spraying technology to ensure complete coverage. We treat every surface — high-touch points, floors, ceilings, and HVAC vents — giving you a space that is not just clean but truly safe. Ideal for offices, healthcare facilities, schools, food establishments, and residential homes.",
  },
  {
    id: "pest-control",
    title: "Pest Control Service",
    icon: Bug,
    short: "Targeted elimination of cockroaches, rodents, termites, mosquitoes, bedbugs, and all common pests.",
    long: "Swift Clear's integrated pest management begins with a thorough inspection to identify species, entry points, and infestation severity. We then apply targeted treatments — chemical, biological, or physical barriers depending on the situation — and provide a prevention plan to stop re-infestation. All chemicals used are child- and pet-safe when dry.",
  },
  {
    id: "basic-cleaning",
    title: "Basic Cleaning",
    icon: Sparkles,
    short: "Routine surface cleaning, dusting, mopping, and sanitizing for a consistently tidy space.",
    long: "Our basic cleaning covers all the essentials: dusting surfaces and furniture, wiping down countertops and appliances, vacuuming or sweeping floors, mopping, cleaning bathrooms, emptying bins, and tidying common areas. Perfect as a regular weekly or bi-weekly maintenance schedule to keep your home or office consistently presentable.",
  },
  {
    id: "general-cleaning",
    title: "General Cleaning",
    icon: Home,
    short: "A thorough top-to-bottom clean covering every room, surface, and corner of your property.",
    long: "Going beyond the basics, our general cleaning service addresses every room and surface in your property. Cleaners scrub tiles, clean inside appliances, wipe cabinet interiors, wash windows from inside, detail baseboards, and remove grime build-up in hard-to-reach areas. Recommended for monthly upkeep or before/after hosting events.",
  },
  {
    id: "post-construction",
    title: "Post-Construction Cleaning",
    icon: HardHat,
    short: "Specialized removal of construction dust, debris, paint splatters, and residue after renovation or building work.",
    long: "Construction leaves behind fine dust that infiltrates every crack, along with paint splatters, adhesive residue, and debris. Our post-construction team uses industrial-grade equipment — HEPA vacuums, grout cleaners, and solvents — to restore the space to move-in condition. We handle residential renovations, commercial fit-outs, and new builds.",
  },
  {
    id: "deep-cleaning",
    title: "Deep Cleaning",
    icon: Layers,
    short: "Intensive fabric cleaning for carpets, rugs, couches, chairs, curtains, mattresses, and upholstery.",
    long: "Our deep cleaning service targets embedded dirt, allergens, dust mites, pet dander, and stains inside fabrics and upholstery. Using hot-water extraction (steam cleaning) and professional dry-cleaning agents, we restore carpets, rugs, sofas, armchairs, curtains, and mattresses to near-original condition. Service includes pre-treatment of stubborn stains and a deodorizing finish.",
  },
  {
    id: "aircon",
    title: "Aircon Cleaning, Repair & Installation",
    icon: Wind,
    short: "Full aircon service: cleaning, maintenance, troubleshooting, repair, and new unit installation.",
    long: "A dirty or malfunctioning air conditioner wastes energy and circulates contaminants. Swift Clear's certified technicians clean filters, coils, drain pans, and blower fans; recharge refrigerant; diagnose electrical and mechanical issues; and perform full system installations for split-type, window-type, and cassette units. We service all major brands.",
  },
  {
    id: "decluttering",
    title: "Decluttering Service",
    icon: PackageOpen,
    short: "Organized removal and proper disposal of unwanted items, junk, and clutter from any space.",
    long: "Our decluttering team works with you to sort, categorize, and decide what stays, what gets donated, and what gets disposed of — responsibly. We haul away junk, arrange items logically, and can coordinate with recycling or donation centers. This service pairs perfectly with a deep clean or move-out clean to fully reset a space.",
  },
  {
    id: "floor",
    title: "Floor Scrubbing, Polishing & Waxing",
    icon: Grid3X3,
    short: "Professional restoration and protection of all hard floor types: tiles, marble, wood, vinyl, and concrete.",
    long: "Floors take the most abuse in any property. Our floor care service begins with heavy-duty scrubbing to strip old wax, stains, and embedded grime, followed by machine polishing to restore sheen, then a protective wax or sealant coat that repels dirt and makes future maintenance easier. We work on ceramic tile, marble, granite, hardwood, vinyl, and polished concrete.",
  },
];

const blogs = [
  {
    id: "why-disinfection-matters",
    title: "Why Regular Disinfection Matters More Than You Think",
    image: blog1Img,
    excerpt: "Most people associate cleaning with what they can see — visible dust, grime, and clutter. But the real threats are invisible: bacteria, viruses, and fungi that colonize surfaces within hours of cleaning.",
    content: `Most people associate cleaning with what they can see — visible dust, grime, and clutter. But the real threats are invisible: bacteria, viruses, and fungi that colonize surfaces within hours of cleaning.

Studies by the CDC and WHO confirm that high-touch surfaces such as door handles, light switches, keyboards, and elevator buttons can harbor active pathogens for 24 to 72 hours. In offices and shared spaces, this creates a silent chain of transmission that conventional mopping and wiping simply cannot break.

Professional disinfection uses EPA-registered formulations at the correct dwell time — the duration the solution must remain wet on a surface to achieve the stated kill rate. Most consumer products are rinsed off too quickly or applied too sparsely to be effective. Our electrostatic spraying technology wraps coverage around objects from every angle, ensuring no surface is missed.

For households with children, the elderly, or immunocompromised individuals, scheduled disinfection isn't a luxury — it's a layer of protection that reduces sick days, medical costs, and anxiety. Businesses, meanwhile, demonstrate duty of care to employees and customers, reducing liability and boosting confidence.

The takeaway: regular disinfection, done correctly with professional-grade products, is the single highest-impact service you can invest in for the health of your space. Swift Clear recommends quarterly disinfection for homes and monthly for commercial properties with high foot traffic.`,
  },
  {
    id: "pest-control-guide",
    title: "The Complete Guide to Pest Prevention in Philippine Homes",
    image: blog2Img,
    excerpt: "The tropical climate of the Philippines creates ideal breeding conditions for cockroaches, termites, rodents, and mosquitoes year-round. Understanding their behavior is the first step to keeping them out.",
    content: `The tropical climate of the Philippines creates ideal breeding conditions for cockroaches, termites, rodents, and mosquitoes year-round. Understanding their behavior is the first step to keeping them out.

Cockroaches thrive in warm, moist environments and are primarily nocturnal. Seeing one during the day is a strong indicator of a heavy infestation, as daytime sightings mean the colony has grown large enough to push individuals out of hiding. They contaminate food, trigger asthma, and carry E. coli and Salmonella.

Termites, often called silent destroyers, can hollow out structural wood for years before detection. Subterranean termites build mud tubes along walls and foundations; drywood termites leave behind frass (powdery droppings). Annual inspections are essential in wooden or mixed-construction homes.

Rodents — primarily the Philippine brown rat and roof rat — enter through gaps as small as 20mm. They gnaw electrical wiring (a leading cause of house fires), contaminate pantries, and carry leptospirosis.

Mosquitoes breed in as little as a tablespoon of standing water. Beyond dengue and malaria, Aedes aegypti is now implicated in Zika transmission. Eliminating breeding sites — flower pot saucers, unused containers, clogged gutters — is as important as chemical treatment.

Our integrated pest management approach combines inspection, targeted treatment, and prevention planning. We don't just eliminate current infestations — we identify and seal entry points, recommend environmental modifications, and schedule follow-up visits to ensure lasting results.`,
  },
  {
    id: "deep-cleaning-fabrics",
    title: "What Lives Inside Your Sofa, Mattress, and Carpets",
    image: blog3Img,
    excerpt: "Your upholstered furniture and carpets are home to millions of dust mites, dead skin cells, pet dander, and potentially mold spores. Here's what professional deep cleaning removes — and why it matters.",
    content: `Your upholstered furniture and carpets are home to millions of dust mites, dead skin cells, pet dander, and potentially mold spores. Here's what professional deep cleaning removes — and why it matters.

Dust mites are microscopic arachnids that feed on shed human skin cells. A single mattress can harbor up to 10 million dust mites. Their feces contain a protein — Der p1 — that is one of the most common indoor allergens, triggering rhinitis, eczema, and asthma attacks. Vacuuming alone doesn't remove them; you need the heat and extraction pressure of professional steam cleaning.

Carpets and rugs act as filters for indoor air, trapping particulates as air circulates. Over time, they become saturated and begin releasing those particles back into the breathing zone. A carpet that looks clean may contain soil loads 5–10 times its own weight.

Pet dander — tiny, lightweight flecks of skin from cats and dogs — is buoyant and clings to upholstery fibers electrostatically. Standard washing won't remove it; enzymatic pre-treatments are required to break down protein bonds.

Mold can grow inside mattress padding and sofa cushions when moisture from sweat, spills, or humidity is trapped. Mold exposure is linked to respiratory illness, headaches, and fatigue.

Our deep cleaning process begins with a thorough pre-inspection and dry vacuuming, followed by targeted pre-treatment of stains and contamination zones. Hot-water extraction at 80–100°C kills dust mites and bacteria on contact. We finish with a deodorizing treatment and, optionally, a fabric protector that repels future spills. Most fabrics are dry within 2–4 hours.`,
  },
  {
    id: "aircon-maintenance",
    title: "How Often Should You Clean Your Air Conditioner — And Why It Matters",
    image: blog4Img,
    excerpt: "An air conditioner with dirty filters works harder, uses more electricity, cools less effectively, and blows contaminated air into your space. The solution is simpler than you think.",
    content: `An air conditioner with dirty filters works harder, uses more electricity, cools less effectively, and blows contaminated air into your space. The solution is simpler than you think.

Air conditioners don't just cool air — they filter it, removing dust, pollen, and particulates as air passes through the evaporator coils. Over time, that debris accumulates and restricts airflow. A unit with a dirty filter uses 5–15% more electricity for the same output. In the Philippines, where air conditioners run for 8–16 hours daily, that adds meaningfully to monthly electricity bills.

Dirty coils are the leading cause of air conditioner failure. Accumulated grime acts as an insulating layer that prevents proper heat exchange, causing the compressor to work at elevated temperatures and pressure. Compressors are the most expensive component to replace — often costing 60–80% of a new unit.

Mold and bacteria that grow on wet evaporator coils get blown directly into the room with every cycle. This explains why air-conditioned rooms often smell musty and why people in heavily air-conditioned offices suffer disproportionately from respiratory infections.

Our recommended schedule:
- **Filter cleaning**: every 2–4 weeks (you can do this yourself between professional visits)
- **Full professional cleaning** (coils, drain pan, blower fan): every 3 months for daily-use units
- **Annual refrigerant check and electrical inspection**: once per year

Our technicians clean and disinfect every internal component, check refrigerant charge and electrical connections, test performance, and advise on any parts approaching end of life. A properly maintained air conditioner runs 20–30% more efficiently and lasts 5–8 years longer.`,
  },
];

const positions = [
  {
    id: "cleaning-technician",
    title: "Cleaning Technician",
    type: "Full-time",
    desc: "Perform residential and commercial cleaning services including basic, general, deep, and post-construction cleaning. Must be physically fit, detail-oriented, and comfortable using professional equipment.",
  },
  {
    id: "pest-control-specialist",
    title: "Pest Control Specialist",
    type: "Full-time",
    desc: "Conduct pest inspections, apply treatments, and advise clients on prevention strategies. TESDA certification in pest management is an advantage. Training provided for the right candidate.",
  },
  {
    id: "aircon-technician",
    title: "Aircon Service Technician",
    type: "Full-time",
    desc: "Install, repair, and maintain air conditioning units of all types. Must be TESDA-certified or have verifiable field experience. Refrigerant handling certification is required.",
  },
];

// ─── Shared Components ───────────────────────────────────────────────────────

function BgDecor() {
  return (
    <>
      <img
        src={bgPattern}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-[0.07]"
      />
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#0F4CBF]/40 to-white/0" />
      <div className="pointer-events-none absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-b from-[#0F4CBF]/25 to-white/0" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-[#02289C]/20 to-white/0" />
    </>
  );
}

function Navbar({ active, setPage }: { active: "home" | "services" | "blogs" | "careers"; setPage?: (p: any) => void }) {
  if (setPage) return null;
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: "Home", to: "/home", key: "home" },
    { label: "Services", to: "/services", key: "services" },
    { label: "Blogs", to: "/blogs", key: "blogs" },
    { label: "Careers", to: "/careers", key: "careers" },
  ];
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 relative z-50">
      <Link to="/" className="flex items-center gap-3 bg-[#0F4CBF]/20 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
        <div className="w-8 h-8 rounded-full bg-[#0F4CBF] flex items-center justify-center overflow-hidden">
          <img src={logoSymbol} alt="Swift Clear" className="w-6 h-4 object-contain" />
        </div>
        <img src={logoNameImg} alt="Swift Clear" className="h-7 object-contain" />
      </Link>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8 bg-[#02289C]/30 rounded-full px-8 py-3 backdrop-blur-sm border border-white/10">
        {links.map((l) => (
          <Link
            key={l.key}
            to={l.to}
            className={`font-['Roboto',sans-serif] font-extrabold text-sm tracking-wide transition-colors ${
              active === l.key ? "text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white bg-[#02289C]/40 rounded-full p-2"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      {menuOpen && (
        <div className="absolute top-full right-4 mt-2 bg-[#001450] rounded-2xl p-4 flex flex-col gap-3 shadow-xl border border-white/10 min-w-[160px]">
          {links.map((l) => (
            <Link
              key={l.key}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`font-['Roboto',sans-serif] font-extrabold text-sm tracking-wide py-1 transition-colors ${
                active === l.key ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Pages ───────────────────────────────────────────────────────────────────

const circles = [
  { size: "140vw", color: "#0A2160" },
  { size: "120vw", color: "#0F4CBF" },
  { size: "100vw", color: "#1D5CD4" },
  { size: "82vw",  color: "#3B76EC" },
  { size: "66vw",  color: "#7DA6FD" },
  { size: "50vw",  color: "#D4E2FF" },
];

function FrontPage({ onEnter, setPage }: { onEnter?: () => void; setPage?: (p: string) => void }) {
  const navigate = useNavigate();

  const handleEnter = () => {
    if (onEnter) {
      onEnter();
    } else if (setPage) {
      setPage("home");
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-[#000E37]">
      {/* Concentric circles — pop in one by one from outermost to innermost */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {circles.map((c, i) => (
          <motion.div
            key={c.color}
            className="absolute rounded-full"
            style={{ width: c.size, height: c.size, backgroundColor: c.color }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: i * 0.13,
              duration: 0.45,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
        ))}
      </div>

      {/* Nav overlay */}
      {!setPage && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: circles.length * 0.13 + 0.1, duration: 0.4 }}
        >
          <div className="bg-white/10 rounded-full px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0F4CBF] flex items-center justify-center overflow-hidden">
              <img src={logoSymbol} alt="" className="w-6 h-4 object-contain" />
            </div>
            <img src={logoNameImg} alt="Swift Clear" className="h-7 object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8 bg-white/10 rounded-full px-8 py-3">
            {["Home", "Services", "Blogs", "Careers"].map((t) => (
              <Link key={t} to={t === "Home" ? "/home" : `/${t.toLowerCase()}`} className="font-['Roboto',sans-serif] font-extrabold text-[#96B0FF] text-sm hover:text-white transition-colors">
                {t}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hero card */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: circles.length * 0.13 + 0.25, duration: 0.5, ease: "easeOut" }}
      >
        <div className="bg-[#0F4CBF] rounded-2xl p-6 mb-8 shadow-2xl">
          <img src={logoSymbol} alt="Swift Clear logo" className="w-40 h-28 object-contain" />
        </div>
        <h1 className="font-['Source_Code_Pro',monospace] font-extrabold text-white text-5xl md:text-7xl drop-shadow-lg mb-4">
          It Matters.
        </h1>
        <p className="font-['Source_Code_Pro',monospace] font-semibold text-white/90 text-base md:text-lg max-w-xl mb-10 drop-shadow">
          {"It's not only disinfection; It's about safety, protection & saving lives. Leave it to the expert!"}
        </p>
        <button
          onClick={handleEnter}
          className="bg-white/10 border border-[#4876FF]/60 rounded-full px-12 py-4 font-['Source_Code_Pro',monospace] font-extrabold text-[#4876FF] text-2xl hover:bg-[#4876FF]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_30px_rgba(72,118,255,0.4)]"
        >
          ENTER
        </button>
      </motion.div>
    </div>
  );
}

function HomePage({ setPage }: { setPage?: (p: string) => void }) {
  const handleScrollDown = () => {
    const el = document.getElementById("swiftclear-main-content");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* 1. HERO VIEW WITH CONCENTRIC CIRCLE POP-IN ANIMATION */}
      <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-[#000E37] text-center px-4">
        {/* Concentric circles — pop in one by one from outermost to innermost */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {circles.map((c, i) => (
            <motion.div
              key={c.color}
              className="absolute rounded-full"
              style={{ width: c.size, height: c.size, backgroundColor: c.color }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.13,
                duration: 0.45,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            />
          ))}
        </div>

        {/* Hero card */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: circles.length * 0.13 + 0.25, duration: 0.5, ease: "easeOut" }}
        >
          <div className="bg-white/70 border border-white/90 rounded-2xl p-2.5 mb-8 shadow-[0_15px_35px_rgba(15,76,191,0.14)] backdrop-blur-xl hover:scale-105 transition-transform duration-300">
            <img src={logoSymbol} alt="Swift Clear logo" className="w-56 sm:w-64 md:w-72 h-36 sm:h-40 md:h-44 object-contain" />
          </div>

          <h1 className="bg-gradient-to-r from-[#000F98] via-[#0F4CBF] to-[#02289C] bg-clip-text text-transparent font-sans font-black text-6xl sm:text-7xl md:text-8xl tracking-tight mb-6 drop-shadow-sm">
            It Matters.
          </h1>

          <div className="bg-white/70 border border-white/90 backdrop-blur-xl rounded-2xl px-8 py-5 mb-10 max-w-2xl shadow-[0_10px_25px_rgba(15,76,191,0.08)]">
            <p className="font-sans font-semibold text-[#001450] text-base sm:text-lg md:text-xl leading-relaxed tracking-wide">
              It&apos;s not only disinfection; It&apos;s about safety,<br className="hidden sm:inline" />
              protection &amp; saving lives. Leave it to the expert!
            </p>
          </div>

          <button
            onClick={handleScrollDown}
            className="bg-[#0F4CBF] hover:bg-[#02289C] text-white font-sans font-bold text-xs sm:text-sm tracking-[0.25em] uppercase rounded-full px-9 py-4 shadow-[0_10px_25px_rgba(15,76,191,0.35)] hover:shadow-[0_15px_35px_rgba(15,76,191,0.5)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2.5 cursor-pointer group"
          >
            <span>EXPLORE SERVICES</span>
            <ChevronRight className="rotate-90 text-white group-hover:translate-y-0.5 transition-transform" size={18} />
          </button>
        </motion.div>
      </section>

      {/* 2. MAIN CONTENT SECTION - LIGHT CLEAN THEME */}
      <div id="swiftclear-main-content" className="relative z-10 min-h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F6F9FF] to-white text-slate-800 px-6 py-20">
        <BgDecor />
        <Navbar active="home" setPage={setPage} />
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-semibold text-xs tracking-[0.25em] uppercase mb-4 shadow-sm">
              SwiftClear Facility &amp; Cleaning
            </span>
            <h1 className="font-sans font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#000F98] tracking-tight mb-4 drop-shadow-sm">
              Swift<span className="text-[#0F4CBF]">Clear</span>
            </h1>
            <p className="font-sans font-semibold text-[#0F4CBF] text-lg md:text-xl mb-6 tracking-wide">
              Professional Cleaning, Hospital-Standard Disinfection &amp; Sanitation
            </p>
            <p className="font-sans text-slate-600 text-base md:text-lg leading-relaxed">
              We bring expert-level cleaning, medical-grade disinfection, pest management, and aircon servicing to homes and commercial spaces across the Philippines.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setPage ? setPage("services") : null}
                className="px-8 py-3.5 bg-[#0F4CBF] hover:bg-[#02289C] text-white font-sans font-bold text-xs sm:text-sm tracking-[0.25em] uppercase rounded-full shadow-[0_8px_25px_rgba(15,76,191,0.3)] hover:shadow-[0_12px_30px_rgba(15,76,191,0.45)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2.5 cursor-pointer group"
              >
                <span>OUR SERVICES</span>
                <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setPage ? setPage("blogs") : null}
                className="px-8 py-3.5 bg-white border border-[#0F4CBF]/40 hover:border-[#0F4CBF] text-[#0F4CBF] hover:bg-[#0F4CBF]/5 font-sans font-semibold text-xs sm:text-sm tracking-[0.25em] uppercase rounded-full shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                READ OUR BLOG
              </button>
            </div>
          </motion.div>

          {/* Key Trust Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20"
          >
            {[
              { stat: "99.9%", label: "Germ & Virus Elimination" },
              { stat: "10k+", label: "Facilities & Homes Protected" },
              { stat: "100%", label: "TESDA Certified Technicians" },
              { stat: "24/7", label: "Emergency Sanitation Service" },
            ].map((st) => (
              <div key={st.label} className="bg-white/90 border border-sky-150 backdrop-blur-xl rounded-2xl p-6 text-center shadow-[0_8px_25px_rgba(15,76,191,0.06)] hover:border-[#0F4CBF]/40 hover:-translate-y-1 transition-all duration-300">
                <div className="font-sans font-black text-3xl sm:text-4xl text-[#000F98] mb-1">{st.stat}</div>
                <div className="font-sans font-semibold text-slate-600 text-xs sm:text-sm uppercase tracking-wider">{st.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Service cards preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {services.slice(0, 6).map((s, idx) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 35, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: idx * 0.08, duration: 0.45 }}
                  onClick={() => setPage ? setPage("services") : null}
                  className="bg-white/90 border border-sky-150 backdrop-blur-xl rounded-2xl p-7 hover:border-[#0F4CBF]/50 hover:shadow-[0_12px_35px_rgba(15,76,191,0.12)] hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0F4CBF] to-[#02289C] rounded-xl flex items-center justify-center mb-5 text-white shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="text-white" size={28} />
                    </div>
                    <h3 className="font-sans font-bold text-[#000F98] text-xl mb-3 tracking-wide group-hover:text-[#0F4CBF] transition-colors">{s.title}</h3>
                    <p className="font-sans text-slate-600 text-sm leading-relaxed mb-6">{s.short}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#0F4CBF] font-sans font-semibold text-xs tracking-wider uppercase group-hover:translate-x-1 transition-transform">
                    <span>Learn More</span>
                    <ChevronRight size={16} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Why choose us */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-[#000F98] via-[#0F4CBF] to-[#02289C] border border-[#0F4CBF]/30 rounded-3xl p-10 md:p-12 text-center text-white shadow-[0_20px_45px_rgba(15,76,191,0.2)]"
          >
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-white font-sans font-semibold text-xs tracking-[0.2em] uppercase mb-3">
              GUARANTEED EXCELLENCE
            </span>
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-4">Why Choose SwiftClear?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              {[
                { title: "Licensed & Certified", desc: "All technicians are fully trained, TESDA certified, and covered so you are always protected." },
                { title: "Hospital-Grade & Eco-Safe", desc: "EPA-approved formulas tough on 99.9% of germs while safe for family, pets, and children." },
                { title: "100% Satisfaction Guarantee", desc: "If you are not satisfied, our team returns free of charge until your space is spotless." },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 border border-white/20 rounded-xl p-7 text-left hover:bg-white/15 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white mb-4 font-bold text-sm">✓</div>
                  <h4 className="font-sans font-bold text-white text-lg mb-2">{item.title}</h4>
                  <p className="font-sans text-white/90 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ setPage }: { setPage?: (p: string) => void }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F6F9FF] to-white text-slate-800 overflow-hidden">
      <BgDecor />
      <Navbar active="services" setPage={setPage} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-semibold text-xs tracking-[0.25em] uppercase mb-4 shadow-sm">
            Full Service Portfolio
          </span>
          <h1 className="font-sans font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#000F98] tracking-tight mb-4 drop-shadow-sm">
            Our <span className="text-[#0F4CBF]">Services</span>
          </h1>
          <p className="font-sans font-medium text-slate-600 text-lg md:text-xl leading-relaxed">
            Everything your residential, commercial, or industrial space needs — executed with hospital-grade precision.
          </p>
        </motion.div>
        <div className="space-y-8">
          {services.map((s, i) => {
            const Icon = s.icon;
            const isEven = i % 2 === 0;
            return (
              <motion.div
                id={s.id}
                key={s.id}
                initial={{ opacity: 0, y: 35, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 bg-white/90 border border-sky-150 backdrop-blur-xl rounded-2xl p-8 md:p-10 hover:border-[#0F4CBF]/40 shadow-[0_10px_30px_rgba(15,76,191,0.08)] transition-all duration-300`}
              >
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[#0F4CBF] to-[#02289C] rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Icon className="text-white" size={48} />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-[#000F98] mb-3 tracking-wide">{s.title}</h2>
                  <p className="font-sans text-slate-600 text-base md:text-lg leading-relaxed mb-6">{s.long}</p>
                  <button
                    onClick={() => setPage ? setPage("careers") : null}
                    className="inline-flex items-center gap-2 bg-[#0F4CBF] hover:bg-[#02289C] text-white font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-full px-7 py-3.5 shadow-[0_8px_20px_rgba(15,76,191,0.3)] hover:shadow-[0_12px_28px_rgba(15,76,191,0.45)] transition-all cursor-pointer"
                  >
                    <span>BOOK SERVICE</span> <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlogsPage({ setPage, selectedArticleId, setSelectedArticleId }: { setPage?: (p: string) => void; selectedArticleId?: string | null; setSelectedArticleId?: (id: string | null) => void }) {
  const [localBlogId, setLocalBlogId] = useState<string | null>(null);

  const activeId = selectedArticleId !== undefined ? selectedArticleId : localBlogId;
  const setArticleId = setSelectedArticleId || setLocalBlogId;

  const currentBlog = blogs.find((b) => b.id === activeId);

  if (currentBlog) {
    return <BlogDetailPage blog={currentBlog} onBack={() => setArticleId(null)} setPage={setPage} />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F6F9FF] to-white text-slate-800 overflow-hidden">
      <BgDecor />
      <Navbar active="blogs" setPage={setPage} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-semibold text-xs tracking-[0.25em] uppercase mb-4 shadow-sm">
            Knowledge &amp; Insights
          </span>
          <h1 className="font-sans font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#000F98] tracking-tight mb-4 drop-shadow-sm">
            Swift<span className="text-[#0F4CBF]">Clear</span> Insights
          </h1>
          <p className="font-sans font-medium text-slate-600 text-lg md:text-xl leading-relaxed">
            Expert guidance on medical-grade disinfection, pest management, indoor air purity, and safety protocols.
          </p>
        </motion.div>

        {/* Featured blog cards grid */}
        <div className="space-y-8">
          {blogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 35, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.1, duration: 0.45 }}
              className="bg-white/90 border border-sky-150 backdrop-blur-xl rounded-2xl p-7 md:p-9 flex flex-col md:flex-row items-center gap-8 hover:border-[#0F4CBF]/50 shadow-[0_10px_30px_rgba(15,76,191,0.08)] hover:shadow-[0_15px_40px_rgba(15,76,191,0.15)] hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Image Container */}
              <div className="flex-shrink-0 relative">
                <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl bg-[#EEF4FF] border border-sky-200 overflow-hidden shadow-md group-hover:shadow-lg transition-all">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-bold text-[11px] tracking-[0.15em] uppercase">
                    FEATURED GUIDE
                  </span>
                  <span className="text-slate-400 font-sans text-xs">5 min read</span>
                </div>
                <h2 className="font-sans font-bold text-2xl md:text-3xl text-[#000F98] mb-3 leading-snug group-hover:text-[#0F4CBF] transition-colors">{blog.title}</h2>
                <p className="font-sans text-slate-600 text-base leading-relaxed line-clamp-3 mb-6">
                  {blog.excerpt}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setArticleId(blog.id);
                    if (typeof window !== 'undefined') window.scrollTo(0, 0);
                  }}
                  className="inline-flex items-center gap-2 bg-[#0F4CBF] hover:bg-[#02289C] text-white font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-full px-7 py-3.5 shadow-[0_8px_20px_rgba(15,76,191,0.25)] hover:shadow-[0_12px_28px_rgba(15,76,191,0.4)] transition-all cursor-pointer"
                >
                  <span>READ ARTICLE</span> <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogDetailPage({ blog, onBack, setPage }: { blog?: typeof blogs[0]; onBack?: () => void; setPage?: (p: string) => void }) {
  const { slug } = useParams<{ slug: string }>();
  const activeBlog = blog ?? blogs.find((b) => b.id === slug) ?? blogs[0];
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F6F9FF] to-white text-slate-800 overflow-hidden">
      <BgDecor />
      <Navbar active="blogs" setPage={setPage} />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header with image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 border border-sky-150 backdrop-blur-xl rounded-3xl p-8 md:p-10 mb-10 shadow-[0_12px_35px_rgba(15,76,191,0.08)]"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl bg-[#EEF4FF] border border-sky-200 overflow-hidden shadow-lg">
                <img src={activeBlog.image} alt={activeBlog.title} className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-bold text-[11px] tracking-[0.15em] uppercase">
                  EXPERT GUIDE
                </span>
                <span className="text-slate-400 font-sans text-xs">Published August 2026</span>
              </div>
              <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-[#000F98] leading-tight mb-4">{activeBlog.title}</h1>
              <p className="font-sans text-slate-600 text-sm md:text-base leading-relaxed">
                By SwiftClear Medical &amp; Sanitation Advisory Board
              </p>
            </div>
          </div>
        </motion.div>

        {/* Article body */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="bg-white/90 border border-sky-150 backdrop-blur-xl rounded-3xl p-8 md:p-14 shadow-[0_15px_40px_rgba(15,76,191,0.08)]"
        >
          {activeBlog.content.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="font-sans text-slate-700 text-base md:text-lg leading-relaxed mb-6 last:mb-0"
              dangerouslySetInnerHTML={{
                __html: para.replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#000F98] font-bold'>$1</strong>"),
              }}
            />
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
              else navigate("/blogs");
              if (typeof window !== 'undefined') window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-2 bg-white border border-[#0F4CBF]/40 text-[#0F4CBF] hover:bg-[#0F4CBF]/10 font-sans font-semibold text-xs tracking-[0.25em] uppercase rounded-full px-9 py-4 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            ← BACK TO BLOGS
          </button>
        </div>
      </div>
    </div>
  );
}

function CareersPage({ setPage }: { setPage?: (p: string) => void }) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const activePosition = positions.find((p) => p.id === selectedJobId);

  if (activePosition) {
    return <CareersFormPage position={activePosition} onBack={() => setSelectedJobId(null)} setPage={setPage} />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F6F9FF] to-white text-slate-800 overflow-hidden">
      <BgDecor />
      <Navbar active="careers" setPage={setPage} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-semibold text-xs tracking-[0.25em] uppercase mb-4 shadow-sm">
            Join Our Team
          </span>
          <h1 className="font-sans font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#000F98] tracking-tight mb-4 drop-shadow-sm">
            Career <span className="text-[#0F4CBF]">Opportunities</span>
          </h1>
          <p className="font-sans font-medium text-slate-600 text-lg md:text-xl leading-relaxed">
            Build a meaningful career with the Philippines&apos; leading facility and cleaning services provider.
          </p>
        </motion.div>
        <div className="space-y-6">
          {positions.map((pos, idx) => (
            <motion.div
              key={pos.id}
              initial={{ opacity: 0, y: 35, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.08, duration: 0.45 }}
              className="bg-white/90 border border-sky-150 backdrop-blur-xl rounded-2xl p-7 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#0F4CBF]/40 shadow-[0_10px_30px_rgba(15,76,191,0.08)] transition-all duration-300"
            >
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h3 className="font-sans font-bold text-[#000F98] text-2xl tracking-wide">{pos.title}</h3>
                  <span className="px-3 py-1 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-semibold text-xs tracking-wider uppercase">
                    {pos.type}
                  </span>
                </div>
                <p className="font-sans text-slate-600 text-sm md:text-base leading-relaxed">{pos.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedJobId(pos.id);
                  if (typeof window !== 'undefined') window.scrollTo(0, 0);
                }}
                className="flex-shrink-0 bg-[#0F4CBF] hover:bg-[#02289C] text-white font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-full px-8 py-3.5 shadow-[0_8px_20px_rgba(15,76,191,0.3)] hover:shadow-[0_12px_28px_rgba(15,76,191,0.45)] transition-all cursor-pointer"
              >
                APPLY NOW
              </button>
            </motion.div>
          ))}
        </div>
        <div className="mt-16 bg-white/80 border border-sky-150 backdrop-blur-2xl rounded-2xl p-8 md:p-10 text-center shadow-sm">
          <p className="font-sans text-slate-700 text-base md:text-lg leading-relaxed">
            Don&apos;t see a role that fits? Send your resume to{" "}
            <a href="mailto:careers@swiftclear.ph" className="text-[#0F4CBF] font-bold underline hover:text-[#000F98] transition-colors">
              careers@swiftclear.ph
            </a>{" "}
            and we&apos;ll keep you in mind for future openings.
          </p>
        </div>
      </div>
    </div>
  );
}

function CareersFormPage({ position: propPosition, onBack, setPage }: { position?: typeof positions[0]; onBack?: () => void; setPage?: (p: string) => void }) {
  const { positionId } = useParams<{ positionId: string }>();
  const position = propPosition ?? positions.find((p) => p.id === positionId) ?? positions[0];
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", email: "", contact: "" });
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileName(f.name);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.contact.trim()) e.contact = "Contact number is required";
    if (!fileName) e.resume = "Please upload your resume";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F6F9FF] to-white text-slate-800 overflow-hidden flex flex-col">
        <BgDecor />
        <Navbar active="careers" setPage={setPage} />
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
          <div className="bg-white/90 border border-sky-150 backdrop-blur-2xl rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_15px_40px_rgba(15,76,191,0.12)]">
            <CheckCircle className="text-[#0F4CBF] mx-auto mb-6" size={70} />
            <h2 className="font-sans font-bold text-3xl text-[#000F98] mb-4">Application Submitted!</h2>
            <p className="font-sans text-slate-600 mb-8 text-base leading-relaxed">Thank you, <strong className="text-slate-900">{form.name}</strong>. We&apos;ll review your application for <strong className="text-[#0F4CBF]">{position.title}</strong> and reach out within 3–5 business days.</p>
            <button
              type="button"
              onClick={() => {
                if (onBack) onBack();
                else navigate("/careers");
                if (typeof window !== 'undefined') window.scrollTo(0, 0);
              }}
              className="bg-[#0F4CBF] hover:bg-[#02289C] text-white font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-full px-8 py-3.5 shadow-[0_8px_20px_rgba(15,76,191,0.3)] transition-all cursor-pointer"
            >
              BACK TO CAREERS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F6F9FF] to-white text-slate-800 overflow-hidden">
      <BgDecor />
      <Navbar active="careers" setPage={setPage} />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#0F4CBF]/10 border border-[#0F4CBF]/30 text-[#0F4CBF] font-sans font-bold text-xs tracking-[0.2em] uppercase mb-3">
            JOB APPLICATION
          </span>
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-[#000F98] tracking-tight mb-2">{position.title}</h1>
          <p className="font-sans text-slate-600 text-base">Please fill out the details below to submit your application.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 border border-sky-150 backdrop-blur-2xl rounded-3xl p-8 md:p-10 space-y-6 shadow-[0_15px_40px_rgba(15,76,191,0.12)]"
          noValidate
        >
          {/* NAME */}
          <div>
            <label className="block font-sans font-semibold text-xs text-[#0F4CBF] tracking-[0.2em] uppercase mb-2">FULL NAME</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#0F4CBF] focus:bg-white rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 font-sans text-base outline-none transition-colors"
              placeholder="Juan dela Cruz"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
          </div>

          {/* EMAIL */}
          <div>
            <label className="block font-sans font-semibold text-xs text-[#0F4CBF] tracking-[0.2em] uppercase mb-2">EMAIL ADDRESS</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#0F4CBF] focus:bg-white rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 font-sans text-base outline-none transition-colors"
              placeholder="juan@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
          </div>

          {/* CONTACT */}
          <div>
            <label className="block font-sans font-semibold text-xs text-[#0F4CBF] tracking-[0.2em] uppercase mb-2">CONTACT NUMBER</label>
            <input
              type="tel"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 focus:border-[#0F4CBF] focus:bg-white rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 font-sans text-base outline-none transition-colors"
              placeholder="+63 9XX XXX XXXX"
            />
            {errors.contact && <p className="text-red-500 text-xs mt-1.5">{errors.contact}</p>}
          </div>

          {/* RESUME */}
          <div>
            <label className="block font-sans font-semibold text-xs text-[#0F4CBF] tracking-[0.2em] uppercase mb-2">ATTACH RESUME (PDF/DOC)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold text-xs tracking-wider uppercase px-5 py-3.5 rounded-xl border border-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload size={16} /> <span>BROWSE FILE</span>
              </button>
              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-5 py-3.5 truncate">
                <span className="font-sans text-slate-600 text-sm truncate block">
                  {fileName || "No file chosen"}
                </span>
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
            </div>
            {errors.resume && <p className="text-red-500 text-xs mt-1.5">{errors.resume}</p>}
          </div>

          {/* SUBMIT */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-[#0F4CBF] hover:bg-[#02289C] text-white font-sans font-bold text-xs tracking-[0.25em] uppercase rounded-full py-4 shadow-[0_8px_25px_rgba(15,76,191,0.35)] hover:shadow-[0_12px_30px_rgba(15,76,191,0.5)] transition-all cursor-pointer"
            >
              SUBMIT APPLICATION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App({ page = 'home', setPage }: { page?: string; setPage?: (p: string) => void }) {
  if (setPage) {
    return (
      <div className="swiftclear-app-container relative bg-white text-gray-900 selection:bg-[#00B4D8] selection:text-white">
        {(page === 'home' || page === 'inquire') && <HomePage setPage={setPage} />}
        {page === 'services' && <ServicesPage setPage={setPage} />}
        {page === 'blogs' && <BlogsPage setPage={setPage} />}
        {page === 'careers' && <CareersPage setPage={setPage} />}
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:slug" element={<BlogDetailPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/:positionId" element={<CareersFormPage />} />
      </Routes>
    </BrowserRouter>
  );
}
