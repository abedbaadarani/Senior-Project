import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Link } from 'react-router-dom';

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
        <div>
          <h1 className="page-title">Recommendations Overview</h1>
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Admins manage accounts; currently no recommendations exist in the system.</h3>
          </div>
        </div>
     );
  }

  return (
    <div>
      <h1 className="page-title">
        {(user.role === 'STUDENT' || user.role === 'ALUMNI') && 'My Recommendations'}
        {user.role === 'INSTRUCTOR' && 'Recommendations I Wrote'}
        {(user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') && 'All System Recommendations'}
      </h1>

      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        {(user.role === 'STUDENT' || user.role === 'ALUMNI') && 'View the endorsements written for you by university instructors.'}
        {user.role === 'INSTRUCTOR' && 'Track the students you have endorsed for opportunities.'}
      </p>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading recommendations...</p>
      ) : recommendations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>No recommendations found.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recommendations.map((rec) => (
            <div key={rec.id} className="card" style={{ marginBottom: 0, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                  {(user.role === 'STUDENT' || user.role === 'ALUMNI') ? `From Instructor ID: ${rec.instructorId}` : `For Student ID: ${rec.studentId}`}
                  {(user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') && ` (Instructor ${rec.instructorId} -> Student ${rec.studentId})`}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date(rec.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                <Link to={`/opportunities/${rec.opportunityId}`} style={{ fontWeight: '500' }}>
                  Reference: Opportunity #{rec.opportunityId}
                </Link>
              </div>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
