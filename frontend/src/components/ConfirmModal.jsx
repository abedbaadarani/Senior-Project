import React, { useEffect } from 'react';

const ConfirmModal = ({
  isOpen, title, message,
  confirmText = 'Confirm', cancelText = 'Cancel',
  onConfirm, onCancel, type = 'danger'
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const palette = {
    danger:  { btn: '#ef4444', hover: '#dc2626', icon: '🗑️', accent: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.28)'  },
    warning: { btn: '#f59e0b', hover: '#d97706', icon: '⚠️',  accent: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
    info:    { btn: '#f97316', hover: '#ea580c', icon: 'ℹ️',  accent: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.28)' },
  }[type] || { btn: '#ef4444', hover: '#dc2626', icon: '🗑️', accent: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.28)' };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #0f1f3d, #1e293b)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px', padding: '32px',
          maxWidth: '420px', width: '90%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: '56px', height: '56px',
          background: palette.accent, border: `1px solid ${palette.border}`,
          borderRadius: '16px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.8rem', marginBottom: '20px',
        }}>
          {palette.icon}
        </div>
        <h3 style={{ color: '#f8fafc', margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: '700' }}>
          {title}
        </h3>
        <p style={{ color: '#94a3b8', margin: '0 0 28px 0', lineHeight: '1.6', fontSize: '0.92rem' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 22px', borderRadius: '10px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: '#94a3b8', cursor: 'pointer', fontWeight: '600',
              fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f8fafc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 22px', borderRadius: '10px',
              background: palette.btn, border: 'none',
              color: '#fff', cursor: 'pointer', fontWeight: '600',
              fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = palette.hover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = palette.btn; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
