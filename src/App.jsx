import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './routes/Home';
import Properties from './routes/Properties';
import VirtualOffice from './routes/VirtualOffice';
import Careers from './routes/Careers';
import Blogs from './routes/Blogs';
import Contact from './routes/Contact';
import NotFound from './routes/NotFound';
// Subsidiaries
import Realty from './routes/subsidiaries/Realty';
import Construction from './routes/subsidiaries/Construction';
import SwiftClear from './routes/subsidiaries/SwiftClear';
import DynamicTree from './routes/subsidiaries/DynamicTree';
import LuxePrime from './routes/subsidiaries/LuxePrime';
import { default as AltaVentureLayout } from './routes/subsidiaries/AltaVenture';
import AltaVentureHome from './routes/subsidiaries/alta-venture/Home';
import AltaVentureServices from './routes/subsidiaries/alta-venture/Services';
import AltaVentureBlogs from './routes/subsidiaries/alta-venture/Blogs';
import AltaVentureCareers from './routes/subsidiaries/alta-venture/Careers';
import AltaVentureInquire from './routes/subsidiaries/alta-venture/Inquire';
import Prime88 from './routes/subsidiaries/Prime88';
// Admin
import AdminShell from './routes/admin/AdminShell';

export default function App() {
  return (
    <Routes>
      {/* === Public routes (unchanged) === */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="properties" element={<Properties />} />
        <Route path="virtual-office" element={<VirtualOffice />} />
        <Route path="careers" element={<Careers />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="about" element={<Navigate to="/" replace />} />
        <Route path="contact" element={<Contact />} />
        <Route path="subsidiaries/realty" element={<Realty />} />
        <Route path="subsidiaries/construction" element={<Construction />} />
        <Route path="subsidiaries/swiftclear" element={<SwiftClear />} />
        <Route path="subsidiaries/dynamic-tree" element={<DynamicTree />} />
        <Route path="subsidiaries/luxe-prime" element={<LuxePrime />} />
        <Route path="subsidiaries/88prime" element={<Prime88 />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* === Alta Venture subsidiary — own layout (AV header/footer/chatbot skeleton).
            Pulled out of <Layout /> so APG's shared Header/Footer/Chatbot do NOT render
            on this subsidiary's pages. Design clones APG's; branding/logo/nav are AV's. === */}
      <Route path="subsidiaries/alta-venture" element={<AltaVentureLayout />}>
        <Route index element={<AltaVentureHome />} />
        <Route path="services" element={<AltaVentureServices />} />
        <Route path="blogs" element={<AltaVentureBlogs />} />
        <Route path="careers" element={<AltaVentureCareers />} />
        <Route path="inquire" element={<AltaVentureInquire />} />
        <Route path="*" element={<AltaVentureHome />} />
      </Route>

      {/* === Admin routes — single AuthProvider for all of /admin/* === */}
      <Route path="admin/*" element={<AdminShell />} />
    </Routes>
  );
}

