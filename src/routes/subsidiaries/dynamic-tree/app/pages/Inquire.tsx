import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone, Mail, MapPin, Facebook, Instagram,
  Send, MessageCircle, CheckCircle, ChevronDown,
} from "lucide-react";
import logo from "@/imports/Dynamic_Tree_Logo-1.png";

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.77a4.85 4.85 0 01-1.02-.08z" />
    </svg>
  );
}

const SERVICE_OPTIONS = [
  "Select a Service",
  "Model & Influencer Casting",
  "TV, Digital & Online Advertising",
  "Product Launches & Social Campaigns",
  "Fashion & Product Photography",
  "Video Direction & Production",
  "Creative Campaign Development",
  "Multiple Services / Full Package",
];

const BUDGET_OPTIONS = [
  "Select Budget Range",
  "Under ₱50,000",
  "₱50,000 – ₱150,000",
  "₱150,000 – ₱500,000",
  "₱500,000 – ₱1,000,000",
  "₱1,000,000+",
  "To be discussed",
];

// ─── Contact sidebar ──────────────────────────────────────────────────────────
function ContactSidebar() {
  return (
    <div className="flex flex-col gap-8">
      {/* Intro */}
      <div>
        <span
          className="text-xs tracking-[0.3em] uppercase text-[#C84A72] font-bold"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Let's Work Together
        </span>
        <h3
          className="text-2xl lg:text-3xl font-semibold text-[#1C1814] mt-2 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Contact <span style={{ fontStyle: "italic" }}>Details</span>
        </h3>
        <p
          className="text-sm text-[#5A4E55] mt-3 leading-relaxed font-normal"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Reach out and let's talk about how Dynamic Tree can elevate your brand,
          one frame at a time.
        </p>
      </div>

      {/* Contact items */}
      <div className="flex flex-col gap-4">
        {[
          {
            icon: Phone,
            label: "Phone / Viber",
            value: "0915 888 9482 / 02 8 650 2540",
            href: "tel:+639158889482",
          },
          {
            icon: Mail,
            label: "Email",
            value: "hello@dynamictree.ph",
            href: "mailto:hello@dynamictree.ph",
          },
          {
            icon: MapPin,
            label: "Office",
            value: "Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City",
            href: "#map",
          },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group flex items-start gap-3.5 p-3.5 rounded-xl hover:bg-[#C84A72]/6 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F5E0EC] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#C84A72] transition-colors">
              <item.icon size={15} className="text-[#C84A72] group-hover:text-white transition-colors" />
            </div>
            <div>
              <p
                className="text-[10px] tracking-widest uppercase text-[#8A7078] font-semibold mb-0.5"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {item.label}
              </p>
              <p
                className="text-sm text-[#1C1814] font-normal leading-relaxed"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {item.value}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#E8C8D4]/60" />

      {/* Social links */}
      <div>
        <p
          className="text-[10px] tracking-[0.25em] uppercase text-[#8A7078] font-semibold mb-4"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Connect With Us
        </p>
        <div className="flex gap-3">
          {[
            { icon: <Facebook size={15} />, label: "Facebook",  href: "#" },
            { icon: <Instagram size={15} />, label: "Instagram", href: "#" },
            { icon: <TikTokIcon size={15} />, label: "TikTok",   href: "#" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-10 h-10 rounded-full border border-[#E8C8D4] flex items-center justify-center text-[#8A7078] hover:border-[#C84A72] hover:text-[#C84A72] hover:bg-[#C84A72]/5 transition-all duration-200"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Why choose us strip */}
      <div
        className="rounded-2xl p-5 border border-[#E8C8D4]/60"
        style={{ background: "linear-gradient(135deg, #FDF0F5 0%, #F5EAF8 100%)" }}
      >
        <p
          className="text-[10px] tracking-[0.25em] uppercase text-[#C84A72] font-bold mb-3"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Why Dynamic Tree
        </p>
        {[
          "200+ models & influencers in our talent roster",
          "Full-service from concept to final delivery",
          "12+ years of industry experience",
        ].map((item) => (
          <div key={item} className="flex items-start gap-2.5 mb-2 last:mb-0">
            <CheckCircle size={14} className="text-[#C84A72] flex-shrink-0 mt-0.5" />
            <p
              className="text-xs text-[#3D3040] font-normal leading-relaxed"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inquiry form ─────────────────────────────────────────────────────────────
function InquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", company: "",
    service: "Select a Service", budget: "Select Budget Range",
    campaignDate: "", contact: "", notes: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputBase =
    "w-full bg-white/70 border border-[#E8C8D4] rounded-xl px-4 py-3 text-sm text-[#1C1814] placeholder-[#B0A0A8] focus:outline-none focus:border-[#C84A72] focus:bg-white focus:ring-2 focus:ring-[#C84A72]/10 transition-all font-normal";

  const labelBase =
    "block text-[10px] tracking-[0.22em] uppercase text-[#8A7078] font-bold mb-1.5";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 text-center px-8">
        <div className="w-16 h-16 rounded-full bg-[#F5E0EC] flex items-center justify-center">
          <CheckCircle size={32} className="text-[#C84A72]" />
        </div>
        <div>
          <h3
            className="text-2xl font-semibold text-[#1C1814] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Inquiry Received!
          </h3>
          <p
            className="text-sm text-[#5A4E55] leading-relaxed max-w-sm font-normal"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Thank you for reaching out. Our team will get back to you within 24
            hours. We look forward to working with you.
          </p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="text-xs text-[#C84A72] border border-[#C84A72]/30 px-5 py-2.5 rounded-full hover:bg-[#C84A72]/5 transition-colors"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Row 1: Full name */}
      <div>
        <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>Full Name</label>
        <input
          type="text" required placeholder="Juan Dela Cruz"
          value={form.fullName} onChange={set("fullName")}
          className={inputBase} style={{ fontFamily: "Outfit, sans-serif" }}
        />
      </div>

      {/* Row 2: Email + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>Email Address</label>
          <input
            type="email" required placeholder="juan@yourbrand.com"
            value={form.email} onChange={set("email")}
            className={inputBase} style={{ fontFamily: "Outfit, sans-serif" }}
          />
        </div>
        <div>
          <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>Company / Brand</label>
          <input
            type="text" placeholder="Your Brand Name"
            value={form.company} onChange={set("company")}
            className={inputBase} style={{ fontFamily: "Outfit, sans-serif" }}
          />
        </div>
      </div>

      {/* Row 3: Service + Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>Type of Service</label>
          <div className="relative">
            <select
              value={form.service} onChange={set("service")} required
              className={`${inputBase} appearance-none pr-10 cursor-pointer`}
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {SERVICE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A7078] pointer-events-none" />
          </div>
        </div>
        <div className="relative">
          <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>Budget Range</label>
          <div className="relative">
            <select
              value={form.budget} onChange={set("budget")}
              className={`${inputBase} appearance-none pr-10 cursor-pointer`}
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              {BUDGET_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A7078] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 4: Date + Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>Campaign / Event Date</label>
          <input
            type="text" placeholder="e.g. August 2026 or Flexible"
            value={form.campaignDate} onChange={set("campaignDate")}
            className={inputBase} style={{ fontFamily: "Outfit, sans-serif" }}
          />
        </div>
        <div>
          <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>Viber / Contact Number</label>
          <input
            type="text" placeholder="0917 XXX XXXX"
            value={form.contact} onChange={set("contact")}
            className={inputBase} style={{ fontFamily: "Outfit, sans-serif" }}
          />
        </div>
      </div>

      {/* Row 5: Notes */}
      <div>
        <label className={labelBase} style={{ fontFamily: "Outfit, sans-serif" }}>
          Project Details / Notes
        </label>
        <textarea
          rows={4} placeholder="Tell us about your project, campaign goals, or any specific requirements..."
          value={form.notes} onChange={set("notes")}
          className={`${inputBase} resize-none`}
          style={{ fontFamily: "Outfit, sans-serif" }}
        />
      </div>

      {/* Submit row */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="submit"
          className="group flex-1 flex items-center justify-center gap-2.5 bg-[#C84A72] text-white text-sm font-bold px-6 py-3.5 rounded-full hover:bg-[#A0305A] transition-all duration-300 shadow-lg hover:shadow-xl"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          <Send size={14} />
          Send Message via Email
        </button>
        <button
          type="button"
          className="group flex-1 flex items-center justify-center gap-2.5 border-2 border-[#1C1814] text-[#1C1814] text-sm font-bold px-6 py-3.5 rounded-full hover:bg-[#1C1814] hover:text-white transition-all duration-300"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          <MessageCircle size={14} />
          Start Live Chat
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Inquire() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #FDF6F9 0%, #FAF4F8 50%, #F5EDF3 100%)" }}
    >
      {/* Background orbs — same as hero */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-48 -left-48 w-[600px] h-[600px] opacity-35"
          style={{ background: "radial-gradient(circle, #F5ABBE 0%, #E8607E 30%, transparent 65%)", filter: "blur(90px)" }}
        />
        <div
          className="absolute -top-36 -right-36 w-[500px] h-[500px] opacity-25"
          style={{ background: "radial-gradient(circle, #FBBF7A 0%, #E8843A 30%, transparent 65%)", filter: "blur(100px)" }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-18"
          style={{ background: "radial-gradient(ellipse, #EDE0F5 0%, #D8C8F0 40%, transparent 70%)", filter: "blur(110px)" }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #C84A72 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">

          {/* ── Page header ── */}
          <div className="text-center mb-12">
            <Link to="/" className="inline-block mb-6">
              <img src={logo} alt="Dynamic Tree" className="h-14 w-auto mx-auto" />
            </Link>
            <span
              className="text-xs tracking-[0.4em] uppercase text-[#C84A72] font-bold block mb-3"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Let's Create Something Great
            </span>
            <h1
              className="text-[clamp(2.8rem,7vw,6rem)] leading-none font-black uppercase text-[#1C1814]"
              style={{ fontFamily: "'Big Shoulders Display', sans-serif", letterSpacing: "-0.02em" }}
            >
              Dynamic Tree
            </h1>
            <p
              className="text-base text-[#1C1814]/55 mt-2 tracking-[0.15em]"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
            >
              Multimedia Services
            </p>
          </div>

          {/* ── Two-column card ── */}
          <div
            className="rounded-3xl overflow-hidden border border-[#E8C8D4]/50 shadow-[0_8px_60px_rgba(200,74,114,0.08)]"
            style={{ background: "rgba(255,251,252,0.85)", backdropFilter: "blur(20px)" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[38%_62%]">

              {/* Left: contact sidebar */}
              <div
                className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#E8C8D4]/40"
                style={{ background: "linear-gradient(160deg, #FDF0F5 0%, #F8EAF5 100%)" }}
              >
                <ContactSidebar />
              </div>

              {/* Right: form */}
              <div className="p-8 lg:p-10">
                <div className="mb-6">
                  <h2
                    className="text-xl font-semibold text-[#1C1814]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Tell Us About Your Project
                  </h2>
                  <p
                    className="text-sm text-[#5A4E55] mt-1 font-normal"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Fill in the form below and our team will respond within 24 hours.
                  </p>
                </div>
                <InquiryForm />
              </div>

            </div>
          </div>

          {/* ── Visit our office / map ── */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <span
                className="text-xs tracking-[0.3em] uppercase text-[#C84A72] font-bold block mb-2"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Find Us
              </span>
              <h2
                className="text-3xl lg:text-4xl font-semibold text-[#1C1814]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Visit Our <span style={{ fontStyle: "italic" }}>Office</span>
              </h2>
            </div>

            <div
              id="map"
              className="rounded-3xl overflow-hidden border border-[#E8C8D4]/50 shadow-[0_8px_40px_rgba(200,74,114,0.07)]"
              style={{ height: "420px" }}
            >
              <iframe
                title="Dynamic Tree Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.3821!2d121.0562!3d14.5871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8f50a4f7b1d%3A0x6b2a6c5e3a4b8c9d!2sPhilippine%20Stock%20Exchange%20Centre%2C%20Exchange%20Rd%2C%20Ortigas%20Center%2C%20Pasig%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1720000000000!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Address card below map */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
              <MapPin size={15} className="text-[#C84A72] flex-shrink-0" />
              <p
                className="text-sm text-[#5A4E55] font-normal"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower,
                Exchange Road, Ortigas Center, Pasig City
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
