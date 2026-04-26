import React from 'react';

const ChartCard = ({ title, children, style = {} }) => (
  <div style={{
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '14px',
    padding: '20px 24px',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
    ...style,
  }}>
    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
      {title}
    </p>
    {children}
  </div>
);

export default ChartCard;
