import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'INSTRUCTOR') {
      import('../api/client').then((module) => {
        module.default('/alumni/pending').then(data => {
          setPendingCount(data ? data.length : 0);
        }).catch(() => { });
      });
    }
  }, [user, location.pathname]); // Refresh count when navigation happens

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to={user ? '/dashboard' : '/'}>🎓 LIU Connect</Link>
        </div>
        <div className="navbar-user">
          {user ? (
            <>
              <span className="user-badge">{user.role.replace('_', ' ')}</span>
              <span className="user-name">{user.name}</span>
              <button className="btn-logout" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <Link className="btn-login" to="/login">Log In</Link>
          )}
        </div>
      </nav>

      <div className="layout-body">
        {user && !user.needsPasswordChange && (
          <aside className="sidebar">
            <ul className="sidebar-menu">
              <li>
                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              </li>
              <li>
                <Link to="/opportunities" className={isActive('/opportunities')}>Opportunities</Link>
              </li>

              {(user.role === 'INSTRUCTOR' || user.role === 'ALUMNI') && (
                <li>
                  <Link to="/my-opportunities" className={isActive('/my-opportunities')}>My Posts</Link>
                </li>
              )}

              {(user.role === 'STUDENT' || user.role === 'INSTRUCTOR' || user.role === 'ADMIN' || user.role === 'HEAD_ADMIN' || user.role === 'ALUMNI') && (
                <li>
                  <Link to="/recommendations" className={isActive('/recommendations')}>
                    {user.role === 'INSTRUCTOR' ? 'Students Recommended' : 'Recommendations'}
                  </Link>
                </li>
              )}

              {user.role === 'INSTRUCTOR' && (
                <li>
                  <Link to="/alumni-approval" className={isActive('/alumni-approval')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Alumni Approvals
                    {pendingCount > 0 && (
                      <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              )}

              {user.role === 'ADMIN' && (
                <li>
                  <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
                </li>
              )}

              {user.role === 'HEAD_ADMIN' && (
                <li>
                  <Link to="/head-admin" className={isActive('/head-admin')}>Doctor Registration</Link>
                </li>
              )}
            </ul>
          </aside>
        )}

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
