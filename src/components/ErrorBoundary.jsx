import { Component } from 'react';

// A deploy replaces the hashed chunks, so a tab opened before it fails to lazy-load a route.
const STALE_CHUNK = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk .* failed/i;
const RELOAD_KEY = 'apg-chunk-reload-at';

/** One hard reload per stale chunk; the timestamp guard stops a reload loop if the chunk is truly gone. */
function reloadOnceForStaleChunk(error) {
  if (!STALE_CHUNK.test(String(error?.message ?? error))) return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 30000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false; // no storage: can't guard against a loop, show the fallback instead
  }
  window.location.reload();
  return true;
}

/**
 * Catches render errors in the routed content so one broken page doesn't blank the whole app.
 * `resetKey` (the pathname) clears the error when the visitor navigates elsewhere.
 */
export default class ErrorBoundary extends Component {
  state = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  componentDidCatch(error, info) {
    if (reloadOnceForStaleChunk(error)) return;
    console.error('Render error caught by ErrorBoundary:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '96px 16px',
          textAlign: 'center',
          background: '#0A0803',
          color: '#f5f0e8',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <p style={{ margin: 0, color: '#D4AF37', fontSize: 12, fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
          Alpha Premier Group
        </p>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ margin: 0, maxWidth: 420, color: '#a3a3a3', fontSize: 15, lineHeight: 1.6 }}>
          This page couldn&apos;t be displayed. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ minHeight: 44, padding: '10px 28px', border: 0, borderRadius: 9999, background: '#D4AF37', color: '#0A0803', fontWeight: 800, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Reload
        </button>
      </div>
    );
  }
}
