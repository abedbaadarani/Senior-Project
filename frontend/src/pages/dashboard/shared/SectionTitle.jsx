import React from 'react';

const SectionTitle = ({ children, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#e2e8f0' }}>{children}</h2>
    {action}
  </div>
);

export default SectionTitle;
