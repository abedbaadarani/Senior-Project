import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './dashboard/StudentDashboard';
import AlumniDashboard from './dashboard/AlumniDashboard';
import InstructorDashboard from './dashboard/InstructorDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import HeadAdminDashboard from './dashboard/HeadAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'HEAD_ADMIN': return <HeadAdminDashboard user={user} />;
    case 'ADMIN':      return <AdminDashboard user={user} />;
    case 'INSTRUCTOR': return <InstructorDashboard user={user} />;
    case 'ALUMNI':     return <AlumniDashboard user={user} />;
    case 'STUDENT':
    default:           return <StudentDashboard user={user} />;
  }
};

export default Dashboard;
