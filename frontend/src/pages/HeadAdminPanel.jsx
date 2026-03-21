import React, { useState } from 'react';
import client from '../api/client';
import '../styles/Layout.css';

const HeadAdminPanel = () => {
  // --- Instructor form state ---
  const [instructorForm, setInstructorForm] = useState({ name: '', email: '', password: '' });
  const [instructorError, setInstructorError] = useState(null);
  const [instructorSuccess, setInstructorSuccess] = useState(null);
  const [instructorSubmitting, setInstructorSubmitting] = useState(false);

  // --- Admin form state ---
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const handleInstructorSubmit = async (e) => {
    e.preventDefault();
    setInstructorError(null);
    setInstructorSuccess(null);
    setInstructorSubmitting(true);
    try {
      await client('/admin/create-instructor', { body: instructorForm });
      setInstructorSuccess(`Doctor account for ${instructorForm.name} (${instructorForm.email}) was successfully created!`);
      setInstructorForm({ name: '', email: '', password: '' });
    } catch (err) {
      setInstructorError(err.message || 'Failed to create doctor');
    } finally {
      setInstructorSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    setAdminSubmitting(true);
    try {
      await client('/admin/create-admin', { body: adminForm });
      setAdminSuccess(`Admin account for ${adminForm.name} (${adminForm.email}) was successfully created!`);
      setAdminForm({ name: '', email: '', password: '' });
    } catch (err) {
      setAdminError(err.message || 'Failed to create admin');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const alertBox = (type, msg) => (
    <div style={{
      backgroundColor: type === 'success' ? '#ecfdf5' : '#fef2f2',
      color: type === 'success' ? '#065f46' : '#991b1b',
      borderLeft: `4px solid ${type === 'success' ? '#10b981' : '#ef4444'}`,
      padding: '12px 16px',
      marginBottom: '20px',
      borderRadius: '4px',
      fontSize: '0.9rem',
    }}>{msg}</div>
  );

  return (
    <div>
      <h1 className="page-title">Account Registration</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Create Doctor and Admin accounts. New accounts receive a temporary password they must change on first login.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>

        {/* Register Doctor (Instructor) */}
        <div className="card" style={{ flex: '1 1 340px', maxWidth: '480px', margin: 0 }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '4px' }}>
            Register a New Doctor
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Creates an Instructor account. The doctor must change their password on first login.
          </p>

          {instructorError && alertBox('error', instructorError)}
          {instructorSuccess && alertBox('success', instructorSuccess)}

          <form onSubmit={handleInstructorSubmit}>
            <div className="form-group">
              <label htmlFor="inst-name">Full Name *</label>
              <input
                id="inst-name" type="text" className="form-control"
                value={instructorForm.name}
                onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="inst-email">Email Address *</label>
              <input
                id="inst-email" type="email" className="form-control"
                placeholder="e.g. ali.kalakesh@liu.edu.lb"
                value={instructorForm.email}
                onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="inst-password">Temporary Password *</label>
              <input
                id="inst-password" type="password" className="form-control"
                value={instructorForm.password}
                onChange={(e) => setInstructorForm({ ...instructorForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={instructorSubmitting}>
              {instructorSubmitting ? 'Creating...' : 'Register Doctor'}
            </button>
          </form>
        </div>

        {/* Create Admin */}
        <div className="card" style={{ flex: '1 1 340px', maxWidth: '480px', margin: 0 }}>
          <h3 style={{ marginTop: 0, color: '#7c3aed', marginBottom: '4px' }}>
            Create Admin Account
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Creates a university staff Admin. Admins can moderate content and provision doctors, but cannot access the audit log.
          </p>

          {adminError && alertBox('error', adminError)}
          {adminSuccess && alertBox('success', adminSuccess)}

          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label htmlFor="admin-name">Full Name *</label>
              <input
                id="admin-name" type="text" className="form-control"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-email">Email Address *</label>
              <input
                id="admin-email" type="email" className="form-control"
                placeholder="e.g. staff@liu.edu.lb"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label htmlFor="admin-password">Temporary Password *</label>
              <input
                id="admin-password" type="password" className="form-control"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={adminSubmitting}
              style={{ backgroundColor: '#7c3aed' }}
            >
              {adminSubmitting ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default HeadAdminPanel;
