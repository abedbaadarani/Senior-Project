import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { timeAgo, formatDateTime } from '../utils/dateUtils';
import '../styles/Layout.css';

const ACTION_ICONS = {
  CREATE: '➕', REGISTER: '➕',
  DELETE: '🗑️', REJECT: '🗑️',
  APPROVE: '✅',
  LOGIN: '🔑',
  UPDATE: '✏️', CHANGE: '✏️',
};

const getActionIcon = (action = '') => {
  const upper = action.toUpperCase();
  for (const [key, icon] of Object.entries(ACTION_ICONS)) {
    if (upper.includes(key)) return icon;
  }
  return '📋';
};

const getActionColor = (action = '') => {
  const upper = action.toUpperCase();
  if (upper.includes('DELETE') || upper.includes('REJECT')) return '#f87171';
  if (upper.includes('APPROVE') || upper.includes('CREATE') || upper.includes('REGISTER')) return '#34d399';
  if (upper.includes('LOGIN')) return '#a78bfa';
  if (upper.includes('UPDATE') || upper.includes('CHANGE')) return '#fbbf24';
  return 'var(--primary-color)';
};

const LIMIT = 15;

const categories = [
  { label: 'All',      value: '' },
  { label: '➕ Create',  value: 'CREATE'  },
  { label: '✅ Approve', value: 'APPROVE' },
  { label: '🗑️ Delete',  value: 'DELETE'  },
  { label: '🔑 Login',   value: 'LOGIN'   },
  { label: '✏️ Update',  value: 'UPDATE'  },
];

const AuditLog = () => {
  const { showToast } = useToast();
  const [logs, setLogs]       = useState([]);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('');
  const [search, setSearch]   = useState('');

  const fetchLogs = useCallback(async (pageNum, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client(`/audit?page=${pageNum}&limit=${LIMIT}`);
      const data = res?.data || [];
      setLogs(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === LIMIT);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1, true); setPage(1); }, [fetchLogs]);

  const loadMore = () => { const next = page + 1; setPage(next); fetchLogs(next, false); };
  const refresh  = () => { setPage(1); fetchLogs(1, true); showToast('Audit log refreshed.', 'info'); };

  const visible = logs.filter(log => {
    const matchFilter = !filter || log.action?.toUpperCase().includes(filter.toUpperCase());
    const matchSearch = !search || [
      log.action, log.actorRole, log.metadata?.email, log.metadata?.title, String(log.actorUserId)
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const exportCSV = () => {
    if (!visible.length) { showToast('No logs to export.', 'warning'); return; }
    const headers = ['Time', 'Action', 'Actor Role', 'Actor ID', 'Target', 'Target ID', 'Email', 'Title'];
    const rows = visible.map(log => [
      formatDateTime(log.timestamp),
      log.action,
      log.actorRole,
      log.actorUserId,
      log.targetType,
      log.targetId,
      log.metadata?.email || '',
      log.metadata?.title || '',
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${visible.length} log entries.`, 'success');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>Audit Log</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            A complete, immutable record of every admin action on LIU Connect.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={exportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 18px', borderRadius: '8px',
              border: '1px solid rgba(16,185,129,0.35)',
              background: 'rgba(16,185,129,0.08)', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.88rem', color: '#34d399',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={refresh}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 18px', borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-color)',
              transition: 'background 0.2s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-color)'}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search + Filter chips */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by action, role, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px', marginBottom: 0 }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              style={{
                padding: '6px 14px', borderRadius: '99px', border: '1px solid',
                borderColor: filter === cat.value ? 'var(--primary-color)' : 'var(--border-color)',
                background: filter === cat.value ? 'var(--primary-color)' : 'transparent',
                color: filter === cat.value ? '#fff' : 'var(--text-muted)',
                fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
        borderRadius: '10px', padding: '12px 20px', marginBottom: '20px',
        display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)'
      }}>
        <span>📋 <strong style={{ color: 'var(--text-color)' }}>{logs.length}</strong> events loaded</span>
        <span>🔍 <strong style={{ color: 'var(--text-color)' }}>{visible.length}</strong> matching filter</span>
        {!hasMore && <span style={{ color: '#34d399', fontWeight: '600' }}>✅ All records loaded</span>}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444', color: '#f87171', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Log Table */}
      <div className="card" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {loading && logs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
            <p style={{ margin: 0 }}>Loading audit logs…</p>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
            <p style={{ margin: 0 }}>No events match your current filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  {['Time', 'Action', 'Actor', 'Target / Details'].map(col => (
                    <th key={col} style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((log, i) => (
                  <tr
                    key={log.id || i}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Time */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.85rem' }}>
                        {timeAgo(log.timestamp)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatDateTime(log.timestamp)}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.05rem' }}>{getActionIcon(log.action)}</span>
                        <span style={{ fontWeight: '700', color: getActionColor(log.action) }}>
                          {log.action}
                        </span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 9px', borderRadius: '99px',
                        background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                        fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px',
                      }}>
                        {log.actorRole?.replace('_', ' ')}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {log.actorUserId}</div>
                    </td>

                    {/* Target / Details */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                        {log.targetType} {log.targetId ? `#${log.targetId}` : ''}
                      </span>
                      {log.metadata?.email && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📧 {log.metadata.email}</div>
                      )}
                      {log.metadata?.title && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📌 {log.metadata.title}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasMore && !loading && (
          <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={loadMore} className="btn-primary" style={{ padding: '10px 32px' }}>
              Load More Events
            </button>
          </div>
        )}

        {loading && logs.length > 0 && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)' }}>
            Loading more…
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
