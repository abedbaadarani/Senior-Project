import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call for sending a reset email
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h2 className="auth-title">Check Your Email</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
                        If an account is associated with {email}, we've sent instructions to reset your password.
                    </p>
                    <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '12px 24px' }}>
                        Return to Login
                    </Link>
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
                    <h2 className="auth-title">Reset Password</h2>
                    <p className="auth-subtitle">Enter your email and we'll send you a recovery link</p>

                    <form onSubmit={handleSubmit}>
                        <div className="auth-form-group">
                            <label htmlFor="email" className="auth-label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="university or personal email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}>
                                Wait, I remember my password!
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
