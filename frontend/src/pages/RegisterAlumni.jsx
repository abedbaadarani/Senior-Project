import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import '../styles/Layout.css';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

// ── Approval Pending Screen ────────────────────────────────────────────────────
const PendingScreen = ({ navigate }) => {
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/login');
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  // Progress arc percentage
  const pct = countdown / 8;

  return (
    <div className="auth-wrapper">
      <div className="floating-bubble bubble-1"></div>
      <div className="floating-bubble bubble-2"></div>
      <div className="floating-bubble bubble-3"></div>

      <div className="auth-container" style={{ maxWidth: '500px' }}>

        {/* Brand */}
        <div className="auth-brand-header">
          <h1>LIU Alumni &amp; Opportunities Platform</h1>
          <p>The exclusive professional network for LIU students and alumni.</p>
        </div>

        <div className="auth-card" style={{ textAlign: 'center', padding: '40px 36px' }}>

          {/* Pulsing hourglass icon */}
          <div style={{
            width: '76px', height: '76px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.06))',
            border: '2px solid rgba(249,115,22,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 0 10px rgba(249,115,22,0.06), 0 0 40px rgba(249,115,22,0.12)',
            animation: 'iconPulse 2.6s ease-in-out infinite',
          }}>
            <span style={{ fontSize: '2.2rem' }}>⏳</span>
          </div>

          {/* Title */}
          <h2 className="auth-title" style={{ marginBottom: '8px', fontSize: '1.5rem' }}>
            Registration Submitted!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '24px' }}>
            Your alumni account has been created successfully. It is now
            {' '}<strong style={{ color: '#fb923c' }}>pending review by an instructor</strong>.
            You will be able to log in only after your registration has been approved.
          </p>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '0 0 22px' }} />

          {/* What happens next */}
          <div style={{ textAlign: 'left', marginBottom: '26px' }}>
            <p style={{
              color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', fontWeight: '700',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px'
            }}>
              What happens next
            </p>
            {[
              { icon: '📋', title: 'Under Review',     desc: 'An instructor will verify your university details' },
              { icon: '✅', title: 'Approval',          desc: "You'll receive access once your account is approved" },
              { icon: '🚀', title: 'Full Access',       desc: 'Log in and connect with the LIU network' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '10px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <span style={{
                  width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                  background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem',
                }}>{icon}</span>
                <div style={{ paddingTop: '1px' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.87rem', color: '#e2e8f0' }}>{title}</div>
                  <div style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.32)', marginTop: '2px' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Live status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(249,115,22,0.09)',
            border: '1px solid rgba(249,115,22,0.22)',
            borderRadius: '99px',
            padding: '6px 18px',
            marginBottom: '28px',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#f97316',
              boxShadow: '0 0 7px rgba(249,115,22,0.9)',
              display: 'inline-block',
              animation: 'dotBlink 1.4s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.79rem', fontWeight: '600', color: '#fb923c', letterSpacing: '0.03em' }}>
              Awaiting Instructor Approval
            </span>
          </div>

          {/* Countdown redirect bar */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: '500' }}>
                Redirecting to login in…
              </span>
              <span style={{
                fontSize: '1rem', fontWeight: '800', color: '#fb923c',
                minWidth: '24px', textAlign: 'center',
              }}>
                {countdown}s
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '99px', height: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f97316, #ea580c)',
                borderRadius: '99px',
                transition: 'width 1s linear',
                boxShadow: '0 0 8px rgba(249,115,22,0.5)',
              }} />
            </div>
          </div>

          {/* Manual back button */}
          <button
            onClick={() => navigate('/login')}
            className="auth-btn"
            style={{ width: '100%' }}
          >
            ← Go to Login Now
          </button>
        </div>
      </div>

      <style>{`
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 0 10px rgba(249,115,22,0.06), 0 0 40px rgba(249,115,22,0.12); }
          50%       { box-shadow: 0 0 0 16px rgba(249,115,22,0.03), 0 0 56px rgba(249,115,22,0.22); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
};

// ── Main Registration Form ─────────────────────────────────────────────────────
const RegisterAlumni = () => {
  const [formData, setFormData] = useState({
    name: '', fatherName: '', email: '', password: '',
    graduationYear: '', universityId: '', major: ''
  });
  const [error, setError]     = useState(null);
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
      if (!formData.universityId) {
        throw new Error('Must provide a valid university ID');
      }

      const pw = formData.password;
      if (pw.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      const checks = [/[A-Z]/.test(pw), /[a-z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
      if (checks.filter(Boolean).length < 2) {
        throw new Error('Password is too weak. Include uppercase, lowercase, numbers, or special characters.');
      }

      const payload = { ...formData, graduationYear: parseInt(formData.graduationYear, 10) };
      await client('/auth/register/alumni', { body: payload });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) return <PendingScreen navigate={navigate} />;

  return (
    <div className="auth-wrapper">
      <div className="floating-bubble bubble-1"></div>
      <div className="floating-bubble bubble-2"></div>
      <div className="floating-bubble bubble-3"></div>

      <div className="auth-container">
        <div className="auth-brand-header">
          <h1>LIU Alumni &amp; Opportunities Platform</h1>
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
              <label htmlFor="universityId" className="auth-label">University ID *</label>
              <input id="universityId" type="text" className="auth-input" value={formData.universityId} onChange={handleChange} required placeholder="e.g. 12110625" />
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
              <PasswordStrengthMeter password={formData.password} />
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
