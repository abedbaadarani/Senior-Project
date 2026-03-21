import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here if needed
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d1b2a',
          color: '#f8fafc',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.4))' }}>
              ⚠️
            </div>
            <h1 style={{ margin: '0 0 16px', fontSize: '1.75rem', fontWeight: 700 }}>Something went wrong.</h1>
            <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: 1.6 }}>
              We encountered an unexpected error while trying to display this page. Our team has been notified.
            </p>

            {/* Optional: Show technical error in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '32px',
                textAlign: 'left',
                overflowX: 'auto',
                fontSize: '0.8rem',
                color: '#ef4444',
                fontFamily: 'monospace'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={this.handleReload}
                className="btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  flex: 1
                }}
              >
                Try Again
              </button>
              <button 
                onClick={this.handleGoHome}
                className="btn-secondary"
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.05)',
                  flex: 1
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
