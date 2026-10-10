import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/global.css';

const analyticsId = import.meta.env.VITE_ANALYTICS_ID;
if (analyticsId && /^G-[A-Z0-9]+$/i.test(analyticsId)) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', analyticsId);
  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;
  document.head.appendChild(analyticsScript);
}

// Crawler-only prerendered snapshot (tools/prerender.mjs, .htaccess rule 0): when a bot runs JS,
// the snapshot stays visible while #root renders hidden underneath;
// swap them in the same frame once React has painted the page heading, or after 8s at the latest.
const rootEl = document.getElementById('root');
const prerendered = document.getElementById('prerender');
if (prerendered) {
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

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
