import { useState, useMemo } from 'react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns, rows = [], actions, search, onSearch,
  filterComponent, pageSize = 25,
  sortKey: initialSortKey, sortDir: initialSortDir = 'asc',
  emptyIcon, emptyTitle, emptySubtitle, emptyAction,
  loading,
}) {
  const [sortKey, setSortKey] = useState(initialSortKey || '');
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [page, setPage] = useState(0);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let data = [...rows];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(row =>
        columns.some(col => String(row[col.key] || '').toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      data.sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, search, sortKey, sortDir, columns]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  if (loading) {
    return <div className="admin-loading-screen"><div className="admin-spinner" /><p>Loading...</p></div>;
  }

  if (!filtered.length) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} action={emptyAction} />;
  }

  return (
    <div>
      <div className="admin-table-toolbar">
        {onSearch && <input type="text" placeholder="Search..." value={search || ''} onChange={e => { setPage(0); onSearch(e.target.value); }} />}
        {filterComponent}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)} style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}>
                  {col.header}
                  {sortKey === col.key && (
                    <i className={`fa-solid ${sortDir === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'}`} style={{ marginLeft: 4, fontSize: 10 }} />
                  )}
                </th>
              ))}
              {actions && <th style={{ width: 1 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {actions && (
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {actions(row).map((act, j) => (
                        <button key={j} className={`admin-btn admin-btn-ghost admin-btn-sm`}
                          onClick={act.onClick} title={act.label}
                          style={act.color ? { color: act.color } : {}}>
                          <i className={`fa-solid ${act.icon}`} />
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="admin-table-pagination">
          <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
          <span>Page {page + 1} of {totalPages} ({filtered.length} total)</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>Next</button>
        </div>
      )}
    </div>
  );
}
