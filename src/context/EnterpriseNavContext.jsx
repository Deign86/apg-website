import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EnterpriseNavContext = createContext({
  currentPage: 'home',
  setCurrentPage: (_page) => {},
  registerNavigator: (_fn) => () => {},
  navigate: (_key) => false,
});

// In-page sections that have their own URL (<base>/services …). Anything else an enterprise
// reports (e.g. Realty's /properties) manages its own URL and is left alone here.
const URL_SECTIONS = ['home', 'services', 'blogs', 'careers', 'inquire'];

/** "/subsidiaries/dynamic-tree/blogs" -> { base: "/subsidiaries/dynamic-tree", section: "blogs" }. */
function splitEnterprisePath(pathname) {
  const match = /^(\/(?:subsidiaries\/)?[^/]+)(?:\/([^/]+))?/.exec(pathname);
  if (!match) return { base: pathname, section: 'home' };
  return { base: match[1], section: match[2] ? match[2].toLowerCase() : 'home' };
}

function sectionPath(base, section) {
  return section === 'home' ? base : `${base}/${section}`;
}

/**
 * The enterprise section shown by the URL plus a navigator that pushes its URL, for enterprise
 * pages that keep the URL as their only page state (refresh, Back/Forward and sharing just work).
 * @returns {[string, (section: string) => void]}
 */
/**
 * useNavigate() with a stable identity. Router's navigate changes on every location change, which
 * would re-run every effect depending on it (re-reporting stale pages -> URL ping-pong on Back).
 * Only absolute paths are passed, so the latest instance is always right.
 */
function useStableNavigate() {
  const navigate = useNavigate();
  const ref = useRef(navigate);
  ref.current = navigate;
  return useCallback((to, options) => ref.current(to, options), []);
}

export function useEnterpriseSection() {
  const { pathname } = useLocation();
  const routerNavigate = useStableNavigate();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const { section } = splitEnterprisePath(pathname);
  const page = URL_SECTIONS.includes(section) ? section : 'home';
  // Stable identity, so the page registers its navigator once.
  const go = useCallback((next) => {
    const target = sectionPath(splitEnterprisePath(pathnameRef.current).base, URL_SECTIONS.includes(next) ? next : 'home');
    if (target !== pathnameRef.current) {
      pathnameRef.current = target; // a repeat call before the re-render doesn't push twice
      routerNavigate(target);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [routerNavigate]);
  return [page, go];
}

// EnterpriseShell (and this provider) stays mounted while the visitor moves between
// enterprises and their /inquire routes, so a navigator must be unregistered when its
// page unmounts — otherwise header/footer nav keeps calling the previous enterprise's
// dead setPage and does nothing.
//
// URL sync for enterprises that keep their section in state (Realty, 88 Prime): a section
// change reported via setCurrentPage pushes <base>/<section>, and a deep link / refresh /
// Back / Forward hands the URL's section to the registered navigator.
export function EnterpriseNavProvider({ children }) {
  const location = useLocation();
  const routerNavigate = useStableNavigate();
  const [currentPage, setCurrentPageState] = useState('home');
  const navigatorRef = useRef(null);
  const currentPageRef = useRef('home');
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;
  // Section the navigator was just told to show; until it is reported, a 'home' report is the
  // page's stale initial state and must not push a URL over the one being restored.
  const restoringRef = useRef(null);
  const poppedRef = useRef(false);

  // A page mounts on its home section, so on registration only a non-home URL needs restoring.
  const restoreFromUrl = useCallback((fn, includeHome) => {
    const { section } = splitEnterprisePath(pathnameRef.current);
    if (!URL_SECTIONS.includes(section) || section === currentPageRef.current) return;
    if (section === 'home' && !includeHome) return;
    restoringRef.current = section;
    fn(section);
  }, []);

  // Returns the unregister function; call sites return it from their effect.
  const registerNavigator = useCallback((fn) => {
    navigatorRef.current = fn;
    if (typeof window !== 'undefined') window.enterpriseNavigate = fn;
    restoreFromUrl(fn, false);
    return () => {
      if (navigatorRef.current === fn) navigatorRef.current = null;
      if (typeof window !== 'undefined' && window.enterpriseNavigate === fn) window.enterpriseNavigate = undefined;
    };
  }, [restoreFromUrl]);

  const setCurrentPage = useCallback((page) => {
    setCurrentPageState(page);
    currentPageRef.current = page;
    if (typeof window !== 'undefined') {
      window.enterpriseCurrentPage = page;
    }
    const restoring = restoringRef.current;
    if (restoring) {
      if (page === 'home' && restoring !== 'home') return;
      restoringRef.current = null;
    }
    if (!navigatorRef.current || !URL_SECTIONS.includes(page)) return;
    const { base, section } = splitEnterprisePath(pathnameRef.current);
    if (section === page) return;
    const target = sectionPath(base, page);
    // Several components may report the same page before the router re-renders: push once.
    pathnameRef.current = target;
    routerNavigate(target);
  }, [routerNavigate]);

  // Back/Forward: show the section of the URL we landed on.
  useEffect(() => {
    const onPop = () => { poppedRef.current = true; };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!poppedRef.current) return;
    poppedRef.current = false;
    if (navigatorRef.current) restoreFromUrl(navigatorRef.current, true);
  }, [location.pathname, restoreFromUrl]);

  // With no enterprise page mounted (e.g. the shared /inquire route) go straight to the
  // section's URL; the enterprise restores it from there when it mounts.
  const navigate = useCallback((key) => {
    const fn = navigatorRef.current
      ?? (typeof window !== 'undefined' && typeof window.enterpriseNavigate === 'function' ? window.enterpriseNavigate : null);
    if (fn) {
      fn(key);
      return true;
    }
    routerNavigate(sectionPath(splitEnterprisePath(pathnameRef.current).base, key));
    return true;
  }, [routerNavigate]);

  const value = useMemo(() => ({
    currentPage,
    setCurrentPage,
    registerNavigator,
    navigate,
  }), [currentPage, setCurrentPage, registerNavigator, navigate]);

  return (
    <EnterpriseNavContext.Provider value={value}>
      {children}
    </EnterpriseNavContext.Provider>
  );
}

export function useEnterpriseNav() {
  return useContext(EnterpriseNavContext);
}
