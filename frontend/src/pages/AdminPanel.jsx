import React, { useState } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import '../styles/Layout.css';

const PasswordResetSection = () => {
  const { showToast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resettingId, setResettingId] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [resetUser, setResetUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setSearching(true);
    setTempPassword(null);
    try {
      const users = await client('/users');
      const lower = searchEmail.toLowerCase();
      const matches = (users || []).filter(u =>
        u.email?.toLowerCase().includes(lower) || u.name?.toLowerCase().includes(lower)
      ).slice(0, 5);
      setSearchResults(matches);
      if (matches.length === 0) showToast('No users found matching that search.', 'warning');
    } catch (err) {
      showToast('Failed to search users.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleReset = async (user) => {
    setResettingId(user.id);
    try {
      const result = await client(`/admin/reset-password/${user.id}`, { method: 'PATCH' });
      setTempPassword(result.temporaryPassword);
      setResetUser(user);
      showToast(`Password reset for ${user.name}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to reset password.', 'error');
    } finally {
      setResettingId(null);
    }
  };

  const roleBadgeColor = { HEAD_ADMIN: '#dc2626', ADMIN: '#a855f7', INSTRUCTOR: '#3b82f6', ALUMNI: '#10b981', STUDENT: '#f59e0b' };

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, color: '#f59e0b', marginBottom: '4px' }}>Reset User Password</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
        Search for a user and reset their password. They will be required to change it on next login.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email..."
          value={searchEmail}
          onChange={e => { setSearchEmail(e.target.value); setTempPassword(null); }}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" disabled={searching} style={{ whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '16px' }}>
          {searchResults.map((u, i) => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: i < searchResults.length - 1 ? '1px solid var(--border-color)' : 'none',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{u.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '99px',
                  background: `${roleBadgeColor[u.role] || '#64748b'}22`, color: roleBadgeColor[u.role] || '#64748b',
                }}>
                  {u.role?.replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleReset(u)}
                  disabled={resettingId === u.id}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                    color: '#f59e0b', cursor: 'pointer',
                  }}
                >
                  {resettingId === u.id ? 'Resetting...' : 'Reset'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tempPassword && resetUser && (
        <div style={{
          background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '12px', padding: '16px 20px', marginTop: '8px',
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#10b981', fontSize: '0.9rem' }}>
            Password reset for {resetUser.name}
          </p>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Temporary password (give this to the user):
          </p>
          <div style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px 16px',
            fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc',
            letterSpacing: '0.1em', userSelect: 'all',
          }}>
            {tempPassword}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            The user will be required to set a new password on their next login.
          </p>
        </div>
      )}
    </div>
  );
};

const AdminPanel = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await client('/admin/create-instructor', { body: formData });
      showToast(`Instructor account created for ${formData.email}`, 'success');
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      showToast(err.message || 'Failed to create instructor.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Admin Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Manage platform access. As an Admin, you can provision new Instructor accounts.
      </p>

      <div className="card">
        <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '6px' }}>
          Register New Instructor
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          The instructor will receive a temporary password and must change it on first login.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input id="name" type="text" className="form-control" value={formData.name}
              onChange={handleChange} required placeholder="e.g. Dr. Ali Hassan" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input id="email" type="email" className="form-control" value={formData.email}
              onChange={handleChange} required placeholder="e.g. ali.hassan@liu.edu.lb" />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Temporary Password *</label>
            <input id="password" type="password" className="form-control" value={formData.password}
              onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Instructor Account'}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '32px' }}>
        <PasswordResetSection />
      </div>
    </div>
  );
};

export default AdminPanel;
