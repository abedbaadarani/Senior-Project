import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import '../styles/Layout.css';

const RegisterAlumni = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', graduationYear: '', major: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!formData.graduationYear || isNaN(formData.graduationYear)) {
        throw new Error('Must provide a valid graduation year');
      }
      
      const payload = {
        ...formData,
        graduationYear: parseInt(formData.graduationYear, 10)
      };
      
      await client('/auth/register/alumni', { body: payload });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary-color)' }}>Alumni Registered!</h2>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <div className="card">
        <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Alumni Registration</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Connect with peers and share opportunities</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input id="name" type="text" className="form-control" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input id="email" type="email" className="form-control" value={formData.email} onChange={handleChange} required placeholder="personal@email.com" />
          </div>

          <div className="form-group">
            <label htmlFor="graduationYear">Graduation Year *</label>
            <input id="graduationYear" type="number" min="1950" max="2030" className="form-control" value={formData.graduationYear} onChange={handleChange} required placeholder="e.g. 2020" />
          </div>

          <div className="form-group">
            <label htmlFor="major">Major (Optional)</label>
            <input id="major" type="text" className="form-control" value={formData.major} onChange={handleChange} placeholder="e.g. Computer Science" />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Password *</label>
            <input id="password" type="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Register Alumni</button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterAlumni;
