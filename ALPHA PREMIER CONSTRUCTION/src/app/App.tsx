import { useState, useEffect, useRef } from "react";
import wavyBg from "@/imports/Realistic_wavy_luxury_background___Premium_AI-generated_image.jpg";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Menu, X, ArrowUpRight, Layers, HardHat, Cog, Wind, Package,
  ChevronRight, Facebook, Instagram, Linkedin, Twitter, MoveRight,
  TrendingUp, Users, Shield, Award, Lightbulb, MapPin, Briefcase,
  Clock, ArrowRight, Play, Pause,
} from "lucide-react";

/* ─── constants ─────────────────────────────────────────── */
const GOLD = "#D4AF37";
const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── images ────────────────────────────────────────────── */
const IMG = {
  // existing
  hero:        "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&h=1080&fit=crop&auto=format",
  fitout:      "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?w=900&h=700&fit=crop&auto=format",
  civil:       "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=900&h=700&fit=crop&auto=format",
  engineering: "https://images.unsplash.com/photo-1705147219565-fe9f6f369d03?w=900&h=700&fit=crop&auto=format",
  aircon:      "https://images.unsplash.com/photo-1698479603408-1a66a6d9e80f?w=900&h=700&fit=crop&auto=format",
  sourcing:    "https://images.unsplash.com/photo-1637241612956-b7309005288b?w=900&h=700&fit=crop&auto=format",
  // blog
  blogFeatured: "https://images.unsplash.com/photo-1758901810612-55ba2c317a53?w=1400&h=920&fit=crop&auto=format",
  blog1:        "https://images.unsplash.com/photo-1551766472-62096056b476?w=700&h=560&fit=crop&auto=format",
  blog2:        "https://images.unsplash.com/photo-1765766601592-ac2936aa87e0?w=700&h=420&fit=crop&auto=format",
  blog3:        "https://images.unsplash.com/photo-1715156153744-d5fd2f1f66eb?w=700&h=600&fit=crop&auto=format",
  blog4:        "https://images.unsplash.com/photo-1773085266769-fbee873610bd?w=700&h=440&fit=crop&auto=format",
  blog5:        "https://images.unsplash.com/photo-1760385737098-0b555a75b2ba?w=700&h=580&fit=crop&auto=format",
  blog6:        "https://images.unsplash.com/photo-1692624654117-9df7f0d9a4c1?w=700&h=380&fit=crop&auto=format",
  // careers
  careerHero:   "https://images.unsplash.com/photo-1579847188804-ecba0e2ea330?w=1920&h=1080&fit=crop&auto=format",
};

/* ─── nav ────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",     page: "home" },
  { label: "Services", page: "services" },
  { label: "Blogs",    page: "blogs" },
  { label: "Careers",  page: "careers" },
];

/* ─── services data ─────────────────────────────────────── */
const PORTFOLIO_SERVICES = [
  { num:"01", icon:Layers,   title:"Architectural &\nInterior Fit-Out",       tagline:"Precision-crafted environments from concept to completion.",   body:"We deliver integrated architectural and interior fit-out solutions that blend design, function, and precision. From bespoke joinery and surface finishes to complete spatial planning, every project is executed to the highest standards — transforming raw space into refined environments that reflect our clients' vision.", capabilities:["Spatial Planning & 3D Visualization","Custom Joinery & Millwork","FF&E Specification & Procurement","Site Supervision & QA"],           image:IMG.fitout,      imageAlt:"Luxury interior space with warm natural light",                    imageRight:false },
  { num:"02", icon:HardHat,  title:"Civil Works &\nGeneral Construction",     tagline:"Structural integrity built on decades of field expertise.",     body:"We provide end-to-end civil works and construction services for residential, commercial, and industrial projects. Our teams ensure structural integrity, regulatory compliance, and quality craftsmanship throughout every phase — from groundwork and foundations to full structural build-out and finishing.", capabilities:["Foundation & Substructure Work","Structural Steelwork & Concrete","Commercial & Residential Builds","Regulatory Compliance & Permitting"], image:IMG.civil,       imageAlt:"Concrete building structure under construction",                   imageRight:true  },
  { num:"03", icon:Cog,      title:"Engineering &\nMechanical Services",      tagline:"Systems designed for performance, safety, and longevity.",      body:"We offer comprehensive engineering and mechanical services for modern buildings and industrial facilities. Our scope covers MEP design, installation, and ongoing maintenance — ensuring every system operates safely, efficiently, and in compliance with local and international standards.",                capabilities:["MEP Design & Engineering","Plumbing & Drainage Systems","Fire Protection Systems","Preventive Maintenance Programs"],                   image:IMG.engineering, imageAlt:"Industrial pipes and mechanical systems on a building exterior",   imageRight:false },
  { num:"04", icon:Wind,     title:"Professional Aircon\nSupply & Installation",tagline:"Climate-engineered comfort for every scale of space.",         body:"We specialize in supplying and installing high-performance air conditioning systems for residential, commercial, and industrial spaces. Our certified technicians handle everything from initial load calculation and system selection to precision installation and long-term service contracts.",          capabilities:["Load Calculation & System Design","VRF, Split & Ducted Systems","Commissioning & Testing","Annual Maintenance Contracts"],                image:IMG.aircon,      imageAlt:"Modern AC units installed on a commercial building",               imageRight:true  },
  { num:"05", icon:Package,  title:"On-Demand\nMaterial Sourcing",            tagline:"Right materials. Right time. No compromise on quality.",        body:"We provide reliable, on-demand sourcing of quality construction materials — ensuring timely delivery, competitive pricing, and compliance with industry standards. Our supplier network spans locally-manufactured and internationally-certified materials, keeping your project on schedule and budget.",  capabilities:["Structural & Finishing Materials","Certified Supplier Network","Just-in-Time Delivery Logistics","Quality Inspection & Certification"],   image:IMG.sourcing,    imageAlt:"Organised shelves of construction bricks and materials",           imageRight:false },
];

const METRICS = [
  { value:"12+",  label:"Years of Experience" },
  { value:"5",    label:"Integrated Service Lines" },
  { value:"100%", label:"Client Satisfaction" },
  { value:"3×",   label:"Industry Sectors Served" },
];

const CORE_VALUES = [
  { label:"Integrity",     desc:"Transparent dealings at every stage of every project." },
  { label:"Excellence",    desc:"Uncompromising quality in craft, material, and delivery." },
  { label:"Innovation",    desc:"Forward-thinking design solutions for evolving needs." },
  { label:"Accountability",desc:"Ownership of outcomes — from groundbreak to handover." },
];

/* ─── blog data ─────────────────────────────────────────── */
const BLOG_FEATURED = {
  category: "Industry Insight",
  date:      "June 18, 2025",
  readTime:  "7 min read",
  title:     "The New Language of Luxury: How Bespoke Fit-Out is Redefining Commercial Interiors in the UAE",
  excerpt:   "As the UAE continues its trajectory as a global architectural showcase, the demand for distinguished, custom-crafted interior environments has never been more acute. We explore the defining trends, materials, and methodologies shaping the future of premium fit-out.",
  image:     IMG.blogFeatured,
  imageAlt:  "Grand staircase with artwork and chandelier in a luxury interior space",
};

const BLOG_POSTS = [
  {
    id:1, image:IMG.blog1, imageH:"h-64",
    category:"Civil Works", date:"May 30, 2025",
    title:"Foundations of Excellence: Why Substructure Engineering Determines Every Project's Future",
    excerpt:"Underground decisions made at the foundation stage carry consequences that reverberate through a building's entire lifecycle. Our structural team explains the non-negotiables.",
  },
  {
    id:2, image:IMG.blog2, imageH:"h-48",
    category:"Interior Design", date:"May 12, 2025",
    title:"Residential Luxury: The 2025 Material Palette Shaping High-End UAE Homes",
    excerpt:"From brushed unlacquered brass to smoked oak and fluted travertine — the materials defining this year's premium residential interiors.",
  },
  {
    id:3, image:IMG.blog3, imageH:"h-72",
    category:"Architecture", date:"Apr 28, 2025",
    title:"Vertical Ambition: Engineering the Next Generation of Mixed-Use Towers",
    excerpt:"As plot sizes shrink and urban density rises, vertical integration has become both an architectural and engineering discipline requiring unprecedented coordination.",
  },
  {
    id:4, image:IMG.blog4, imageH:"h-52",
    category:"Sustainability", date:"Apr 10, 2025",
    title:"Net-Zero on the Horizon: How Construction Firms Must Adapt to Incoming UAE Climate Mandates",
    excerpt:"Regulatory momentum is building rapidly. Here is what the construction sector needs to know about the incoming requirements — and how to get ahead of them.",
  },
  {
    id:5, image:IMG.blog5, imageH:"h-68",
    category:"Fit-Out", date:"Mar 22, 2025",
    title:"Behind the Threshold: A Deep Dive into Hospitality Fit-Out at the Highest Standards",
    excerpt:"From brief to unveiling, our design team walks through the anatomy of a five-star hospitality interior project from specification to handover.",
  },
  {
    id:6, image:IMG.blog6, imageH:"h-44",
    category:"Engineering", date:"Mar 5, 2025",
    title:"MEP Integration in Luxury Builds: Why It Must Be Designed In, Not Bolted On",
    excerpt:"Mechanical, electrical, and plumbing systems are too often an afterthought. We make the case for their role as primary design drivers in premium construction.",
  },
];

/* ─── careers data ──────────────────────────────────────── */
const CULTURE_PILLARS = [
  { icon:TrendingUp, title:"Growth by Design",    desc:"Every role is structured with a clear advancement path. We invest in training, mentorship, and professional development at every level." },
  { icon:Users,      title:"Collaborative Teams", desc:"We build cross-functional teams where engineers, designers, and project managers operate as one cohesive unit." },
  { icon:Shield,     title:"Safety First, Always",desc:"Our safety culture is non-negotiable. Every team member goes home. Full stop." },
  { icon:Lightbulb,  title:"Innovation Culture",  desc:"We encourage our people to challenge convention, propose new methods, and pioneer better solutions for our clients." },
  { icon:Award,      title:"Recognised Excellence",desc:"Outstanding work is acknowledged, rewarded, and celebrated — from the site team to the boardroom." },
  { icon:Clock,      title:"Work-Life Integrity", desc:"We respect boundaries and believe sustainable performance comes from rested, balanced professionals." },
];

const JOB_LISTINGS = [
  { id:1, dept:"Construction Management", title:"Senior Project Manager",         location:"Dubai, UAE",     type:"Full-time",  featured:true  },
  { id:2, dept:"Civil & Structural",      title:"Civil Engineer",                 location:"Abu Dhabi, UAE", type:"Full-time",  featured:false },
  { id:3, dept:"Architectural Fit-Out",   title:"Interior Design Lead",           location:"Dubai, UAE",     type:"Full-time",  featured:false },
  { id:4, dept:"Engineering & MEP",       title:"MEP Engineer",                   location:"Dubai, UAE",     type:"Full-time",  featured:false },
  { id:5, dept:"Site Operations",         title:"Site Supervisor",                location:"Sharjah, UAE",   type:"Full-time",  featured:false },
  { id:6, dept:"Material Sourcing",       title:"Procurement & Sourcing Officer", location:"Dubai, UAE",     type:"Full-time",  featured:false },
  { id:7, dept:"Business Development",    title:"Client Relations Manager",       location:"Dubai, UAE",     type:"Full-time",  featured:false },
  { id:8, dept:"Quality Assurance",       title:"QA / QC Inspector",             location:"Abu Dhabi, UAE", type:"Contract",   featured:false },
];

/* ─── animation variants ────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity:0, y:28 },
  visible: (delay=0) => ({ opacity:1, y:0, transition:{ duration:0.75, ease:EASE, delay } }),
};
const fadeLeft  = { hidden:{ opacity:0, x:-56 }, visible:{ opacity:1, x:0, transition:{ duration:0.9, ease:EASE } } };
const fadeRight = { hidden:{ opacity:0, x:56  }, visible:{ opacity:1, x:0, transition:{ duration:0.9, ease:EASE } } };
const staggerContainer = { hidden:{}, visible:{ transition:{ staggerChildren:0.09, delayChildren:0.1 } } };
const staggerItem = { hidden:{ opacity:0, y:18 }, visible:{ opacity:1, y:0, transition:{ duration:0.55, ease:EASE } } };
const ruleExpand = { hidden:{ scaleX:0, originX:0 }, visible:{ scaleX:1, transition:{ duration:0.7, ease:EASE } } };

/* ─── shared micro-components ───────────────────────────── */
function AnimatedRule({ width="w-10", delay=0 }: { width?:string; delay?:number }) {
  return (
    <motion.span className={`block h-px ${width}`}
      style={{ backgroundColor:GOLD, transformOrigin:"left" }}
      variants={ruleExpand} initial="hidden" whileInView="visible"
      viewport={{ once:true, margin:"-5%" }}
      transition={{ duration:0.7, ease:EASE, delay }}
    />
  );
}

function CategoryPill({ label }: { label:string }) {
  return (
    <span className="inline-block font-['Jost'] text-[10px] tracking-[0.18em] uppercase px-3 py-1"
      style={{ color:GOLD, border:`1px solid rgba(212,175,55,0.4)` }}>
      {label}
    </span>
  );
}

/* ─── nav ────────────────────────────────────────────────── */
function NavBar({ currentPage, onNavigate }:{ currentPage:string; onNavigate:(p:string)=>void }) {
  const [menuOpen,setMenuOpen] = useState(false);
  const [scrolled,setScrolled] = useState(false);
  useEffect(()=>{
    const fn = ()=>setScrolled(window.scrollY>48);
    window.addEventListener("scroll",fn,{passive:true});
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?"bg-[#121212]/95 backdrop-blur-sm border-b border-[rgba(212,175,55,0.12)]":"bg-transparent"}`}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <button onClick={()=>onNavigate("home")} className="flex items-center gap-3 flex-shrink-0">
          <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden="true">
            <path d="M14 0L28 8V24L14 32L0 24V8L14 0Z" fill="none" stroke={GOLD} strokeWidth="1.2"/>
            <path d="M8 22V14L14 10L20 14V22" stroke={GOLD} strokeWidth="1.4" strokeLinecap="square"/>
            <rect x="11" y="17" width="6" height="5" stroke={GOLD} strokeWidth="1.2"/>
          </svg>
          <span className="font-['Cinzel'] text-xs tracking-[0.18em] uppercase leading-tight text-left">
            Alpha Premier<br/><span style={{color:GOLD}}>Construction</span>
          </span>
        </button>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link=>(
            <button key={link.label} onClick={()=>onNavigate(link.page)}
              className={`font-['Jost'] text-xs tracking-[0.12em] uppercase transition-colors duration-200 ${currentPage===link.page?"text-[#D4AF37]":"text-[#a0a0a0] hover:text-[#D4AF37]"}`}>
              {link.label}
            </button>
          ))}
        </nav>
        <button className="md:hidden text-white" onClick={()=>setMenuOpen(v=>!v)} aria-label="Toggle menu">
          {menuOpen?<X size={22}/>:<Menu size={22}/>}
        </button>
      </div>
      {menuOpen&&(
        <div className="md:hidden bg-[#161616] border-t border-[rgba(212,175,55,0.12)] px-6 pb-6 pt-4">
          {NAV_LINKS.map(link=>(
            <button key={link.label} onClick={()=>{onNavigate(link.page);setMenuOpen(false);}}
              className="block w-full text-left font-['Jost'] text-sm tracking-[0.1em] uppercase text-[#a0a0a0] hover:text-[#D4AF37] py-3 border-b border-[rgba(255,255,255,0.05)] transition-colors">
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function Footer({ onNavigate }:{ onNavigate:(p:string)=>void }) {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[rgba(212,175,55,0.12)] pt-16 pb-8 px-6 md:px-10">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-14 border-b border-[rgba(255,255,255,0.06)]">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <svg width="24" height="28" viewBox="0 0 28 32" fill="none" aria-hidden="true">
                <path d="M14 0L28 8V24L14 32L0 24V8L14 0Z" fill="none" stroke={GOLD} strokeWidth="1.2"/>
                <path d="M8 22V14L14 10L20 14V22" stroke={GOLD} strokeWidth="1.4" strokeLinecap="square"/>
                <rect x="11" y="17" width="6" height="5" stroke={GOLD} strokeWidth="1.2"/>
              </svg>
              <span className="font-['Cinzel'] text-xs tracking-[0.14em] uppercase">Alpha Premier</span>
            </div>
            <p className="font-['Jost'] text-xs leading-relaxed text-[#6a6a6a] font-light max-w-[200px]">Designing, building, and transforming spaces with precision and purpose.</p>
            <div className="flex items-center gap-4 mt-1">
              {[Facebook,Instagram,Linkedin,Twitter].map((Icon,i)=>(
                <a key={i} href="#" className="text-[#5a5a5a] hover:text-[#D4AF37] transition-colors" aria-label={["Facebook","Instagram","LinkedIn","Twitter"][i]}><Icon size={16} strokeWidth={1.5}/></a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-['Cinzel'] text-xs tracking-[0.16em] uppercase text-[#D4AF37] mb-2">Company</p>
            {["About","Services","Blogs","Careers"].map(l=><button key={l} onClick={()=>onNavigate(l.toLowerCase())} className="text-left font-['Jost'] text-sm text-[#6a6a6a] hover:text-white transition-colors">{l}</button>)}
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-['Cinzel'] text-xs tracking-[0.16em] uppercase text-[#D4AF37] mb-2">Services</p>
            {["Fit-Out","Civil Works","Engineering","Aircon","Sourcing"].map(s=><a key={s} href="#" className="font-['Jost'] text-sm text-[#6a6a6a] hover:text-white transition-colors">{s}</a>)}
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-['Cinzel'] text-xs tracking-[0.16em] uppercase text-[#D4AF37] mb-2">Contact</p>
            <p className="font-['Jost'] text-sm text-[#6a6a6a] font-light">info@alphapremierconstruction.com</p>
            <p className="font-['Jost'] text-sm text-[#6a6a6a] font-light">+971 XX XXX XXXX</p>
            <button className="mt-3 self-start border border-[#D4AF37]/40 text-[#D4AF37] font-['Cinzel'] font-bold text-[10px] tracking-[0.16em] uppercase px-5 py-2.5 hover:bg-[#D4AF37] hover:text-[#121212] transition-all duration-300">Inquire Now</button>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-['Jost'] text-xs text-[#4a4a4a]">© 2025 Alpha Premier Group of Companies OPC. All rights reserved.</p>
          <p className="font-['Jost'] text-xs text-[#3a3a3a]">Design. Build. Transform.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── SERVICE ROW ────────────────────────────────────────── */
function ServiceRow({ service, index }:{ service:typeof PORTFOLIO_SERVICES[0]; index:number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target:rowRef, offset:["start end","end start"] });
  const imageY = useTransform(scrollYProgress,[0,1],["6%","-6%"]);
  const numY   = useTransform(scrollYProgress,[0,1],["-12%","12%"]);
  const { imageRight } = service;
  const Icon = service.icon;
  return (
    <div ref={rowRef} className="relative" style={{position:"relative"}}>
      <div className="w-full h-px bg-[rgba(212,175,55,0.1)]"/>
      <div className="grid md:grid-cols-2" style={{minHeight:560}}>
        <motion.div className={`relative overflow-hidden bg-[#0a0a0a] ${imageRight?"md:order-2":"md:order-1"} order-1`} style={{minHeight:360}}
          variants={imageRight?fadeRight:fadeLeft} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-8%"}}>
          <motion.img src={service.image} alt={service.imageAlt} className="absolute inset-0 w-full object-cover"
            style={{y:imageY,height:"116%",top:"-8%"}}/>
          <div className="absolute inset-0 pointer-events-none" style={{background:imageRight?"linear-gradient(to left,rgba(18,18,18,0.4) 0%,transparent 55%)":"linear-gradient(to right,rgba(18,18,18,0.4) 0%,transparent 55%)"}}/>
          <motion.span className="absolute bottom-4 font-['Cinzel'] font-black select-none pointer-events-none leading-none"
            style={{y:numY,fontSize:"clamp(6rem,14vw,12rem)",color:"rgba(212,175,55,0.07)",[imageRight?"right":"left"]:"1.5rem"}} aria-hidden="true">
            {service.num}
          </motion.span>
        </motion.div>
        <motion.div className={`flex flex-col justify-center px-10 md:px-16 py-16 bg-[#121212] ${imageRight?"md:order-1":"md:order-2"} order-2`}
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-8%"}}>
          <motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
            <Icon size={16} className="text-[#D4AF37]" strokeWidth={1.5}/>
            <span className="font-['Jost'] text-xs tracking-[0.22em] uppercase text-[#D4AF37]">Service {service.num}</span>
          </motion.div>
          <motion.h2 variants={staggerItem} className="font-['Cinzel'] font-bold uppercase mb-5 leading-[1.15]" style={{fontSize:"clamp(1.5rem,3vw,2.4rem)",letterSpacing:"0.05em"}}>
            {service.title.split("\n").map((l,i,a)=><span key={i}>{l}{i<a.length-1&&<br/>}</span>)}
          </motion.h2>
          <motion.div variants={staggerItem} className="flex items-center gap-4 mb-6">
            <motion.span className="block h-px w-10 flex-shrink-0" style={{backgroundColor:GOLD,transformOrigin:"left"}} variants={ruleExpand}/>
            <p className="font-['Jost'] text-sm italic font-light text-[#D4AF37]/75 tracking-wide">{service.tagline}</p>
          </motion.div>
          <motion.p variants={staggerItem} className="font-['Jost'] text-sm md:text-base leading-[1.95] text-[#8a8a8a] font-light mb-8">{service.body}</motion.p>
          <motion.ul variants={staggerContainer} className="flex flex-col gap-2.5 mb-10">
            {service.capabilities.map(cap=>(
              <motion.li key={cap} variants={staggerItem} className="flex items-start gap-3">
                <span className="mt-[6px] block w-[5px] h-[5px] flex-shrink-0 rotate-45" style={{backgroundColor:GOLD}}/>
                <span className="font-['Jost'] text-xs tracking-[0.07em] text-[#7a7a7a]">{cap}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div variants={staggerItem}>
            <button className="group inline-flex items-center gap-3 border border-[#D4AF37]/50 text-[#D4AF37] font-['Cinzel'] font-bold text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121212]">
              View Projects <MoveRight size={13} className="transition-transform duration-300 group-hover:translate-x-1"/>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NEWS & INSIGHTS PAGE
══════════════════════════════════════════════════════════ */
function NewsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target:heroRef, offset:["start start","end start"] });
  const heroOpacity = useTransform(scrollYProgress,[0,0.7],[1,0]);

  return (
    <div className="bg-[#0e0e0e] text-white">

      {/* ── Page header ── */}
      <section ref={heroRef} className="relative pt-36 pb-20 px-6 md:px-10 overflow-hidden border-b border-[rgba(212,175,55,0.1)]" style={{position:"relative"}}>
        {/* large faint watermark */}
        <span className="absolute right-0 top-1/2 -translate-y-1/2 font-['Cinzel'] font-black uppercase select-none pointer-events-none leading-none"
          style={{fontSize:"clamp(7rem,20vw,20rem)",color:"rgba(212,175,55,0.025)",letterSpacing:"-0.02em",whiteSpace:"nowrap"}} aria-hidden="true">
          INSIGHTS
        </span>
        <motion.div className="max-w-[1280px] mx-auto relative z-10" style={{opacity:heroOpacity}}>
          <motion.div className="flex items-center gap-2 mb-10" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:0.6,ease:EASE}}>
            <span className="font-['Jost'] text-xs tracking-[0.18em] uppercase text-[#5a5a5a]">Home</span>
            <ChevronRight size={12} className="text-[#3a3a3a]"/>
            <span className="font-['Jost'] text-xs tracking-[0.18em] uppercase" style={{color:GOLD}}>News & Insights</span>
          </motion.div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <motion.p className="font-['Jost'] text-xs tracking-[0.28em] uppercase mb-4" style={{color:GOLD}} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:EASE,delay:0.1}}>
                Alpha Premier Construction
              </motion.p>
              <motion.h1 className="font-['Cinzel'] font-black uppercase leading-[1.04]"
                style={{fontSize:"clamp(2.8rem,7vw,7rem)",letterSpacing:"0.03em"}}
                initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} transition={{duration:0.85,ease:EASE,delay:0.2}}>
                News &<br/><span style={{color:GOLD}}>Insights</span>
              </motion.h1>
            </div>
            <motion.p className="font-['Jost'] text-sm font-light text-[#6a6a6a] max-w-xs leading-relaxed md:text-right"
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:EASE,delay:0.4}}>
              Industry perspectives, project stories, and expert commentary from the Alpha Premier team.
            </motion.p>
          </div>
          <motion.div className="mt-14 h-px" style={{backgroundColor:"rgba(212,175,55,0.12)",transformOrigin:"left"}}
            initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:1.1,ease:EASE,delay:0.5}}/>
        </motion.div>
      </section>

      {/* ── Featured Article ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <motion.div className="flex items-center gap-4 mb-10" variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{once:true}}>
          <span className="font-['Cinzel'] text-xs tracking-[0.2em] uppercase" style={{color:GOLD}}>Featured</span>
          <span className="block h-px flex-1" style={{backgroundColor:"rgba(212,175,55,0.15)"}}/>
        </motion.div>

        <motion.div className="grid md:grid-cols-[58%_42%] border border-[rgba(212,175,55,0.12)] overflow-hidden"
          initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} transition={{duration:0.9,ease:EASE}} viewport={{once:true,margin:"-5%"}}>

          {/* Image */}
          <div className="relative overflow-hidden bg-[#161616]" style={{minHeight:460}}>
            <img src={BLOG_FEATURED.image} alt={BLOG_FEATURED.imageAlt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"/>
            {/* dark gradient from right */}
            <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(to right,transparent 50%,rgba(18,18,18,0.7) 100%)"}}/>
            {/* bottom overlay for mobile */}
            <div className="absolute inset-0 pointer-events-none md:hidden" style={{background:"linear-gradient(to top,rgba(14,14,14,0.95) 0%,transparent 50%)"}}/>
            {/* Category pill on image */}
            <div className="absolute top-6 left-6">
              <CategoryPill label={BLOG_FEATURED.category}/>
            </div>
          </div>

          {/* Text */}
          <motion.div className="flex flex-col justify-center px-8 md:px-12 py-12 bg-[#141414]"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-5%"}}>
            <motion.div variants={staggerItem} className="flex items-center gap-4 mb-6">
              <span className="font-['Jost'] text-xs tracking-[0.16em] uppercase text-[#6a6a6a]">{BLOG_FEATURED.date}</span>
              <span className="block w-px h-3 bg-[#3a3a3a]"/>
              <span className="font-['Jost'] text-xs tracking-[0.12em] text-[#6a6a6a]">{BLOG_FEATURED.readTime}</span>
            </motion.div>
            <motion.h2 variants={staggerItem} className="font-['Cinzel'] font-bold uppercase leading-[1.18] mb-6"
              style={{fontSize:"clamp(1.4rem,2.8vw,2.2rem)",letterSpacing:"0.04em"}}>
              {BLOG_FEATURED.title}
            </motion.h2>
            <AnimatedRule delay={0.1}/>
            <motion.p variants={staggerItem} className="font-['Jost'] text-sm leading-[1.9] text-[#8a8a8a] font-light mt-6 mb-8">
              {BLOG_FEATURED.excerpt}
            </motion.p>
            <motion.div variants={staggerItem}>
              <button className="group inline-flex items-center gap-3 font-['Cinzel'] font-bold text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 transition-all duration-300 bg-[#D4AF37] text-[#121212] hover:bg-white">
                Read Full Article
                <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Blog Grid ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 pb-28">

        {/* section label row */}
        <motion.div className="flex items-center gap-5 mb-14"
          initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
          transition={{duration:0.7,ease:EASE}} viewport={{once:true}}>
          <span className="font-['Cinzel'] text-xs tracking-[0.22em] uppercase" style={{color:GOLD}}>
            Latest Articles
          </span>
          <motion.span className="block h-px flex-1"
            style={{backgroundColor:"rgba(212,175,55,0.15)",transformOrigin:"left"}}
            initial={{scaleX:0}} whileInView={{scaleX:1}}
            transition={{duration:1,ease:EASE,delay:0.2}} viewport={{once:true}}/>
          <span className="font-['Jost'] text-[10px] tracking-[0.16em] uppercase text-[#4a4a4a]">
            {BLOG_POSTS.length} Articles
          </span>
        </motion.div>

        {/* 3-column uniform grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={{
            hidden:{},
            visible:{ transition:{ staggerChildren:0.13, delayChildren:0.05 } }
          }}
          initial="hidden" whileInView="visible"
          viewport={{once:true, margin:"-6%"}}
        >
          {BLOG_POSTS.map((post)=>(
            <motion.article
              key={post.id}
              className="group relative flex flex-col bg-[#161616] border border-[rgba(212,175,55,0.1)] overflow-hidden cursor-pointer"
              variants={{
                hidden:{ opacity:0, y:44 },
                visible:{ opacity:1, y:0, transition:{ duration:0.72, ease:EASE } }
              }}
              whileHover={{ y:-8, transition:{ duration:0.35, ease:EASE } }}
              style={{
                boxShadow:"0 0 0 0 rgba(212,175,55,0)",
              }}
              onHoverStart={e=>{
                (e.target as HTMLElement).closest("article")!.style.boxShadow="0 28px 72px rgba(0,0,0,0.55)";
                (e.target as HTMLElement).closest("article")!.style.borderColor="rgba(212,175,55,0.38)";
              }}
              onHoverEnd={e=>{
                (e.target as HTMLElement).closest("article")!.style.boxShadow="0 0 0 0 rgba(212,175,55,0)";
                (e.target as HTMLElement).closest("article")!.style.borderColor="rgba(212,175,55,0.1)";
              }}
            >
              {/* Left gold accent bar */}
              <span className="absolute left-0 top-0 w-[2px] h-full origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-500 z-10"
                style={{backgroundColor:GOLD}}/>

              {/* Image — fixed 3:2 aspect ratio for uniform grid */}
              <div className="relative overflow-hidden bg-[#0a0a0a]" style={{aspectRatio:"3/2"}}>
                <motion.img
                  src={post.image} alt={post.title}
                  className="w-full h-full object-cover"
                  whileHover={{scale:1.07}}
                  transition={{duration:0.65,ease:EASE}}
                />
                {/* gradient vignette */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{background:"linear-gradient(to top,rgba(22,22,22,0.72) 0%,rgba(22,22,22,0.1) 45%,transparent 100%)"}}/>
                {/* date — bottom left of image */}
                <span className="absolute bottom-4 left-5 font-['Jost'] text-[10px] tracking-[0.16em] uppercase text-[#aaa]">
                  {post.date}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-7 gap-4">

                {/* Category tag */}
                <div>
                  <CategoryPill label={post.category}/>
                </div>

                {/* Title */}
                <h3 className="font-['Cinzel'] text-[13px] font-bold uppercase leading-[1.5] tracking-[0.06em] text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Animated gold rule */}
                <span
                  className="block h-px origin-left transition-all duration-500"
                  style={{
                    backgroundColor:GOLD,
                    opacity:0.45,
                    width:"2rem",
                  }}
                  ref={el=>{
                    if (!el) return;
                    const article = el.closest("article");
                    if (!article) return;
                    const grow = ()=>{ el.style.width="3.5rem"; el.style.opacity="0.85"; };
                    const shrink = ()=>{ el.style.width="2rem"; el.style.opacity="0.45"; };
                    article.addEventListener("mouseenter",grow);
                    article.addEventListener("mouseleave",shrink);
                  }}
                />

                {/* Excerpt */}
                <p className="font-['Jost'] text-xs leading-[1.95] text-[#686868] font-light flex-1">
                  {post.excerpt}
                </p>

                {/* Read More */}
                <div className="flex items-center gap-2 pt-2 mt-auto border-t border-[rgba(255,255,255,0.05)]">
                  <span className="font-['Jost'] text-[10px] tracking-[0.2em] uppercase" style={{color:GOLD}}>
                    Read More
                  </span>
                  <ArrowRight
                    size={11}
                    style={{color:GOLD}}
                    className="transition-transform duration-300 group-hover:translate-x-2"
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── Newsletter CTA ── */}
      <motion.section className="border-t border-[rgba(212,175,55,0.1)] py-20 px-6 md:px-10"
        initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,ease:EASE}} viewport={{once:true,margin:"-5%"}}>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <p className="font-['Jost'] text-xs tracking-[0.22em] uppercase mb-3" style={{color:GOLD}}>Stay Informed</p>
            <h2 className="font-['Cinzel'] font-bold uppercase" style={{fontSize:"clamp(1.4rem,3vw,2.2rem)",letterSpacing:"0.06em"}}>
              Subscribe to Our Insights
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:w-auto w-full">
            <input type="email" placeholder="Your email address"
              className="flex-1 bg-[#1c1c1c] border border-[rgba(212,175,55,0.2)] text-white text-sm font-['Jost'] px-5 py-3.5 placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#D4AF37] transition-colors min-w-[260px]"/>
            <button className="bg-[#D4AF37] text-[#121212] font-['Cinzel'] font-bold text-xs tracking-[0.16em] uppercase px-7 py-3.5 hover:bg-white transition-colors duration-300 whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CAREERS PAGE
══════════════════════════════════════════════════════════ */
function CareersPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target:heroRef, offset:["start start","end start"] });
  const bgY      = useTransform(scrollYProgress,[0,1],["0%","20%"]);
  const textY    = useTransform(scrollYProgress,[0,1],["0%","14%"]);
  const heroFade = useTransform(scrollYProgress,[0,0.6],[1,0]);

  return (
    <div className="bg-[#121212] text-white">

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col justify-end overflow-hidden" style={{position:"relative"}}>
        {/* background image with parallax */}
        <motion.div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{backgroundImage:`url('${IMG.careerHero}')`,y:bgY}} aria-hidden="true"/>
        {/* layered overlays */}
        <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(to top,rgba(18,18,18,1) 0%,rgba(18,18,18,0.5) 40%,rgba(18,18,18,0.3) 100%)"}}/>
        <div className="absolute inset-0 pointer-events-none" style={{background:"rgba(18,18,18,0.35)"}}/>
        {/* corner accents */}
        {[["top-0 left-0","border-t border-l"],["top-0 right-0","border-t border-r"],["bottom-0 left-0","border-b border-l"],["bottom-0 right-0","border-b border-r"]].map(([pos,b],i)=>(
          <span key={i} className={`absolute ${pos} w-16 h-16 ${b} border-[#D4AF37]/40`} aria-hidden="true"/>
        ))}

        <motion.div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-10 pb-20 pt-36" style={{y:textY,opacity:heroFade}}>
          <motion.p className="font-['Jost'] text-xs tracking-[0.28em] uppercase mb-5" style={{color:GOLD}}
            initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:EASE,delay:0.2}}>
            Join Our Team
          </motion.p>
          <motion.h1 className="font-['Cinzel'] font-black uppercase leading-[1.06] mb-6"
            style={{fontSize:"clamp(2.8rem,7vw,7rem)",letterSpacing:"0.03em"}}
            initial={{opacity:0,y:36}} animate={{opacity:1,y:0}} transition={{duration:0.85,ease:EASE,delay:0.32}}>
            Build Your<br/><span style={{color:GOLD}}>Future</span><br/>With Us
          </motion.h1>
          <motion.div initial={{opacity:0,scaleX:0}} animate={{opacity:1,scaleX:1}} transition={{duration:0.9,ease:EASE,delay:0.56}}
            className="h-px w-16 mb-6" style={{transformOrigin:"left",backgroundColor:GOLD}}/>

          <motion.p className="font-['Jost'] text-base md:text-lg font-light text-[#c0c0c0] max-w-lg leading-[1.8]"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:EASE,delay:0.5}}>
            We are building more than structures. We are building careers — shaped by ambition, backed by expertise, and defined by the work we leave behind.
          </motion.p>
          <motion.div className="flex flex-wrap gap-4 mt-10"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:EASE,delay:0.64}}>
            <a href="#positions" className="group inline-flex items-center gap-3 bg-[#D4AF37] text-[#121212] font-['Cinzel'] font-bold text-xs tracking-[0.18em] uppercase px-8 py-4 hover:bg-white transition-colors duration-300">
              View Open Positions <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
            </a>
            <button className="inline-flex items-center gap-3 border border-[rgba(212,175,55,0.5)] text-[#D4AF37] font-['Cinzel'] font-bold text-xs tracking-[0.18em] uppercase px-8 py-4 hover:border-[#D4AF37] transition-colors duration-300">
              Our Culture
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-[rgba(212,175,55,0.12)] bg-[#0e0e0e]">
        <motion.div className="max-w-[1280px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(212,175,55,0.08)]"
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true}}>
          {[["120+","Team Members"],["18","Nationalities"],["96%","Retention Rate"],["8","Years Avg Tenure"]].map(([v,l])=>(
            <motion.div key={l} variants={staggerItem} className="bg-[#0e0e0e] px-8 py-8 flex flex-col items-center text-center gap-1">
              <span className="font-['Cinzel'] font-black" style={{fontSize:"clamp(1.8rem,4vw,3rem)",color:GOLD}}>{v}</span>
              <span className="font-['Jost'] text-xs tracking-[0.12em] uppercase text-[#6a6a6a]">{l}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Culture Pillars ── */}
      <section className="py-24 px-6 md:px-10 max-w-[1280px] mx-auto">
        <motion.div className="mb-14" variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{once:true}}>
          <p className="font-['Jost'] text-xs tracking-[0.26em] uppercase mb-4" style={{color:GOLD}}>Life at Alpha Premier</p>
          <h2 className="font-['Cinzel'] font-bold uppercase" style={{fontSize:"clamp(1.8rem,4vw,3rem)",letterSpacing:"0.05em"}}>Our Culture</h2>
        </motion.div>
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[rgba(212,175,55,0.08)]"
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-5%"}}>
          {CULTURE_PILLARS.map(p=>{
            const Icon=p.icon;
            return (
              <motion.div key={p.title} variants={staggerItem}
                className="group bg-[#161616] hover:bg-[#1c1c1c] transition-colors duration-300 p-8 flex flex-col gap-4">
                <div className="w-10 h-10 flex items-center justify-center border flex-shrink-0" style={{borderColor:"rgba(212,175,55,0.25)"}}>
                  <Icon size={18} style={{color:GOLD}} strokeWidth={1.5}/>
                </div>
                <h3 className="font-['Cinzel'] text-sm uppercase tracking-[0.1em] text-white group-hover:text-[#D4AF37] transition-colors duration-300">{p.title}</h3>
                <span className="block h-px w-6" style={{backgroundColor:GOLD,opacity:0.5}}/>
                <p className="font-['Jost'] text-sm leading-[1.8] text-[#7a7a7a] font-light">{p.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Open Positions ── */}
      <section id="positions" className="pb-28 px-6 md:px-10 max-w-[1280px] mx-auto">
        <motion.div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{once:true}}>
          <div>
            <p className="font-['Jost'] text-xs tracking-[0.26em] uppercase mb-4" style={{color:GOLD}}>We Are Hiring</p>
            <h2 className="font-['Cinzel'] font-bold uppercase" style={{fontSize:"clamp(1.8rem,4vw,3rem)",letterSpacing:"0.05em"}}>Open Positions</h2>
          </div>
          <p className="font-['Jost'] text-sm text-[#6a6a6a] font-light max-w-xs">
            Don't see a perfect fit? Send your CV to <span style={{color:GOLD}}>careers@alphapremierconstruction.com</span>
          </p>
        </motion.div>

        {/* job list */}
        <motion.div className="border border-[rgba(212,175,55,0.12)]"
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-5%"}}>
          {JOB_LISTINGS.map((job,i)=>(
            <motion.div
              key={job.id}
              variants={staggerItem}
              className={`group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-7 py-6 transition-all duration-300 hover:bg-[#161616] ${i<JOB_LISTINGS.length-1?"border-b border-[rgba(212,175,55,0.1)]":""} ${job.featured?"bg-[#161616]":""}`}
            >
              {/* featured gold accent bar */}
              {job.featured&&<span className="absolute left-0 top-0 h-full w-[3px]" style={{backgroundColor:GOLD}}/>}

              <div className="flex flex-col gap-1.5">
                {/* dept + featured badge */}
                <div className="flex items-center gap-3">
                  <span className="font-['Jost'] text-[10px] tracking-[0.16em] uppercase text-[#6a6a6a]">{job.dept}</span>
                  {job.featured&&<span className="font-['Jost'] text-[9px] tracking-[0.14em] uppercase px-2 py-0.5" style={{color:GOLD,border:`1px solid rgba(212,175,55,0.4)`}}>Featured</span>}
                </div>
                {/* title */}
                <h3 className="font-['Cinzel'] text-base md:text-lg font-semibold uppercase tracking-[0.05em] text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                  {job.title}
                </h3>
                {/* meta */}
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 font-['Jost'] text-xs text-[#5a5a5a]">
                    <MapPin size={11} style={{color:GOLD}}/>{job.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-['Jost'] text-xs text-[#5a5a5a]">
                    <Briefcase size={11} style={{color:GOLD}}/>{job.type}
                  </span>
                </div>
              </div>

              {/* Apply button */}
              <button className="group/btn flex-shrink-0 inline-flex items-center gap-3 border font-['Cinzel'] font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 transition-all duration-300"
                style={{borderColor:"rgba(212,175,55,0.45)",color:GOLD}}
                onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.backgroundColor=GOLD;(e.currentTarget as HTMLButtonElement).style.color="#121212";}}
                onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.backgroundColor="transparent";(e.currentTarget as HTMLButtonElement).style.color=GOLD;}}>
                Apply Now
                <ArrowUpRight size={12} className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"/>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <motion.section
        className="relative py-28 px-6 md:px-10 text-center overflow-hidden"
        style={{ backgroundImage:`url(${wavyBg})`, backgroundSize:"cover", backgroundPosition:"center" }}
        initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,ease:EASE}} viewport={{once:true,margin:"-5%"}}>
        {/* dark overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{background:"rgba(10,8,4,0.70)"}}/>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
          <p className="font-['Jost'] text-xs tracking-[0.25em] uppercase" style={{color:GOLD}}>Shape Your Career</p>
          <h2 className="font-['Cinzel'] font-bold uppercase text-white" style={{fontSize:"clamp(1.6rem,4vw,3rem)",letterSpacing:"0.06em"}}>
            Bring Your Expertise to Our Team
          </h2>
          <AnimatedRule/>
          <button className="group flex items-center gap-3 bg-[#D4AF37] text-[#121212] font-['Cinzel'] font-bold text-xs tracking-[0.18em] uppercase px-10 py-4 transition-all duration-300 hover:bg-white">
            Browse All Roles
            <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
          </button>
        </div>
      </motion.section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SERVICES CAROUSEL
══════════════════════════════════════════════════════════ */
const CAROUSEL_CARDS = [
  { num:"01", icon:Layers,  tag:"Fit-Out",     title:"Architectural & Interior Fit-Out",  short:"Precision-crafted environments built from concept to handover, blending function with elevated design.", image:IMG.fitout      },
  { num:"02", icon:HardHat, tag:"Civil Works",  title:"Civil Works & General Construction",short:"End-to-end structural builds for residential, commercial, and industrial projects.", image:IMG.civil       },
  { num:"03", icon:Cog,     tag:"Engineering",  title:"Engineering & Mechanical Services", short:"MEP design, installation, and maintenance ensuring safety, efficiency, and full compliance.", image:IMG.engineering },
  { num:"04", icon:Wind,    tag:"Aircon",       title:"Aircon Supply & Installation",      short:"High-performance climate systems engineered for every scale of residential and commercial space.", image:IMG.aircon      },
  { num:"05", icon:Package, tag:"Sourcing",     title:"On-Demand Material Sourcing",       short:"Quality-certified construction materials delivered on time and within budget.", image:IMG.sourcing    },
];

function ServicesCarousel({ onNavigate }:{ onNavigate:(p:string)=>void }) {
  const [paused, setPaused] = useState(false);
  const doubled = [...CAROUSEL_CARDS, ...CAROUSEL_CARDS];

  return (
    <section className="py-28 overflow-hidden">
      {/* keyframe injected once */}
      <style>{`
        @keyframes apc-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .apc-track {
          animation: apc-marquee 38s linear infinite;
          will-change: transform;
        }
        .apc-track.apc-paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{once:true}}>
            <p className="font-['Jost'] text-xs tracking-[0.25em] uppercase mb-4" style={{color:GOLD}}>What We Do</p>
            <h2 className="font-['Cinzel'] font-bold uppercase leading-tight" style={{fontSize:"clamp(1.8rem,4vw,2.8rem)",letterSpacing:"0.06em"}}>Our Services</h2>
          </motion.div>
          <motion.div className="flex items-center gap-5" variants={fadeRight} initial="hidden" whileInView="visible" viewport={{once:true}}>
            <button onClick={()=>setPaused(p=>!p)}
              className="flex items-center gap-2 font-['Jost'] text-xs tracking-[0.14em] uppercase transition-opacity hover:opacity-60"
              style={{color:GOLD}} aria-label={paused?"Resume carousel":"Pause carousel"}>
              {paused ? <><Play size={11}/> Resume</> : <><Pause size={11}/> Pause</>}
            </button>
            <span className="block w-px h-4" style={{background:"rgba(212,175,55,0.3)"}}/>
            <button onClick={()=>onNavigate("services")}
              className="flex items-center gap-2 font-['Jost'] text-xs tracking-[0.14em] uppercase transition-opacity hover:opacity-60"
              style={{color:GOLD}}>
              View All <ArrowUpRight size={13}/>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Scrolling track ── */}
      <div className="relative"
        onMouseEnter={()=>setPaused(true)}
        onMouseLeave={()=>setPaused(false)}>

        {/* Fade masks */}
        <div className="absolute left-0 inset-y-0 w-32 z-10 pointer-events-none"
          style={{background:"linear-gradient(to right,#121212 0%,transparent 100%)"}}/>
        <div className="absolute right-0 inset-y-0 w-32 z-10 pointer-events-none"
          style={{background:"linear-gradient(to left,#121212 0%,transparent 100%)"}}/>

        <div className={`apc-track flex gap-5${paused?" apc-paused":""}`}
          style={{width:"max-content",paddingLeft:"2rem"}}>

          {doubled.map((card,i)=>{
            const Icon = card.icon;
            return (
              <div key={i}
                className="group relative bg-[#161616] border border-[rgba(212,175,55,0.1)] overflow-hidden flex-shrink-0 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-[rgba(212,175,55,0.5)] hover:shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
                style={{width:308}}>

                {/* Image zone */}
                <div className="relative overflow-hidden bg-[#0a0a0a]" style={{height:212}}>
                  <img src={card.image} alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"/>
                  {/* gradient vignette */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{background:"linear-gradient(to top,rgba(22,22,22,0.92) 0%,rgba(22,22,22,0.15) 55%,transparent 100%)"}}/>
                  {/* faded service number */}
                  <span className="absolute bottom-2 right-4 font-['Cinzel'] font-black leading-none select-none pointer-events-none"
                    style={{fontSize:"5rem",color:"rgba(212,175,55,0.11)",lineHeight:1}}>
                    {card.num}
                  </span>
                  {/* category pill */}
                  <span className="absolute bottom-4 left-5 font-['Jost'] text-[9px] tracking-[0.2em] uppercase px-2.5 py-1"
                    style={{color:GOLD,border:"1px solid rgba(212,175,55,0.38)",background:"rgba(18,18,18,0.65)",backdropFilter:"blur(6px)"}}>
                    {card.tag}
                  </span>
                </div>

                {/* Gold progress bar — draws on hover */}
                <span className="block h-[2px] w-full scale-x-0 origin-left transition-transform duration-500 group-hover:scale-x-100"
                  style={{backgroundColor:GOLD}}/>

                {/* Text content */}
                <div className="p-6 flex flex-col gap-3.5">
                  <div className="flex items-start gap-3">
                    <Icon size={15} strokeWidth={1.5} style={{color:GOLD,flexShrink:0,marginTop:3}}/>
                    <h3 className="font-['Cinzel'] text-[13px] font-semibold uppercase leading-[1.4] tracking-[0.07em] text-white group-hover:text-[#D4AF37] transition-colors duration-300">
                      {card.title}
                    </h3>
                  </div>
                  <span className="block h-px w-7" style={{backgroundColor:GOLD,opacity:0.45}}/>
                  <p className="font-['Jost'] text-xs leading-[1.9] font-light text-[#707070]">
                    {card.short}
                  </p>
                  <div className="flex items-center gap-2 pt-1" style={{color:GOLD}}>
                    <span className="font-['Jost'] text-[10px] tracking-[0.16em] uppercase">Explore</span>
                    <ArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-1.5"/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dot strip (decorative) ── */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 mt-10 flex items-center gap-3">
        {CAROUSEL_CARDS.map((_,i)=>(
          <span key={i} className="block rounded-full transition-all duration-300"
            style={{width:i===0?24:6,height:6,backgroundColor:i===0?GOLD:"rgba(212,175,55,0.25)"}}/>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════ */
function HomePage({ onNavigate }:{ onNavigate:(p:string)=>void }) {
  const SERVICES_HOME = [
    { icon:Layers,  title:"Architectural & Interior Fit-Out",      body:"Integrated fit-out solutions blending design, function, and precision from concept to completion.", wide:true  },
    { icon:HardHat, title:"Civil Works & General Construction",    body:"End-to-end civil and construction services ensuring structural integrity and regulatory compliance.", wide:false },
    { icon:Cog,     title:"Engineering & Mechanical Services",     body:"MEP design, installation, and maintenance for buildings and industrial facilities.", wide:false },
    { icon:Wind,    title:"Professional Aircon Supply & Installation",body:"High-performance AC systems for residential, commercial, and industrial spaces.", wide:false },
    { icon:Package, title:"On-Demand Material Sourcing",           body:"Reliable sourcing with timely delivery, competitive pricing, and quality assurance.", wide:false },
  ];
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress:heroScroll } = useScroll({ target:heroRef, offset:["start start","end start"] });
  const heroY = useTransform(heroScroll,[0,1],["0%","18%"]);
  const heroOpacity = useTransform(heroScroll,[0,0.6],[1,0]);

  return (
    <div className="bg-[#121212] text-white">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden" style={{position:"relative"}}>
        <motion.div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage:`url('${IMG.hero}')`,y:heroY}} aria-hidden="true"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,rgba(18,18,18,0.72) 0%,rgba(18,18,18,0.55) 50%,rgba(18,18,18,0.92) 100%)"}} aria-hidden="true"/>
        {[["top-0 left-0","border-t border-l"],["top-0 right-0","border-t border-r"],["bottom-0 left-0","border-b border-l"],["bottom-0 right-0","border-b border-r"]].map(([pos,b],i)=>(
          <span key={i} className={`absolute ${pos} w-16 h-16 ${b} border-[#D4AF37]/40`} aria-hidden="true"/>
        ))}
        <motion.div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl" style={{opacity:heroOpacity}}>
          <motion.p className="font-['Jost'] text-xs tracking-[0.28em] uppercase" style={{color:GOLD}} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:EASE,delay:0.2}}>Alpha Premier Group</motion.p>
          <motion.h1 className="font-['Cinzel'] font-black uppercase leading-[1.08]" style={{fontSize:"clamp(2.8rem,8vw,7rem)",letterSpacing:"0.04em"}} initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} transition={{duration:0.85,ease:EASE,delay:0.35}}>Design. Build. Transform.</motion.h1>
          <motion.p className="font-['Jost'] text-base md:text-lg font-light tracking-[0.06em] text-[#c8c8c8]" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:EASE,delay:0.55}}>Where Vision Becomes Structure.</motion.p>
          <motion.div className="h-px w-10" style={{backgroundColor:GOLD,transformOrigin:"left"}} initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:0.8,ease:EASE,delay:0.7}}/>
          <motion.button onClick={()=>onNavigate("services")} className="group flex items-center gap-3 border border-[#D4AF37] bg-transparent text-[#D4AF37] font-['Cinzel'] font-bold text-xs tracking-[0.18em] uppercase px-8 py-4 transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#121212]" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:EASE,delay:0.8}}>
            Inquire Now <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
          </motion.button>
        </motion.div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="font-['Jost'] text-[10px] tracking-[0.2em] uppercase text-white">Scroll</span>
          <span className="block w-px h-8 bg-[#D4AF37]/60"/>
        </div>
      </section>

      {/* About */}
      <section className="py-28 px-6 md:px-10 max-w-[1280px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          <motion.div className="flex flex-col gap-6" variants={fadeLeft} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-8%"}}>
            <p className="font-['Jost'] text-xs tracking-[0.25em] uppercase" style={{color:GOLD}}>Who We Are</p>
            <h2 className="font-['Cinzel'] font-bold uppercase leading-tight" style={{fontSize:"clamp(1.8rem,4vw,3rem)",letterSpacing:"0.06em"}}>About Alpha Premier Construction</h2>
            <AnimatedRule/>
            <p className="font-['Jost'] text-base leading-[1.9] text-[#a0a0a0] font-light">We specialize in elegant, modern, functional designs that reflect the sophistication of our clientele. From concept planning to handover, our projects are marked by efficiency, craftsmanship, and accountability.</p>
          </motion.div>
          <motion.div className="border border-[#D4AF37]/20 bg-[#161616] p-8 md:p-10 flex flex-col gap-5" variants={fadeRight} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-8%"}}>
            <p className="font-['Jost'] text-xs tracking-[0.22em] uppercase" style={{color:GOLD}}>Our Mission</p>
            <AnimatedRule/>
            <p className="font-['Jost'] text-lg leading-[1.8] font-light text-white">To be the most trusted partner for innovative, sustainable, and elegant solutions in the construction industry.</p>
          </motion.div>
        </div>
        <div className="mt-20">
          <p className="font-['Jost'] text-xs tracking-[0.25em] uppercase mb-10" style={{color:GOLD}}>Core Values</p>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(212,175,55,0.1)]" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-5%"}}>
            {CORE_VALUES.map(v=>(
              <motion.div key={v.label} variants={staggerItem} className="bg-[#121212] p-7 flex flex-col gap-3 group hover:bg-[#161616] transition-colors duration-300">
                <span className="font-['Cinzel'] text-sm tracking-[0.12em] uppercase" style={{color:GOLD}}>{v.label}</span>
                <p className="font-['Jost'] text-sm leading-relaxed text-[#7a7a7a] font-light group-hover:text-[#a0a0a0] transition-colors">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-[rgba(212,175,55,0.12)] bg-[#0e0e0e] py-20 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <motion.p className="font-['Jost'] text-xs tracking-[0.25em] uppercase text-center mb-4" style={{color:GOLD}} variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{once:true}}>Why Choose Us</motion.p>
          <motion.h2 className="font-['Cinzel'] font-bold uppercase text-center mb-16" style={{fontSize:"clamp(1.4rem,3vw,2.2rem)",letterSpacing:"0.08em"}} variants={fadeUp} custom={0.1} initial="hidden" whileInView="visible" viewport={{once:true}}>Built on Proven Results</motion.h2>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(212,175,55,0.1)]" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-5%"}}>
            {METRICS.map(m=>(
              <motion.div key={m.label} variants={staggerItem} className="bg-[#0e0e0e] px-8 py-10 flex flex-col items-center gap-2 text-center">
                <span className="font-['Cinzel'] font-black" style={{fontSize:"clamp(2.4rem,5vw,4rem)",color:GOLD}}>{m.value}</span>
                <span className="block w-6 h-px mt-1" style={{backgroundColor:GOLD}}/>
                <span className="font-['Jost'] text-xs tracking-[0.14em] uppercase text-[#a0a0a0]">{m.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services carousel */}
      <ServicesCarousel onNavigate={onNavigate}/>

      {/* CTA */}
      <motion.section
        className="relative py-28 px-6 md:px-10 text-center overflow-hidden"
        style={{ backgroundImage:`url(${wavyBg})`, backgroundSize:"cover", backgroundPosition:"center" }}
        initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,ease:EASE}} viewport={{once:true,margin:"-5%"}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"rgba(10,8,4,0.70)"}}/>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
          <p className="font-['Jost'] text-xs tracking-[0.25em] uppercase" style={{color:GOLD}}>Ready to Build?</p>
          <h2 className="font-['Cinzel'] font-bold uppercase text-white" style={{fontSize:"clamp(1.6rem,4vw,3rem)",letterSpacing:"0.06em"}}>Let Us Transform Your Vision Into Structure</h2>
          <AnimatedRule/>
          <button className="group flex items-center gap-3 bg-[#D4AF37] text-[#121212] font-['Cinzel'] font-bold text-xs tracking-[0.18em] uppercase px-10 py-4 transition-all duration-300 hover:bg-white">
            Inquire Now <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
          </button>
        </div>
      </motion.section>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SERVICES PAGE
══════════════════════════════════════════════════════════ */
function ServicesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress:heroScroll } = useScroll({ target:heroRef, offset:["start start","end start"] });
  const apcY = useTransform(heroScroll,[0,1],["0%","28%"]);
  const heroOpacity = useTransform(heroScroll,[0,0.7],[1,0]);
  return (
    <div className="bg-[#121212] text-white">
      <section ref={heroRef} className="relative pt-36 pb-28 px-6 md:px-10 overflow-hidden" style={{position:"relative"}}>
        <motion.span className="absolute right-0 top-1/2 -translate-y-1/2 font-['Cinzel'] font-black uppercase select-none pointer-events-none leading-none"
          style={{y:apcY,fontSize:"clamp(8rem,22vw,22rem)",color:"rgba(212,175,55,0.03)",letterSpacing:"-0.02em",whiteSpace:"nowrap"}} aria-hidden="true">APC</motion.span>
        <motion.div className="max-w-[1280px] mx-auto relative z-10" style={{opacity:heroOpacity}}>
          <motion.div className="flex items-center gap-2 mb-12" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:0.6,ease:EASE}}>
            <span className="font-['Jost'] text-xs tracking-[0.18em] uppercase text-[#5a5a5a]">Home</span>
            <ChevronRight size={12} className="text-[#3a3a3a]"/>
            <span className="font-['Jost'] text-xs tracking-[0.18em] uppercase" style={{color:GOLD}}>Services</span>
          </motion.div>
          <motion.p className="font-['Jost'] text-xs tracking-[0.3em] uppercase mb-4" style={{color:GOLD}} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:EASE,delay:0.1}}>Alpha Premier Construction</motion.p>
          <div className="overflow-hidden">
            <motion.h1 className="font-['Cinzel'] font-black uppercase leading-[1.02]" style={{fontSize:"clamp(3rem,8vw,8rem)",letterSpacing:"0.03em"}} initial={{opacity:0,y:"100%"}} animate={{opacity:1,y:"0%"}} transition={{duration:0.85,ease:EASE,delay:0.18}}>
              Our<br/>
              <motion.span style={{color:GOLD,display:"inline-block"}} initial={{opacity:0,y:"60%"}} animate={{opacity:1,y:"0%"}} transition={{duration:0.85,ease:EASE,delay:0.34}}>Expertise</motion.span>
            </motion.h1>
          </div>
          <motion.div className="mt-12 flex flex-col md:flex-row md:items-start gap-8 md:gap-20" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:EASE,delay:0.52}}>
            <div className="h-px w-16 mt-3 flex-shrink-0 hidden md:block" style={{backgroundColor:GOLD}}/>
            <p className="font-['Jost'] text-base md:text-lg font-light leading-[1.8] text-[#7a7a7a] max-w-xl">Five integrated service lines, delivered under one roof with the precision, accountability, and design intelligence that define the Alpha Premier standard.</p>
            <div className="flex flex-wrap gap-2 md:ml-auto">
              {PORTFOLIO_SERVICES.map(s=>(
                <motion.span key={s.num} className="font-['Jost'] text-[10px] tracking-[0.14em] uppercase border px-3 py-1.5 text-[#6a6a6a]" style={{borderColor:"rgba(212,175,55,0.2)"}}
                  initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{duration:0.4,ease:EASE,delay:0.55+PORTFOLIO_SERVICES.indexOf(s)*0.07}}>
                  {s.num}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <motion.div className="mt-16 h-px" style={{backgroundColor:"rgba(212,175,55,0.12)",transformOrigin:"left"}} initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:1.1,ease:EASE,delay:0.6}}/>
        </motion.div>
      </section>
      <section>
        {PORTFOLIO_SERVICES.map((service,i)=><ServiceRow key={service.num} service={service} index={i}/>)}
        <div className="w-full h-px bg-[rgba(212,175,55,0.1)]"/>
      </section>
      <section className="bg-[#0a0a0a] py-20 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(212,175,55,0.1)]" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{once:true,margin:"-5%"}}>
            {METRICS.map(m=>(
              <motion.div key={m.label} variants={staggerItem} className="bg-[#0a0a0a] px-8 py-12 flex flex-col items-center gap-2 text-center">
                <span className="font-['Cinzel'] font-black" style={{fontSize:"clamp(2.4rem,5vw,4rem)",color:GOLD}}>{m.value}</span>
                <span className="block w-6 h-px mt-1" style={{backgroundColor:GOLD}}/>
                <span className="font-['Jost'] text-xs tracking-[0.14em] uppercase text-[#6a6a6a] mt-1">{m.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <motion.section
        className="relative py-28 px-6 md:px-10 text-center overflow-hidden"
        style={{ backgroundImage:`url(${wavyBg})`, backgroundSize:"cover", backgroundPosition:"center" }}
        initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} transition={{duration:0.8,ease:EASE}} viewport={{once:true,margin:"-5%"}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"rgba(10,8,4,0.70)"}}/>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-8">
          <p className="font-['Jost'] text-xs tracking-[0.25em] uppercase" style={{color:GOLD}}>Start a Project</p>
          <h2 className="font-['Cinzel'] font-bold uppercase text-white" style={{fontSize:"clamp(1.6rem,4vw,3rem)",letterSpacing:"0.06em"}}>Let Us Build Something Extraordinary</h2>
          <AnimatedRule/>
          <button className="group flex items-center gap-3 bg-[#D4AF37] text-[#121212] font-['Cinzel'] font-bold text-xs tracking-[0.18em] uppercase px-10 py-4 transition-all duration-300 hover:bg-white">
            Inquire Now <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
          </button>
        </div>
      </motion.section>
    </div>
  );
}

/* ─── ROOT ──────────────────────────────────────────────── */
export default function App() {
  const [page,setPage] = useState<"home"|"services"|"blogs"|"careers">("home");
  const navigate = (p:string) => {
    setPage(p as typeof page);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  return (
    <div className="min-h-screen bg-[#121212] text-white overflow-x-hidden">
      <NavBar currentPage={page} onNavigate={navigate}/>
      {page==="home"     && <HomePage     onNavigate={navigate}/>}
      {page==="services" && <ServicesPage/>}
      {page==="blogs"    && <NewsPage/>}
      {page==="careers"  && <CareersPage/>}
      <Footer onNavigate={navigate}/>
    </div>
  );
}
