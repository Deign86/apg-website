import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { readConsent, loadAnalytics } from './lib/consent';
import './styles/global.css';

// Analytics only after the visitor accepted cookies (the banner loads it on "Accept All").
if (readConsent() === 'accepted') loadAnalytics();

// Crawler-only prerendered snapshot (tools/prerender.mjs, .htaccess rule 0): when a bot runs JS,
// the snapshot stays visible while #root renders hidden underneath;
// swap them in the same frame once React has painted the page heading, or after 8s at the latest.
const rootEl = document.getElementById('root');
const prerendered = document.getElementById('prerender');
// Server-rendered crawler pages (api/lib/CrawlerPage.php) show live API data. Google's renderer runs the app on
// its own, often days-old copy of that API, which made new listings noindex and their canonical /properties,
// so those pages stay exactly as served: the app never mounts there.
const serverPage = rootEl.hasAttribute('data-server-page');
if (prerendered && !serverPage) {
  const reveal = () => {
    observer.disconnect();
    clearTimeout(fallback);
    prerendered.remove();
    rootEl.removeAttribute('style');
  };
  const observer = new MutationObserver(() => {
    if (rootEl.querySelector('h1')) reveal();
  });
  observer.observe(rootEl, { childList: true, subtree: true });
  const fallback = setTimeout(reveal, 8000);
}

if (!serverPage) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
}
