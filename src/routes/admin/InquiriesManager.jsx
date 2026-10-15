import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Eye, Inbox, Mail, MailCheck, Phone, Reply, RotateCw, Search, Send, Trash2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusPill from '@/components/admin/StatusPill';
import EmptyState from '@/components/admin/EmptyState';
import PageHeader from '@/components/admin/PageHeader';
import SegmentedControl from '@/components/admin/SegmentedControl';
import { useAuth } from '@/context/AuthContext';
import { ENTERPRISES } from '@/data/enterprises';

const API = '/api/admin/inquiries.php';

const KINDS = [
  { id: 'inquiry', label: 'Inquiry' },
  { id: 'listing', label: 'Listing' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'application_question', label: 'Job question' },
  { id: 'newsletter', label: 'Newsletter' },
];
const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label]));
const STATUSES = ['new', 'read', 'replied', 'archived'];
const STATUS_TONE = { new: 'gold', read: 'grey', replied: 'green', archived: 'grey' };
const ENTERPRISE_NAME = Object.fromEntries(ENTERPRISES.map((e) => [e.slug, e.name]));

// Same pill strip look as Job Applicants.

const EMPTY_FILTERS = { kind: '', enterprise: '', status: '', from: '', to: '', q: '' };

const WHEN = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** MySQL DATETIME (Asia/Manila) → short readable date. */
function when(value) {
  if (!value) return '—';
  const d = new Date(String(value).replace(' ', 'T') + '+08:00');
  return Number.isNaN(d.getTime()) ? String(value) : WHEN.format(d);
}

/** Query string for the list/export endpoints; the Newsletter tab always pins kind=newsletter. */
function queryFor(tab, filters) {
  const params = new URLSearchParams();
  const effective = tab === 'newsletter' ? { ...filters, kind: 'newsletter', status: '' } : filters;
  Object.entries(effective).forEach(([k, v]) => { if (v) params.set(k, v); });
  if (tab === 'inbox' && !filters.kind) params.set('exclude', 'newsletter');
  return params.toString();
}

const META_LABELS = [
  ['listing_ref', 'Listing'], ['property', 'Property'], ['company', 'Company'], ['service', 'Service'],
  ['topic', 'Topic'], ['position', 'Position'], ['budget', 'Budget'], ['timeline', 'Timeline'],
  ['type', 'Type'], ['attachment', 'Attachment (emailed)'],
];

export default function InquiriesManager() {
  const toast = useToast();
  const { can } = useAuth();
  const [tab, setTab] = useState('inbox');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [summary, setSummary] = useState(null);
  const [active, setActive] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');
  const [sending, setSending] = useState(false);

  const query = queryFor(tab, filters);
  const queryRef = useRef(query);

  // Debounced server search.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === searchInput.trim() ? f : { ...f, q: searchInput.trim() })), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    queryRef.current = query;
    setLoading(true);
    Promise.all([
      fetch(`${API}?${query}`, { credentials: 'include', signal: controller.signal }).then((r) => r.json()),
      fetch(`${API}?action=summary`, { credentials: 'include', signal: controller.signal }).then((r) => r.json()),
    ])
      .then(([list, sum]) => {
        if (!list.success) throw new Error(list.error || 'Failed to load inquiries');
        setRows(Array.isArray(list.data) ? list.data : []);
        setTotal(Number(list.total) || 0);
        if (sum.success) setSummary(sum.summary);
        setLoadError('');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load inquiries');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, reloadKey]);

  // Rows whose status was changed out of the status filter stay on screen but no longer match on the
  // server, so neither `total` (see updateStatus) nor the "more" count includes them.
  const statusFilter = tab === 'newsletter' ? '' : filters.status;
  const loadedMatching = statusFilter ? rows.filter((r) => r.status === statusFilter).length : rows.length;

  // Next page of the same filters: the rows after the last loaded one (by date, then id), so edits,
  // deletions and new arrivals elsewhere never skip or repeat a row; any overlap is dropped by id.
  const loadOlder = async () => {
    const forQuery = query;
    const last = rows[rows.length - 1];
    setLoadingOlder(true);
    try {
      const cursor = last ? `&before_at=${encodeURIComponent(last.created_at)}&before_id=${last.id}` : '';
      const list = await fetch(`${API}?${forQuery}${cursor}`, { credentials: 'include' }).then((r) => r.json());
      if (queryRef.current !== forQuery) return; // the filters changed meanwhile
      if (!list.success) throw new Error(list.error || 'Failed to load older inquiries');
      setRows((prev) => {
        const have = new Set(prev.map((r) => r.id));
        return [...prev, ...(Array.isArray(list.data) ? list.data : []).filter((r) => !have.has(r.id))];
      });
      setTotal(Number(list.total) || 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load older inquiries');
    } finally {
      setLoadingOlder(false);
    }
  };

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const switchTab = (next) => { setTab(next); setFilters(EMPTY_FILTERS); setSearchInput(''); };
  const hasFilters = Object.values(filters).some(Boolean);

  const updateStatus = async (row, status, quiet = false) => {
    if (row.status === status) return;
    try {
      const res = await fetch(API, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update status');
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
      if (statusFilter) setTotal((t) => t + (status === statusFilter ? 1 : 0) - (row.status === statusFilter ? 1 : 0));
      setActive((prev) => (prev && prev.id === row.id ? { ...prev, status } : prev));
      setSummary((prev) => {
        if (!prev || row.kind === 'newsletter') return prev;
        const delta = (status === 'new' ? 1 : 0) - (row.status === 'new' ? 1 : 0);
        return { ...prev, unread: Math.max(0, prev.unread + delta) };
      });
      if (!quiet) toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const openDetail = async (row) => {
    setActive({ ...row, message: null });
    setReplyOpen(false);
    setReplyText('');
    setReplyError('');
    try {
      const res = await fetch(`${API}?id=${row.id}`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load inquiry');
      setActive(json.data);
      if (json.data.status === 'new') updateStatus(json.data, 'read', true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load inquiry');
      setActive(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}?id=${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete');
      toast.success('Deleted');
      if (active?.id === deleteTarget.id) setActive(null);
      // Drop the row in place (a reload would also drop the older pages loaded so far) and refresh the counts.
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      if (!statusFilter || deleteTarget.status === statusFilter) setTotal((t) => Math.max(0, t - 1));
      setDeleteTarget(null);
      fetch(`${API}?action=summary`, { credentials: 'include' }).then((r) => r.json())
        .then((sum) => { if (sum.success) setSummary(sum.summary); })
        .catch(() => {});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // Same subject the API builds for an in-app reply.
  const replySubject = useMemo(() => {
    if (!active) return '';
    const ticket = active.meta?.ticket ? `[${active.meta.ticket}] ` : '';
    const company = ENTERPRISE_NAME[active.enterprise_slug] || active.enterprise_slug;
    return `Re: ${ticket}${active.subject || `Your inquiry with ${company}`}`.trim();
  }, [active]);
  const replies = Array.isArray(active?.meta?.replies) ? active.meta.replies.filter((r) => r && typeof r.body === 'string') : [];

  const sendReply = async (e) => {
    e.preventDefault();
    const message = replyText.trim();
    if (!active || !message || sending) return;
    const target = active;
    setSending(true);
    setReplyError('');
    try {
      const res = await fetch(`${API}?action=reply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: target.id, message }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send the reply');
      const sent = Array.isArray(json.data?.replies) ? json.data.replies : [];
      setActive((prev) => (prev && prev.id === target.id ? { ...prev, status: 'replied', meta: { ...prev.meta, replies: sent } } : prev));
      setRows((prev) => prev.map((r) => (r.id === target.id ? { ...r, status: 'replied' } : r)));
      if (statusFilter) setTotal((t) => t + (statusFilter === 'replied' ? 1 : 0) - (target.status === statusFilter ? 1 : 0));
      if (target.status === 'new') setSummary((prev) => (prev ? { ...prev, unread: Math.max(0, prev.unread - 1) } : prev));
      setReplyOpen(false);
      setReplyText('');
      toast.success(`Reply sent to ${target.email}`);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Failed to send the reply');
    } finally {
      setSending(false);
    }
  };

  const newsletter = tab === 'newsletter';

  return (
    <div className="admin-page">
      <Helmet><title>Inquiries | Admin</title></Helmet>

      <PageHeader
        eyebrow="Engagement"
        title="Inquiries"
        badge={summary?.unread > 0 && <span className="admin-pill admin-pill-gold tabular-nums">{summary.unread} new</span>}
        description="Every contact, listing, and feedback form from all APG sites, plus newsletter sign-ups. Each one is also emailed to the team."
        actions={<>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setReloadKey((k) => k + 1)} disabled={loading}>
            <RotateCw size={14} aria-hidden="true" /> Refresh
          </button>
          <a className="admin-btn admin-btn-primary" href={`${API}?action=export&${query}`} download>
            <Download size={14} aria-hidden="true" /> Export CSV
          </a>
        </>}
      />

      <div className="inquiries-tabs">
        <SegmentedControl
          label="Inbox or newsletter"
          value={tab}
          onChange={switchTab}
          options={[
            { value: 'inbox', label: 'Inbox', count: summary?.unread },
            { value: 'newsletter', label: 'Newsletter', count: summary?.subscribers },
          ]}
        />
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search inquiries</span>
          <input
            type="search"
            className="admin-input"
            placeholder={newsletter ? 'Search email or name' : 'Search name, email, phone, message'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        {!newsletter && (
          <select className="admin-select" aria-label="Kind" value={filters.kind} onChange={(e) => setFilter({ kind: e.target.value })}>
            <option value="">All kinds</option>
            {KINDS.filter((k) => k.id !== 'newsletter').map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        )}
        <select className="admin-select" aria-label="Company" value={filters.enterprise} onChange={(e) => setFilter({ enterprise: e.target.value })}>
          <option value="">All companies</option>
          {ENTERPRISES.map((e) => <option key={e.slug} value={e.slug}>{e.name}</option>)}
        </select>
        {!newsletter && (
          <select className="admin-select" aria-label="Status" value={filters.status} onChange={(e) => setFilter({ status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        )}
        <label className="inquiries-date">
          <span>From</span>
          <input type="date" className="admin-input" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilter({ from: e.target.value })} />
        </label>
        <label className="inquiries-date">
          <span>To</span>
          <input type="date" className="admin-input" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilter({ to: e.target.value })} />
        </label>
        {hasFilters && (
          <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setFilters(EMPTY_FILTERS); setSearchInput(''); }}>
            Clear
          </button>
        )}
      </div>

      {loadError && <div className="admin-alert admin-alert-error" role="alert">Could not load inquiries: {loadError}</div>}

      <div className="admin-table-container">
        {loading && rows.length === 0 ? (
          <div className="listings-loading" role="status"><div className="admin-spinner" aria-hidden="true" /><span className="sr-only">Loading inquiries…</span></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={newsletter ? MailCheck : Inbox}
            title={hasFilters ? 'Nothing matches these filters' : newsletter ? 'No newsletter subscribers yet' : 'No inquiries yet'}
            subtitle={hasFilters ? 'Try clearing a filter.' : 'Form submissions from every APG site land here.'}
          />
        ) : newsletter ? (
          <table className="admin-table">
            <thead>
              <tr><th>Email</th><th>Company</th><th>Subscribed</th><th>Last sign-up</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><a className="inquiries-link" href={`mailto:${r.email}`}>{r.email}</a></td>
                  <td>{ENTERPRISE_NAME[r.enterprise_slug] || r.enterprise_slug}</td>
                  <td className="tabular-nums">{when(r.created_at)}</td>
                  <td className="tabular-nums">{when(r.updated_at)}</td>
                  <td>
                    {can('delete') && (
                      <button type="button" className="admin-icon-btn admin-icon-btn-danger" title="Remove subscriber" aria-label={`Remove ${r.email}`} onClick={() => setDeleteTarget(r)}>
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Received</th><th>From</th><th>Kind</th><th>Subject</th><th>Status</th><th aria-label="Actions" /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={`inquiries-row${r.status === 'new' ? ' admin-row-new inquiries-row-new' : ''}`}
                  // Mouse convenience only; the subject button is the keyboard control.
                  onClick={(e) => { if (!e.target.closest('select,button,a,input,label')) openDetail(r); }}
                >
                  <td className="tabular-nums inquiries-when">{when(r.created_at)}</td>
                  <td>
                    <div className="inquiries-name">{r.name}</div>
                    <div className="admin-muted inquiries-sub">{r.email}</div>
                  </td>
                  <td>
                    <div>{KIND_LABEL[r.kind] || r.kind}</div>
                    <div className="admin-muted inquiries-sub">{ENTERPRISE_NAME[r.enterprise_slug] || r.enterprise_slug}</div>
                  </td>
                  <td>
                    <button type="button" className="inquiries-subject" onClick={() => openDetail(r)}>
                      <span className="inquiries-name">{r.subject || '(no subject)'}</span>
                      {r.excerpt && <span className="admin-muted inquiries-sub inquiries-excerpt">{r.excerpt}</span>}
                    </button>
                  </td>
                  <td>
                    <select
                      className="admin-select inquiries-status"
                      aria-label={`Status of inquiry from ${r.name}`}
                      value={r.status}
                      onChange={(e) => updateStatus(r, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" className="admin-icon-btn" title="Open" aria-label={`Open inquiry from ${r.name}`} onClick={() => openDetail(r)}>
                        <Eye size={15} aria-hidden="true" />
                      </button>
                      {can('delete') && (
                        <button type="button" className="admin-icon-btn admin-icon-btn-danger" title="Delete" aria-label={`Delete inquiry from ${r.name}`} onClick={() => setDeleteTarget(r)}>
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && total > loadedMatching && (
          <div style={{ padding: 12, textAlign: 'center' }}>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={loadOlder} disabled={loadingOlder}>
              {loadingOlder ? 'Loading…' : `Load older (${total - loadedMatching} more)`}
            </button>
          </div>
        )}
      </div>

      {active && (
        <div className="admin-modal-overlay inquiries-drawer-overlay" onClick={() => setActive(null)}>
          <aside className="admin-modal inquiries-drawer" role="dialog" aria-modal="true" aria-labelledby="inquiry-title" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div className="inquiries-badges">
                  <span className="admin-badge">{KIND_LABEL[active.kind] || active.kind}</span>
                  <span className="admin-badge">{ENTERPRISE_NAME[active.enterprise_slug] || active.enterprise_slug}</span>
                  {active.meta?.ticket && <span className="admin-badge tabular-nums">{active.meta.ticket}</span>}
                </div>
                <h2 id="inquiry-title">{active.name}</h2>
                <div className="admin-muted inquiries-sub">{when(active.created_at)}</div>
              </div>
              <button type="button" className="admin-modal-close" aria-label="Close" onClick={() => setActive(null)}>&times;</button>
            </div>
            <div className="admin-modal-body inquiries-detail">
              <div className="inquiries-contact">
                <a className="inquiries-link" href={`mailto:${active.email}`}><Mail size={14} aria-hidden="true" /> {active.email}</a>
                {active.phone && (
                  <a className="inquiries-link" href={`tel:${String(active.phone).replace(/[^\d+]/g, '')}`}><Phone size={14} aria-hidden="true" /> {active.phone}</a>
                )}
              </div>

              <div className="inquiries-status-chips" role="group" aria-label="Status">
                {STATUSES.map((s) => (
                  <button key={s} type="button" aria-pressed={active.status === s} className={`listings-toggle${active.status === s ? ' on' : ''}`} onClick={() => updateStatus(active, s)}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
                <StatusPill status={active.status} map={STATUS_TONE} />
              </div>

              {active.subject && <h3 className="inquiries-detail-subject">{active.subject}</h3>}

              {META_LABELS.some(([k]) => active.meta?.[k]) || (active.meta?.fields && Object.keys(active.meta.fields).length > 0) ? (
                <dl className="inquiries-meta">
                  {META_LABELS.filter(([k]) => active.meta?.[k]).map(([k, label]) => (
                    <React.Fragment key={k}>
                      <dt>{label}</dt>
                      <dd>
                        {k === 'listing_ref'
                          ? <a className="inquiries-link" href={`/subsidiaries/realty/properties?ref=${encodeURIComponent(active.meta.listing_ref)}`} target="_blank" rel="noopener noreferrer">{active.meta.listing_ref}{active.meta.listing_title ? ` · ${active.meta.listing_title}` : ''}</a>
                          : String(active.meta[k])}
                      </dd>
                    </React.Fragment>
                  ))}
                  {Object.entries(active.meta?.fields ?? {}).map(([label, value]) => (
                    <React.Fragment key={label}><dt>{label}</dt><dd>{String(value)}</dd></React.Fragment>
                  ))}
                </dl>
              ) : null}

              <div className="inquiries-message">
                {active.message === null && active.excerpt !== undefined
                  ? <span className="admin-muted">Loading…</span>
                  : active.message || <span className="admin-muted">No message.</span>}
              </div>

              {replies.length > 0 && (
                <section className="inquiries-replies" aria-labelledby="inquiry-replies-title">
                  <h3 id="inquiry-replies-title" className="inquiries-detail-subject">Replies</h3>
                  {replies.map((rep, i) => (
                    <div key={`${rep.at}-${i}`}>
                      <div className="admin-muted inquiries-sub">{rep.by || 'Admin'} · {when(rep.at)}</div>
                      <div className="inquiries-message">{rep.body}</div>
                    </div>
                  ))}
                </section>
              )}

              {replyOpen && (
                <form id="inquiry-reply-form" className="inquiries-reply" onSubmit={sendReply}>
                  <div className="admin-field">
                    <span className="admin-label">Subject</span>
                    <div className="inquiries-detail-subject">{replySubject}</div>
                  </div>
                  <div className="admin-field">
                    <label htmlFor="inquiry-reply-body">Message to {active.email}</label>
                    <textarea
                      id="inquiry-reply-body"
                      rows={8}
                      maxLength={5000}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={sending}
                      autoFocus
                    />
                    <div className="admin-muted inquiries-sub">
                      Sent in the {ENTERPRISE_NAME[active.enterprise_slug] || active.enterprise_slug} email design; their replies go to the company inbox. {replyText.length}/5000
                    </div>
                  </div>
                  {replyError && <div className="admin-alert admin-alert-error" role="alert">{replyError}</div>}
                  <a className="inquiries-link inquiries-sub" href={`mailto:${active.email}?subject=${encodeURIComponent(replySubject)}`}>
                    <Mail size={13} aria-hidden="true" /> Open in mail app instead
                  </a>
                </form>
              )}
            </div>
            <div className="admin-modal-footer">
              {can('delete') && (
                <button type="button" className="admin-btn admin-btn-danger" onClick={() => setDeleteTarget(active)}>
                  <Trash2 size={14} aria-hidden="true" /> Delete
                </button>
              )}
              {active.kind !== 'newsletter' && (replyOpen ? (
                <>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => { setReplyOpen(false); setReplyError(''); }} disabled={sending}>
                    Cancel
                  </button>
                  <button type="submit" form="inquiry-reply-form" className="admin-btn admin-btn-primary" disabled={sending || !replyText.trim()}>
                    <Send size={14} aria-hidden="true" /> {sending ? 'Sending…' : 'Send reply'}
                  </button>
                </>
              ) : (
                <>
                  <a className="admin-btn admin-btn-ghost" href={`mailto:${active.email}?subject=${encodeURIComponent(replySubject)}`}>
                    <Mail size={14} aria-hidden="true" /> Open in mail app
                  </a>
                  <button type="button" className="admin-btn admin-btn-primary" onClick={() => setReplyOpen(true)}>
                    <Reply size={14} aria-hidden="true" /> Reply
                  </button>
                </>
              ))}
            </div>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.kind === 'newsletter' ? 'Remove subscriber' : 'Delete inquiry'}
        message={`Permanently delete ${deleteTarget?.kind === 'newsletter' ? 'the newsletter sign-up of' : 'the inquiry from'} ${deleteTarget?.email || 'this sender'}? The email already sent to the team is not affected.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
