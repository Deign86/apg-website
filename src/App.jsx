import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { basePathFor, enterpriseFromPath, enterpriseOrigin, hostEnterprise, isProductionHost, ROOT_DOMAIN } from './lib/enterpriseHost';
import NotFound from './routes/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import PrivacyPolicy from './routes/PrivacyPolicy';
import TermsConditions from './routes/TermsConditions';

const HOST_SLUG = hostEnterprise();
const APEX_ONLY = /^\/(admin|privacy|terms)(\/|$)/;

/** In production, the URL of the host that serves this path when it isn't this one (else null). */
function crossHostUrl({ pathname, search, hash }) {
  if (!isProductionHost()) return null;
  const owner = enterpriseFromPath(pathname);
  if (owner && owner.slug !== HOST_SLUG) return `${enterpriseOrigin(owner.slug)}${owner.rest}${search}${hash}`;
  if (!owner && HOST_SLUG && APEX_ONLY.test(pathname)) return `https://${ROOT_DOMAIN}${pathname}${search}${hash}`;
  return null;
}

// The page a lazy shell renders is its own chunk too, keyed by enterprise slug or apex path segment.
// Each shell's factory starts the page it is about to render (preloadPage), so a cold load fetches
// shell and page in one wave instead of shell first, then page.
const PAGE_LOADERS = {
  '': () => import('./views/HomeView'),
  enterprises: () => import('./views/EnterprisesView'),
  careers: () => import('./views/CareersView'),
  blogs: () => import('./views/BlogsView'),
  inquire: () => import('./views/InquireView'),
  contact: () => import('./routes/Contact'),
  'virtual-office': () => import('./routes/VirtualOffice'),
  realty: () => import('./routes/subsidiaries/Realty'),
  'realty/inquire': () => import('./routes/subsidiaries/EnterpriseInquire'),
  construction: () => import('./routes/subsidiaries/Construction'),
  swiftclear: () => import('./routes/subsidiaries/SwiftClear'),
  'dynamic-tree': () => import('./routes/subsidiaries/DynamicTree'),
  'luxe-prime': () => import('./routes/subsidiaries/LuxePrime'),
  '88prime': () => import('./routes/subsidiaries/Prime88'),
};
function preloadPage() {
  const { pathname } = window.location;
  if (crossHostUrl(window.location)) return; // about to leave for the host that serves it
  const owner = enterpriseFromPath(pathname) ?? (HOST_SLUG ? { slug: HOST_SLUG, rest: pathname } : null);
  let key = pathname.split('/')[1];
  if (owner) key = owner.slug === 'realty' && owner.rest === '/inquire' ? 'realty/inquire' : owner.slug;
  PAGE_LOADERS[key]?.().catch(() => {});
}

// Subsidiaries
const VirtualOffice = lazy(PAGE_LOADERS['virtual-office']);
const VirtualOfficeInquire = lazy(() => PAGE_LOADERS['virtual-office']().then((module) => ({ default: module.VirtualOfficeInquire })));
const Contact = lazy(PAGE_LOADERS.contact);
const Realty = lazy(PAGE_LOADERS.realty);
const Construction = lazy(PAGE_LOADERS.construction);
const SwiftClear = lazy(PAGE_LOADERS.swiftclear);
const DynamicTree = lazy(PAGE_LOADERS['dynamic-tree']);
const LuxePrime = lazy(PAGE_LOADERS['luxe-prime']);
const AltaVenture = lazy(() => import('./routes/subsidiaries/AltaVenture'));
const AltaVentureHome = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureHome })));
const AltaVentureServices = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureServices })));
const AltaVentureBlogs = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureBlogs })));
const AltaVentureCareers = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureCareers })));
const AltaVentureInquire = lazy(() => import('./routes/subsidiaries/AltaVenture').then((module) => ({ default: module.AltaVentureInquire })));
const Prime88 = lazy(PAGE_LOADERS['88prime']);
const EnterpriseInquire = lazy(PAGE_LOADERS['realty/inquire']);
// Enterprise shell (shared layout wrapping per-enterprise Header + Footer + Chatbot)
const EnterpriseShell = lazy(() => {
  preloadPage();
  return import('./components/EnterpriseShell');
});
// Admin
const AdminShell = lazy(() => import('./routes/admin/AdminShell'));
// Lazy so enterprise-subdomain visitors don't download the apex shell and its views.
const RedesignShell = lazy(() => {
  preloadPage();
  return import('./components/redesign/RedesignShell');
});

const CookieConsent = React.lazy(() => import('./components/CookieConsent'));
// Admin-controlled announcement (Site settings), shown on the sites the admin picked.
const AnnouncementBanner = React.lazy(() => import('./components/AnnouncementBanner'));

/** Live listings belong to Alpha Premier Realty: the old apex /properties (and its ?ref= links) moves there. */
function PropertiesRedirect() {
  const { search } = useLocation();
  return <Navigate to={`${basePathFor('realty')}/properties${search}`} replace />;
}

// Keeps enterprise pages on their own subdomain in production, and maps the clean
// subdomain URL onto the in-app enterprise path the route tree expects.
function useEnterpriseHostLocation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, search, hash } = location;
  const leaveFor = crossHostUrl(location);
  // A path served by another host is a full page load: an in-app link to it keeps rendering the
  // current page (rather than downloading and running that site's chunks here first) until the
  // effect below leaves. On a first load there is no earlier page, so that path renders as before.
  const [shown, setShown] = useState(location);
  if (!leaveFor && shown !== location) setShown(location);

  useEffect(() => {
    if (leaveFor) {
      window.location.replace(leaveFor);
      return;
    }
    const owner = enterpriseFromPath(pathname);
    if (HOST_SLUG && owner?.slug === HOST_SLUG) navigate(`${owner.rest}${search}${hash}`, { replace: true });
  }, [leaveFor, pathname, search, hash, navigate]);

  const current = leaveFor ? shown : location;
  if (!HOST_SLUG || enterpriseFromPath(current.pathname)) return current;
  const base = basePathFor(HOST_SLUG);
  return { ...current, pathname: current.pathname === '/' ? base : `${base}${current.pathname}` };
}

export default function App() {
  const routedLocation = useEnterpriseHostLocation();
  return (
    <>
    <React.Suspense fallback={null}>
      <CookieConsent />
      <AnnouncementBanner />
    </React.Suspense>
    <ErrorBoundary resetKey={routedLocation.pathname}>
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
        <Route path="virtual-office/inquire" element={<VirtualOfficeInquire />} />
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
      {/* Sections (/services, /blogs, /careers, /inquire) are URLs inside each enterprise page
          (EnterpriseNavContext); only Realty's /inquire is the standalone shared form. */}
      <Route element={<EnterpriseShell />}>
        <Route path="subsidiaries/realty/*" element={<Realty />} />
        <Route path="subsidiaries/realty" element={<Realty />} />
        <Route path="subsidiaries/realty/inquire" element={<EnterpriseInquire />} />
        <Route path="realty/*" element={<Realty />} />
        <Route path="realty" element={<Realty />} />

        <Route path="subsidiaries/luxe-prime/*" element={<LuxePrime />} />
        <Route path="subsidiaries/luxe-prime" element={<LuxePrime />} />
        <Route path="luxe-prime/*" element={<LuxePrime />} />
        <Route path="luxe-prime" element={<LuxePrime />} />

        <Route path="subsidiaries/dynamic-tree/*" element={<DynamicTree />} />
        <Route path="subsidiaries/dynamic-tree" element={<DynamicTree />} />
        <Route path="dynamic-tree/*" element={<DynamicTree />} />
        <Route path="dynamic-tree" element={<DynamicTree />} />

        <Route path="subsidiaries/swiftclear/*" element={<SwiftClear />} />
        <Route path="subsidiaries/swiftclear" element={<SwiftClear />} />
        <Route path="swiftclear/*" element={<SwiftClear />} />
        <Route path="swiftclear" element={<SwiftClear />} />

        <Route path="subsidiaries/construction/*" element={<Construction />} />
        <Route path="subsidiaries/construction" element={<Construction />} />
        <Route path="construction/*" element={<Construction />} />
        <Route path="construction" element={<Construction />} />

        <Route path="subsidiaries/88prime/*" element={<Prime88 />} />
        <Route path="subsidiaries/88prime" element={<Prime88 />} />
        <Route path="88prime/*" element={<Prime88 />} />
        <Route path="88prime" element={<Prime88 />} />
      </Route>

      {/* === Admin routes === */}
      <Route path="admin/*" element={<AdminShell />} />

      {/* === Wildcard 404 catch-all === */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
    </ErrorBoundary>
    </>
  );
}
