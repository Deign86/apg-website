import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Trash2, Upload, Pen, Code2, ListChecks } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import PageHeader from '@/components/admin/PageHeader';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { openOnRowClick } from '@/components/admin/rowClick';
import { RichText } from '@/components/RichText';
import { CONTENT_SCHEMA, fieldsFor, valueMatchesField } from '@/data/contentSchema';
import { invalidateContent } from '@/hooks/useContent';

// Guided content editor over the registry (src/data/contentSchema.js): pick a page, edit labeled
// fields per section, see which fields are customized, reset any field to its default.
// Superadmins also get "Advanced (raw keys)" for stored rows the registry does not describe.

const GROUP_ORDER = ['Settings', 'Main site', 'Company sites'];

function emptyItem(field) {
  return Object.fromEntries((field.itemFields || []).map((f) => [f.key, f.type === 'select' ? (f.options?.[0] ?? '') : '']));
}

function storedValue(row) {
  if (row.type !== 'card') return row.value ?? '';
  try {
    return JSON.parse(row.value ?? 'null');
  } catch {
    return null;
  }
}

function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/* ------------------------------------------------------------------ inputs */

function ImageInput({ id, value, onChange }) {
  const toast = useToast();
  const [pct, setPct] = useState(null);
  const onFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid format. Allowed: JPG, PNG, WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB');
      return;
    }
    const fd = new FormData();
    fd.append('image', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/content.php?action=upload_image', true);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setPct(Math.round((ev.loaded / ev.total) * 100)); };
    xhr.onload = () => {
      setPct(null);
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* handled below */ }
      if (xhr.status >= 200 && xhr.status < 300 && data?.success && data.url) {
        onChange(data.url);
        toast.success('Image uploaded');
      } else {
        toast.error(data?.error || `Upload failed (HTTP ${xhr.status})`);
      }
    };
    xhr.onerror = () => { setPct(null); toast.error('Network error while uploading image'); };
    setPct(0);
    xhr.send(fd);
  };
  return (
    <div className="ce-image">
      {value ? <img src={value} alt="" className="ce-image-preview" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} onLoad={(e) => { e.currentTarget.style.visibility = 'visible'; }} /> : <div className="ce-image-preview ce-image-empty">No image</div>}
      <div className="ce-image-controls">
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/content/... or https://..." />
        <label className="admin-btn admin-btn-secondary admin-btn-sm ce-upload">
          <Upload className="size-3.5" aria-hidden="true" />
          {pct === null ? 'Upload image' : `Uploading ${pct}%`}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} disabled={pct !== null} hidden />
        </label>
      </div>
    </div>
  );
}

function RichTextInput({ id, value, onChange }) {
  const ref = useRef(null);
  const wrap = (marker, placeholder) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const sel = value.slice(s, e) || placeholder;
    onChange(value.slice(0, s) + marker + sel + marker + value.slice(e));
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + marker.length, s + marker.length + sel.length); });
  };
  return (
    <>
      <div className="ce-toolbar">
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => wrap('**', 'bold text')} aria-label="Bold"><strong>B</strong></button>
        <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => wrap('*', 'italic text')} aria-label="Italic"><em>I</em></button>
        <span className="ce-hint">**bold** · *italic* · new line = line break</span>
      </div>
      <textarea id={id} ref={ref} rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="ce-preview" aria-label="Preview"><span className="ce-preview-label">Preview</span><RichText text={value} /></div>
    </>
  );
}

function ScalarInput({ id, field, value, onChange }) {
  const v = typeof value === 'string' ? value : '';
  switch (field.type) {
    case 'textarea':
      return <textarea id={id} rows={field.key.includes('address') ? 3 : 4} value={v} onChange={(e) => onChange(e.target.value)} />;
    case 'richtext':
      return <RichTextInput id={id} value={v} onChange={onChange} />;
    case 'image':
      return <ImageInput id={id} value={v} onChange={onChange} />;
    case 'select':
      return (
        <select id={id} value={v} onChange={(e) => onChange(e.target.value)}>
          {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'email':
      return <input id={id} type="email" value={v} onChange={(e) => onChange(e.target.value)} autoComplete="off" />;
    case 'url':
      return <input id={id} type="url" value={v} onChange={(e) => onChange(e.target.value)} placeholder="https://" />;
    case 'phone':
      return <input id={id} type="tel" value={v} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <input id={id} type="text" value={v} onChange={(e) => onChange(e.target.value)} />;
  }
}

function RepeaterInput({ id, field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const update = (idx, key, v) => onChange(items.map((item, i) => (i === idx ? { ...item, [key]: v } : item)));
  const move = (idx, dir) => {
    const next = [...items];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    onChange(next);
  };
  return (
    <div className="ce-repeater" id={id}>
      {items.length === 0 && <p className="ce-hint">No items. Add one below.</p>}
      {items.map((item, idx) => (
        <div className="ce-item" key={idx}>
          <div className="ce-item-head">
            <span className="ce-item-title">{idx + 1}. {String(item?.[field.itemLabel] || '').slice(0, 60) || 'New item'}</span>
            <div className="ce-item-actions">
              <button type="button" className="admin-icon-btn" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label={`Move item ${idx + 1} up`}><ArrowUp className="size-4" aria-hidden="true" /></button>
              <button type="button" className="admin-icon-btn" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} aria-label={`Move item ${idx + 1} down`}><ArrowDown className="size-4" aria-hidden="true" /></button>
              <button type="button" className="admin-icon-btn admin-icon-btn-danger" onClick={() => onChange(items.filter((_, i) => i !== idx))} aria-label={`Remove item ${idx + 1}`}><Trash2 className="size-4" aria-hidden="true" /></button>
            </div>
          </div>
          <div className="ce-item-fields">
            {(field.itemFields || []).map((sub) => (
              <div className={`admin-field${['textarea', 'richtext', 'image'].includes(sub.type) ? ' ce-wide' : ''}`} key={sub.key}>
                <label htmlFor={`${id}-${idx}-${sub.key}`}>{sub.label}</label>
                <ScalarInput id={`${id}-${idx}-${sub.key}`} field={sub} value={item?.[sub.key] ?? ''} onChange={(v) => update(idx, sub.key, v)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onChange([...items, emptyItem(field)])}>
        <Plus className="size-3.5" aria-hidden="true" /> Add item
      </button>
    </div>
  );
}

function FieldInput({ id, field, value, onChange }) {
  if (field.type === 'repeater') return <RepeaterInput id={id} field={field} value={value} onChange={onChange} />;
  if (field.type === 'list') {
    const lines = Array.isArray(value) ? value : [];
    return <textarea id={id} rows={Math.max(3, lines.length + 1)} value={lines.join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} />;
  }
  if (field.type === 'toggle') {
    return (
      <label className="ce-toggle" htmlFor={id}>
        <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        <span>{value === true ? 'On' : 'Off'}</span>
      </label>
    );
  }
  if (field.type === 'choices') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="ce-choices" id={id}>
        {(field.options || []).map((o) => (
          <label key={o.value} className="ce-choice">
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={(e) => onChange(e.target.checked ? [...selected, o.value] : selected.filter((s) => s !== o.value))}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    );
  }
  return <ScalarInput id={id} field={field} value={value} onChange={onChange} />;
}

/* ------------------------------------------------------------------ advanced view */

function AdvancedView({ slug, rows, onChanged }) {
  const toast = useToast();
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const registered = new Set(fieldsFor(slug).map((f) => f.key));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content.php', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_slug: slug, raw: { section_key: edit.section_key, type: edit.type, value: edit.value } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      toast.success('Saved');
      setEdit(null);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const res = await fetch(`/api/admin/content.php?page=${encodeURIComponent(slug)}&key=${encodeURIComponent(deleteRow.section_key)}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) toast.success('Row deleted (default restored)');
    else toast.error(data.error || 'Delete failed');
    setDeleteRow(null);
    onChanged();
  };

  return (
    <div className="admin-card ce-advanced">
      <p className="ce-hint">Raw rows stored for <code>{slug}</code>. Prefer the guided editor; registered keys are still validated on save. Deleting a row restores the default.</p>
      {rows.length === 0 ? <p className="ce-hint">Nothing stored for this page — every field shows its default.</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Key</th><th>Type</th><th>Value</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="admin-row-clickable" onClick={(e) => openOnRowClick(e, () => setEdit({ section_key: r.section_key, type: r.type, value: r.value ?? '' }))}>
                  <td><code>{r.section_key}</code>{!registered.has(r.section_key) && <span className="admin-pill admin-pill-grey" style={{ marginLeft: 6 }}>unregistered</span>}</td>
                  <td>{r.type}</td>
                  <td className="ce-raw-cell">{String(r.value ?? '').slice(0, 160)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button type="button" className="admin-icon-btn" aria-label={`Edit ${r.section_key}`} onClick={() => setEdit({ section_key: r.section_key, type: r.type, value: r.value ?? '' })}><Pen className="size-4" aria-hidden="true" /></button>
                    <button type="button" className="admin-icon-btn admin-icon-btn-danger" aria-label={`Delete ${r.section_key}`} onClick={() => setDeleteRow(r)}><Trash2 className="size-4" aria-hidden="true" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: 12 }} onClick={() => setEdit({ section_key: '', type: 'text', value: '' })}>
        <Plus className="size-3.5" aria-hidden="true" /> Add raw key
      </button>

      {edit && (
        <div className="admin-modal-overlay" onClick={() => setEdit(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }} role="dialog" aria-modal="true" aria-label="Edit raw row">
            <div className="admin-modal-header">
              <h2>Raw row</h2>
              <button className="admin-modal-close" aria-label="Close dialog" onClick={() => setEdit(null)}>&times;</button>
            </div>
            <form onSubmit={save} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="admin-field">
                <label htmlFor="raw-key">Key</label>
                <input id="raw-key" value={edit.section_key} onChange={(e) => setEdit({ ...edit, section_key: e.target.value })} required pattern="[A-Za-z0-9_.\-]{1,100}" />
              </div>
              <div className="admin-field">
                <label htmlFor="raw-type">Type</label>
                <select id="raw-type" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
                  <option value="text">text</option><option value="richtext">richtext</option><option value="image">image</option><option value="card">card (JSON)</option>
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="raw-value">Value</label>
                <textarea id="raw-value" rows={8} value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} spellCheck={false} />
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEdit(null)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save row'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={!!deleteRow}
        title="Delete raw row"
        message={`Delete "${deleteRow?.section_key}"? Registered fields go back to their default.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setDeleteRow(null)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ editor */

export default function ContentEditor() {
  const toast = useToast();
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();

  const pages = useMemo(() => Object.entries(CONTENT_SCHEMA)
    .filter(([, page]) => !page.private || can('private_settings'))
    .sort((a, b) => GROUP_ORDER.indexOf(a[1].group) - GROUP_ORDER.indexOf(b[1].group)), [can]);
  const requested = params.get('page');
  const slug = pages.some(([s]) => s === requested) ? requested : 'home';
  const page = CONTENT_SCHEMA[slug];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [pendingPage, setPendingPage] = useState(null);
  const [resetField, setResetField] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dirty = Object.keys(draft).length > 0;

  // quiet = refresh after save/reset without swapping the form for a spinner (keeps scroll position)
  const fetchRows = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch(`/api/admin/content.php?page=${encodeURIComponent(slug)}`, { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setRows(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setRows([]);
      toast.error(`Could not load content: ${err instanceof Error ? err.message : 'request failed'}`);
    } finally {
      setLoading(false);
    }
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDraft({});
    setErrors({});
    fetchRows();
  }, [fetchRows]);

  // Unsaved-changes guard: tab close/reload, and in-app links (sidebar, topbar).
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    const onClick = (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || a.target === '_blank' || e.defaultPrevented) return;
      if (!window.confirm('You have unsaved changes. Leave without saving?')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  const stored = useMemo(() => {
    const byKey = new Map(fieldsFor(slug).map((f) => [f.key, f]));
    const out = {};
    rows.forEach((r) => {
      const field = byKey.get(r.section_key);
      const v = storedValue(r);
      if (field && valueMatchesField(field, v)) out[r.section_key] = v;
    });
    return out;
  }, [rows, slug]);

  const valueOf = (field) => (field.key in draft ? draft[field.key] : field.key in stored ? stored[field.key] : field.default);

  const setValue = (field, value) => {
    setErrors((prev) => { const next = { ...prev }; delete next[field.key]; return next; });
    setDraft((prev) => {
      const base = field.key in stored ? stored[field.key] : field.default;
      const next = { ...prev };
      if (sameValue(value, base)) delete next[field.key];
      else next[field.key] = value;
      return next;
    });
  };

  const switchPage = (next) => {
    if (next === slug) return;
    if (dirty) setPendingPage(next);
    else setParams({ page: next });
  };

  const save = async () => {
    setSaving(true);
    const values = Object.fromEntries(Object.entries(draft).map(([key, value]) => {
      const field = fieldsFor(slug).find((f) => f.key === key);
      return [key, field?.type === 'list' ? value.map((s) => s.trim()).filter(Boolean) : value];
    }));
    try {
      const res = await fetch('/api/admin/content.php', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_slug: slug, values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        if (data.key) {
          setErrors({ [data.key]: data.error });
          document.getElementById(`ce-${data.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      toast.success(`${page.label}: changes saved`);
      setDraft({});
      invalidateContent(slug);
      await fetchRows(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmReset = async () => {
    const field = resetField;
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/content.php?page=${encodeURIComponent(slug)}&key=${encodeURIComponent(field.key)}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || `HTTP ${res.status}`);
      setDraft((prev) => { const next = { ...prev }; delete next[field.key]; return next; });
      toast.success(`${field.label} reset to default`);
      invalidateContent(slug);
      await fetchRows(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setResetting(false);
      setResetField(null);
    }
  };

  const customizedCount = Object.keys(stored).length;
  const isSuperadmin = can('users');

  return (
    <div className="admin-page ce-page">
      <Helmet><title>Content Editor | Admin</title></Helmet>

      <PageHeader
        eyebrow="Website"
        title="Content Editor"
        description="Edit the words, images, and contact details shown on the websites. Untouched fields keep the original wording."
        actions={isSuperadmin && (
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setAdvanced((a) => !a)} disabled={dirty && !advanced} title={dirty && !advanced ? 'Save or discard changes first' : undefined}>
            {advanced ? <><ListChecks className="size-4" aria-hidden="true" /> Guided editor</> : <><Code2 className="size-4" aria-hidden="true" /> Advanced (raw keys)</>}
          </button>
        )}
      />

      <div className="ce-picker admin-card">
        <div className="admin-field">
          <label htmlFor="ce-page">Page</label>
          <select id="ce-page" value={slug} onChange={(e) => switchPage(e.target.value)}>
            {GROUP_ORDER.map((group) => (
              <optgroup key={group} label={group}>
                {pages.filter(([, p]) => p.group === group).map(([s, p]) => <option key={s} value={s}>{p.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="ce-picker-meta">
          {page.description && <p className="ce-hint">{page.description}</p>}
          <p className="ce-hint">
            {loading ? 'Loading…' : customizedCount === 0 ? 'All fields show their default wording.' : `${customizedCount} customized field${customizedCount === 1 ? '' : 's'}.`}
            {page.path && <> <a className="ce-link" href={page.path} target="_blank" rel="noopener noreferrer">View page <ExternalLink className="inline size-3" aria-hidden="true" /></a></>}
          </p>
        </div>
      </div>

      {advanced && isSuperadmin ? (
        <AdvancedView slug={slug} rows={rows} onChanged={() => { invalidateContent(slug); fetchRows(true); }} />
      ) : loading ? (
        <div className="admin-card ce-loading"><div className="admin-spinner" /><span>Loading {page.label}…</span></div>
      ) : (
        <div className="ce-sections">
          {page.sections.map((section) => (
            <section className="admin-card ce-section" key={section.title} aria-labelledby={`ce-sec-${section.title}`}>
              <h2 id={`ce-sec-${section.title}`} className="ce-section-title">{section.title}</h2>
              {section.description && <p className="ce-hint">{section.description}</p>}
              <div className="ce-fields">
                {section.fields.map((field) => {
                  const id = `ce-${field.key}`;
                  const customized = field.key in stored;
                  const changed = field.key in draft;
                  const wide = ['textarea', 'richtext', 'image', 'repeater', 'list', 'choices'].includes(field.type);
                  return (
                    <div className={`admin-field ce-field${wide ? ' ce-wide' : ''}${errors[field.key] ? ' ce-has-error' : ''}`} key={field.key}>
                      <div className="ce-field-head">
                        <label htmlFor={id}>{field.label}</label>
                        <span className="ce-badges">
                          {changed && <span className="admin-pill admin-pill-gold">Unsaved</span>}
                          {customized && <span className="admin-pill admin-pill-grey">Customized</span>}
                          {(customized || changed) && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost admin-btn-sm"
                              onClick={() => (customized ? setResetField(field) : setValue(field, field.default))}
                              title={customized ? 'Delete the saved value and show the default again' : 'Undo this change'}
                            >
                              <RotateCcw className="size-3.5" aria-hidden="true" /> {customized ? 'Reset to default' : 'Undo'}
                            </button>
                          )}
                        </span>
                      </div>
                      <FieldInput id={id} field={field} value={valueOf(field)} onChange={(v) => setValue(field, v)} />
                      {field.help && <p className="ce-hint">{field.help}</p>}
                      {errors[field.key] && <p className="admin-error-text" role="alert">{errors[field.key]}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {!advanced && dirty && (
        <div className="ce-savebar" role="region" aria-label="Unsaved changes">
          <span>{Object.keys(draft).length} unsaved change{Object.keys(draft).length === 1 ? '' : 's'}</span>
          <div className="ce-savebar-actions">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setConfirmDiscard(true)} disabled={saving}>Discard</button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingPage}
        title="Discard unsaved changes?"
        message="You have unsaved changes on this page. Switching pages will discard them."
        confirmLabel="Discard and switch"
        onConfirm={() => { const next = pendingPage; setPendingPage(null); setDraft({}); setParams({ page: next }); }}
        onCancel={() => setPendingPage(null)}
      />
      <ConfirmDialog
        open={confirmDiscard}
        title="Discard unsaved changes?"
        message={`Your ${Object.keys(draft).length} unsaved change${Object.keys(draft).length === 1 ? '' : 's'} on this page will be lost. The saved website text is not affected.`}
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onConfirm={() => { setConfirmDiscard(false); setDraft({}); setErrors({}); }}
        onCancel={() => setConfirmDiscard(false)}
      />
      <ConfirmDialog
        open={!!resetField}
        title="Reset to default?"
        message={`"${resetField?.label}" will show its original default again. Your saved version is deleted.`}
        confirmLabel="Reset"
        loading={resetting}
        onConfirm={confirmReset}
        onCancel={() => setResetField(null)}
      />
    </div>
  );
}

