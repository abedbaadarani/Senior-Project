import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Login from '../pages/Login';
import RegisterStudent from '../pages/RegisterStudent';
import RegisterAlumni from '../pages/RegisterAlumni';
import Dashboard from '../pages/Dashboard';
import Opportunities from '../pages/Opportunities';
import OpportunityDetails from '../pages/OpportunityDetails';
import MyOpportunities from '../pages/MyOpportunities';
import Recommendations from '../pages/Recommendations';
import AdminPanel from '../pages/AdminPanel';
import HeadAdminPanel from '../pages/HeadAdminPanel';
import AlumniApproval from '../pages/AlumniApproval';
import SetupPassword from '../pages/SetupPassword';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        <Route path="/register-alumni" element={<RegisterAlumni />} />

        {/* Root Redirect based on layout context (handled by Layout but redirect here first) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes encapsulated in visual Layout */}
        <Route element={<Layout />}>
          
          {/* Forced action route */}
          <Route path="/setup-password" element={<SetupPassword />} />

          {/* Authenticated defaults */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/opportunities" element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          } />

          <Route path="/opportunities/:id" element={
            <ProtectedRoute>
              <OpportunityDetails />
            </ProtectedRoute>
          } />

          <Route path="/recommendations" element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          } />

          {/* Instructor & Alumni Only */}
          <Route path="/my-opportunities" element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ALUMNI']}>
              <MyOpportunities />
            </ProtectedRoute>
          } />

          {/* Instructor Only */}
          <Route path="/alumni-approval" element={
            <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
              <AlumniApproval />
            </ProtectedRoute>
          } />

          {/* Admin Only */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'HEAD_ADMIN']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* Head Admin Only */}
          <Route path="/head-admin" element={
            <ProtectedRoute allowedRoles={['HEAD_ADMIN']}>
              <HeadAdminPanel />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
