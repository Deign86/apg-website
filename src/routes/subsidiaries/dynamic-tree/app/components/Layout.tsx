import { Outlet } from "react-router-dom";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen w-full" style={{ fontFamily: "Outfit, sans-serif" }}>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
