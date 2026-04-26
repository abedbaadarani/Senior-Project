import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';

/* ── helpers ── */
const daysUntilDeadline = (d) => {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
};

const deadlinePillColor = (days) => {
  if (days <= 2) return { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' };
  if (days <= 5) return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
  return { bg: 'rgba(16,185,129,0.12)', text: '#10b981' };
};

/* ── component ── */
const InstructorDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [removingIds, setRemovingIds] = useState([]);

  /* fetch */
  useEffect(() => {
    (async () => {
      const [res] = await Promise.allSettled([
        client('/dashboard/instructor-stats'),
      ]);
      if (res.status === 'fulfilled') {
        setStats(res.value);
        setPendingAlumni(res.value.pendingAlumni || []);
      }
      setLoading(false);
    })();
  }, []);

  /* approve / reject */
  const handleAlumniAction = async (id, action) => {
    const key = `${id}-${action}`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      if (action === 'approve') {
        await client('/alumni/' + id + '/approve', { method: 'PATCH' });
      } else {
        await client('/alumni/' + id + '/reject', { method: 'DELETE' });
      }
      setRemovingIds((p) => [...p, id]);
      setTimeout(() => {
        setPendingAlumni((prev) => prev.filter((a) => a._id !== id && a.id !== id));
        setRemovingIds((p) => p.filter((x) => x !== id));
        setStats((prev) =>
          prev ? { ...prev, pendingAlumniCount: Math.max(0, (prev.pendingAlumniCount || 0) - 1) } : prev
        );
      }, 350);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    }
  };

  /* loading */
  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[...Array(5)].map((_, i) => <ListSkeleton key={i} />)}
      </div>
    );
  }

  if (!stats) {
    return <DashboardEmptyState icon="📊" text="Unable to load dashboard data. Please try again later." />;
  }

  /* derived data */
  const opps = stats.opportunitiesWithCounts || [];
  const barData = opps.slice(0, 6).map((o) => ({
    name: o.title?.length > 18 ? o.title.slice(0, 18) + '...' : o.title,
    applications: o.applicationCount ?? o.appCount ?? 0,
  }));

  const typeMap = {};
  opps.forEach((o) => {
    const t = o.type || 'Other';
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  const impact = stats.recommendationImpact || { total: 0, accepted: 0 };
  const impactPct = impact.total > 0 ? Math.round((impact.accepted / impact.total) * 100) : 0;

  const expiring = stats.expiringOpportunities || [];
  const topPosts = opps.slice(0, 4);

  const pendingCount = stats.pendingAlumniCount ?? pendingAlumni.length;
  const unreadMessages = stats.unreadMessages ?? 0;

  /* ── render ── */
  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>
          {greet()}, Dr.&nbsp;{user?.name?.split(' ')[0]} <span role="img" aria-label="teacher">👨‍🏫</span>
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
          Here's what's happening with your opportunities and students.
        </p>
      </div>

      {/* ── Pending Alumni Alert ── */}
      {pendingAlumni.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '2px solid #f59e0b',
          borderRadius: '14px',
          padding: '20px 24px',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.3rem' }}>⚠️</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbbf24' }}>
              Alumni Awaiting Approval
            </span>
            <span style={{
              background: '#f59e0b',
              color: '#000',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: '99px',
            }}>
              {pendingAlumni.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingAlumni.map((a) => {
              const aid = a._id || a.id;
              const isRemoving = removingIds.includes(aid);
              return (
                <div
                  key={aid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? 'translateX(40px)' : 'translateX(0)',
                    transition: 'opacity 0.35s, transform 0.35s',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.92rem' }}>{a.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                      {a.email}{a.graduationYear ? ` · Class of ${a.graduationYear}` : ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleAlumniAction(aid, 'approve')}
                      disabled={!!actionLoading[`${aid}-approve`]}
                      style={{
                        background: 'rgba(16,185,129,0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: actionLoading[`${aid}-approve`] ? 0.5 : 1,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; }}
                    >
                      {actionLoading[`${aid}-approve`] ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAlumniAction(aid, 'reject')}
                      disabled={!!actionLoading[`${aid}-reject`]}
                      style={{
                        background: 'rgba(239,68,68,0.12)',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        opacity: actionLoading[`${aid}-reject`] ? 0.5 : 1,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.22)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                    >
                      {actionLoading[`${aid}-reject`] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '14px', textAlign: 'right' }}>
            <Link to="/alumni-approval" style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
              Review All &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatCard icon="📌" label="My Listings" value={stats.myPostsCount ?? 0} color="#2563eb" />
        <StatCard
          icon="📥"
          label="Total Applications"
          value={stats.totalApplications ?? 0}
          color="#059669"
          trend={stats.trends?.newAppsThisWeek > 0 ? `+${stats.trends.newAppsThisWeek} this week` : null}
        />
        <StatCard icon="⏳" label="Pending Alumni" value={pendingCount} color="#d97706" sub="Awaiting approval" />
        <StatCard
          icon="⭐"
          label="Recommendations"
          value={stats.recommendationCount ?? 0}
          color="#7c3aed"
          trend={stats.trends?.newRecsThisWeek > 0 ? `+${stats.trends.newRecsThisWeek} this week` : null}
        />
      </div>

      {/* ── Recommendation Impact ── */}
      {impact.total > 0 && (
        <div style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: '14px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#e2e8f0' }}>
              <span style={{ color: '#10b981' }}>{impact.accepted}</span> of{' '}
              <span style={{ color: '#e2e8f0' }}>{impact.total}</span> recommended students got accepted
            </p>
            <div style={{
              marginTop: '8px',
              height: '8px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${impactPct}%`,
                height: '100%',
                borderRadius: '99px',
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
              {impactPct}% acceptance rate
            </p>
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Bar Chart */}
        <ChartCard title="Applications per Post">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="applications" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <DashboardEmptyState icon="📊" text="No posts yet to chart." />
          )}
        </ChartCard>

        {/* Pie Chart */}
        <ChartCard title="My Posts by Type">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <DashboardEmptyState icon="📊" text="No post types to show." />
          )}
          {/* legend */}
          {pieData.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', justifyContent: 'center' }}>
              {pieData.map((d, i) => (
                <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], display: 'inline-block' }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Bottom Row: Posts + Quick Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Expiring Opportunities */}
          {expiring.length > 0 && (
            <div>
              <SectionTitle>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚠️</span> Expiring Soon
                </span>
              </SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expiring.map((opp) => {
                  const oid = opp._id || opp.id;
                  const days = daysUntilDeadline(opp.deadline);
                  const pill = deadlinePillColor(days);
                  return (
                    <div key={oid} style={{
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link
                          to={`/opportunities/${oid}`}
                          style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
                        >
                          {opp.title}
                        </Link>
                        {opp.company && (
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginLeft: '8px' }}>
                            {opp.company}
                          </span>
                        )}
                      </div>
                      <span style={{
                        background: pill.bg,
                        color: pill.text,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '99px',
                        whiteSpace: 'nowrap',
                      }}>
                        {days !== null ? (days <= 0 ? 'Expired' : `${days}d left`) : 'No deadline'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Opportunity Posts */}
          <div>
            <SectionTitle
              action={
                <Link to="/my-opportunities" style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                  Manage Posts &rarr;
                </Link>
              }
            >
              My Opportunity Posts
            </SectionTitle>
            {topPosts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {topPosts.map((opp) => {
                  const oid = opp._id || opp.id;
                  const appCount = opp.applicationCount ?? opp.appCount ?? 0;
                  return (
                    <div key={oid} style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'background 0.2s',
                      flexWrap: 'wrap',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link
                          to={`/opportunities/${oid}`}
                          style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
                        >
                          {opp.title}
                        </Link>
                        {opp.company && (
                          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
                            {opp.company}
                          </p>
                        )}
                      </div>
                      <span style={{
                        background: appCount > 0 ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.06)',
                        color: appCount > 0 ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '99px',
                        whiteSpace: 'nowrap',
                      }}>
                        {appCount} app{appCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <DashboardEmptyState icon="📝" text="You haven't posted any opportunities yet." />
            )}
          </div>
        </div>

        {/* Right column: Quick Actions */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '14px',
          padding: '22px 20px',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          position: 'sticky',
          top: '100px',
        }}>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.4)',
            margin: '0 0 6px',
          }}>
            Quick Actions
          </p>

          {/* Post Opportunity */}
          <Link to="/my-opportunities" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s, transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span>📤</span> Post Opportunity
            </button>
          </Link>

          {/* Write Recommendation */}
          <Link to="/recommendations" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              background: 'rgba(124,58,237,0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span>✍️</span> Write Recommendation
            </button>
          </Link>

          {/* Alumni Approvals */}
          <Link to="/alumni-approval" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              background: 'rgba(245,158,11,0.12)',
              color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎓</span> Alumni Approvals
              </span>
              {pendingCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          </Link>

          {/* Messages */}
          <Link to="/messages" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💬</span> Messages
              </span>
              {unreadMessages > 0 && (
                <span style={{
                  background: '#3b82f6',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {unreadMessages}
                </span>
              )}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
