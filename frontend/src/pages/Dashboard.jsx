import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import OpportunityCard from '../components/OpportunityCard';
import '../styles/Layout.css';
import '../styles/Opportunities.css';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, color = 'var(--primary-color)', sub }) => (
  <div style={{
    background: '#fff',
    borderRadius: '14px',
    padding: '20px 24px',
    flex: '1 1 140px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
  >
    <span style={{ fontSize: '1.6rem' }}>{icon}</span>
    <span style={{ fontSize: '2rem', fontWeight: '800', color, lineHeight: 1 }}>{value ?? '—'}</span>
    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    {sub && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</span>}
  </div>
);

const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary-color)' }}>{children}</h2>
    {action}
  </div>
);

const EmptyState = ({ icon, text }) => (
  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
    <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>{icon}</div>
    <p style={{ margin: 0, fontSize: '0.95rem' }}>{text}</p>
  </div>
);

const statusColor = (s) => ({
  PENDING: { bg: '#fef3c7', text: '#d97706' },
  REVIEWED: { bg: '#dbeafe', text: '#2563eb' },
  INTERVIEWING: { bg: '#ede9fe', text: '#7c3aed' },
  ACCEPTED: { bg: '#d1fae5', text: '#059669' },
  REJECTED: { bg: '#fee2e2', text: '#dc2626' },
}[s] || { bg: '#f1f5f9', text: '#64748b' });

// ── Greeting ───────────────────────────────────────────────────────────────────
const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEAD ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const HeadAdminDashboard = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      client('/audit?page=1&limit=5'),
      client('/users'),
      client('/opportunities'),
    ]).then(([logsRes, usersRes, oppsRes]) => {
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value?.data || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);
      if (oppsRes.status === 'fulfilled') setOpps(oppsRes.value || []);
      setLoading(false);
    });
  }, []);

  const roleCount = (role) => users.filter(u => u.role === role).length;
  const actionIcon = (action = '') => {
    if (action.includes('CREATE') || action.includes('REGISTER')) return '➕';
    if (action.includes('DELETE') || action.includes('REJECT')) return '🗑️';
    if (action.includes('APPROVE')) return '✅';
    if (action.includes('LOGIN')) return '🔑';
    if (action.includes('UPDATE') || action.includes('CHANGE')) return '✏️';
    return '📋';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>{greet()}, Administrator 👑</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's a live overview of everything happening on LIU Connect.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard icon="👥" label="Total Users" value={loading ? '…' : users.length} color="#2563eb" />
        <StatCard icon="🎓" label="Students" value={loading ? '…' : roleCount('STUDENT')} color="#7c3aed" />
        <StatCard icon="🏅" label="Alumni" value={loading ? '…' : roleCount('ALUMNI')} color="#059669" />
        <StatCard icon="👨‍🏫" label="Instructors" value={loading ? '…' : roleCount('INSTRUCTOR')} color="#d97706" />
        <StatCard icon="🛡️" label="Admins" value={loading ? '…' : roleCount('ADMIN')} color="#dc2626" />
        <StatCard icon="💼" label="Opportunities" value={loading ? '…' : opps.length} color="#0891b2" />
      </div>

      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        {/* Recent Activity Feed */}
        <div style={{ flex: '1 1 420px' }}>
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/head-admin" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Full Log →
              </Link>
            }>
              🕐 Recent System Activity
            </SectionTitle>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading activity…</p>
            ) : logs.length === 0 ? (
              <EmptyState icon="📭" text="No system activity recorded yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {logs.map((log, i) => (
                  <div key={log.id || i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '14px 0',
                    borderBottom: i < logs.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>{actionIcon(log.action)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-color)' }}>{log.action}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        By <span style={{ fontWeight: '600' }}>{log.actorRole}</span>
                        {log.metadata?.email && ` · ${log.metadata.email}`}
                        {log.metadata?.title && ` · "${log.metadata.title}"`}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* User breakdown */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>👤 User Breakdown</SectionTitle>
            {[
              { role: 'HEAD_ADMIN', label: 'Head Admin', color: '#dc2626', icon: '👑' },
              { role: 'ADMIN', label: 'Admins', color: '#f59e0b', icon: '🛡️' },
              { role: 'INSTRUCTOR', label: 'Instructors', color: '#2563eb', icon: '👨‍🏫' },
              { role: 'ALUMNI', label: 'Alumni', color: '#059669', icon: '🏅' },
              { role: 'STUDENT', label: 'Students', color: '#7c3aed', icon: '🎓' },
            ].map(({ role, label, color, icon }) => {
              const count = roleCount(role);
              const pct = users.length ? Math.round((count / users.length) * 100) : 0;
              return (
                <div key={role} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>{icon} {label}</span>
                    <span style={{ fontWeight: '700', color }}>{count}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>⚡ Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/head-admin" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}>
                ➕ Register Account
              </Link>
              <Link to="/head-admin" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                📋 Full Audit Log
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      client('/users'),
      client('/opportunities'),
    ]).then(([usersRes, oppsRes]) => {
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);
      if (oppsRes.status === 'fulfilled') setOpps(oppsRes.value || []);
      setLoading(false);
    });
  }, []);

  const roleCount = (role) => users.filter(u => u.role === role).length;
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>{greet()}, {user?.name?.split(' ')[0]} 🛡️</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage users, moderate content, and keep LIU Connect running smoothly.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard icon="🎓" label="Students" value={loading ? '…' : roleCount('STUDENT')} color="#7c3aed" />
        <StatCard icon="🏅" label="Alumni" value={loading ? '…' : roleCount('ALUMNI')} color="#059669" />
        <StatCard icon="👨‍🏫" label="Instructors" value={loading ? '…' : roleCount('INSTRUCTOR')} color="#d97706" />
        <StatCard icon="💼" label="Opportunities" value={loading ? '…' : opps.length} color="#0891b2" />
      </div>

      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/admin" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Admin Panel →</Link>
            }>
              🆕 Recently Joined Users
            </SectionTitle>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : recentUsers.length === 0 ? (
              <EmptyState icon="👤" text="No users yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {recentUsers.map((u, i) => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 0',
                    borderBottom: i < recentUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--primary-color), #3b82f6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: '700', fontSize: '0.85rem'
                    }}>
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '99px',
                      background: '#f1f5f9', color: 'var(--text-muted)'
                    }}>
                      {u.role?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>📊 Platform At a Glance</SectionTitle>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Total Users', val: users.length, icon: '👥' },
                { label: 'Active Listings', val: opps.filter(o => o.status !== 'CLOSED').length, icon: '📌' },
                { label: 'Closed Listings', val: opps.filter(o => o.status === 'CLOSED').length, icon: '🔒' },
              ].map(({ label, val, icon }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>{icon} {label}</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{loading ? '…' : val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>⚡ Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/admin" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}>
                🛡️ Admin Panel
              </Link>
              <Link to="/opportunities" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                💼 Browse Opportunities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// INSTRUCTOR (DOCTOR) DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const InstructorDashboard = ({ user }) => {
  const [myOpps, setMyOpps] = useState([]);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      client('/opportunities/mine'),
      client('/alumni/pending'),
      client('/recommendations/mine'),
    ]).then(([oppsRes, alumniRes, recsRes]) => {
      if (oppsRes.status === 'fulfilled') setMyOpps(oppsRes.value || []);
      if (alumniRes.status === 'fulfilled') setPendingAlumni(alumniRes.value || []);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value || []);
      setLoading(false);
    });
  }, []);

  const totalApps = myOpps.reduce((sum, o) => sum + (o._count?.applications || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>{greet()}, Dr. {user?.name?.split(' ')[0]} 👨‍🏫</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your posts, review alumni applications, and write recommendations for students.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard icon="📌" label="My Listings" value={loading ? '…' : myOpps.length} color="#2563eb" />
        <StatCard icon="📥" label="Total Applications" value={loading ? '…' : totalApps} color="#059669" sub="Across all your posts" />
        <StatCard icon="⏳" label="Pending Alumni" value={loading ? '…' : pendingAlumni.length} color="#d97706" sub="Awaiting your approval" />
        <StatCard icon="🌟" label="Recommendations" value={loading ? '…' : recommendations.length} color="#7c3aed" sub="Written by you" />
      </div>

      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        {/* My Opportunity Posts */}
        <div style={{ flex: '1 1 380px' }}>
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/my-opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Manage Posts →</Link>
            }>
              📌 My Opportunity Posts
            </SectionTitle>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
              : myOpps.length === 0 ? <EmptyState icon="📭" text="You haven't posted any opportunities yet." />
                : myOpps.slice(0, 4).map((opp, i) => (
                  <div key={opp.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: i < Math.min(myOpps.length, 4) - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/opportunities/${opp.id}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {opp.title}
                      </Link>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opp.company} · {opp.type}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', marginLeft: '12px', flexShrink: 0 }}>
                      {opp._count?.applications ?? 0} apps
                    </span>
                  </div>
                ))}
          </div>
        </div>

        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pending Alumni */}
          {pendingAlumni.length > 0 && (
            <div className="card" style={{ margin: 0, borderLeft: '4px solid #f59e0b' }}>
              <SectionTitle action={
                <Link to="/alumni-approval" style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: '600', textDecoration: 'none' }}>Review All →</Link>
              }>
                ⚠️ Alumni Awaiting Approval
              </SectionTitle>
              {pendingAlumni.slice(0, 3).map((a, i) => (
                <div key={a.id} style={{ padding: '8px 0', borderBottom: i < Math.min(pendingAlumni.length, 3) - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: '600' }}>{a.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{a.email}</div>
                </div>
              ))}
              {pendingAlumni.length > 3 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>+{pendingAlumni.length - 3} more pending</p>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>⚡ Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/my-opportunities" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}>
                ➕ Post Opportunity
              </Link>
              <Link to="/recommendations" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                🌟 Write Recommendation
              </Link>
              <Link to="/alumni-approval" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem', position: 'relative' }}>
                ✅ Alumni Approvals
                {pendingAlumni.length > 0 && (
                  <span style={{ marginLeft: '6px', background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '99px', fontWeight: '700' }}>{pendingAlumni.length}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ALUMNI DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const AlumniDashboard = ({ user }) => {
  const [myOpps, setMyOpps] = useState([]);
  const [recentOpps, setRecentOpps] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      client('/opportunities/mine'),
      client('/opportunities'),
      client('/opportunities/bookmarks'),
    ]).then(([mineRes, allRes, bkRes]) => {
      if (mineRes.status === 'fulfilled') setMyOpps(mineRes.value || []);
      if (allRes.status === 'fulfilled') setRecentOpps((allRes.value || []).slice(0, 3));
      if (bkRes.status === 'fulfilled') setBookmarks(bkRes.value || []);
      setLoading(false);
    });
  }, []);

  const totalApps = myOpps.reduce((sum, o) => sum + (o._count?.applications || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>{greet()}, {user?.name?.split(' ')[0]} 🏅</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, alumni! Share your network, post opportunities, and support the next generation.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard icon="📌" label="My Posts" value={loading ? '…' : myOpps.length} color="#2563eb" />
        <StatCard icon="📥" label="Applications Received" value={loading ? '…' : totalApps} color="#059669" />
        <StatCard icon="🔖" label="Saved Listings" value={loading ? '…' : bookmarks.length} color="#7c3aed" />
      </div>

      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        {/* My Posts */}
        <div style={{ flex: '1 1 380px' }}>
          <div className="card" style={{ margin: 0, marginBottom: '24px' }}>
            <SectionTitle action={
              <Link to="/my-opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Manage →</Link>
            }>
              📌 My Opportunity Posts
            </SectionTitle>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
              : myOpps.length === 0 ? <EmptyState icon="✨" text="You haven't posted any opportunities. Share your network!" />
                : myOpps.slice(0, 4).map((opp, i) => (
                  <div key={opp.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderBottom: i < Math.min(myOpps.length, 4) - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/opportunities/${opp.id}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {opp.title}
                      </Link>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opp.company}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', marginLeft: '12px', flexShrink: 0 }}>
                      {opp._count?.applications ?? 0} apps
                    </span>
                  </div>
                ))}
          </div>

          {/* Recent listings */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>See All →</Link>
            }>
              🔍 Latest Opportunities
            </SectionTitle>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
              : recentOpps.length === 0 ? <EmptyState icon="📭" text="No opportunities available yet." />
                : <div className="opportunities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', marginTop: '8px' }}>
                  {recentOpps.map(opp => <OpportunityCard key={opp.id} opportunity={opp} mine={false} initialBookmarked={bookmarks.some(b => b.id === opp.id)} />)}
                </div>}
          </div>
        </div>

        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>⚡ Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/my-opportunities" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}>
                ➕ Post Opportunity
              </Link>
              <Link to="/recommendations" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                🌟 View Recommendations
              </Link>
              <Link to="/alumni-directory" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                📒 Alumni Directory
              </Link>
              <Link to="/messages" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                💬 Messages
              </Link>
            </div>
          </div>

          {bookmarks.length > 0 && (
            <div className="card" style={{ margin: 0 }}>
              <SectionTitle action={
                <Link to="/opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>See All →</Link>
              }>
                🔖 Saved Listings
              </SectionTitle>
              {bookmarks.slice(0, 3).map((b, i) => (
                <div key={b.id} style={{ padding: '8px 0', borderBottom: i < Math.min(bookmarks.length, 3) - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '0.88rem' }}>
                  <Link to={`/opportunities/${b.id}`} style={{ fontWeight: '600', color: 'var(--primary-color)', textDecoration: 'none' }}>{b.title}</Link>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{b.company}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const StudentDashboard = ({ user }) => {
  const [recentOpps, setRecentOpps] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      client('/opportunities'),
      client('/opportunities/bookmarks'),
      client('/applications/my-applications'),
      client('/recommendations/for-me'),
    ]).then(([oppsRes, bkRes, appsRes, recsRes]) => {
      if (oppsRes.status === 'fulfilled') setRecentOpps((oppsRes.value || []).slice(0, 3));
      if (bkRes.status === 'fulfilled') {
        const bk = bkRes.value || [];
        setBookmarks(bk);
        setBookmarkedIds(new Set(bk.map(b => b.id)));
      }
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value || []);
      if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value || []);
      setLoading(false);
    });
  }, []);

  const calculateCompletion = () => {
    let score = 25;
    if (user?.major) score += 25;
    if (user?.cvUrl) score += 25;
    if (user?.linkedinUrl) score += 25;
    return score;
  };
  const completion = calculateCompletion();

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>{greet()}, {user?.name?.split(' ')[0]} 🎓</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your applications, explore opportunities, and build your career path.</p>
      </div>

      {/* Profile completion banner */}
      {completion < 100 && (
        <div className="card" style={{
          margin: '0 0 28px 0', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
          border: '1px solid #bfdbfe', boxShadow: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#1d4ed8', fontSize: '1rem' }}>Complete your profile to stand out! ✨</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#3b82f6' }}>
                {completion < 50 ? 'Add your major, CV, and LinkedIn to attract opportunities.' : 'Almost there! Just a few more details to reach 100%.'}
              </p>
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1d4ed8' }}>{completion}%</span>
          </div>
          <div style={{ background: '#dbeafe', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${completion}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
          </div>
          <Link to="/profile" style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.85rem', color: '#1d4ed8', fontWeight: '700', textDecoration: 'none' }}>
            Update Profile →
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard icon="📝" label="Applications" value={loading ? '…' : applications.length} color="#2563eb" />
        <StatCard icon="🔖" label="Saved Jobs" value={loading ? '…' : bookmarks.length} color="#7c3aed" />
        <StatCard icon="🌟" label="Recommendations" value={loading ? '…' : recommendations.length} color="#059669" sub="From instructors" />
        <StatCard icon="👤" label="Profile" value={`${completion}%`} color={completion === 100 ? '#059669' : '#d97706'} sub="Completion" />
      </div>

      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        {/* Left: Opportunities + Application Tracker */}
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Latest Opportunities */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Browse All →</Link>
            }>
              🔍 Latest Opportunities
            </SectionTitle>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
              : recentOpps.length === 0 ? <EmptyState icon="📭" text="No opportunities posted yet." />
                : <div className="opportunities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', marginTop: '8px' }}>
                  {recentOpps.map(opp => <OpportunityCard key={opp.id} opportunity={opp} mine={false} initialBookmarked={bookmarkedIds.has(opp.id)} />)}
                </div>}
          </div>

          {/* Application Tracker */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Find More →</Link>
            }>
              📋 Application Tracker
            </SectionTitle>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
              : applications.length === 0 ? <EmptyState icon="🚀" text="No applications yet. Start exploring jobs!" />
                : applications.map((app, i) => {
                  const sc = statusColor(app.status);
                  return (
                    <div key={app.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 0', borderBottom: i < applications.length - 1 ? '1px solid var(--border-color)' : 'none',
                      borderLeft: `3px solid ${sc.text}`, paddingLeft: '12px'
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <Link to={`/opportunities/${app.opportunity?.id}`} style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary-color)', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {app.opportunity?.title}
                        </Link>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.opportunity?.company}</span>
                      </div>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: '700', padding: '3px 9px', borderRadius: '99px',
                        background: sc.bg, color: sc.text, marginLeft: '12px', flexShrink: 0
                      }}>
                        {app.status}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Right side */}
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recommendations */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/recommendations" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>View All →</Link>
            }>
              🌟 My Recommendations
            </SectionTitle>
            {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
              : recommendations.length === 0 ? <EmptyState icon="📝" text="No recommendations yet. Impress your instructors!" />
                : recommendations.slice(0, 3).map((rec, i) => (
                  <div key={rec.id} style={{ padding: '10px 0', borderBottom: i < Math.min(recommendations.length, 3) - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-color)', marginBottom: '4px' }}>
                      "{rec.content?.length > 80 ? rec.content.slice(0, 80) + '…' : rec.content}"
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— {rec.instructor?.name || 'Instructor'}</div>
                  </div>
                ))}
          </div>

          {/* Saved opportunities */}
          {bookmarks.length > 0 && (
            <div className="card" style={{ margin: 0 }}>
              <SectionTitle action={
                <Link to="/opportunities" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>See All →</Link>
              }>
                🔖 Saved Jobs
              </SectionTitle>
              {bookmarks.slice(0, 3).map((b, i) => (
                <div key={b.id} style={{ padding: '8px 0', borderBottom: i < Math.min(bookmarks.length, 3) - 1 ? '1px solid var(--border-color)' : 'none', fontSize: '0.88rem' }}>
                  <Link to={`/opportunities/${b.id}`} style={{ fontWeight: '600', color: 'var(--primary-color)', textDecoration: 'none' }}>{b.title}</Link>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{b.company}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>⚡ Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/opportunities" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}>
                🔍 Find Opportunities
              </Link>
              <Link to="/profile" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                👤 Update Profile
              </Link>
              <Link to="/alumni-directory" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                📒 Alumni Directory
              </Link>
              <Link to="/messages" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>
                💬 Messages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT DASHBOARD — routes to correct sub-dashboard by role
// ═══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'HEAD_ADMIN': return <HeadAdminDashboard user={user} />;
    case 'ADMIN':      return <AdminDashboard user={user} />;
    case 'INSTRUCTOR': return <InstructorDashboard user={user} />;
    case 'ALUMNI':     return <AlumniDashboard user={user} />;
    case 'STUDENT':
    default:           return <StudentDashboard user={user} />;
  }
};

export default Dashboard;
