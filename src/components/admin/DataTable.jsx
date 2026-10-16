import { useState, useMemo } from 'react';
import { ArrowDown, ArrowUp, Pen, Search, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';
import { openOnRowClick } from './rowClick';

const legacyIconMap = {
  'fa-pen': Pen,
  'fa-trash': Trash2,
};

function ActionIcon({ act }) {
  if (act.Icon) {
    const Icon = act.Icon;
    return <Icon className="size-4" aria-hidden="true" />;
  }
  const Fallback = legacyIconMap[act.icon] || Pen;
  return <Fallback className="size-4" aria-hidden="true" />;
}

export default function DataTable({
  columns, rows = [], actions, search, onSearch,
  filterComponent, pageSize = 25,
  sortKey: initialSortKey, sortDir: initialSortDir = 'asc',
  emptyIcon, emptyTitle, emptySubtitle, emptyAction,
  loading, onRowClick,
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
        const cmp = Number.isFinite(av) && Number.isFinite(bv)
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, search, sortKey, sortDir, columns]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  // A narrower filter can leave the old page past the end
  const current = Math.min(page, totalPages - 1);
  const paged = filtered.slice(current * pageSize, (current + 1) * pageSize);

  // The toolbar stays visible for every state, so a search with no matches can be cleared
  const toolbar = (onSearch || filterComponent) && (
    <div className="admin-toolbar">
      {filterComponent}
      <span className="admin-toolbar-spacer" />
      {onSearch && (
        <label className="admin-search">
          <Search size={14} aria-hidden="true" />
          <span className="sr-only">Search table</span>
          <input type="search" className="admin-form-input" placeholder="Search" value={search || ''} onChange={e => { setPage(0); onSearch(e.target.value); }} />
        </label>
      )}
    </div>
  );

  if (loading) {
    return (
      <div>
      {toolbar}
      <div className="admin-table-wrap" aria-busy="true">
        <table className="admin-table">
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}><span className="admin-skeleton" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div>
        {toolbar}
        {search
          ? <EmptyState icon={Search} title="No matches" subtitle={`Nothing matches "${search}".`} action={<button type="button" className="admin-btn admin-btn-secondary" onClick={() => onSearch('')}>Clear search</button>} />
          : <EmptyState icon={emptyIcon} title={emptyTitle} subtitle={emptySubtitle} action={emptyAction} />}
      </div>
    );
  }

  return (
    <div>
      {toolbar}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map(col => {
                const sortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    className={sortable ? 'sortable' : undefined}
                    aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    onClick={sortable ? () => handleSort(col.key) : undefined}
                  >
                    {col.header}
                    {sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ArrowUp size={11} aria-hidden="true" style={{ marginLeft: 4 }} />
                        : <ArrowDown size={11} aria-hidden="true" style={{ marginLeft: 4 }} />
                    )}
                  </th>
                );
              })}
              {actions && <th style={{ width: 1 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={row.id || i}
                className={onRowClick ? 'admin-row-clickable' : undefined}
                onClick={onRowClick ? (e) => openOnRowClick(e, () => onRowClick(row)) : undefined}
              >
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? col.render(row) : (row[col.key] ?? <span className="admin-muted">-</span>)}
                  </td>
                ))}
                {actions && (
                  <td>
                    <div className="admin-row-actions">
                      {actions(row).map((act, j) => (
                        <button key={j} type="button" className={`admin-icon-btn${act.danger ? ' admin-icon-btn-danger' : ''}`}
                          onClick={act.onClick} title={act.label} aria-label={act.label}>
                          <ActionIcon act={act} />
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
          <button disabled={current === 0} onClick={() => setPage(Math.max(0, current - 1))}>Previous</button>
          <span className="tabular-nums">Page {current + 1} of {totalPages} ({filtered.length} total)</span>
          <button disabled={current >= totalPages - 1} onClick={() => setPage(Math.min(totalPages - 1, current + 1))}>Next</button>
        </div>
      )}
    </div>
  );
}
