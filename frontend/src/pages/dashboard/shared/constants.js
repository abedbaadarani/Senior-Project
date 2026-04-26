export const CHART_COLORS = ['#f97316', '#6366f1', '#10b981', '#3b82f6', '#dc2626', '#a855f7'];

export const chartTooltipStyle = {
  contentStyle: {
    background: 'rgba(15,23,42,0.92)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '0.82rem',
    backdropFilter: 'blur(12px)',
  },
  labelStyle: { color: '#94a3b8', fontWeight: 600 },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

export const statusColor = (s) => ({
  PENDING: { bg: '#fef3c7', text: '#d97706' },
  REVIEWED: { bg: '#dbeafe', text: '#2563eb' },
  INTERVIEWING: { bg: '#ede9fe', text: '#7c3aed' },
  ACCEPTED: { bg: '#d1fae5', text: '#059669' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
}[s] || { bg: 'rgba(255,255,255,0.05)', text: '#94a3b8' });

export const STATUS_COLORS_MAP = {
  PENDING: '#f59e0b',
  REVIEWED: '#3b82f6',
  INTERVIEWING: '#7c3aed',
  ACCEPTED: '#10b981',
  REJECTED: '#ef4444',
};

export const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};
