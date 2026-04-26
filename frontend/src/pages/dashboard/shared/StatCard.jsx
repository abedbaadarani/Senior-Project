import React from 'react';
import useCountUp from './useCountUp';

const StatCard = ({ icon, label, value, color = 'var(--primary-color)', sub, onClick, gradient, trend }) => {
  const isNumber = typeof value === 'number';
  const animatedValue = useCountUp(isNumber ? value : 0);
  const displayValue = value === null || value === undefined ? '...' : isNumber ? animatedValue : value;

  return (
    <div style={{
      background: gradient || 'rgba(255,255,255,0.07)',
      borderRadius: '14px',
      padding: '20px 24px',
      flex: '1 1 140px',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
    }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)'; }}
    >
      <span style={{ fontSize: '1.6rem' }}>{icon}</span>
      <span style={{ fontSize: '2rem', fontWeight: '800', color, lineHeight: 1 }}>{displayValue}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      {sub && <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>{sub}</span>}
      {trend && (
        <span style={{
          fontSize: '0.7rem',
          fontWeight: '700',
          color: '#10b981',
          background: 'rgba(16,185,129,0.12)',
          padding: '2px 8px',
          borderRadius: '99px',
          display: 'inline-block',
          width: 'fit-content',
          marginTop: '2px',
        }}>
          {trend}
        </span>
      )}
    </div>
  );
};

export default StatCard;
