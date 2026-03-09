import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const AlumniApproval = () => {
  const { user } = useAuth();
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await client('/alumni/pending');
      setPendingAlumni(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch pending alumni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'INSTRUCTOR') {
      fetchPending();
    }
  }, [user]);

  const handleApprove = async (alumniId, name) => {
    if (!window.confirm(`Are you sure you want to approve ${name} as a verified Alumni?`)) return;
    
    try {
      await client(`/alumni/${alumniId}/approve`, { method: 'PATCH' });
      // Remove from list automatically
      setPendingAlumni(pendingAlumni.filter((a) => a.id !== alumniId));
      alert(`${name} has been successfully verified!`);
    } catch (err) {
      alert(err.message || 'Failed to approve alumni');
    }
  };

  if (user?.role !== 'INSTRUCTOR') {
    return <div>Unauthorized. Only Instructors can verify alumni credentials.</div>;
  }

  return (
    <div>
      <h1 className="page-title">Alumni Approvals</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Review and verify graduated students so they can access the LIU Connect platform.
      </p>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading pending requests...</p>
      ) : pendingAlumni.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>There are no pending alumni requests.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {pendingAlumni.map((alumni) => (
            <div key={alumni.id} className="card" style={{ margin: 0 }}>
              <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>{alumni.name}</h3>
              <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}>
                <strong>Email:</strong> {alumni.email}
              </p>
              <p style={{ margin: '8px 0', color: 'var(--text-muted)' }}>
                <strong>Graduation Year:</strong> {alumni.graduationYear}
              </p>
              <div style={{ marginTop: '20px' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', backgroundColor: '#10b981' }}
                  onClick={() => handleApprove(alumni.id, alumni.name)}
                >
                  Verify & Approve Identity
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniApproval;
