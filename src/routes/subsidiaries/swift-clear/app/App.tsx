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
  { size: "140vw", color: "#000E37" },
  { size: "120vw", color: "#001450" },
  { size: "100vw", color: "#02289C" },
  { size: "82vw",  color: "#4876FF" },
  { size: "66vw",  color: "#97B1FF" },
  { size: "50vw",  color: "#C3D2FF" },
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
          <p className="font-['Source_Code_Pro',monospace] font-semibold text-white/90 text-base md:text-lg max-w-xl mb-8 drop-shadow">
            {"It's not only disinfection; It's about safety, protection & saving lives. Leave it to the expert!"}
          </p>

          <button
            onClick={handleScrollDown}
            className="bg-white/10 border border-[#4876FF]/60 rounded-full px-8 py-3.5 font-['Source_Code_Pro',monospace] font-extrabold text-[#4876FF] text-xl hover:bg-[#4876FF]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_30px_rgba(72,118,255,0.4)] flex items-center gap-2"
          >
            <span>EXPLORE SERVICES</span>
            <ChevronRight className="rotate-90" size={20} />
          </button>
        </motion.div>

        {/* Animated Scroll Down Indicator */}
        <button
          onClick={handleScrollDown}
          className="absolute bottom-8 z-10 animate-bounce cursor-pointer text-white/60 hover:text-white transition-colors"
          title="Scroll Down"
        >
          <svg className="w-7 h-7 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </section>

      {/* 2. MAIN CONTENT SECTION */}
      <div id="swiftclear-main-content" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <BgDecor />
        <Navbar active="home" setPage={setPage} />
        <div className="text-center mb-16">
          <h1 className="font-['Righteous',sans-serif] text-5xl md:text-7xl text-[#000F98] mb-4">Swift Clear</h1>
          <p className="font-['Roboto_Mono',monospace] font-semibold text-[#0F4CBF] text-lg md:text-2xl mb-6">Professional Cleaning & Sanitation Services</p>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We bring expert-level cleaning, disinfection, and pest control to homes and businesses across the Philippines. Safety, cleanliness, and professionalism in every service.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setPage ? setPage("services") : null}
              className="bg-[#0F4CBF] text-white font-['Righteous',sans-serif] text-lg px-8 py-3 rounded-full hover:bg-[#02289C] transition-colors flex items-center gap-2 cursor-pointer"
            >
              Our Services <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setPage ? setPage("blogs") : null}
              className="border-2 border-[#0F4CBF] text-[#0F4CBF] font-['Righteous',sans-serif] text-lg px-8 py-3 rounded-full hover:bg-[#0F4CBF]/10 transition-colors cursor-pointer"
            >
              Read Our Blog
            </button>
          </div>
        </div>
        {/* Service cards preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.slice(0, 6).map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => setPage ? setPage("services") : null}
                className="bg-[#02289C]/10 rounded-3xl p-6 hover:bg-[#02289C]/20 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="w-12 h-12 bg-[#0F4CBF] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#02289C] transition-colors">
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="font-['Righteous',sans-serif] text-[#000F98] text-lg mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.short}</p>
              </div>
            );
          })}
        </div>
        {/* Why choose us */}
        <div className="bg-[#0F4CBF] rounded-[40px] p-10 text-white text-center">
          <h2 className="font-['Righteous',sans-serif] text-3xl md:text-4xl mb-4">Why Choose Swift Clear?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              { title: "Licensed & Insured", desc: "All technicians are trained, certified, and covered so you're never at risk." },
              { title: "Eco-Safe Products", desc: "Hospital-grade formulas that are tough on germs and safe for your family and pets." },
              { title: "Satisfaction Guaranteed", desc: "Not satisfied? We come back free of charge until the job is done right." },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-2xl p-6">
                <h4 className="font-['Righteous',sans-serif] text-xl mb-2">{item.title}</h4>
                <p className="text-white/80 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesPage({ setPage }: { setPage?: (p: string) => void }) {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <BgDecor />
      <Navbar active="services" setPage={setPage} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-14">
          <h1 className="font-['Righteous',sans-serif] text-5xl md:text-7xl text-[#000F98] mb-3">Services</h1>
          <p className="font-['Roboto_Mono',monospace] font-semibold text-[#0F4CBF] text-lg">Everything your space needs — under one roof.</p>
        </div>
        <div className="space-y-8">
          {services.map((s, i) => {
            const Icon = s.icon;
            const isEven = i % 2 === 0;
            return (
              <div
                id={s.id}
                key={s.id}
                className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 bg-[#02289C]/10 rounded-[40px] p-8 md:p-10`}
              >
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0F4CBF] rounded-full flex items-center justify-center shadow-lg">
                    <Icon className="text-white" size={48} />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-['Righteous',sans-serif] text-2xl md:text-4xl text-white mb-3">{s.title}</h2>
                  <p className="text-white/80 text-base md:text-lg leading-relaxed">{s.long}</p>
                  <Link
                    to="/careers"
                    className="inline-flex items-center gap-2 mt-5 bg-white rounded-full px-6 py-2 font-['Righteous',sans-serif] text-[#c0c0c0] text-lg shadow hover:text-[#0F4CBF] transition-colors"
                  >
                    Book Now <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlogsPage({ setPage }: { setPage?: (p: string) => void }) {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <BgDecor />
      <Navbar active="blogs" setPage={setPage} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-14">
          <h1 className="font-['Righteous',sans-serif] text-5xl md:text-7xl text-[#000F98]">Blogs</h1>
        </div>
        <div className="space-y-10">
          {blogs.map((blog, i) => (
            <div
              key={blog.id}
              className="bg-[#02289C]/20 rounded-[40px] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8"
            >
              {/* Circle image */}
              <div className="flex-shrink-0 relative">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#0F4CBF] flex items-center justify-center overflow-hidden shadow-xl">
                  <img src={blog.image} alt={blog.title} className="w-[90%] h-[90%] object-cover rounded-full" />
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-['Righteous',sans-serif] text-2xl md:text-4xl text-white mb-4 leading-tight">{blog.title}</h2>
                <p className="font-['Righteous',sans-serif] text-white/80 text-base md:text-xl leading-relaxed line-clamp-3 mb-6">
                  {blog.excerpt}
                </p>
                <Link
                  to={`/blogs/${blog.id}`}
                  className="inline-block bg-white rounded-full px-8 py-3 font-['Righteous',sans-serif] text-[#c0c0c0] text-xl shadow-md hover:text-[#0F4CBF] transition-colors"
                >
                  Read More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const blog = blogs.find((b) => b.id === slug);
  const navigate = useNavigate();

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Righteous',sans-serif] text-4xl text-[#000F98] mb-4">Post not found</h1>
          <button onClick={() => navigate("/blogs")} className="text-[#0F4CBF] underline">Back to Blogs</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <BgDecor />
      <Navbar active="blogs" />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header with circle image */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="flex-shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#0F4CBF] flex items-center justify-center overflow-hidden shadow-xl">
              <img src={blog.image} alt={blog.title} className="w-[90%] h-[90%] object-cover rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="font-['Righteous',sans-serif] text-3xl md:text-6xl text-white leading-tight">{blog.title}</h1>
          </div>
        </div>
        {/* Article body */}
        <div className="bg-[#02289C]/20 rounded-[40px] p-8 md:p-12">
          {blog.content.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="font-['Righteous',sans-serif] text-white text-base md:text-xl leading-relaxed mb-6 last:mb-0"
              dangerouslySetInnerHTML={{
                __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
              }}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/blogs" className="inline-block bg-white rounded-full px-8 py-3 font-['Righteous',sans-serif] text-[#c0c0c0] text-xl shadow-md hover:text-[#0F4CBF] transition-colors">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    </div>
  );
}

function CareersPage({ setPage }: { setPage?: (p: string) => void }) {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <BgDecor />
      <Navbar active="careers" setPage={setPage} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-4">
          <h1 className="font-['Righteous',sans-serif] text-5xl md:text-7xl text-[#000F98]">Careers</h1>
          <p className="font-['Roboto_Mono',monospace] font-semibold text-[#000F98] text-xl md:text-3xl mt-2">JOIN OUR TEAM</p>
        </div>
        <div className="mt-12 space-y-6">
          {positions.map((pos) => (
            <div
              key={pos.id}
              className="bg-[#02289C]/20 rounded-full flex flex-col md:flex-row items-center justify-between gap-4 px-8 py-6"
            >
              <div className="flex-1 text-center md:text-left">
                <span className="font-['Roboto_Mono',monospace] font-semibold text-white text-2xl md:text-4xl">{pos.title}</span>
                <span className="ml-3 text-white/60 text-sm font-mono">· {pos.type}</span>
                <p className="text-white/70 text-sm md:text-base mt-1 leading-relaxed hidden md:block">{pos.desc}</p>
              </div>
              <Link
                to={`/careers/${pos.id}`}
                className="flex-shrink-0 bg-white rounded-full px-8 py-3 font-['Righteous',sans-serif] text-[#c0c0c0] text-2xl shadow-md hover:text-[#0F4CBF] transition-colors"
              >
                APPLY
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-[#02289C]/10 rounded-[40px] p-8 text-center">
          <p className="font-['Righteous',sans-serif] text-white text-xl md:text-2xl leading-relaxed">
            Don&apos;t see a role that fits? Send your resume to{" "}
            <a href="mailto:careers@swiftclear.ph" className="underline hover:text-[#4876FF]">
              careers@swiftclear.ph
            </a>{" "}
            and we&apos;ll keep you in mind for future openings.
          </p>
        </div>
      </div>
    </div>
  );
}

function CareersFormPage() {
  const { positionId } = useParams<{ positionId: string }>();
  const position = positions.find((p) => p.id === positionId) ?? positions[0];
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
      <div className="relative min-h-screen bg-white overflow-hidden flex flex-col">
        <BgDecor />
        <Navbar active="careers" />
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="bg-[#02289C]/20 rounded-[40px] p-12 max-w-lg w-full text-center">
            <CheckCircle className="text-green-400 mx-auto mb-6" size={80} />
            <h2 className="font-['Righteous',sans-serif] text-3xl text-white mb-4">Application Submitted!</h2>
            <p className="text-white/80 mb-8 text-lg">Thank you, {form.name}. We&apos;ll review your application for <strong>{position.title}</strong> and reach out within 3–5 business days.</p>
            <button
              onClick={() => navigate("/careers")}
              className="bg-white rounded-full px-8 py-3 font-['Righteous',sans-serif] text-[#c0c0c0] text-xl shadow hover:text-[#0F4CBF] transition-colors"
            >
              Back to Careers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <BgDecor />
      <Navbar active="careers" />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-['Righteous',sans-serif] text-5xl md:text-7xl text-[#000F98]">Careers</h1>
          <p className="font-['Righteous',sans-serif] text-white text-xl md:text-2xl mt-2">Applying for: {position.title}</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-[#02289C]/20 rounded-[40px] p-8 md:p-12 space-y-5"
          noValidate
        >
          {/* NAME */}
          <div className="flex items-center bg-[#A5B7FF] rounded-full overflow-hidden shadow">
            <span className="font-['Righteous',sans-serif] text-white text-xl px-6 py-4 whitespace-nowrap">NAME</span>
            <div className="flex-1 bg-[#EFF2FA] shadow-inner rounded-full">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent font-['Righteous',sans-serif] text-[#180070] text-lg px-6 py-4 outline-none"
                placeholder="Juan dela Cruz"
              />
            </div>
          </div>
          {errors.name && <p className="text-red-400 text-sm pl-4">{errors.name}</p>}

          {/* EMAIL */}
          <div className="flex items-center bg-[#A5B7FF] rounded-full overflow-hidden shadow">
            <span className="font-['Righteous',sans-serif] text-white text-xl px-6 py-4 whitespace-nowrap">EMAIL</span>
            <div className="flex-1 bg-[#EFF2FA] shadow-inner rounded-full">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent font-['Righteous',sans-serif] text-[#180070] text-lg px-6 py-4 outline-none"
                placeholder="juan@email.com"
              />
            </div>
          </div>
          {errors.email && <p className="text-red-400 text-sm pl-4">{errors.email}</p>}

          {/* CONTACT */}
          <div className="flex items-center bg-[#A5B7FF] rounded-full overflow-hidden shadow">
            <span className="font-['Righteous',sans-serif] text-white text-xl px-6 py-4 whitespace-nowrap">CONTACT</span>
            <div className="flex-1 bg-[#EFF2FA] shadow-inner rounded-full">
              <input
                type="tel"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full bg-transparent font-['Righteous',sans-serif] text-[#180070] text-lg px-6 py-4 outline-none"
                placeholder="+63 9XX XXX XXXX"
              />
            </div>
          </div>
          {errors.contact && <p className="text-red-400 text-sm pl-4">{errors.contact}</p>}

          {/* RESUME */}
          <div className="flex items-center bg-[#A5B7FF] rounded-full overflow-hidden shadow">
            <span className="font-['Righteous',sans-serif] text-white text-xl px-6 py-4 whitespace-nowrap">RESUME</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-[#EFF2FA] text-[#180070] font-['Righteous',sans-serif] text-lg px-6 py-4 flex items-center gap-2 hover:bg-[#d0d8f7] transition-colors"
            >
              <Upload size={18} /> UPLOAD
            </button>
            <div className="flex-1 bg-[#EFF2FA] shadow-inner rounded-r-full px-6 py-4">
              <span className="font-['Righteous',sans-serif] text-[#180070] text-base truncate block">
                {fileName || "No file chosen"}
              </span>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
          </div>
          {errors.resume && <p className="text-red-400 text-sm pl-4">{errors.resume}</p>}

          {/* SUBMIT */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-white rounded-full px-12 py-4 font-['Righteous',sans-serif] text-[#c0c0c0] text-2xl shadow-md hover:text-[#0F4CBF] hover:shadow-lg transition-all"
            >
              CONFIRM
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
