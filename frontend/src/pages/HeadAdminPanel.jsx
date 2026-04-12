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

const HeadAdminPanel = () => {
  const { showToast } = useToast();

  const [instructorForm, setInstructorForm]           = useState({ name: '', email: '', password: '' });
  const [instructorSubmitting, setInstructorSubmitting] = useState(false);
  const [adminForm, setAdminForm]                     = useState({ name: '', email: '', password: '' });
  const [adminSubmitting, setAdminSubmitting]         = useState(false);

  const handleInstructorSubmit = async (e) => {
    e.preventDefault();
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
    </div>
  );
};

export default HeadAdminPanel;
