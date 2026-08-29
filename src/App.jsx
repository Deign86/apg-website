import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './routes/Home';
import VirtualOffice from './routes/VirtualOffice';
import Contact from './routes/Contact';
import Properties from './routes/Properties';
import NotFound from './routes/NotFound';
// Subsidiaries
import Realty from './routes/subsidiaries/Realty';
import Construction from './routes/subsidiaries/Construction';
import SwiftClear from './routes/subsidiaries/SwiftClear';
import DynamicTree from './routes/subsidiaries/DynamicTree';
import LuxePrime from './routes/subsidiaries/LuxePrime';
import AltaVenture, {
  AltaVentureHome,
  AltaVentureServices,
  AltaVentureBlogs,
  AltaVentureCareers,
  AltaVentureInquire,
} from './routes/subsidiaries/AltaVenture';
import Prime88 from './routes/subsidiaries/Prime88';
import EnterpriseInquire from './routes/subsidiaries/EnterpriseInquire';
// Enterprise shell (shared layout wrapping per-enterprise Header + Footer + Chatbot)
import EnterpriseShell from './components/EnterpriseShell';
// Admin
import AdminShell from './routes/admin/AdminShell';
import RedesignShell from './components/redesign/RedesignShell';

export default function App() {
  return (
    <Routes>
      {/* === Public routes (Main APG Redesign site) === */}
      <Route element={<RedesignShell />}>
        <Route index element={null} />
        <Route path="enterprises" element={null} />
        <Route path="careers" element={null} />
        <Route path="careers/*" element={null} />
        <Route path="blogs" element={null} />
        <Route path="inquire" element={null} />
        <Route path="properties" element={<Properties />} />
        <Route path="virtual-office" element={<VirtualOffice />} />
        <Route path="about" element={<Navigate to="/" replace />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/*
        === Alta Venture subsidiary — own bespoke layout ===
      */}
      <Route path="subsidiaries/alta-venture" element={<AltaVenture />}>
        <Route index element={<AltaVentureHome />} />
        <Route path="services" element={<AltaVentureServices />} />
        <Route path="blogs" element={<AltaVentureBlogs />} />
        <Route path="careers" element={<AltaVentureCareers />} />
        <Route path="inquire" element={<AltaVentureInquire />} />
        <Route path="*" element={<AltaVentureHome />} />
      </Route>

      {/* === Enterprise routes — wrap with shared EnterpriseShell (Header + Outlet + Footer + EnterpriseChatbot) === */}
      <Route element={<EnterpriseShell />}>
        <Route path="subsidiaries/realty/*" element={<Realty />} />
        <Route path="subsidiaries/realty" element={<Realty />} />
        <Route path="subsidiaries/realty/inquire" element={<EnterpriseInquire />} />
        <Route path="realty/*" element={<Realty />} />
        <Route path="realty" element={<Realty />} />

        <Route path="subsidiaries/luxe-prime/*" element={<LuxePrime />} />
        <Route path="subsidiaries/luxe-prime" element={<LuxePrime />} />
        <Route path="subsidiaries/luxe-prime/inquire" element={<EnterpriseInquire />} />
        <Route path="luxe-prime/*" element={<LuxePrime />} />
        <Route path="luxe-prime" element={<LuxePrime />} />

        <Route path="subsidiaries/dynamic-tree/*" element={<DynamicTree />} />
        <Route path="subsidiaries/dynamic-tree" element={<DynamicTree />} />
        <Route path="subsidiaries/dynamic-tree/inquire" element={<EnterpriseInquire />} />
        <Route path="dynamic-tree/*" element={<DynamicTree />} />
        <Route path="dynamic-tree" element={<DynamicTree />} />

        <Route path="subsidiaries/swiftclear/*" element={<SwiftClear />} />
        <Route path="subsidiaries/swiftclear" element={<SwiftClear />} />
        <Route path="subsidiaries/swiftclear/inquire" element={<EnterpriseInquire />} />
        <Route path="swiftclear/*" element={<SwiftClear />} />
        <Route path="swiftclear" element={<SwiftClear />} />

        <Route path="subsidiaries/construction/*" element={<Construction />} />
        <Route path="subsidiaries/construction" element={<Construction />} />
        <Route path="subsidiaries/construction/inquire" element={<EnterpriseInquire />} />
        <Route path="construction/*" element={<Construction />} />
        <Route path="construction" element={<Construction />} />

        <Route path="subsidiaries/88prime/*" element={<Prime88 />} />
        <Route path="subsidiaries/88prime" element={<Prime88 />} />
        <Route path="subsidiaries/88prime/inquire" element={<EnterpriseInquire />} />
        <Route path="88prime/*" element={<Prime88 />} />
        <Route path="88prime" element={<Prime88 />} />
      </Route>

      {/* === Admin routes === */}
      <Route path="admin/*" element={<AdminShell />} />

      {/* === Wildcard 404 catch-all === */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
