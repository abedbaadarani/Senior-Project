import React, { useState } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import '../styles/Layout.css';

const FormCard = ({ title, subtitle, accentColor, children, onSubmit, submitting, btnLabel }) => (
  <div className="card" style={{ flex: '1 1 340px', maxWidth: '480px', margin: 0 }}>
    <h3 style={{ marginTop: 0, color: accentColor, marginBottom: '4px' }}>{title}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>{subtitle}</p>
    <form onSubmit={onSubmit}>
      {children}
      <button
        type="submit"
        className="btn-primary"
        disabled={submitting}
        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
      >
        {submitting ? 'Creating…' : btnLabel}
      </button>
    </form>
  </div>
);

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
    <div className="card" style={{ margin: 0 }}>
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
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#e2e8f0' }}>{u.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{u.email}</div>
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

const HeadAdminPanel = () => {
  const { showToast } = useToast();

  const [instructorForm, setInstructorForm]           = useState({ name: '', email: '', password: '' });
  const [instructorSubmitting, setInstructorSubmitting] = useState(false);
  const [adminForm, setAdminForm]                     = useState({ name: '', email: '', password: '' });
  const [adminSubmitting, setAdminSubmitting]         = useState(false);

  const handleInstructorSubmit = async (e) => {
    e.preventDefault();
    if (instructorForm.password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    setInstructorSubmitting(true);
    try {
      await client('/admin/create-instructor', { body: instructorForm });
      showToast(`Doctor account created for ${instructorForm.name} (${instructorForm.email})`, 'success');
      setInstructorForm({ name: '', email: '', password: '' });
    } catch (err) {
      showToast(err.message || 'Failed to create doctor account.', 'error');
    } finally {
      setInstructorSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (adminForm.password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    setAdminSubmitting(true);
    try {
      await client('/admin/create-admin', { body: adminForm });
      showToast(`Admin account created for ${adminForm.name} (${adminForm.email})`, 'success');
      setAdminForm({ name: '', email: '', password: '' });
    } catch (err) {
      showToast(err.message || 'Failed to create admin account.', 'error');
    } finally {
      setAdminSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Account Registration</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Create Doctor (Instructor) and Admin accounts. All new accounts must change their password on first login.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>

        <FormCard
          title="Register a New Doctor"
          subtitle="Creates an Instructor account. The doctor must set a new password on first login."
          accentColor="var(--primary-color)"
          onSubmit={handleInstructorSubmit}
          submitting={instructorSubmitting}
          btnLabel="Register Doctor"
        >
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" className="form-control" value={instructorForm.name}
              onChange={e => setInstructorForm(p => ({ ...p, name: e.target.value }))}
              required placeholder="e.g. Dr. Ali Hassan" />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" className="form-control" value={instructorForm.email}
              onChange={e => setInstructorForm(p => ({ ...p, email: e.target.value }))}
              required placeholder="e.g. ali.hassan@liu.edu.lb" />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Temporary Password *</label>
            <input type="password" className="form-control" value={instructorForm.password}
              onChange={e => setInstructorForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
        </FormCard>

        <FormCard
          title="Create Admin Account"
          subtitle="Creates a university staff Admin. Admins can moderate content and provision doctors, but cannot access the audit log."
          accentColor="#7c3aed"
          onSubmit={handleAdminSubmit}
          submitting={adminSubmitting}
          btnLabel="Create Admin"
        >
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" className="form-control" value={adminForm.name}
              onChange={e => setAdminForm(p => ({ ...p, name: e.target.value }))}
              required placeholder="e.g. Rania Khalil" />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input type="email" className="form-control" value={adminForm.email}
              onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))}
              required placeholder="e.g. staff@liu.edu.lb" />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Temporary Password *</label>
            <input type="password" className="form-control" value={adminForm.password}
              onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
        </FormCard>

      </div>

      <div style={{ marginTop: '40px' }}>
        <PasswordResetSection />
      </div>
    </div>
  );
};

export default HeadAdminPanel;
