import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import '../styles/Layout.css';

const Icon = ({ children }) => <span className="nav-icon">{children}</span>;

const ROLE_META = {
  HEAD_ADMIN: { color: '#dc2626', label: 'Head Admin' },
  ADMIN:      { color: '#7c3aed', label: 'Admin'      },
  INSTRUCTOR: { color: '#2563eb', label: 'Instructor'  },
  ALUMNI:     { color: '#059669', label: 'Alumni'      },
  STUDENT:    { color: '#d97706', label: 'Student'     },
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const roleMeta = ROLE_META[user?.role] || { color: '#64748b', label: user?.role || '' };
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (user?.role === 'INSTRUCTOR') {
      import('../api/client').then(m =>
        m.default('/alumni/pending')
          .then(data => setPendingCount(data?.length ?? 0))
          .catch(() => {})
      );
    }
  }, [user, location.pathname]);

  // Scroll-to-top listener on the content element
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="layout-container">

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to={user ? '/dashboard' : '/'}>
            <div className="nav-logo-badge">A&O</div>
            <div className="nav-logo-text">
              <span className="nav-logo-title">Alumni &amp; Opportunities</span>
              <span className="nav-logo-sub">Lebanese International University</span>
            </div>
          </Link>
        </div>

        <div className="navbar-user">
          {user ? (
            <>
              <NotificationsDropdown />
              <div className="navbar-user-pill">
                <div
                  className="navbar-avatar"
                  style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}bb)` }}
                >
                  {initials}
                </div>
                <span className="user-name">{user.name}</span>
                {user.role === 'HEAD_ADMIN' && (
                  <span
                    className="user-badge"
                    style={{ background: `${roleMeta.color}28`, color: roleMeta.color, border: `1px solid ${roleMeta.color}44` }}
                  >
                    {roleMeta.label}
                  </span>
                )}
              </div>
              <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <Link className="btn-login" to="/login">Sign In</Link>
          )}
        </div>
      </nav>

      {/* Body */}
      <div className="layout-body">

        {user && !user.needsPasswordChange && (
          <aside className="sidebar">
            <ul className="sidebar-menu">

              <li>
                <Link to="/dashboard" className={isActive('/dashboard')}>
                  <Icon>🏠</Icon> Dashboard
                </Link>
              </li>

              {(user.role === 'STUDENT' || user.role === 'ALUMNI') && (
                <li>
                  <Link to="/profile" className={isActive('/profile')}>
                    <Icon>👤</Icon> My Profile
                  </Link>
                </li>
              )}

              <li>
                <Link to="/opportunities" className={isActive('/opportunities')}>
                  <Icon>💼</Icon> Opportunities
                </Link>
              </li>

              <li>
                <Link to="/messages" className={isActive('/messages')}>
                  <Icon>💬</Icon> Messages
                </Link>
              </li>

              {(user.role === 'ALUMNI' || user.role === 'STUDENT') && (
                <li>
                  <Link to="/alumni-directory" className={isActive('/alumni-directory')}>
                    <Icon>📒</Icon> Alumni Directory
                  </Link>
                </li>
              )}

              {(user.role === 'INSTRUCTOR' || user.role === 'ALUMNI') && (
                <li>
                  <Link to="/my-opportunities" className={isActive('/my-opportunities')}>
                    <Icon>📌</Icon> My Posts
                  </Link>
                </li>
              )}

              {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN' || user.role === 'HEAD_ADMIN' || user.role === 'ALUMNI') && (
                <li>
                  <Link to="/recommendations" className={isActive('/recommendations')}>
                    <Icon>🌟</Icon>
                    {user.role === 'INSTRUCTOR' ? 'Students Recommended' : 'Recommendations'}
                  </Link>
                </li>
              )}

              {user.role === 'INSTRUCTOR' && (
                <li>
                  <Link to="/alumni-approval" className={isActive('/alumni-approval')}>
                    <Icon>✅</Icon>
                    Alumni Approvals
                    {pendingCount > 0 && (
                      <span className="sidebar-badge">{pendingCount}</span>
                    )}
                  </Link>
                </li>
              )}

              {user.role === 'ADMIN' && (
                <li>
                  <Link to="/admin" className={isActive('/admin')}>
                    <Icon>🛡️</Icon> Admin Panel
                  </Link>
                </li>
              )}

              {user.role === 'HEAD_ADMIN' && (
                <>
                  <li>
                    <Link to="/head-admin" className={isActive('/head-admin')}>
                      <Icon>➕</Icon> Account Registration
                    </Link>
                  </li>
                  <li>
                    <Link to="/audit-log" className={isActive('/audit-log')}>
                      <Icon>📋</Icon> Audit Log
                    </Link>
                  </li>
                </>
              )}

            </ul>

            <div className="sidebar-footer">
              <div
                className="sidebar-footer-avatar"
                style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}bb)` }}
              >
                {initials}
              </div>
              <div className="sidebar-footer-info">
                <div className="sidebar-footer-name">{user.name}</div>
                <div className="sidebar-footer-role">{roleMeta.label}</div>
              </div>
            </div>
          </aside>
        )}

        <main className="content" ref={contentRef}>
          <div className="content-orb-2" aria-hidden="true" />
          <div className="content-orb-3" aria-hidden="true" />
          <Outlet />
          <button
            className={`scroll-top-btn${showScrollTop ? ' visible' : ''}`}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            title="Back to top"
          >
            ↑
          </button>
        </main>
      </div>
    </div>
  );
};

export default Layout;
