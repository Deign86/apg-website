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
