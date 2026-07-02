import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './routes/Home';
import Properties from './routes/Properties';
import VirtualOffice from './routes/VirtualOffice';
import Careers from './routes/Careers';
import Blogs from './routes/Blogs';
import About from './routes/About';
import Contact from './routes/Contact';
import NotFound from './routes/NotFound';
// Subsidiaries
import Realty from './routes/subsidiaries/Realty';
import RealtyOffers from './routes/subsidiaries/RealtyOffers';
import Construction from './routes/subsidiaries/Construction';
import SwiftClear from './routes/subsidiaries/SwiftClear';
import DynamicTree from './routes/subsidiaries/DynamicTree';
import LuxePrime from './routes/subsidiaries/LuxePrime';
import AltaVenture from './routes/subsidiaries/AltaVenture';
import Prime88 from './routes/subsidiaries/Prime88';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="properties" element={<Properties />} />
        <Route path="virtual-office" element={<VirtualOffice />} />
        <Route path="careers" element={<Careers />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="subsidiaries/realty" element={<Realty />} />
        <Route path="subsidiaries/realty-offers" element={<RealtyOffers />} />
        <Route path="subsidiaries/construction" element={<Construction />} />
        <Route path="subsidiaries/swiftclear" element={<SwiftClear />} />
        <Route path="subsidiaries/dynamic-tree" element={<DynamicTree />} />
        <Route path="subsidiaries/luxe-prime" element={<LuxePrime />} />
        <Route path="subsidiaries/alta-venture" element={<AltaVenture />} />
        <Route path="subsidiaries/88prime" element={<Prime88 />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
