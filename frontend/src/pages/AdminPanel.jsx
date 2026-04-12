import React, { useState } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import '../styles/Layout.css';

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
    </div>
  );
};

export default AdminPanel;
