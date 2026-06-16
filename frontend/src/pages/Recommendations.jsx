import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        if (user.role === 'STUDENT' || user.role === 'ALUMNI') {
          endpoint = '/recommendations/for-me';
        } else if (user.role === 'INSTRUCTOR') {
          endpoint = '/recommendations/mine';
        } else if (user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') {
          endpoint = '/recommendations';
        } else {
          setLoading(false);
          return;
        }

        const data = await client(endpoint);
        setRecommendations(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecs();
    }
  }, [user]);



  if (user?.role === 'ADMIN' && recommendations.length === 0 && !loading) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <h1 className="page-title">Recommendations Overview</h1>
        <EmptyState 
          icon="📋" 
          title="No recommendations yet" 
          message="There are currently no recommendations in the system."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">
        {(user.role === 'STUDENT' || user.role === 'ALUMNI') && 'My Recommendations'}
        {user.role === 'INSTRUCTOR' && 'Students Recommended'}
        {(user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') && 'All System Recommendations'}
      </h1>

      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
        {(user.role === 'STUDENT' || user.role === 'ALUMNI') && 'Endorsements written for you by university instructors for specific opportunities.'}
        {user.role === 'INSTRUCTOR' && 'Track the students that have been endorsed for opportunities.'}
        {(user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') && 'Overview of all endorsements made across the platform.'}
      </p>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState 
          icon="📝" 
          title="No recommendations found" 
          message="When instructors endorse students for opportunities, they will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recommendations.map((rec) => (
            <div key={rec.id} className="card" style={{ marginBottom: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                  {(user.role === 'STUDENT' || user.role === 'ALUMNI')
                    ? `From: ${rec.instructor?.name || 'Instructor ' + rec.instructorId}`
                    : `Student: ${rec.student?.name || 'ID ' + rec.studentId} ${rec.student?.email ? `(${rec.student.email})` : ''}`}
                  {(user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') && ` — (Instructor ${rec.instructor?.name || rec.instructorId} -> Student ${rec.student?.name || rec.studentId})`}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(rec.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Student info */}
              {rec.student && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '14px',
                  padding: '12px 16px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <span style={{ color: '#94a3b8' }}>Student: </span>
                    <strong>{rec.student.name}</strong>
                  </div>
                  {rec.student.university_id && (
                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                      <span style={{ color: '#94a3b8' }}>ID: </span>
                      <strong>{rec.student.university_id}</strong>
                    </div>
                  )}
                  {rec.student.email && (
                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                      <span style={{ color: '#94a3b8' }}>Email: </span>
                      {rec.student.email}
                    </div>
                  )}
                  {rec.student.major && (
                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                      <span style={{ color: '#94a3b8' }}>Major: </span>
                      {rec.student.major}
                    </div>
                  )}
                  {rec.student.graduation_year && (
                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                      <span style={{ color: '#94a3b8' }}>Graduation: </span>
                      {rec.student.graduation_year}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                <Link to={`/opportunities/${rec.opportunityId}`} style={{ fontWeight: '500' }}>
                  Opportunity: {rec.opportunity?.title || 'ID ' + rec.opportunityId} {rec.opportunity?.company && `at ${rec.opportunity.company}`}
                </Link>
              </div>

              {user.role !== 'INSTRUCTOR' && (
                <div style={{
                  backgroundColor: 'var(--bg-color)',
                  padding: '16px',
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--secondary-color)',
                  fontStyle: 'italic',
                  color: 'var(--text-dark)'
                }}>
                  "{rec.message}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
