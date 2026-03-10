import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import '../styles/Layout.css';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({ name: '', fatherName: '', email: '', password: '', major: '' });
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
      if (!formData.email.endsWith('@liu.edu')) {
        throw new Error('Must use a valid @liu.edu email address');
      }
      await client('/auth/register/student', { body: formData });
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
          <h2 className="auth-title">Welcome Aboard!</h2>
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
          <h2 className="auth-title">Student Registration</h2>
          <p className="auth-subtitle">Create an account using your @liu.edu email</p>

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
              <label htmlFor="email" className="auth-label">University Email *</label>
              <input id="email" type="email" className="auth-input" value={formData.email} onChange={handleChange} required placeholder="student@liu.edu" />
            </div>

            <div className="auth-form-group">
              <label htmlFor="major" className="auth-label">Major (Optional)</label>
              <input id="major" type="text" className="auth-input" value={formData.major} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">Password *</label>
              <input id="password" type="password" className="auth-input" value={formData.password} onChange={handleChange} required />
            </div>

            <button type="submit" className="auth-btn">Register Student</button>
          </form>

          <div className="auth-footer">
            <Link to="/login" className="auth-link">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
