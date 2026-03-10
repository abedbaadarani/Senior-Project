import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import client from '../api/client';
import OpportunityCard from '../components/OpportunityCard';
import '../styles/Layout.css';
import '../styles/Opportunities.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const oppsData = await client('/opportunities');
        setRecentOpportunities(oppsData.slice(0, 3));

        if (user?.role === 'STUDENT' || user?.role === 'ALUMNI') {
          const bookmarksData = await client('/opportunities/bookmarks');
          setSavedOpportunities(bookmarksData);
          setBookmarkedIds(new Set(bookmarksData.map(opp => opp.id)));

          const applicationsData = await client('/applications/my-applications');
          setMyApplications(applicationsData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const calculateCompletion = () => {
    let score = 25; // Base score for having an account
    if (user?.major) score += 25;
    if (user?.cvUrl) score += 25;
    if (user?.linkedinUrl) score += 25;
    return score;
  };

  const completion = calculateCompletion();

  return (
    <div>
      <h1 className="page-title">
        {user?.role === 'HEAD_ADMIN' ? 'Welcome Back, Mister Admin' : `Welcome back, ${user?.name.split(' ')[0]}!`}
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
        You are logged in as <strong style={{ color: 'black' }}>{user?.role}</strong>.
      </p>

      {(user?.role === 'STUDENT' || user?.role === 'ALUMNI') && (
        <div className="card" style={{ marginTop: '24px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Profile Completion</h3>
            <span style={{ fontWeight: 'bold', color: completion === 100 ? '#10b981' : 'var(--text-color)' }}>{completion}%</span>
          </div>
          <div style={{ backgroundColor: '#e2e8f0', borderRadius: '8px', height: '10px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ backgroundColor: completion === 100 ? '#10b981' : 'var(--primary-color)', height: '100%', width: `${completion}%`, transition: 'width 0.3s ease' }}></div>
          </div>
          {completion < 100 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your profile is {completion}% complete! <Link to="/profile" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>Add your details</Link> to stand out to alumni and instructors.
            </p>
          ) : (
            <p style={{ margin: 0, color: '#10b981', fontSize: '0.9rem', fontWeight: '500' }}>
              Awesome! Your profile is fully complete.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '40px' }}>
        {(user?.role === 'ALUMNI' || user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || user?.role === 'HEAD_ADMIN') && (
          <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Recommendations</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {user?.role === 'ALUMNI' ? 'View the recommendations instructors have sent for you.' : 'Write recommendations for your students.'}
            </p>
            <Link to="/recommendations" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>Go to Recommendations</Link>
          </div>
        )}

        {(user?.role === 'INSTRUCTOR' || user?.role === 'ALUMNI') && (
          <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Manage Posts</h3>
            <p style={{ color: 'var(--text-muted)' }}>Create new opportunities or edit the ones you have posted.</p>
            <Link to="/my-opportunities" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>My Posts</Link>
          </div>
        )}
      </div>

      <hr style={{ margin: '48px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Recent Opportunities</h2>
        </div>

        {loading ? (
          <p>Loading recent opportunities...</p>
        ) : recentOpportunities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No recent opportunities available.</p>
          </div>
        ) : (
          <div className="opportunities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {recentOpportunities.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} mine={false} initialBookmarked={bookmarkedIds.has(opp.id)} />
            ))}
          </div>
        )}
      </div>

      {(user?.role === 'STUDENT' || user?.role === 'ALUMNI') && (
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Your Saved Opportunities</h2>
          </div>

          {loading ? (
            <p>Loading saved opportunities...</p>
          ) : savedOpportunities.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>You haven't bookmarked any opportunities yet. Go explore the job board!</p>
              <Link to="/opportunities" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>Explore Opportunities</Link>
            </div>
          ) : (
            <div className="opportunities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {savedOpportunities.map(opp => (
                <OpportunityCard key={opp.id} opportunity={opp} mine={false} initialBookmarked={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {(user?.role === 'STUDENT' || user?.role === 'ALUMNI') && (
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Application Tracker</h2>
          </div>

          {loading ? (
            <p>Loading applications...</p>
          ) : myApplications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>You haven't applied to any opportunities yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myApplications.map(app => (
                <div key={app.id} className="card" style={{ padding: '16px', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${app.status === 'PENDING' ? '#f59e0b' : app.status === 'REVIEWED' ? '#3b82f6' : app.status === 'INTERVIEWING' ? '#8b5cf6' : app.status === 'ACCEPTED' ? '#10b981' : '#ef4444'}` }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>
                      <Link to={`/opportunities/${app.opportunity.id}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                        {app.opportunity.title}
                      </Link>
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                      {app.opportunity.company} • {app.opportunity.mode}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        backgroundColor: app.status === 'PENDING' ? '#fef3c7' : app.status === 'REVIEWED' ? '#dbeafe' : app.status === 'INTERVIEWING' ? '#ede9fe' : app.status === 'ACCEPTED' ? '#d1fae5' : '#fee2e2',
                        color: app.status === 'PENDING' ? '#d97706' : app.status === 'REVIEWED' ? '#2563eb' : app.status === 'INTERVIEWING' ? '#7c3aed' : app.status === 'ACCEPTED' ? '#059669' : '#dc2626'
                      }}
                    >
                      {app.status}
                    </span>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
