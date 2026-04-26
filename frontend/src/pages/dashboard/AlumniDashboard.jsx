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
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Alumni Dashboard                                                   */
/* ------------------------------------------------------------------ */

const AlumniDashboard = ({ user }) => {
  const [stats, setStats]             = useState(null);
  const [opportunities, setOpps]      = useState([]);
  const [bookmarkedIds, setBookmarks] = useState([]);
  const [loading, setLoading]         = useState(true);

  /* ---- data fetch ---- */
  useEffect(() => {
    const load = async () => {
      const [statsRes, oppsRes, bmRes] = await Promise.allSettled([
        client('/dashboard/alumni-stats'),
        client('/opportunities'),
        client('/opportunities/bookmarks'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (oppsRes.status === 'fulfilled') {
        const list = Array.isArray(oppsRes.value) ? oppsRes.value : oppsRes.value.opportunities || [];
        setOpps(list.slice(0, 3));
      }
      if (bmRes.status === 'fulfilled') {
        const bm = Array.isArray(bmRes.value) ? bmRes.value : bmRes.value.bookmarks || [];
        setBookmarks(bm.map(b => (typeof b === 'object' ? b.id : b)));
      }
      setLoading(false);
    };
    load();
  }, []);

  /* ---- derived chart data ---- */
  const appsByPost = (stats?.opportunitiesWithCounts || []).map(opp => {
    const row = { name: opp.title?.length > 18 ? opp.title.slice(0, 18) + '...' : opp.title };
    (opp.statusBreakdown || []).forEach(sb => { row[sb.status] = sb.count; });
    return row;
  });

  const typeMap = {};
  (stats?.opportunitiesWithCounts || []).forEach(opp => {
    const t = opp.type || 'OTHER';
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const postsByType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  const myOpps = (stats?.opportunitiesWithCounts || []).slice(0, 4);
  const recentApplicants = (stats?.recentApplicants || []).slice(0, 5);

  /* ---- bookmarked opps for sidebar ---- */
  const savedListings = opportunities.filter(o => bookmarkedIds.includes(o.id)).slice(0, 3);

  /* ---- styles ---- */
  const sectionStyle = {
    marginBottom: '36px',
  };

  const linkBtn = {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#f97316',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };

  const cardBg = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '14px',
    padding: '20px 24px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
  };

  const pillStyle = (status) => {
    const sc = statusColor(status);
    return {
      fontSize: '0.68rem',
      fontWeight: '700',
      padding: '2px 10px',
      borderRadius: '99px',
      background: sc.bg,
      color: sc.text,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    };
  };

  const quickBtn = (isPrimary) => ({
    display: 'block',
    width: '100%',
    padding: '10px 0',
    borderRadius: '10px',
    border: isPrimary ? 'none' : '1px solid rgba(255,255,255,0.12)',
    background: isPrimary
      ? 'linear-gradient(135deg, #f97316, #ea580c)'
      : 'rgba(255,255,255,0.06)',
    color: isPrimary ? '#fff' : '#cbd5e1',
    fontWeight: '700',
    fontSize: '0.82rem',
    textAlign: 'center',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'transform 0.18s, box-shadow 0.18s',
  });

  /* ---- loading skeleton ---- */
  if (loading) {
    return (
      <div style={{ padding: '32px 0' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '28px' }}>
          {greet()}, {user?.firstName || 'Alumni'}
        </h1>
        {[...Array(4)].map((_, i) => <ListSkeleton key={i} />)}
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div style={{ padding: '32px 0' }}>
      {/* Greeting */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#e2e8f0', marginBottom: '28px' }}>
        {greet()}, {user?.firstName || 'Alumni'}
      </h1>

      {/* ============================================================ */}
      {/*  ZONE 1 - My Contributions                                   */}
      {/* ============================================================ */}
      <div style={sectionStyle}>
        <SectionTitle action={
          <Link to="/my-opportunities" style={linkBtn}>Manage Posts &rarr;</Link>
        }>
          <span style={{ marginRight: '8px' }}>&#128188;</span>
          My Contributions
        </SectionTitle>

        {/* -- Stat Cards -- */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <StatCard
            icon="&#128204;"
            label="My Posts"
            value={stats?.myPostsCount ?? 0}
            color="#2563eb"
            gradient="linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.06) 100%)"
          />
          <StatCard
            icon="&#128229;"
            label="Your Reach"
            value={stats?.totalApplicationsReceived ?? 0}
            color="#059669"
            sub="Total applications"
            gradient="linear-gradient(135deg, rgba(5,150,105,0.18) 0%, rgba(5,150,105,0.06) 100%)"
          />
          <StatCard
            icon="&#11088;"
            label="Recommendations"
            value={stats?.recommendationsReceived ?? 0}
            color="#7c3aed"
            gradient="linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.06) 100%)"
          />
          <StatCard
            icon="&#9993;"
            label="Unread Messages"
            value={stats?.unreadMessages ?? 0}
            color="#0891b2"
            gradient="linear-gradient(135deg, rgba(8,145,178,0.18) 0%, rgba(8,145,178,0.06) 100%)"
          />
        </div>

        {/* -- Charts Row -- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Applications by Post */}
          <ChartCard title="Applications by Post">
            {appsByPost.length === 0 ? (
              <DashboardEmptyState icon="&#128202;" text="No application data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={appsByPost} barGap={2} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTooltipStyle} />
                  <Bar dataKey="PENDING"  stackId="a" fill={STATUS_COLORS_MAP.PENDING}  radius={[0, 0, 0, 0]} />
                  <Bar dataKey="REVIEWED" stackId="a" fill={STATUS_COLORS_MAP.REVIEWED} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="ACCEPTED" stackId="a" fill={STATUS_COLORS_MAP.ACCEPTED} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Posts by Type */}
          <ChartCard title="Posts by Type">
            {postsByType.length === 0 ? (
              <DashboardEmptyState icon="&#128200;" text="No posts yet" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={postsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {postsByType.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{v}</span>}
                  />
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* -- Recent Applicants Feed -- */}
        <div style={{ ...cardBg, marginBottom: '24px' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '14px' }}>
            Recent Applicants
          </p>
          {recentApplicants.length === 0 ? (
            <DashboardEmptyState icon="&#128101;" text="No applicants yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentApplicants.map((a, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < recentApplicants.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#e2e8f0' }}>
                      {a.applicantName || 'Unknown'}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      {a.opportunityTitle || ''} &middot; {timeAgo(a.appliedAt)}
                    </span>
                  </div>
                  <span style={pillStyle(a.status)}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* -- My Opportunity Posts (top 4) -- */}
        <div style={{ ...cardBg, marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              My Opportunity Posts
            </p>
            <Link to="/my-opportunities" style={linkBtn}>Manage &rarr;</Link>
          </div>
          {myOpps.length === 0 ? (
            <DashboardEmptyState icon="&#128196;" text="You haven't posted any opportunities yet" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {myOpps.map((opp, i) => (
                <div key={opp.id || i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < myOpps.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                    <Link to={`/opportunities/${opp.id}`} style={{
                      fontSize: '0.88rem', fontWeight: '700', color: '#e2e8f0',
                      textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {opp.title}
                    </Link>
                    {opp.company && (
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{opp.company}</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    padding: '3px 12px',
                    borderRadius: '99px',
                    background: 'rgba(249,115,22,0.12)',
                    color: '#f97316',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px',
                  }}>
                    {opp.applicationCount ?? 0} apps
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  ZONE 2 - Explore                                            */}
      {/* ============================================================ */}
      <div style={sectionStyle}>
        <SectionTitle action={
          <Link to="/opportunities" style={linkBtn}>See All &rarr;</Link>
        }>
          <span style={{ marginRight: '8px' }}>&#128270;</span>
          Explore
        </SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* -- Latest Opportunities Grid -- */}
          <div>
            {opportunities.length === 0 ? (
              <DashboardEmptyState icon="&#127919;" text="No opportunities to show right now" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {opportunities.map(opp => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    initialBookmarked={bookmarkedIds.includes(opp.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* -- Right Sidebar -- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Saved Listings */}
            <div style={cardBg}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                Saved Listings
              </p>
              {savedListings.length === 0 ? (
                <DashboardEmptyState icon="&#128278;" text="No saved listings" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedListings.map(opp => (
                    <Link key={opp.id} to={`/opportunities/${opp.id}`} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      textDecoration: 'none',
                      transition: 'background 0.18s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    >
                      <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opp.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {opp.company}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={cardBg}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                Quick Actions
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/opportunities/create" style={quickBtn(true)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  + Post Opportunity
                </Link>
                <Link to="/recommendations" style={quickBtn(false)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                >
                  View Recommendations
                </Link>
                <Link to="/alumni" style={quickBtn(false)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                >
                  Alumni Directory
                </Link>
                <Link to="/messages" style={{ ...quickBtn(false), position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                >
                  Messages
                  {(stats?.unreadMessages ?? 0) > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      right: '14px',
                      transform: 'translateY(-50%)',
                      fontSize: '0.66rem',
                      fontWeight: '800',
                      background: '#ef4444',
                      color: '#fff',
                      borderRadius: '99px',
                      padding: '1px 8px',
                      minWidth: '18px',
                      textAlign: 'center',
                    }}>
                      {stats.unreadMessages}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
