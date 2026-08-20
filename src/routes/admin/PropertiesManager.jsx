import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/supabase';
import { createOffering, lifecycleOffering } from '@/lib/adminApi';
import { useAuth } from '@/context/AuthContext';
import DataTable from '@/components/admin/DataTable';
import StatusPill from '@/components/admin/StatusPill';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';
import PropertyEditor from '@/components/admin/properties/PropertyEditor';

const propertyTypes = ['warehouse', 'commercial_spaces', 'office_spaces', 'condominium', 'house', 'virtual_office', 'lot'];
const lifecycleStatuses = ['draft', 'for_review', 'published', 'unavailable', 'archived'];
const transactionTypesFallback = [
  { id: '', name: 'sale', label: 'For Sale' },
  { id: '', name: 'rent', label: 'For Rent' },
  { id: '', name: 'lease', label: 'For Lease' },
];

export default function PropertiesManager() {
  const toast = useToast();
  const { profile } = useAuth();
  const canPublish = ['owner', 'admin'].includes(profile?.role);
  const canSubmitReview = ['owner', 'admin', 'editor', 'staff'].includes(profile?.role);
  const [rows, setRows] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState(transactionTypesFallback);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTransaction, setFilterTransaction] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('offerings').select('*').order('created_at', { ascending: false });
    if (filterType) query = query.eq('property_type', filterType);
    if (filterStatus) query = query.eq('listing_status', filterStatus);
    if (filterTransaction) query = query.eq('transaction_type_id', filterTransaction);
    const [{ data, error }, types] = await Promise.all([
      query,
      supabase.from('transaction_types').select('id,name,label').order('name'),
    ]);
    if (error) toast(error.message, 'error'); else setRows(data || []);
    if (!types.error && types.data?.length) setTransactionTypes(types.data);
    setLoading(false);
  }, [filterType, filterStatus, filterTransaction, toast]);

  useEffect(() => { load(); }, [load]);

  const lifecycle = async (row, action) => {
    if (!window.confirm(`${action.replace('-', ' ')} "${row.title}"?`)) return;
    try {
      await lifecycleOffering(row.id, action);
      toast(`Listing ${action.replace('-', ' ')}d`, 'success');
      load();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  const duplicate = async (row) => {
    try {
      const copy = {
        ...row,
        title: `${row.title} (Copy)`,
        listing_status: undefined,
        is_published: undefined,
        deleted_at: undefined,
        archived_at: undefined,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
        drive_folder_id: undefined,
        drive_doc_id: undefined,
        imported_at: undefined,
        imported_by: undefined,
      };
      await createOffering(copy);
      toast('Draft duplicated', 'success');
      load();
    } catch (error) {
      toast(error.message, 'error');
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'property_type', header: 'Type', render: (row) => <StatusPill status={row.property_type || '-'} /> },
    { key: 'location', header: 'Location' },
    { key: 'price', header: 'Price', render: (row) => row.price == null ? 'Contact for price' : `${row.price_unit || 'PHP'} ${Number(row.price).toLocaleString()}` },
    { key: 'listing_status', header: 'Lifecycle', render: (row) => <StatusPill status={row.listing_status || (row.is_published ? 'published' : 'draft')} /> },
    { key: 'created_at', header: 'Created', render: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—' },
  ];

  const actions = (row) => {
    const result = [
      { icon: 'fa-pen', label: 'Edit', onClick: () => setEditing(row) },
      { icon: 'fa-copy', label: 'Duplicate', onClick: () => duplicate(row) },
    ];
    const status = row.listing_status || (row.is_published ? 'published' : 'draft');
    if (canSubmitReview && ['draft', 'for_review'].includes(status)) result.push({ icon: 'fa-paper-plane', label: 'Submit for review', onClick: () => lifecycle(row, 'submit-review') });
    if (canPublish && ['for_review', 'draft'].includes(status)) result.push({ icon: 'fa-globe', label: 'Publish', onClick: () => lifecycle(row, 'publish') });
    if (canPublish && status === 'published') result.push({ icon: 'fa-eye-slash', label: 'Unpublish', onClick: () => lifecycle(row, 'unpublish') });
    if (canPublish && !['unavailable', 'archived'].includes(status)) result.push({ icon: 'fa-ban', label: 'Mark unavailable', onClick: () => lifecycle(row, 'unavailable') });
    if (canPublish && status !== 'archived') result.push({ icon: 'fa-box-archive', label: 'Archive', onClick: () => setConfirm({ row, action: 'archive' }) });
    if (canPublish && status === 'archived') result.push({ icon: 'fa-rotate-left', label: 'Restore', onClick: () => lifecycle(row, 'restore') });
    return result;
  };

  return <>
    <Helmet><title>Properties | Alpha Premier Admin</title></Helmet>
    <div className="admin-page-header">
      <div><h1>Properties</h1><p className="admin-muted">Supabase is canonical for all properties, assets, and media.</p></div>
      <div className="admin-header-actions">
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setEditing({})}><i className="fa-solid fa-plus" /> New draft</button>
      </div>
    </div>
    <DataTable
      columns={columns}
      rows={rows}
      search={search}
      onSearch={setSearch}
      loading={loading}
      actions={actions}
      emptyIcon="fa-building"
      emptyTitle="No properties"
      emptySubtitle="Create a draft property to get started"
      filterComponent={<div className="admin-table-filters">
        <select aria-label="Filter property type" value={filterType} onChange={(event) => setFilterType(event.target.value)}><option value="">All types</option>{propertyTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}</select>
        <select aria-label="Filter lifecycle" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}><option value="">All lifecycle states</option>{lifecycleStatuses.map((status) => <option key={status}>{status}</option>)}</select>
        <select aria-label="Filter transaction" value={filterTransaction} onChange={(event) => setFilterTransaction(event.target.value)}><option value="">All transactions</option>{transactionTypes.map((type) => <option key={type.id || type.name} value={type.id}>{type.label || type.name}</option>)}</select>
      </div>}
    />
    {editing !== null && <PropertyEditor row={editing.id ? editing : null} transactionTypes={transactionTypes} onClose={() => setEditing(null)} onSaved={load} toast={toast} />}
    <ConfirmDialog
      open={Boolean(confirm)}
      title="Archive listing"
      message={confirm ? `Archive "${confirm.row.title}"? It will leave public discovery and can be restored.` : ''}
      confirmLabel="Archive"
      onCancel={() => setConfirm(null)}
      onConfirm={async () => {
        try { await lifecycleOffering(confirm.row.id, confirm.action); toast('Listing archived', 'success'); load(); }
        catch (error) { toast(error.message, 'error'); }
        finally { setConfirm(null); }
      }}
    />
  </>;
}
