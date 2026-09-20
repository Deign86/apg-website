import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/admin/Toast';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import { Pen, Plus, TriangleAlert, Trash2, Users } from 'lucide-react';

const inputCls = 'rounded-xl border-neutral-800 bg-black/80 focus:border-[#D4AF37]';

const ROLES = ['superadmin', 'admin', 'recruiter', 'editor'];

const EMPTY_FORM = {
  email: '',
  name: '',
  role: 'admin',
  password: '',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function UsersManager() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const { user } = useAuth();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users.php', { credentials: 'include' });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const message = data?.error || `Request failed with HTTP ${res.status}`;
        setLoadError(message);
        setAdmins([]);
        toast.error(message);
        return;
      }

      setAdmins(Array.isArray(data.data) ? data.data : []);
      setLoadError(null);
    } catch (err) {
      const message = err?.message || 'Network error loading admin accounts';
      setLoadError(message);
      setAdmins([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditingAdmin(null);
    setFormError(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (admin) => {
    setEditingAdmin(admin);
    setFormError(null);
    setForm({
      email: admin.email || '',
      name: admin.name || '',
      role: admin.role || 'admin',
      password: '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const payload = editingAdmin
        ? { id: editingAdmin.id, email: form.email, name: form.name, role: form.role }
        : { ...form };
      if (editingAdmin && form.password !== '') {
        payload.password = form.password;
      }
      const res = await fetch('/api/admin/users.php', {
        method: editingAdmin ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const message = data?.error || `Save failed with HTTP ${res.status}`;
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success(editingAdmin ? 'Admin account updated' : 'Admin account created');
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      const message = err?.message || 'Network error saving admin account';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users.php?id=${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        toast.error(data?.error || `Delete failed with HTTP ${res.status}`);
        return;
      }

      toast.success('Admin account deleted');
      setDeleteTarget(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err?.message || 'Network error deleting admin account');
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <>
          <strong style={{ color: '#fff', display: 'block' }}>
            {row.name}
            {user && Number(user.id) === Number(row.id) && (
              <span className="admin-badge rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/15 px-2 py-0.5 text-[#E2B857]" style={{ marginLeft: 8 }}>YOU</span>
            )}
          </strong>
          <span style={{ color: '#888', fontSize: '0.8rem' }}>{row.email}</span>
        </>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <StatusPill status={row.role} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{formatDate(row.created_at)}</span>,
    },
  ], [user]);

  const actions = useMemo(() => (row) => {
    const list = [{ Icon: Pen, label: 'Edit', onClick: () => openEdit(row) }];
    if (!user || Number(user.id) !== Number(row.id)) {
      list.push({ Icon: Trash2, label: 'Delete', color: '#ef4444', onClick: () => setDeleteTarget(row) });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="admin-page">
      <Helmet><title>Users | Admin</title></Helmet>

      <div className="admin-header">
        <div>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Users</h1>
          <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>
            Manage admin accounts and roles (superadmin only)
          </p>
        </div>
        <button className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" onClick={openAdd}>
          <Plus className="size-4" aria-hidden="true" /> New Admin
        </button>
      </div>

      {loadError && (
        <div className="admin-alert admin-alert-error" role="alert" style={{ marginBottom: 16 }}>
          <TriangleAlert className="size-4" aria-hidden="true" /> {loadError}
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchAdmins} style={{ marginLeft: 12 }}>
            Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={admins}
        loading={loading}
        search={searchTerm}
        onSearch={setSearchTerm}
        pageSize={25}
        sortKey="created_at"
        sortDir="asc"
        emptyIcon={Users}
        emptyTitle="No admin accounts found"
        emptySubtitle="Create the first admin account to get started."
        emptyAction={<button className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" onClick={openAdd}>New Admin</button>}
        actions={actions}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Admin Account"
        message={`Are you sure you want to delete the admin account "${deleteTarget?.email || 'this account'}"? This permanently removes their access.`}
        confirmLabel="Delete Account"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {modalOpen && (
        <div className="admin-modal-overlay fixed inset-0 z-50 bg-black/90 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="admin-modal rounded-3xl border border-[#D4AF37]/50 bg-[#0B0905]" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="admin-modal-header">
              <h2 className="text-balance text-[#E2B857]">{editingAdmin ? 'Edit Admin Account' : 'Create Admin Account'}</h2>
              <button className="admin-modal-close rounded-full border border-[#D4AF37]/30" aria-label="Close dialog" onClick={() => setModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {formError && (
                <div className="admin-alert admin-alert-error" role="alert">
                  <TriangleAlert className="size-4" aria-hidden="true" /> {formError}
                </div>
              )}

              <div className="admin-field">
                <label>Email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. jane@alphapremiergroup.com"
                  required
                />
              </div>

              <div className="admin-field">
                <label>Name</label>
                <input
                  type="text"
                  className={inputCls}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Jane Santos"
                  required
                />
              </div>

              <div className="admin-field">
                <label>Role</label>
                <select className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="admin-field">
                <label>Password{editingAdmin ? ' (leave blank to keep unchanged)' : ' (min. 10 characters)'}</label>
                <input
                  type="password"
                  className={inputCls}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editingAdmin ? 'Blank = unchanged' : 'Min. 10 characters'}
                  required={!editingAdmin}
                  minLength={editingAdmin ? undefined : 10}
                />
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary rounded-full bg-[#D4AF37] uppercase tracking-widest" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
