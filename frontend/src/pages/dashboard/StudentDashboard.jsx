import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import OpportunityCard from '../../components/OpportunityCard';
import { ListSkeleton } from '../../components/Skeleton';
import { timeAgo } from '../../utils/dateUtils';
import StatCard from './shared/StatCard';
import ChartCard from './shared/ChartCard';
import SectionTitle from './shared/SectionTitle';
import DashboardEmptyState from './shared/DashboardEmptyState';
import { CHART_COLORS, chartTooltipStyle, statusColor, STATUS_COLORS_MAP, greet } from './shared/constants';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─── Application Timeline Steps ─────────────────────────────────────────────
const TIMELINE_STEPS = ['PENDING', 'REVIEWED', 'INTERVIEWING', 'ACCEPTED'];

const stepIndex = (status) => {
  if (status === 'REJECTED') return -1;
  return TIMELINE_STEPS.indexOf(status);
};

// ─── Profile Stepper Steps ──────────────────────────────────────────────────
const PROFILE_STEPS = [
  { key: 'account', label: 'Account' },
  { key: 'major', label: 'Major' },
  { key: 'cv', label: 'CV' },
  { key: 'linkedin', label: 'LinkedIn' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const deadlineCountdown = (deadline) => {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
  if (days === 0) return { label: 'Today!', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  if (days === 1) return { label: 'Tomorrow!', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
  if (days <= 7) return { label: `${days} days left`, color: '#d97706', bg: 'rgba(217,119,6,0.12)' };
  return { label: `${days} days left`, color: '#94a3b8', bg: 'rgba(148,163,184,0.10)' };
};

// ═════════════════════════════════════════════════════════════════════════════
// STUDENT DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const StudentDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentOpps, setRecentOpps] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      client('/dashboard/student-stats'),
      client('/opportunities'),
      client('/opportunities/bookmarks'),
    ]).then(([statsRes, oppsRes, bkRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value || {});
      if (oppsRes.status === 'fulfilled') setRecentOpps((oppsRes.value || []).slice(0, 3));
      if (bkRes.status === 'fulfilled') {
        const bk = bkRes.value || [];
        setBookmarkedIds(new Set(bk.map(b => b.id)));
      }
      setLoading(false);
    });
  }, []);

  // Profile completion
  const profileCompletion = stats?.profileCompletion ?? (() => {
    let score = 25;
    if (user?.major) score += 25;
    if (user?.cvUrl) score += 25;
    if (user?.linkedinUrl) score += 25;
    return score;
  })();

  const stepDone = (key) => {
    if (key === 'account') return true;
    if (key === 'major') return !!user?.major;
    if (key === 'cv') return !!user?.cvUrl;
    if (key === 'linkedin') return !!user?.linkedinUrl;
    return false;
  };

  // Derived data
  const applicationCount = stats?.applicationCount ?? 0;
  const bookmarkCount = stats?.bookmarkCount ?? 0;
  const recommendationCount = stats?.recommendationCount ?? 0;
  const applicationsByStatus = stats?.applicationsByStatus || [];
  const applications = stats?.applications || [];
  const recommendations = stats?.recommendations || [];
  const bookmarks = stats?.bookmarks || [];
  const recommendedOpportunities = stats?.recommendedOpportunities || [];
  const upcomingDeadlines = stats?.upcomingDeadlines || [];
  const unreadMessages = stats?.unreadMessages ?? 0;

  // Chart data
  const pipelineData = applicationsByStatus.map(({ status, count }) => ({
    name: status,
    value: count,
    color: STATUS_COLORS_MAP[status] || '#64748b',
  }));

  const activityData = [
    { label: 'Applied', count: applicationCount },
    { label: 'Bookmarks', count: bookmarkCount },
    { label: 'Recommendations', count: recommendationCount },
  ];

  return (
    <div>
      {/* ── 1. Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title" style={{ marginBottom: '4px' }}>
          {greet()}, {user?.name?.split(' ')[0]} <span role="img" aria-label="graduation cap">🎓</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Track your applications, explore opportunities, and build your career path.
        </p>
      </div>

      {/* ── 2. Profile Completion Stepper ── */}
      {profileCompletion < 100 && (
        <div style={{
          margin: '0 0 28px 0',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(124,58,237,0.14))',
          border: '1px solid rgba(99,102,241,0.30)',
          borderRadius: '14px',
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative glow */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#a5b4fc', fontSize: '1rem', fontWeight: 700 }}>
                Complete your profile to stand out! <span role="img" aria-label="sparkles">✨</span>
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(165,180,252,0.7)' }}>
                {profileCompletion < 50
                  ? 'Add your major, CV, and LinkedIn to attract opportunities.'
                  : 'Almost there! Just a few more details to reach 100%.'}
              </p>
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#a5b4fc' }}>{profileCompletion}%</span>
          </div>

          {/* Horizontal Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '16px' }}>
            {PROFILE_STEPS.map((step, idx) => {
              const done = stepDone(step.key);
              const isLast = idx === PROFILE_STEPS.length - 1;
              return (
                <React.Fragment key={step.key}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                    {/* Circle */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: done
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'rgba(255,255,255,0.08)',
                      border: done
                        ? '2px solid rgba(16,185,129,0.4)'
                        : '2px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: done ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontWeight: 700, fontSize: done ? '1rem' : '0.85rem',
                      transition: 'all 0.3s ease',
                      boxShadow: done ? '0 0 12px rgba(16,185,129,0.3)' : 'none',
                    }}>
                      {done ? '✓' : idx + 1}
                    </div>
                    {/* Label */}
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: done ? '#10b981' : 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {/* Connecting line */}
                  {!isLast && (
                    <div style={{
                      flex: 1, height: '3px', marginTop: '-18px',
                      background: stepDone(PROFILE_STEPS[idx + 1]?.key)
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : done
                          ? 'linear-gradient(90deg, #10b981, rgba(255,255,255,0.12))'
                          : 'rgba(255,255,255,0.10)',
                      borderRadius: '99px',
                      minWidth: '40px',
                      transition: 'background 0.4s ease',
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <Link to="/profile" style={{
            display: 'inline-block', fontSize: '0.85rem',
            color: '#818cf8', fontWeight: '700', textDecoration: 'none',
          }}>
            Update Profile →
          </Link>
        </div>
      )}

      {/* ── 3. Stat Cards Row ── */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard
          icon="📋"
          label="Applications"
          value={loading ? null : applicationCount}
          color="#2563eb"
          gradient="linear-gradient(135deg, rgba(37,99,235,0.10), rgba(37,99,235,0.04))"
        />
        <StatCard
          icon="🔖"
          label="Saved Jobs"
          value={loading ? null : bookmarkCount}
          color="#7c3aed"
          gradient="linear-gradient(135deg, rgba(124,58,237,0.10), rgba(124,58,237,0.04))"
        />
        <StatCard
          icon="⭐"
          label="Recommendations"
          value={loading ? null : recommendationCount}
          color="#059669"
          sub="From instructors"
          gradient="linear-gradient(135deg, rgba(5,150,105,0.10), rgba(5,150,105,0.04))"
        />
        <StatCard
          icon="👤"
          label="Profile"
          value={`${profileCompletion}%`}
          color={profileCompletion === 100 ? '#059669' : '#d97706'}
          sub="Completion"
          gradient={profileCompletion === 100
            ? 'linear-gradient(135deg, rgba(5,150,105,0.10), rgba(5,150,105,0.04))'
            : 'linear-gradient(135deg, rgba(217,119,6,0.10), rgba(217,119,6,0.04))'
          }
        />
      </div>

      {/* ── 4. Charts Row ── */}
      {!loading && applicationCount > 0 && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '36px' }}>
          {/* Pie: Application Pipeline */}
          <ChartCard title="📋 My Application Pipeline" style={{ flex: '1 1 260px' }}>
            {pipelineData.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>
                No application data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pipelineData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {pipelineData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8', paddingTop: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Bar: Activity Overview */}
          <ChartCard title="📈 My Activity Overview" style={{ flex: '2 1 340px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData} barSize={44}>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" name="Count" radius={[8, 8, 0, 0]}>
                  <Cell fill="#f97316" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#10b981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── 5. Recommended For You ── */}
      {!loading && recommendedOpportunities.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <SectionTitle action={
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
              Based on your major
            </span>
          }>
            ✨ Recommended For You
          </SectionTitle>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {recommendedOpportunities.slice(0, 4).map((opp) => {
              const typeBadge = {
                JOB: { bg: '#ede9fe', text: '#5b21b6' },
                INTERNSHIP: { bg: '#dcfce7', text: '#15803d' },
                RESEARCH: { bg: '#dbeafe', text: '#1e40af' },
                VOLUNTEER: { bg: '#fef9c3', text: '#854d0e' },
              }[opp.type] || { bg: 'rgba(255,255,255,0.06)', text: '#94a3b8' };

              return (
                <div key={opp.id} style={{
                  flex: '1 1 220px',
                  maxWidth: '300px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link to={`/opportunities/${opp.id}`} style={{
                      fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0',
                      textDecoration: 'none', lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {opp.title}
                    </Link>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '99px', background: typeBadge.bg, color: typeBadge.text,
                      flexShrink: 0, marginLeft: '8px', whiteSpace: 'nowrap',
                    }}>
                      {opp.type}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    {opp.company}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main Content: Left + Right Sidebar ── */}
      <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ── 6. Latest Opportunities Grid ── */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/opportunities" style={{
                fontSize: '0.85rem', color: 'var(--primary-color)',
                fontWeight: '600', textDecoration: 'none',
              }}>
                Browse All →
              </Link>
            }>
              🔍 Latest Opportunities
            </SectionTitle>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ListSkeleton />
                <ListSkeleton />
                <ListSkeleton />
              </div>
            ) : recentOpps.length === 0 ? (
              <DashboardEmptyState icon="📭" text="No opportunities posted yet." />
            ) : (
              <div className="opportunities-grid" style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                marginTop: '8px',
              }}>
                {recentOpps.map(opp => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    mine={false}
                    initialBookmarked={bookmarkedIds.has(opp.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── 7. Upcoming Deadlines ── */}
          {!loading && upcomingDeadlines.length > 0 && (
            <div className="card" style={{ margin: 0 }}>
              <SectionTitle>
                <span role="img" aria-label="calendar">📅</span> Upcoming Deadlines
              </SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {upcomingDeadlines.map((item, i) => {
                  const cd = deadlineCountdown(item.deadline);
                  return (
                    <div key={item.id || i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: i < upcomingDeadlines.length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link to={`/opportunities/${item.id || item.opportunityId}`} style={{
                          fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-color)',
                          textDecoration: 'none', display: 'block',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.title}
                        </Link>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.company}
                        </span>
                      </div>
                      {cd && (
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px',
                          borderRadius: '99px', background: cd.bg, color: cd.color,
                          marginLeft: '12px', flexShrink: 0, whiteSpace: 'nowrap',
                        }}>
                          {cd.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 8. Application Tracker with Visual Timeline ── */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/opportunities" style={{
                fontSize: '0.85rem', color: 'var(--primary-color)',
                fontWeight: '600', textDecoration: 'none',
              }}>
                Find More →
              </Link>
            }>
              📋 Application Tracker
            </SectionTitle>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ListSkeleton />
                <ListSkeleton />
                <ListSkeleton />
              </div>
            ) : applications.length === 0 ? (
              <DashboardEmptyState icon="🚀" text="No applications yet. Start exploring jobs!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {applications.map((app) => {
                  const sc = statusColor(app.status);
                  const isRejected = app.status === 'REJECTED';
                  const activeIdx = isRejected ? -1 : stepIndex(app.status);
                  const timelineSteps = isRejected
                    ? [...TIMELINE_STEPS.slice(0, -1), 'REJECTED']
                    : TIMELINE_STEPS;

                  return (
                    <div key={app.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '12px',
                      padding: '16px 18px',
                    }}>
                      {/* Timeline dots */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0',
                        marginBottom: '12px', padding: '0 4px',
                      }}>
                        {timelineSteps.map((step, idx) => {
                          const isCurrent = isRejected
                            ? (step === 'REJECTED')
                            : (idx === activeIdx);
                          const isPast = !isRejected && idx < activeIdx;
                          const isFuture = !isCurrent && !isPast;
                          const isLast = idx === timelineSteps.length - 1;

                          let dotColor;
                          if (isCurrent) dotColor = STATUS_COLORS_MAP[step] || '#64748b';
                          else if (isPast) dotColor = STATUS_COLORS_MAP[step] || '#64748b';
                          else dotColor = 'rgba(255,255,255,0.12)';

                          let lineColor;
                          if (!isLast) {
                            if (isPast || isCurrent) lineColor = STATUS_COLORS_MAP[step] || '#64748b';
                            else lineColor = 'rgba(255,255,255,0.08)';
                          }

                          return (
                            <React.Fragment key={step}>
                              <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: '4px', zIndex: 1,
                              }}>
                                {/* Dot */}
                                <div style={{
                                  width: isCurrent ? '14px' : '10px',
                                  height: isCurrent ? '14px' : '10px',
                                  borderRadius: '50%',
                                  background: dotColor,
                                  boxShadow: isCurrent ? `0 0 8px ${dotColor}` : 'none',
                                  transition: 'all 0.3s ease',
                                  border: isFuture ? '2px solid rgba(255,255,255,0.08)' : 'none',
                                }} />
                                {/* Step label */}
                                <span style={{
                                  fontSize: '0.58rem', fontWeight: 600,
                                  color: isCurrent
                                    ? dotColor
                                    : isPast
                                      ? 'rgba(255,255,255,0.35)'
                                      : 'rgba(255,255,255,0.15)',
                                  textTransform: 'uppercase', letterSpacing: '0.03em',
                                  whiteSpace: 'nowrap',
                                }}>
                                  {step.charAt(0) + step.slice(1).toLowerCase()}
                                </span>
                              </div>
                              {/* Connecting line */}
                              {!isLast && (
                                <div style={{
                                  flex: 1, height: '2px',
                                  background: lineColor,
                                  marginTop: '-16px',
                                  minWidth: '20px',
                                  borderRadius: '99px',
                                  transition: 'background 0.3s ease',
                                }} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* App details row */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Link to={`/opportunities/${app.opportunity?.id}`} style={{
                            fontWeight: 600, fontSize: '0.9rem',
                            color: 'var(--primary-color)', textDecoration: 'none',
                            display: 'block', whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {app.opportunity?.title}
                          </Link>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {app.opportunity?.company}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px',
                          borderRadius: '99px', background: sc.bg, color: sc.text,
                          marginLeft: '12px', flexShrink: 0,
                        }}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* My Recommendations */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle action={
              <Link to="/recommendations" style={{
                fontSize: '0.85rem', color: 'var(--primary-color)',
                fontWeight: '600', textDecoration: 'none',
              }}>
                View All →
              </Link>
            }>
              ⭐ My Recommendations
            </SectionTitle>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ListSkeleton />
                <ListSkeleton />
              </div>
            ) : recommendations.length === 0 ? (
              <DashboardEmptyState icon="📝" text="No recommendations yet. Impress your instructors!" />
            ) : (
              recommendations.slice(0, 3).map((rec, i) => (
                <div key={rec.id} style={{
                  padding: '10px 0',
                  borderBottom: i < Math.min(recommendations.length, 3) - 1
                    ? '1px solid var(--border-color)' : 'none',
                }}>
                  <div style={{
                    fontSize: '0.88rem', fontStyle: 'italic',
                    color: 'var(--text-color)', marginBottom: '4px',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    "{rec.content?.length > 80 ? rec.content.slice(0, 80) + '...' : rec.content}"
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    -- {rec.instructor?.name || 'Instructor'}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Saved Jobs */}
          {!loading && bookmarks.length > 0 && (
            <div className="card" style={{ margin: 0 }}>
              <SectionTitle action={
                <Link to="/opportunities" style={{
                  fontSize: '0.85rem', color: 'var(--primary-color)',
                  fontWeight: '600', textDecoration: 'none',
                }}>
                  See All →
                </Link>
              }>
                🔖 Saved Jobs
              </SectionTitle>
              {bookmarks.slice(0, 3).map((b, i) => (
                <div key={b.id} style={{
                  padding: '8px 0',
                  borderBottom: i < Math.min(bookmarks.length, 3) - 1
                    ? '1px solid var(--border-color)' : 'none',
                  fontSize: '0.88rem',
                }}>
                  <Link to={`/opportunities/${b.id}`} style={{
                    fontWeight: 600, color: 'var(--primary-color)', textDecoration: 'none',
                  }}>
                    {b.title}
                  </Link>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {b.company}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="card" style={{ margin: 0 }}>
            <SectionTitle>
              <span role="img" aria-label="lightning">⚡</span> Quick Actions
            </SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/opportunities" className="btn-primary" style={{
                textAlign: 'center', textDecoration: 'none',
                display: 'block', padding: '10px',
              }}>
                🔍 Find Opportunities
              </Link>
              <Link to="/profile" style={{
                textAlign: 'center', textDecoration: 'none',
                display: 'block', padding: '10px', borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem',
              }}>
                👤 Update Profile
              </Link>
              <Link to="/alumni-directory" style={{
                textAlign: 'center', textDecoration: 'none',
                display: 'block', padding: '10px', borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem',
              }}>
                📒 Alumni Directory
              </Link>
              <Link to="/messages" style={{
                textAlign: 'center', textDecoration: 'none',
                display: 'block', padding: '10px', borderRadius: '8px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem',
                position: 'relative',
              }}>
                💬 Messages
                {unreadMessages > 0 && (
                  <span style={{
                    marginLeft: '6px',
                    background: '#ef4444', color: '#fff',
                    fontSize: '0.7rem', padding: '1px 6px',
                    borderRadius: '99px', fontWeight: 700,
                  }}>
                    {unreadMessages}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
