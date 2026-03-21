import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
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
  if (upper.includes('DELETE') || upper.includes('REJECT')) return '#dc2626';
  if (upper.includes('APPROVE') || upper.includes('CREATE') || upper.includes('REGISTER')) return '#059669';
  if (upper.includes('LOGIN')) return '#7c3aed';
  if (upper.includes('UPDATE') || upper.includes('CHANGE')) return '#d97706';
  return 'var(--primary-color)';
};

const LIMIT = 15;

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchLogs(1, true);
    setPage(1);
  }, [fetchLogs]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchLogs(next, false);
  };

  const refresh = () => {
    setPage(1);
    fetchLogs(1, true);
  };

  // Client-side filter + search on already-loaded logs
  const visible = logs.filter(log => {
    const matchFilter = !filter || log.action?.toUpperCase().includes(filter.toUpperCase());
    const matchSearch = !search || [
      log.action, log.actorRole, log.metadata?.email, log.metadata?.title, String(log.actorUserId)
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // Unique action categories for filter chips
  const categories = [
    { label: 'All', value: '' },
    { label: '➕ Create', value: 'CREATE' },
    { label: '✅ Approve', value: 'APPROVE' },
    { label: '🗑️ Delete', value: 'DELETE' },
    { label: '🔑 Login', value: 'LOGIN' },
    { label: '✏️ Update', value: 'UPDATE' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>Audit Log</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            A complete, immutable record of every action taken on LIU Connect.
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--border-color)',
            background: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
            color: 'var(--text-color)', transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Search + Filter */}
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
                background: filter === cat.value ? 'var(--primary-color)' : '#fff',
                color: filter === cat.value ? '#fff' : 'var(--text-muted)',
                fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        background: '#f8fafc', border: '1px solid var(--border-color)',
        borderRadius: '10px', padding: '12px 20px', marginBottom: '20px',
        display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)'
      }}>
        <span>📋 <strong style={{ color: 'var(--text-color)' }}>{logs.length}</strong> events loaded</span>
        <span>🔍 <strong style={{ color: 'var(--text-color)' }}>{visible.length}</strong> matching filter</span>
        {!hasMore && <span style={{ color: '#059669', fontWeight: '600' }}>✅ All records loaded</span>}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b',
          padding: '12px 16px', borderRadius: '6px', marginBottom: '20px'
        }}>
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
                <tr style={{
                  background: '#f8fafc', borderBottom: '2px solid var(--border-color)',
                  textAlign: 'left'
                }}>
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
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Time */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{getActionIcon(log.action)}</span>
                        <span style={{ fontWeight: '700', color: getActionColor(log.action) }}>
                          {log.action}
                        </span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 9px', borderRadius: '99px',
                        background: '#f1f5f9', color: 'var(--text-muted)',
                        fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px'
                      }}>
                        {log.actorRole?.replace('_', ' ')}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ID: {log.actorUserId}
                      </div>
                    </td>

                    {/* Target / Details */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                        {log.targetType} {log.targetId ? `#${log.targetId}` : ''}
                      </span>
                      {log.metadata?.email && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          📧 {log.metadata.email}
                        </div>
                      )}
                      {log.metadata?.title && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          📌 {log.metadata.title}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={loadMore}
              className="btn-primary"
              style={{ padding: '10px 32px' }}
            >
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
