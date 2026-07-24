import { useEffect } from "react";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Blogs from "./pages/Blogs";
import Careers from "./pages/Careers";
import Inquire from "./pages/Inquire";

interface AppProps {
  page?: string;
  setPage?: (page: string) => void;
}

export default function DynamicTreeApp({ page = "home", setPage }: AppProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleNavigate = (targetPage: string) => {
    if (setPage) {
      setPage(targetPage);
    }
  };

  const renderPage = () => {
    switch (page) {
      case "services":
        return <Services onNavigate={handleNavigate} />;
      case "blogs":
        return <Blogs onNavigate={handleNavigate} />;
      case "careers":
        return <Careers onNavigate={handleNavigate} />;
      case "inquire":
        return <Inquire onNavigate={handleNavigate} />;
      case "home":
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#F5F0E8] overflow-x-hidden" style={{ fontFamily: "Outfit, sans-serif" }}>
      {renderPage()}
    </div>
  );
}
