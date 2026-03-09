import React, { useState, useEffect } from 'react';
import client from '../api/client';
import '../styles/Layout.css';

const HeadAdminPanel = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logError, setLogError] = useState(null);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      // Hardcoded page 1, limit 10 for preview
      const response = await client('/audit?page=1&limit=10');
      // Extract data array from paginated response wrapper
      if (response && response.data) {
        setLogs(response.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setLogError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await client('/admin/create-instructor', { body: formData });
      setSuccess(`Doctor account for ${formData.name} (${formData.email}) was successfully created!`);
      setFormData({ name: '', email: '', password: '' });
      fetchAuditLogs();
    } catch (err) {
      setError(err.message || 'Failed to create doctor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Doctor Registration</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Create an official Instructor (Doctor) account for a faculty member.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        
        {/* Creation Column */}
        <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div style={{ 
              backgroundColor: '#ecfdf5', 
              color: '#065f46', 
              borderLeft: '4px solid #10b981', 
              padding: '12px 16px', 
              marginBottom: '20px', 
              borderRadius: '4px' 
            }}>
              {success}
            </div>
          )}

          <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '16px' }}>
              Register a New Doctor
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input id="name" type="text" className="form-control" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input id="email" type="email" placeholder="e.g. ali.kalakesh@liu.edu.lb" className="form-control" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="password">Temporary Password *</label>
                <input id="password" type="password" className="form-control" value={formData.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Register Doctor'}
              </button>
            </form>
          </div>
        </div>

        {/* Logs Column */}
        <div style={{ flex: '1 1 500px' }}>
          <div className="card">
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Recent Audit Logs</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>Latest 10 Events</span>
            </h3>

            {logError && <div className="error-message">{logError}</div>}
            
            {loadingLogs ? (
              <p>Fetching immutable logs...</p>
            ) : logs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notable system actions have been logged yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 4px' }}>Time</th>
                      <th style={{ padding: '8px 4px' }}>Action</th>
                      <th style={{ padding: '8px 4px' }}>Actor</th>
                      <th style={{ padding: '8px 4px' }}>Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 4px' }}>
                          {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          <br />
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 4px', fontWeight: '600', color: 'var(--primary-color)' }}>
                          {log.action}
                        </td>
                        <td style={{ padding: '12px 4px' }}>
                          <span className="user-badge" style={{ display: 'inline-block', marginBottom: '4px' }}>{log.actorRole}</span>
                          <br />ID: {log.actorUserId}
                        </td>
                        <td style={{ padding: '12px 4px' }}>
                          {log.targetType} #{log.targetId}
                          {log.metadata?.email && (
                            <><br/><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.metadata.email}</span></>
                          )}
                          {log.metadata?.title && (
                            <><br/><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.metadata.title}</span></>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeadAdminPanel;
