import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Building2, ExternalLink, EyeOff, FolderOpen, Pen, RotateCw, Search, Star, TriangleAlert, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import StatusPill from '@/components/admin/StatusPill';
import EmptyState from '@/components/admin/EmptyState';

const API = '/api/admin/listings.php';
const PUBLIC_PAGE = '/subsidiaries/realty/properties';
const driveFolderUrl = (id) => `https://drive.google.com/drive/folders/${encodeURIComponent(id)}`;

// Same pill strip look as Job Applicants.
const PILL_GROUP = 'admin-pill-tabs flex flex-wrap gap-2 rounded-full border border-[#D4AF37]/30 bg-[#161109]/90 p-1.5';
const pillCls = (active) => `rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${active ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-[#E2B857]'}`;

const EMPTY_OVERRIDE ={ hidden: false, featured: false, sort_order: null, price_override: null, note: null };

const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'shown', label: 'On the site' },
  { id: 'featured', label: 'Featured' },
  { id: 'hidden', label: 'Hidden' },
];

/** "5 min ago" style text; falls back to a date after a day. */
function ago(iso) {
  if (!iso) return 'never';
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (Number.isNaN(minutes)) return 'unknown';
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Same order as the public feed (api/lib/Listings.php): featured, then order, then Drive order. */
function publicOrder(listings, overrides) {
  return listings
    .map((l, i) => ({ l, i, o: overrides[l.ref] ?? EMPTY_OVERRIDE }))
    .sort((a, b) =>
      (a.o.featured ? 0 : 1) - (b.o.featured ? 0 : 1)
      || (a.o.sort_order ?? Infinity) - (b.o.sort_order ?? Infinity)
      || a.i - b.i);
}

function SyncBanner({ status }) {
  if (!status) return null;
  const failed = !status.ok;
  return (
    <div className={`admin-alert listings-sync${failed ? ' admin-alert-error' : ''}`} role={failed ? 'alert' : 'status'}>
      {failed ? <TriangleAlert size={15} aria-hidden="true" /> : <RefreshCw size={15} aria-hidden="true" />}
      <div>
        {failed ? (
          <>
            <strong>Last Drive sync failed {ago(status.last_run)}.</strong>{' '}
            {status.error || 'Unknown error.'}{' '}
            The site keeps showing the last good listings{status.synced_at ? ` (synced ${ago(status.synced_at)})` : ''}.
          </>
        ) : (
          <>
            <strong>Last synced {ago(status.synced_at || status.last_run)}</strong>
            {status.count !== null && status.count !== undefined ? ` · ${status.count} listings in the Drive feed` : ''}.
          </>
        )}{' '}
        <span className="admin-muted">The Drive syncs automatically every 15 minutes; there is no manual sync.</span>
      </div>
    </div>
  );
}

function Toggle({ on, label, onClick, disabled, Icon }) {
  return (
    <button
      type="button"
      className={`listings-toggle${on ? ' on' : ''}`}
      aria-pressed={on}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon size={13} aria-hidden="true" /> {label}
    </button>
  );
}

export default function ListingsManager() {
  const toast = useToast();
  const [listings, setListings] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [status, setStatus] = useState(null);
  const [driveRoot, setDriveRoot] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState('');
  const [editing, setEditing] = useState(null); // { listing, form }

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
      setListings(Array.isArray(json.data) ? json.data : []);
      setOverrides(json.overrides && typeof json.overrides === 'object' ? json.overrides : {});
      setStatus(json.status ?? null);
      setDriveRoot(typeof json.drive_folder === 'string' ? json.drive_folder : '');
      setLoadError('');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (ref, next, message) => {
    setSaving(ref);
    try {
      const res = await fetch(API, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref, ...next }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `HTTP ${res.status}`);
      setOverrides((prev) => ({ ...prev, [ref]: json.data ?? { ...EMPTY_OVERRIDE, ...next } }));
      toast.success(message);
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save');
      return false;
    } finally {
      setSaving('');
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publicOrder(listings, overrides).filter(({ l, o }) => {
      if (view === 'shown' && o.hidden) return false;
      if (view === 'hidden' && !o.hidden) return false;
      if (view === 'featured' && !o.featured) return false;
      return !q || [l.ref, l.title, l.area, l.size, l.price, o.price_override, o.note]
        .some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [listings, overrides, view, search]);

  const counts = useMemo(() => {
    const all = listings.map((l) => overrides[l.ref] ?? EMPTY_OVERRIDE);
    return {
      all: all.length,
      shown: all.filter((o) => !o.hidden).length,
      featured: all.filter((o) => o.featured).length,
      hidden: all.filter((o) => o.hidden).length,
    };
  }, [listings, overrides]);

  const openEdit = (listing) => {
    const o = overrides[listing.ref] ?? EMPTY_OVERRIDE;
    setEditing({
      listing,
      form: {
        hidden: o.hidden,
        featured: o.featured,
        sort_order: o.sort_order === null || o.sort_order === undefined ? '' : String(o.sort_order),
        price_override: o.price_override ?? '',
        note: o.note ?? '',
      },
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const { listing, form } = editing;
    const order = form.sort_order.trim();
    if (order !== '' && !/^-?\d{1,4}$/.test(order)) {
      toast.error('Order must be a whole number (or empty)');
      return;
    }
    const ok = await save(listing.ref, {
      hidden: form.hidden,
      featured: form.featured,
      sort_order: order === '' ? null : Number(order),
      price_override: form.price_override.trim() || null,
      note: form.note.trim() || null,
    }, `${listing.ref} saved`);
    if (ok) setEditing(null);
  };

  const quickToggle = (listing, key) => {
    const o = overrides[listing.ref] ?? EMPTY_OVERRIDE;
    const next = { ...EMPTY_OVERRIDE, ...o, [key]: !o[key] };
    const message = key === 'hidden'
      ? (next.hidden ? `${listing.ref} hidden from the site` : `${listing.ref} shown on the site`)
      : (next.featured ? `${listing.ref} featured` : `${listing.ref} no longer featured`);
    save(listing.ref, {
      hidden: next.hidden, featured: next.featured, sort_order: next.sort_order,
      price_override: next.price_override, note: next.note,
    }, message);
  };

  const setForm = (patch) => setEditing((prev) => ({ ...prev, form: { ...prev.form, ...patch } }));

  return (
    <div className="admin-page">
      <Helmet><title>Property Listings | Admin</title></Helmet>

      <div className="admin-header">
        <div>
          <h1>Property Listings</h1>
          <p className="admin-muted">Alpha Premier Realty listings from the APR Google Drive. Hide, feature, reorder or re-price them on the website.</p>
        </div>
        <div className="admin-header-actions listings-header-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={load} disabled={loading}>
            <RotateCw size={14} aria-hidden="true" /> Refresh
          </button>
          {driveRoot && (
            <a className="admin-btn admin-btn-secondary" href={driveFolderUrl(driveRoot)} target="_blank" rel="noopener noreferrer">
              <FolderOpen size={14} aria-hidden="true" /> Open Drive folder
            </a>
          )}
          <a className="admin-btn admin-btn-primary" href={PUBLIC_PAGE} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={14} aria-hidden="true" /> View on site
          </a>
        </div>
      </div>

      <SyncBanner status={status} />

      <section className="admin-card admin-notice listings-notice">
        <h4><Building2 size={14} aria-hidden="true" /> Where listings come from</h4>
        <p>
          New listings, photos, details and SOLD moves are managed in the APR Google Drive folder and reach the
          website on the next sync. Settings here only change how a listing appears on the website (and in the chat
          assistant); they never edit the Drive. Changes show on the public site within about a minute.
        </p>
      </section>

      <div className="listings-toolbar">
        <div className={PILL_GROUP} role="group" aria-label="Show listings">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" aria-pressed={view === v.id} className={pillCls(view === v.id)} onClick={() => setView(v.id)}>
              {v.label} <span className="admin-pill-count tabular-nums">{counts[v.id]}</span>
            </button>
          ))}
        </div>
        <label className="listings-search">
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search listings</span>
          <input
            type="search"
            className="admin-input"
            placeholder="Search ref, area, price, note"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loadError && <div className="admin-alert admin-alert-error" role="alert">Could not load listings: {loadError}</div>}

      <div className="admin-table-container">
        {loading ? (
          <div className="listings-loading"><div className="admin-spinner" /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={listings.length === 0 ? 'No listings in the Drive feed yet' : 'No listings match'}
            subtitle={listings.length === 0 ? 'Listings appear here after the next Drive sync.' : 'Try another filter or search.'}
          />
        ) : (
          <table className="admin-table listings-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Price on site</th>
                <th>Order</th>
                <th>Website</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ l, o }) => {
                const busy = saving === l.ref;
                return (
                  <tr key={l.ref} className={o.hidden ? 'listings-row-hidden' : undefined}>
                    <td>
                      <div className="listings-cell-main">
                        {l.photos?.[0]
                          ? <img src={l.photos[0]} alt="" className="listings-thumb" loading="lazy" />
                          : <span className="listings-thumb listings-thumb-empty"><Building2 size={16} aria-hidden="true" /></span>}
                        <div className="listings-cell-text">
                          <div className="listings-title">{l.title}</div>
                          <div className="admin-muted listings-sub">
                            {l.area}{l.size ? ` · ${l.size}` : ''}
                          </div>
                          <div className="listings-badges">
                            <span className="admin-badge tabular-nums">{l.ref}</span>
                            {o.hidden && <StatusPill status="Hidden" map={{ Hidden: 'red' }} />}
                            {o.featured && <StatusPill status="Featured" />}
                          </div>
                          {o.note && <div className="listings-note" title="Internal note">{o.note}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="listings-price tabular-nums">{o.price_override || l.price || <span className="admin-muted">Rate on request</span>}</div>
                      {o.price_override && <div className="admin-muted listings-sub">Drive: {l.price || '—'}</div>}
                    </td>
                    <td className="tabular-nums">{o.sort_order ?? <span className="admin-muted">—</span>}</td>
                    <td>
                      <div className="listings-toggles">
                        <Toggle on={o.featured} label="Featured" Icon={Star} disabled={busy} onClick={() => quickToggle(l, 'featured')} />
                        <Toggle on={o.hidden} label="Hidden" Icon={EyeOff} disabled={busy} onClick={() => quickToggle(l, 'hidden')} />
                      </div>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-icon-btn" title="Edit order, price and note" aria-label={`Edit ${l.ref}`} onClick={() => openEdit(l)}>
                          <Pen size={15} aria-hidden="true" />
                        </button>
                        {l.drive_folder && (
                          <a className="admin-icon-btn" href={driveFolderUrl(l.drive_folder)} target="_blank" rel="noopener noreferrer" title="Open this listing's Drive folder" aria-label={`Open Drive folder for ${l.ref}`}>
                            <FolderOpen size={15} aria-hidden="true" />
                          </a>
                        )}
                        {!o.hidden && (
                          <a className="admin-icon-btn" href={`${PUBLIC_PAGE}?ref=${encodeURIComponent(l.ref)}`} target="_blank" rel="noopener noreferrer" title="View on site" aria-label={`View ${l.ref} on site`}>
                            <ExternalLink size={15} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <form
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-edit-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitEdit}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-badge tabular-nums">{editing.listing.ref}</span>
                <h2 id="listing-edit-title">{editing.listing.title}</h2>
              </div>
              <button type="button" className="admin-modal-close" aria-label="Close dialog" onClick={() => setEditing(null)}>&times;</button>
            </div>
            <div className="admin-modal-body admin-form">
              <div className="listings-toggles">
                <Toggle on={editing.form.featured} label="Featured" Icon={Star} onClick={() => setForm({ featured: !editing.form.featured })} />
                <Toggle on={editing.form.hidden} label="Hidden from site" Icon={EyeOff} onClick={() => setForm({ hidden: !editing.form.hidden })} />
              </div>
              <div className="admin-field">
                <label htmlFor="listing-order">Order</label>
                <input
                  id="listing-order"
                  inputMode="numeric"
                  placeholder="Empty = after ordered ones, newest first"
                  value={editing.form.sort_order}
                  onChange={(e) => setForm({ sort_order: e.target.value })}
                />
                <span className="admin-muted listings-help">Lower numbers show first. Featured listings always come before the rest.</span>
              </div>
              <div className="admin-field">
                <label htmlFor="listing-price">Price shown on the site</label>
                <input
                  id="listing-price"
                  maxLength={255}
                  placeholder={editing.listing.price || 'Rate on request'}
                  value={editing.form.price_override}
                  onChange={(e) => setForm({ price_override: e.target.value })}
                />
                <span className="admin-muted listings-help">Leave empty to use the Drive price{editing.listing.price ? ` (“${editing.listing.price}”)` : ''}.</span>
              </div>
              <div className="admin-field">
                <label htmlFor="listing-note">Internal note</label>
                <textarea
                  id="listing-note"
                  maxLength={500}
                  rows={3}
                  placeholder="Staff only, never shown on the site"
                  value={editing.form.note}
                  onChange={(e) => setForm({ note: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving === editing.listing.ref}>
                {saving === editing.listing.ref ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
