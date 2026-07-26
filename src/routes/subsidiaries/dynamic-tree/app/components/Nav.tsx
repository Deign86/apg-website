import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/imports/Dynamic_Tree_Logo-1.png";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Blogs", path: "/blogs" },
  { name: "Careers", path: "/careers" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-md border-b border-[#E8C8D4]/40"
          : "bg-white/80 backdrop-blur-md shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="relative z-10">
          <img
            src={logo}
            alt="Dynamic Tree Multimedia Services"
            className="h-10 sm:h-12 w-auto transition-all drop-shadow-sm"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm tracking-wide transition-all duration-200 ${
                  isActive
                    ? "text-[#C84A72] font-bold"
                    : "text-[#1C1814] font-semibold hover:text-[#C84A72]"
                }`}
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/inquire"
          className="hidden md:flex items-center gap-2 bg-[#C84A72] text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#A0305A] hover:shadow-lg transition-all duration-300 shadow-md"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          Inquire Now!
        </Link>

        <button
          className="md:hidden text-[#1C1814] p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-[#E8C8D4]/40 px-6 pb-6 pt-4 flex flex-col gap-4 shadow-lg">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-base transition-colors ${
                  isActive
                    ? "text-[#C84A72] font-bold"
                    : "text-[#1C1814] font-semibold hover:text-[#C84A72]"
                }`}
                style={{ fontFamily: "Outfit, sans-serif" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            to="/inquire"
            className="mt-2 bg-[#C84A72] text-white text-sm font-semibold px-6 py-2.5 rounded-full w-fit hover:bg-[#A0305A] transition-colors shadow-md"
            style={{ fontFamily: "Outfit, sans-serif" }}
            onClick={() => setMobileOpen(false)}
          >
            Inquire Now!
          </Link>
        </div>
      )}
    </header>
  );
}