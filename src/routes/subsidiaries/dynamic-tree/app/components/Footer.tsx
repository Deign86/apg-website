import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Facebook, Instagram } from "lucide-react";
import logo from "@/imports/Dynamic_Tree_Logo-1.png";

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.54V6.77a4.85 4.85 0 01-1.02-.08z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#1C1814] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: "radial-gradient(circle, #C84A72 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-14 sm:pt-20 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Link to="/" className="w-fit">
              <img
                src={logo}
                alt="Dynamic Tree Multimedia Services"
                className="h-14 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)", opacity: 0.9 }}
              />
            </Link>
            <p
              className="text-sm text-white/50 leading-relaxed max-w-xs"
              style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
            >
              A full-service creative agency and talent casting hub. We bring
              ideas to life—visually, emotionally, and commercially.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-5">
            <h4
              className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Quick Links
            </h4>
            <nav className="flex flex-col gap-3.5">
              {[
                { name: "Home", path: "/" },
                { name: "Services", path: "/services" },
                { name: "Blogs", path: "/blogs" },
                { name: "Careers", path: "/careers" },
              ].map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm text-white/60 hover:text-[#F5ABBE] transition-colors w-fit font-medium"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-5">
            <h4
              className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Get in Touch
            </h4>
            <div className="flex flex-col gap-3.5 text-sm text-white/60">
              <a
                href="mailto:hello@dynamictree.ph"
                className="hover:text-[#F5ABBE] transition-colors font-medium"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                hello@dynamictree.ph
              </a>
              <a
                href="tel:+63123456789"
                className="hover:text-[#F5ABBE] transition-colors font-medium"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                +63 (2) 1234 5678
              </a>
              <p
                className="text-white/50 leading-relaxed max-w-[200px]"
                style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
              >
                Manila, Philippines
              </p>
            </div>
          </div>

          {/* Social + Newsletter */}
          <div className="flex flex-col gap-6">
            <div>
              <h4
                className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold mb-4"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Follow Us
              </h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Facebook size={16} />, label: "Facebook", url: "#" },
                  { icon: <Instagram size={16} />, label: "Instagram", url: "#" },
                  { icon: <TikTokIcon size={16} />, label: "TikTok", url: "#" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-[#F5ABBE] hover:text-[#F5ABBE] hover:bg-white/5 transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="text-xs tracking-[0.25em] uppercase text-white/40 font-semibold mb-3.5"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Newsletter
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-0 text-sm bg-white/8 border border-white/15 rounded-full px-4 py-2.5 text-white placeholder-white/35 focus:outline-none focus:border-[#F5ABBE]/50 focus:bg-white/10 transition-all"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                />
                <button
                  className="flex-shrink-0 bg-[#C84A72] rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#A0305A] hover:shadow-lg transition-all duration-200"
                  aria-label="Subscribe"
                >
                  <Mail size={15} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-xs text-white/30"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            © 2026 Dynamic Tree by Alpha Premier Group. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <a
              href="#"
              className="hover:text-white/50 transition-colors"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-white/50 transition-colors"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}