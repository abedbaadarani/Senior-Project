import React, { useState } from 'react';
import client from '../api/client';
import '../styles/Layout.css';

const AdminPanel = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      setSuccess(`Instructor account for ${formData.email} was successfully created!`);
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Failed to create instructor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Admin Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Manage platform access. As an ADMIN, you can provision new INSTRUCTOR accounts.
      </p>

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
          Create new INSTRUCTOR
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input 
              id="name" 
              type="text" 
              className="form-control" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input 
              id="email" 
              type="email" 
              className="form-control" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Temporary Password *</label>
            <input 
              id="password" 
              type="password" 
              className="form-control" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Instructor Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
