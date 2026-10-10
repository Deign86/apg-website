import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { basePathFor, enterpriseFromPath, enterpriseOrigin, hostEnterprise, isProductionHost, ROOT_DOMAIN } from './lib/enterpriseHost';
import NotFound from './routes/NotFound';
import PrivacyPolicy from './routes/PrivacyPolicy';
import TermsConditions from './routes/TermsConditions';
// Subsidiaries
const VirtualOffice = lazy(() => import('./routes/VirtualOffice'));
const Contact = lazy(() => import('./routes/Contact'));
const Realty = lazy(() => import('./routes/subsidiaries/Realty'));
const Construction = lazy(() => import('./routes/subsidiaries/Construction'));
const SwiftClear = lazy(() => import('./routes/subsidiaries/SwiftClear'));
const DynamicTree = lazy(() => import('./routes/subsidiaries/DynamicTree'));
const LuxePrime = lazy(() => import('./routes/subsidiaries/LuxePrime'));
const AltaVenture = lazy(() => import('./routes/subsidiaries/AltaVenture'));
const AltaVentureHome = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureHome })));
const AltaVentureServices = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureServices })));
const AltaVentureBlogs = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureBlogs })));
const AltaVentureCareers = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureCareers })));
const AltaVentureInquire = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureInquire })));
const Prime88 = lazy(() => import('./routes/subsidiaries/Prime88'));
const EnterpriseInquire = lazy(() => import('./routes/subsidiaries/EnterpriseInquire'));
// Enterprise shell (shared layout wrapping per-enterprise Header + Footer + Chatbot)
const EnterpriseShell = lazy(() => import('./components/EnterpriseShell'));
// Admin
const AdminShell = lazy(() => import('./routes/admin/AdminShell'));
// Lazy so enterprise-subdomain visitors don't download the apex shell and its views.
const RedesignShell = lazy(() => import('./components/redesign/RedesignShell'));

const CookieConsent = React.lazy(() => import('./components/CookieConsent'));

/** Live listings belong to Alpha Premier Realty: the old apex /properties (and its ?ref= links) moves there. */
function PropertiesRedirect() {
  const { search } = useLocation();
  return <Navigate to={`${basePathFor('realty')}/properties${search}`} replace />;
}

const HOST_SLUG = hostEnterprise();
const APEX_ONLY = /^\/(admin|privacy|terms)(\/|$)/;

// Keeps enterprise pages on their own subdomain in production, and maps the clean
// subdomain URL onto the in-app enterprise path the route tree expects.
function useEnterpriseHostLocation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, search, hash } = location;
  const owner = enterpriseFromPath(pathname);

  useEffect(() => {
    if (!isProductionHost()) return;
    const owner = enterpriseFromPath(pathname);
    if (HOST_SLUG && owner?.slug === HOST_SLUG) {
      navigate(`${owner.rest}${search}${hash}`, { replace: true });
    } else if (owner) {
      window.location.replace(`${enterpriseOrigin(owner.slug)}${owner.rest}${search}${hash}`);
    } else if (HOST_SLUG && APEX_ONLY.test(pathname)) {
      window.location.replace(`https://${ROOT_DOMAIN}${pathname}${search}${hash}`);
    }
  }, [pathname, search, hash, navigate]);

  if (!HOST_SLUG || owner) return location;
  const base = basePathFor(HOST_SLUG);
  return { ...location, pathname: pathname === '/' ? base : `${base}${pathname}` };
}

export default function App() {
  const routedLocation = useEnterpriseHostLocation();
  return (
    <>
    <React.Suspense fallback={null}>
      <CookieConsent />
    </React.Suspense>
    <Suspense fallback={null}>
    <Routes location={routedLocation}>
      {/* === Public routes (Main APG Redesign site) === */}
      <Route element={<RedesignShell />}>
        <Route index element={null} />
        <Route path="enterprises" element={null} />
        <Route path="careers" element={null} />
        <Route path="careers/*" element={null} />
        <Route path="blogs" element={null} />
        <Route path="inquire" element={null} />
        <Route path="virtual-office" element={<VirtualOffice />} />
        <Route path="about" element={<Navigate to="/" replace />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsConditions />} />
      </Route>

      <Route path="properties" element={<PropertiesRedirect />} />

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
    </Suspense>
    </>
  );
}
