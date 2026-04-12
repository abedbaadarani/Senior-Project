import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const COLORS = {
  success: { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.45)', text: '#34d399' },
  error:   { bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.45)',  text: '#f87171' },
  warning: { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.45)', text: '#fbbf24' },
  info:    { bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.45)', text: '#a5b4fc' },
};

const ToastContainer = ({ toasts, onRemove }) => (
  <div style={{
    position: 'fixed', top: '80px', right: '24px',
    zIndex: 99999, display: 'flex', flexDirection: 'column',
    gap: '10px', pointerEvents: 'none',
  }}>
    {toasts.map(toast => {
      const c = COLORS[toast.type] || COLORS.info;
      return (
        <div
          key={toast.id}
          style={{
            pointerEvents: 'all',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '14px 16px 14px 18px',
            borderRadius: '12px',
            background: c.bg,
            border: `1px solid ${c.border}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
            minWidth: '290px', maxWidth: '400px',
            animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>
            {ICONS[toast.type]}
          </span>
          <span style={{ flex: 1, color: c.text, fontSize: '0.88rem', fontWeight: '500', lineHeight: '1.5' }}>
            {toast.message}
          </span>
          <button
            onClick={() => onRemove(toast.id)}
            style={{
              background: 'none', border: 'none', color: c.text,
              cursor: 'pointer', opacity: 0.65, fontSize: '1.2rem',
              padding: '0', lineHeight: 1, flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      );
    })}
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
