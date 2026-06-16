import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { ListSkeleton } from '../../components/Skeleton';
import { timeAgo } from '../../utils/dateUtils';
import StatCard from './shared/StatCard';
import ChartCard from './shared/ChartCard';
import SectionTitle from './shared/SectionTitle';
import DashboardEmptyState from './shared/DashboardEmptyState';
import { CHART_COLORS, chartTooltipStyle, greet } from './shared/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

// ── Action icon mapping ────────────────────────────────────────────────────────
const actionIcon = (action = '') => {
  if (action.includes('CREATE') || action.includes('REGISTER')) return '➕';
  if (action.includes('DELETE') || action.includes('REJECT')) return '🗑️';
  if (action.includes('APPROVE')) return '✅';
  if (action.includes('LOGIN')) return '🔑';
  if (action.includes('UPDATE') || action.includes('CHANGE')) return '✏️';
  return '📋';
};

// ── Role badge color mapping ───────────────────────────────────────────────────
const roleBadgeColor = (role) => ({
  HEAD_ADMIN: { bg: 'rgba(220,38,38,0.15)', text: '#ef4444' },
  ADMIN:      { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
  INSTRUCTOR: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  ALUMNI:     { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  STUDENT:    { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
}[role] || { bg: 'rgba(255,255,255,0.05)', text: '#94a3b8' });

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client('/dashboard/admin-stats')
      .then(data => setStats(data))
      .catch(err => console.error('Admin stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>{greet()}, {user?.name || 'Admin'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage users, moderate content, and keep the platform running smoothly.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ flex: '1 1 140px', height: '110px', background: 'rgba(255,255,255,0.07)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.10)' }} />
          ))}
        </div>
        <ListSkeleton />
        <ListSkeleton />
        <ListSkeleton />
      </div>
    );
  }

  // ── Prep data ──────────────────────────────────────────────────────────────
  const roleData = [
    { name: 'Students',    value: stats?.usersByRole?.STUDENT || 0,    color: '#7c3aed' },
    { name: 'Alumni',      value: stats?.usersByRole?.ALUMNI || 0,      color: '#10b981' },
    { name: 'Instructors', value: stats?.usersByRole?.INSTRUCTOR || 0,  color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const healthData = [
    { name: 'Active',       value: stats?.opportunityHealth?.active || 0,      color: '#10b981' },
    { name: 'Closing Soon', value: stats?.opportunityHealth?.closingSoon || 0, color: '#f59e0b' },
    { name: 'Expired',      value: stats?.opportunityHealth?.expired || 0,     color: '#ef4444' },
  ];

  const growthData = (stats?.userGrowthByMonth || []).map(d => ({
    month: d.month.length > 5 ? d.month.slice(5) : d.month,
    count: d.count,
  }));

  const funnelData = stats?.applicationFunnel
    ? [
        { name: 'Total Applications', value: stats.applicationFunnel.total,    color: '#3b82f6' },
        { name: 'Reviewed',           value: stats.applicationFunnel.reviewed, color: '#7c3aed' },
        { name: 'Accepted',           value: stats.applicationFunnel.accepted, color: '#10b981' },
      ]
    : [];

  const recentUsers = stats?.recentUsers || [];
  const recentLogs = stats?.recentAuditLogs || [];
  const topOpp = stats?.topOpportunity;

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>
          {greet()}, {user?.name || 'Admin'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage users, moderate content, and keep the platform running smoothly.
        </p>
      </div>

      {/* ── Metrics Row ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard icon="👥" label="Total Users" value={stats?.totalUsers ?? 0} color="#2563eb" />
        <StatCard icon="🎓" label="Students" value={stats?.usersByRole?.STUDENT || 0} color="#7c3aed" />
        <StatCard icon="🏅" label="Alumni" value={stats?.usersByRole?.ALUMNI || 0} color="#059669" />
        <StatCard icon="👨‍🏫" label="Instructors" value={stats?.usersByRole?.INSTRUCTOR || 0} color="#d97706" />
        <StatCard icon="💼" label="Active Opportunities" value={stats?.opportunityHealth?.active || 0} color="#0891b2" />
        <StatCard
          icon="⚠️"
          label="Pending Actions"
          value={stats?.pendingAlumniCount || 0}
          color="#dc2626"
          sub="Alumni to review"
          onClick={() => navigate('/alumni-approval')}
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '36px' }}>

        {/* Pie — Role Distribution */}
        <ChartCard title="🎯 Role Distribution" style={{ flex: '1 1 280px' }}>
          {roleData.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>No users yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {roleData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Bar — Opportunity Health */}
        <ChartCard title="📌 Opportunity Health" style={{ flex: '1 1 340px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={healthData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {healthData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Area — User Growth */}
        <ChartCard title="📈 User Growth" style={{ flex: '2 1 400px' }}>
          {growthData.length < 2 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>Not enough data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="adminAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...chartTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#adminAreaGrad)"
                  dot={{ fill: '#f97316', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>

      {/* ── Application Funnel ──────────────────────────────────────────────── */}
      {funnelData.length > 0 && funnelData[0].value > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <ChartCard title="🔻 Application Funnel">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnelData} barSize={56} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} label={{ position: 'right', fill: '#e2e8f0', fontSize: 13, fontWeight: 700 }}>
                  {funnelData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── Top Opportunity ─────────────────────────────────────────────────── */}
      {topOpp && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '14px',
            padding: '20px 24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ fontSize: '2.2rem' }}>🏆</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.4)',
                margin: '0 0 6px 0',
              }}>
                Top Opportunity
              </p>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#f8fafc', marginBottom: '2px' }}>
                {topOpp.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {topOpp.company}
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '12px',
              padding: '10px 18px',
              flexShrink: 0,
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f59e0b', lineHeight: 1 }}>
                {topOpp.applicationCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600, marginTop: '2px' }}>
                Applications
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>

        {/* Left Column: Recent Users + Audit Activity */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Recently Joined Users */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/admin" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Admin Panel →
              </Link>
            }>
              🆕 Recently Joined Users
            </SectionTitle>

            {recentUsers.length === 0 ? (
              <DashboardEmptyState icon="👤" text="No users have joined yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {recentUsers.map((u, i) => {
                  const badge = roleBadgeColor(u.role);
                  return (
                    <div key={u.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 0',
                      borderBottom: i < recentUsers.length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary-color), #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                      }}>
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '99px',
                        background: badge.bg,
                        color: badge.text,
                        letterSpacing: '0.03em',
                        flexShrink: 0,
                      }}>
                        {u.role?.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, minWidth: '50px', textAlign: 'right' }}>
                        {timeAgo(u.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Audit Activity */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/audit-log" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Full Log →
              </Link>
            }>
              🕐 Recent Audit Activity
            </SectionTitle>

            {recentLogs.length === 0 ? (
              <DashboardEmptyState icon="📭" text="No system activity recorded yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {recentLogs.map((log, i) => (
                  <div key={log.id || i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 0',
                    borderBottom: i < recentLogs.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>
                      {actionIcon(log.action)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#e2e8f0' }}>
                        {log.action}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                        By <span style={{ fontWeight: '600', color: '#cbd5e1' }}>{log.actorRole}</span>
                        {log.metadata?.email && <span style={{ color: '#94a3b8' }}> · {log.metadata.email}</span>}
                        {log.metadata?.title && <span style={{ color: '#94a3b8' }}> · "{log.metadata.title}"</span>}
                        {log.metadata?.name && !log.metadata?.email && <span style={{ color: '#94a3b8' }}> · {log.metadata.name}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0, textAlign: 'right', minWidth: '60px' }}>
                      {timeAgo(log.timestamp || log.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Quick Actions */}
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Quick Actions */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>⚡ Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/admin" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px' }}>
                🛡️ Admin Panel
              </Link>
              <Link to="/opportunities" style={{
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontWeight: '600',
                fontSize: '0.9rem',
              }}>
                💼 Browse Opportunities
              </Link>
              <Link to="/messages" style={{
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontWeight: '600',
                fontSize: '0.9rem',
                position: 'relative',
              }}>
                💬 Messages
                {(stats?.unreadMessages || 0) > 0 && (
                  <span style={{
                    marginLeft: '6px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: '99px',
                    fontWeight: '700',
                  }}>
                    {stats.unreadMessages}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Platform At a Glance */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>📊 Platform At a Glance</SectionTitle>
            <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Total Users',     val: stats?.totalUsers ?? 0,                       icon: '👥' },
                { label: 'Active Listings',  val: stats?.opportunityHealth?.active || 0,        icon: '📌' },
                { label: 'Closing Soon',     val: stats?.opportunityHealth?.closingSoon || 0,   icon: '⏰' },
                { label: 'Expired',          val: stats?.opportunityHealth?.expired || 0,       icon: '🔒' },
                { label: 'Total Apps',       val: stats?.applicationFunnel?.total || 0,         icon: '📝' },
              ].map(({ label, val, icon }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <span>{icon} {label}</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
