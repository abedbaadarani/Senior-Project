import React from 'react';

// A single skeleton bar or block
const SkeletonBase = ({ width, height, borderRadius = '8px', style = {} }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
        ...style
      }}
    />
  );
};

// A pre-built skeleton skeleton for an Opportunity/Alumni Card
export const CardSkeleton = () => (
  <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <SkeletonBase width="70%" height="24px" />
        <SkeletonBase width="40%" height="16px" />
      </div>
      <SkeletonBase width="60px" height="24px" borderRadius="12px" />
    </div>
    
    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
      <SkeletonBase width="80px" height="24px" borderRadius="12px" />
      <SkeletonBase width="100px" height="24px" borderRadius="12px" />
    </div>

    <SkeletonBase width="100%" height="40px" style={{ marginTop: 'auto' }} />
  </div>
);

// A pre-built skeleton for a List Item (e.g. Messages, Dashboard rows)
export const ListSkeleton = () => (
  <div style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <SkeletonBase width="40px" height="40px" borderRadius="50%" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
      <SkeletonBase width="30%" height="16px" />
      <SkeletonBase width="60%" height="14px" />
    </div>
  </div>
);

// CSS animation injected globally
const shimmerStyles = `
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// Inject styles once
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = shimmerStyles;
  document.head.appendChild(styleTag);
}

export default SkeletonBase;
