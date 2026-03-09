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
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <div className="card">
        <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome to LIU Alumni & Opportunities Platform</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Sign in to continue to LIU Connect</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="12345678@students.liu.edu.lb"
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>Don't have an account?</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
            <Link to="/register-student" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Student Registration</Link>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <Link to="/register-alumni" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Alumni Registration</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
