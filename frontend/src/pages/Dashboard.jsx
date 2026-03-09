import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/Layout.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="page-title">
        {user?.role === 'HEAD_ADMIN' ? 'Welcome Back, Mister Admin' : `Welcome back, ${user?.name.split(' ')[0]}!`}
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
        You are logged in as <strong style={{color: 'black'}}>{user?.role}</strong>.
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '40px' }}>
        <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
          <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Opportunities</h3>
          <p style={{ color: 'var(--text-muted)' }}>Explore jobs and internships tailored for LIU students and alumni.</p>
          <Link to="/opportunities" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>View Boards</Link>
        </div>

        {(user?.role === 'STUDENT' || user?.role === 'ALUMNI' || user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN' || user?.role === 'HEAD_ADMIN') && (
          <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Recommendations</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {(user?.role === 'STUDENT' || user?.role === 'ALUMNI') ? 'View the recommendations instructors have sent for you.' : 'Write recommendations for your students.'}
            </p>
            <Link to="/recommendations" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>Go to Recommendations</Link>
          </div>
        )}

        {(user?.role === 'INSTRUCTOR' || user?.role === 'ALUMNI') && (
          <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0 }}>Manage Posts</h3>
            <p style={{ color: 'var(--text-muted)' }}>Create new opportunities or edit the ones you have posted.</p>
            <Link to="/my-opportunities" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>My Posts</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
