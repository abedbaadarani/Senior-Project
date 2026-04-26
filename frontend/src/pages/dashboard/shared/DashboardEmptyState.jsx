import React from 'react';
import GlobalEmptyState from '../../../components/EmptyState';

const DashboardEmptyState = ({ icon, text }) => (
  <GlobalEmptyState icon={icon} title="" message={text} />
);

export default DashboardEmptyState;
