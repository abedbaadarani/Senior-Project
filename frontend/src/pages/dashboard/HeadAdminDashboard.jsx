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

// ─── Action icon mapping ────────────────────────────────────────────────────
const actionIcon = (action = '') => {
  if (action.includes('CREATE') || action.includes('REGISTER')) return '➕';
  if (action.includes('DELETE') || action.includes('REJECT')) return '🗑️';
  if (action.includes('APPROVE')) return '✅';
  if (action.includes('LOGIN')) return '🔑';
  if (action.includes('UPDATE') || action.includes('CHANGE')) return '✏️';
  return '📋';
};

// ─── Alert icon by type ─────────────────────────────────────────────────────
const alertIcon = (type = '') => {
  if (type === 'warning') return { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' };
  if (type === 'error') return { icon: '🛑', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' };
  if (type === 'success') return { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.10)' };
  return { icon: 'ℹ️', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' };
};

// ─── Role badge colors ──────────────────────────────────────────────────────
const roleBadge = (role) => ({
  HEAD_ADMIN: { bg: 'rgba(220,38,38,0.15)', color: '#ef4444', label: 'Head Admin' },
  ADMIN: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', label: 'Admin' },
  INSTRUCTOR: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Instructor' },
  ALUMNI: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Alumni' },
  STUDENT: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Student' },
}[role] || { bg: 'rgba(255,255,255,0.05)', color: '#94a3b8', label: role });

// ─── Top contributor medal ──────────────────────────────────────────────────
const medal = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

// ─── Health score color ─────────────────────────────────────────────────────
const healthColor = (score) => {
  if (score > 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

// ─── Platform Health Gauge (SVG) ────────────────────────────────────────────
const HealthGauge = ({ score = 0 }) => {
  const color = healthColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '14px',
      padding: '20px 24px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '160px',
      flex: '0 0 auto',
    }}>
      <p style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', margin: '0 0 12px 0',
      }}>
        Platform Health
      </p>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle
          cx="65" cy="65" r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
        />
        <circle
          cx="65" cy="65" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.4s ease' }}
        />
        <text x="65" y="60" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: '2rem', fontWeight: 800, fill: color }}>
          {score}
        </text>
        <text x="65" y="82" textAnchor="middle"
          style={{ fontSize: '0.65rem', fontWeight: 600, fill: 'rgba(255,255,255,0.35)' }}>
          / 100
        </text>
      </svg>
    </div>
  );
};

// ─── Mini Sparkline ─────────────────────────────────────────────────────────
const MiniSparkline = ({ data = [], color = '#fff' }) => {
  if (!data || data.length < 2) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 0, right: 0, width: '60px', height: '30px', opacity: 0.3,
      pointerEvents: 'none',
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone" dataKey="count" stroke={color} strokeWidth={1.5}
            fill={`url(#spark-${color.replace('#', '')})`} dot={false} isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// HEAD ADMIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const HeadAdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersModalFilter, setUsersModalFilter] = useState(null);
  const [usersModalSearch, setUsersModalSearch] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const navigate = useNavigate();

  const USERS_PER_PAGE = 20;

  useEffect(() => {
    Promise.allSettled([
      client('/dashboard/head-admin-stats'),
      client('/users'),
    ]).then(([statsRes, usersRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);
      setLoading(false);
    });
  }, []);

  // ── Sparkline data from userGrowthByMonth ──
  const sparkData = (stats?.userGrowthByMonth || []).map(m => ({ count: m.count || 0 }));

  // ── Opportunity type data for pie chart ──
  const oppTypeData = stats?.opportunityHealth?.byType
    ? Object.entries(stats.opportunityHealth.byType).map(([name, value]) => ({ name, value }))
    : [];

  // ── Users by role for bar chart ──
  const roleBarData = stats?.usersByRole ? [
    { role: 'Students', count: stats.usersByRole.STUDENT || 0 },
    { role: 'Alumni', count: stats.usersByRole.ALUMNI || 0 },
    { role: 'Instructors', count: stats.usersByRole.INSTRUCTOR || 0 },
    { role: 'Admins', count: stats.usersByRole.ADMIN || 0 },
  ] : [];

  // ── Area chart data ──
  const growthData = (stats?.userGrowthByMonth || []).map(m => ({
    month: m.month || m.label || '',
    count: m.count || 0,
  }));

  // ── Opportunity pipeline ──
  const pipeline = stats?.opportunityPipeline || {};

  // ── User breakdown from stats ──
  const breakdownRoles = [
    { role: 'HEAD_ADMIN', label: 'Head Admin', color: '#dc2626', icon: '👑' },
    { role: 'ADMIN', label: 'Admins', color: '#f59e0b', icon: '🛡️' },
    { role: 'INSTRUCTOR', label: 'Instructors', color: '#2563eb', icon: '👨‍🏫' },
    { role: 'ALUMNI', label: 'Alumni', color: '#059669', icon: '🏅' },
    { role: 'STUDENT', label: 'Students', color: '#7c3aed', icon: '🎓' },
  ];

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>{greet()}, Administrator 👑</h1>
          <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ListSkeleton />
          <ListSkeleton />
          <ListSkeleton />
          <ListSkeleton />
          <ListSkeleton />
        </div>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>
          {greet()}, Administrator 👑
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Here's a live overview of everything happening on LIU Connect.
        </p>
      </div>

      {/* ── Pending Approvals Alert ── */}
      {stats?.pendingAlumniCount > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>{'⚠️'}</span>
            <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fbbf24' }}>
              {stats.pendingAlumniCount} alumni pending approval
            </span>
          </div>
          <Link to="/alumni-approval" style={{
            fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Review Now {'→'}
          </Link>
        </div>
      )}

      {/* ── Platform Health + KPI Stat Cards Row ── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px', alignItems: 'stretch' }}>
        {/* Health Gauge */}
        <HealthGauge score={stats?.platformHealthScore ?? 0} />

        {/* Stat cards */}
        <div style={{ flex: 1, display: 'flex', gap: '14px', flexWrap: 'wrap', minWidth: 0 }}>
          <StatCard
            icon="👥"
            label="Total Users"
            value={totalUsers}
            color="#2563eb"
            onClick={() => { setUsersModalFilter('ALL'); setUsersPage(1); setUsersModalSearch(''); }}
          >
            <MiniSparkline data={sparkData} color="#2563eb" />
          </StatCard>
          <StatCard
            icon="🎓"
            label="Students"
            value={stats?.usersByRole?.STUDENT ?? 0}
            color="#7c3aed"
            onClick={() => { setUsersModalFilter('STUDENT'); setUsersPage(1); setUsersModalSearch(''); }}
          >
            <MiniSparkline data={sparkData} color="#7c3aed" />
          </StatCard>
          <StatCard
            icon="🏅"
            label="Alumni"
            value={stats?.usersByRole?.ALUMNI ?? 0}
            color="#059669"
            onClick={() => { setUsersModalFilter('ALUMNI'); setUsersPage(1); setUsersModalSearch(''); }}
          >
            <MiniSparkline data={sparkData} color="#059669" />
          </StatCard>
          <StatCard
            icon="👨‍🏫"
            label="Instructors"
            value={stats?.usersByRole?.INSTRUCTOR ?? 0}
            color="#d97706"
            onClick={() => { setUsersModalFilter('INSTRUCTOR'); setUsersPage(1); setUsersModalSearch(''); }}
          >
            <MiniSparkline data={sparkData} color="#d97706" />
          </StatCard>
          <StatCard
            icon="🛡️"
            label="Admins"
            value={stats?.usersByRole?.ADMIN ?? 0}
            color="#dc2626"
            onClick={() => { setUsersModalFilter('ADMIN'); setUsersPage(1); setUsersModalSearch(''); }}
          >
            <MiniSparkline data={sparkData} color="#dc2626" />
          </StatCard>
          <StatCard
            icon="💼"
            label="Opportunities"
            value={stats?.opportunityHealth?.total ?? 0}
            color="#0891b2"
          />
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '36px' }}>
        {/* Bar Chart: Users by Role */}
        {roleBarData.length > 0 && (
          <ChartCard title="👥 Users by Role" style={{ flex: '1 1 340px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roleBarData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="role" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {['#f97316', '#10b981', '#6366f1', '#dc2626'].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Pie Chart: Opportunity Types */}
        <ChartCard title="💼 Opportunity Types" style={{ flex: '1 1 280px' }}>
          {oppTypeData.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>
              No opportunity data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={oppTypeData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={70} paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: '10px', fill: '#94a3b8' }}
                >
                  {oppTypeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Area Chart: User Registrations Over Time */}
        <ChartCard title="📈 User Registrations Over Time" style={{ flex: '2 1 400px' }}>
          {growthData.length < 2 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>
              Not enough data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="headAdminAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...chartTooltipStyle} />
                <Area
                  type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2}
                  fill="url(#headAdminAreaGrad)" dot={{ fill: '#f97316', r: 3 }} activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Opportunity Pipeline ── */}
      {(pipeline.active != null || pipeline.expiring != null || pipeline.expired != null) && (
        <div style={{ marginBottom: '36px' }}>
          <SectionTitle>{'🔄'} Opportunity Pipeline</SectionTitle>
          <div style={{
            display: 'flex', gap: '0', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {/* Active */}
            <div style={{
              background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '14px', padding: '24px 32px', textAlign: 'center', flex: '1 1 180px', minWidth: '160px',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>{'🟢'}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{pipeline.active ?? 0}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</div>
            </div>
            {/* Arrow */}
            <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.15)', padding: '0 12px', flexShrink: 0 }}>{'➡'}</div>
            {/* Expiring */}
            <div style={{
              background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '14px', padding: '24px 32px', textAlign: 'center', flex: '1 1 180px', minWidth: '160px',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>{'🟡'}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{pipeline.expiring ?? 0}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiring</div>
            </div>
            {/* Arrow */}
            <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.15)', padding: '0 12px', flexShrink: 0 }}>{'➡'}</div>
            {/* Expired */}
            <div style={{
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '14px', padding: '24px 32px', textAlign: 'center', flex: '1 1 180px', minWidth: '160px',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '4px' }}>{'🔴'}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{pipeline.expired ?? 0}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expired</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Contributors ── */}
      {stats?.topContributors && stats.topContributors.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <SectionTitle>{'🏆'} Top Contributors</SectionTitle>
          <div style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '14px', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Rank</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Name</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Role</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Posts</th>
                </tr>
              </thead>
              <tbody>
                {stats.topContributors.map((c, i) => {
                  const rank = i + 1;
                  const rb = roleBadge(c.role);
                  return (
                    <tr key={c.id || i} style={{
                      borderBottom: i < stats.topContributors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontSize: rank <= 3 ? '1.3rem' : '0.9rem', fontWeight: 700 }}>
                        {medal(rank)}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#f8fafc' }}>
                        {c.name}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
                          background: rb.bg, color: rb.color, fontSize: '0.72rem', fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}>
                          {rb.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 700, color: '#f97316', fontSize: '1rem' }}>
                        {c.posts ?? c.count ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── System Alerts ── */}
      {stats?.systemAlerts && stats.systemAlerts.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <SectionTitle>{'🔔'} System Alerts</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.systemAlerts.map((al, i) => {
              const ai = alertIcon(al.type);
              const content = (
                <div key={i} style={{
                  background: ai.bg, border: `1px solid ${ai.color}33`,
                  borderRadius: '12px', padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: al.link ? 'pointer' : 'default',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                  onClick={() => al.link && navigate(al.link)}
                  onMouseEnter={e => { if (al.link) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{ai.icon}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e2e8f0', flex: 1 }}>
                    {al.message}
                  </span>
                  {al.link && (
                    <span style={{ fontSize: '0.8rem', color: ai.color, fontWeight: 600, flexShrink: 0 }}>{'→'}</span>
                  )}
                </div>
              );
              return content;
            })}
          </div>
        </div>
      )}

      {/* ── Bottom: Activity + Sidebar ── */}
      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
        {/* Recent System Activity */}
        <div style={{ flex: '1 1 420px' }}>
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/audit-log" style={{
                fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                View Full Log {'→'}
              </Link>
            }>
              {'🕐'} Recent System Activity
            </SectionTitle>

            {!stats?.recentAuditLogs || stats.recentAuditLogs.length === 0 ? (
              <DashboardEmptyState icon="📭" text="No system activity recorded yet." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {stats.recentAuditLogs.slice(0, 5).map((log, i) => (
                  <div key={log.id || i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '14px 0',
                    borderBottom: i < Math.min(stats.recentAuditLogs.length, 5) - 1 ? '1px solid var(--border-color)' : 'none',
                  }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: '2px' }}>
                      {actionIcon(log.action)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                        {log.action}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        By <span style={{ fontWeight: '600' }}>{log.actorRole}</span>
                        {log.metadata?.email && ` · ${log.metadata.email}`}
                        {log.metadata?.title && ` · "${log.metadata.title}"`}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right', minWidth: '60px' }}>
                      {timeAgo(log.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* User Breakdown */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>{'👤'} User Breakdown</SectionTitle>
            {breakdownRoles.map(({ role, label, color, icon }) => {
              const count = stats?.usersByRole?.[role] || (role === 'HEAD_ADMIN' ? 1 : 0);
              const pct = totalUsers ? Math.round((count / totalUsers) * 100) : 0;
              return (
                <div key={role} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>{icon} {label}</span>
                    <span style={{ fontWeight: '700', color }}>{count}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', background: color,
                      borderRadius: '99px', transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>{'⚡'} Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/head-admin" className="btn-primary" style={{
                textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px',
              }}>
                {'➕'} Register Account
              </Link>
              <Link to="/audit-log" className="btn-primary" style={{
                textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px',
              }}>
                {'📋'} Full Audit Log
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Users Modal ── */}
      {usersModalFilter && (() => {
        let filteredUsers = usersModalFilter === 'ALL'
          ? users
          : users.filter(u => u.role === usersModalFilter);

        if (usersModalSearch.trim()) {
          const lower = usersModalSearch.toLowerCase();
          filteredUsers = filteredUsers.filter(u =>
            (u.name && u.name.toLowerCase().includes(lower)) ||
            (u.email && u.email.toLowerCase().includes(lower)) ||
            (u.universityId && u.universityId.toLowerCase().includes(lower))
          );
        }

        const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
        const pagedUsers = filteredUsers.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);

        const titleMap = {
          ALL: '👥 Total Registered Users',
          STUDENT: '🎓 Registered Students',
          ALUMNI: '🏅 Registered Alumni',
          INSTRUCTOR: '👨‍🏫 Registered Instructors',
          ADMIN: '🛡️ System Admins',
        };

        const tabs = ['ALL', 'STUDENT', 'ALUMNI', 'INSTRUCTOR', 'ADMIN'];

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
            onClick={(e) => { if (e.target === e.currentTarget) { setUsersModalFilter(null); setUsersModalSearch(''); } }}
          >
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px',
              width: '100%', maxWidth: '860px',
              maxHeight: '85vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              overflow: 'hidden',
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b',
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc' }}>
                    {titleMap[usersModalFilter]}
                  </h2>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {filteredUsers.length} members found
                  </span>
                </div>
                <button
                  onClick={() => { setUsersModalFilter(null); setUsersModalSearch(''); }}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#f8fafc',
                    width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  {'✕'}
                </button>
              </div>

              {/* Role filter tabs */}
              <div style={{
                padding: '12px 32px', background: 'rgba(15,23,42,0.8)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', gap: '6px', flexWrap: 'wrap',
              }}>
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setUsersModalFilter(tab); setUsersPage(1); }}
                    style={{
                      padding: '6px 14px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700,
                      letterSpacing: '0.04em', cursor: 'pointer', transition: 'all 0.2s',
                      border: usersModalFilter === tab ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                      background: usersModalFilter === tab ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                      color: usersModalFilter === tab ? '#f97316' : '#94a3b8',
                    }}
                  >
                    {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ padding: '16px 32px', background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <input
                  type="text"
                  placeholder={`🔍 Search ${filteredUsers.length} users by name, email, or ID...`}
                  value={usersModalSearch}
                  onChange={e => { setUsersModalSearch(e.target.value); setUsersPage(1); }}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc', outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Table */}
              <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '16px 32px', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Name / Email</th>
                      <th style={{ padding: '16px 32px', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Role</th>
                      <th style={{ padding: '16px 32px', textAlign: 'left', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: '#0f172a' }}>
                    {pagedUsers.map(u => {
                      const rb = roleBadge(u.role);
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '16px 32px' }}>
                            <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.95rem', marginBottom: '4px' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '16px 32px' }}>
                            <span style={{
                              display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
                              background: rb.bg, border: `1px solid ${rb.color}33`,
                              color: rb.color, fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em',
                            }}>
                              {rb.label}
                            </span>
                          </td>
                          <td style={{ padding: '16px 32px', color: '#94a3b8', fontSize: '0.85rem' }}>
                            {timeAgo(u.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {pagedUsers.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No users found via this filter.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  padding: '14px 32px', borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b',
                }}>
                  <button
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    disabled={usersPage <= 1}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                      cursor: usersPage <= 1 ? 'not-allowed' : 'pointer',
                      background: usersPage <= 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)', color: usersPage <= 1 ? '#475569' : '#e2e8f0',
                      transition: 'background 0.2s',
                    }}
                  >
                    {'←'} Prev
                  </button>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                    Page {usersPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setUsersPage(p => Math.min(totalPages, p + 1))}
                    disabled={usersPage >= totalPages}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                      cursor: usersPage >= totalPages ? 'not-allowed' : 'pointer',
                      background: usersPage >= totalPages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)', color: usersPage >= totalPages ? '#475569' : '#e2e8f0',
                      transition: 'background 0.2s',
                    }}
                  >
                    Next {'→'}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default HeadAdminDashboard;
