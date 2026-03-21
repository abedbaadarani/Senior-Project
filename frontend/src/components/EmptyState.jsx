import React from 'react';

const EmptyState = ({ icon = '📭', title = 'No data found', message = 'There is nothing to show here right now.', actionText, onAction }) => {
  return (
    <div style={{
      width: '100%',
      padding: '60px 24px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        fontSize: '3.5rem',
        marginBottom: '20px',
        opacity: 0.6,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
      }}>
        {icon}
      </div>
      <h3 style={{
        color: '#f8fafc',
        fontSize: '1.25rem',
        margin: '0 0 10px 0',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#94a3b8',
        fontSize: '0.95rem',
        margin: 0,
        maxWidth: '400px',
        lineHeight: 1.5
      }}>
        {message}
      </p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
          style={{
            marginTop: '24px',
            padding: '10px 24px',
            borderRadius: '99px',
            fontSize: '0.9rem',
            fontWeight: '600',
            background: 'rgba(249,115,22,0.15)',
            color: '#fb923c',
            border: '1px solid rgba(249,115,22,0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(249,115,22,0.25)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(249,115,22,0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
