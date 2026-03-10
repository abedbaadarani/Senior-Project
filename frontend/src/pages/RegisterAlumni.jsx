import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import '../styles/Layout.css';

const RegisterAlumni = () => {
  const [formData, setFormData] = useState({ name: '', fatherName: '', email: '', password: '', graduationYear: '', major: '' });
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
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 className="auth-title">Welcome Back!</h2>
          <p className="auth-subtitle" style={{ marginBottom: 0 }}>Registered successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="floating-bubble bubble-1"></div>
      <div className="floating-bubble bubble-2"></div>
      <div className="floating-bubble bubble-3"></div>

      <div className="auth-container">
        <div className="auth-brand-header">
          <h1>LIU Alumni & Opportunities Platform</h1>
          <p>The exclusive professional network for LIU students and alumni.</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-title">Alumni Registration</h2>
          <p className="auth-subtitle">Connect with peers and share opportunities</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="name" className="auth-label">Full Name *</label>
              <input id="name" type="text" className="auth-input" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="auth-form-group">
              <label htmlFor="fatherName" className="auth-label">Father's Name *</label>
              <input id="fatherName" type="text" className="auth-input" value={formData.fatherName} onChange={handleChange} required />
            </div>

            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">Email *</label>
              <input id="email" type="email" className="auth-input" value={formData.email} onChange={handleChange} required placeholder="personal@email.com" />
            </div>

            <div className="auth-form-group">
              <label htmlFor="graduationYear" className="auth-label">Graduation Year *</label>
              <input id="graduationYear" type="number" min="1950" max="2030" className="auth-input" value={formData.graduationYear} onChange={handleChange} required placeholder="e.g. 2020" />
            </div>

            <div className="auth-form-group">
              <label htmlFor="major" className="auth-label">Major (Optional)</label>
              <input id="major" type="text" className="auth-input" value={formData.major} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">Password *</label>
              <input id="password" type="password" className="auth-input" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="auth-btn">Register Alumni</button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAlumni;
