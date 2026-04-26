import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Wait for AuthContext to update and redirect
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
      setIsSubmitting(false);
    }
  };

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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your platform</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">Email</label>
              <input
                id="email"
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="12345678@students.liu.edu.lb"
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">Password</label>
              <input
                id="password"
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Forgot your password? Contact your administrator.
            </p>
          </form>

          <div className="auth-footer">
            <p style={{ marginBottom: '12px' }}>Don't have an account?</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to="/register-student" className="auth-link">Student Registration</Link>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <Link to="/register-alumni" className="auth-link">Alumni Registration</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
