import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { timeAgo } from '../utils/dateUtils';

const NotificationsDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const data = await client('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id, link, e) => {
        e.preventDefault();
        try {
            await client(`/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setIsOpen(false);
            if (link) navigate(link);
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await client('/notifications/read-all', { method: 'PATCH' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="notifications-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', fontSize: '1.25rem', color: '#fff', padding: '4px' }}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge" style={{
                        position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white',
                        borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notifications-menu" style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: '12px',
                    background: 'var(--header-bg)', borderRadius: '12px', width: '320px',
                    boxShadow: 'var(--shadow-lg)', zIndex: 100, border: '1px solid var(--border-color)',
                    backdropFilter: 'blur(16px)', maxHeight: '400px', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-light)', fontSize: '1.05rem' }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: '0', background: 'rgba(0,0,0,0.2)' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', opacity: 0.5, marginBottom: '8px' }}>📭</div>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    No notifications yet.
                                </p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={(e) => handleMarkAsRead(notif.id, notif.link, e)}
                                    style={{
                                        padding: '16px',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        background: notif.isRead ? 'transparent' : 'rgba(249,115,22,0.08)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        borderLeft: notif.isRead ? '3px solid transparent' : '3px solid var(--primary-color)'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(249,115,22,0.08)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <strong style={{ color: notif.isRead ? 'var(--text-light)' : '#fff', fontSize: '0.9rem', lineHeight: '1.3' }}>{notif.title}</strong>
                                        {!notif.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)', display: 'inline-block', flexShrink: 0, marginTop: '4px' }}></span>}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{notif.message}</p>
                                    <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '8px', display: 'block' }}>
                                        {timeAgo(notif.createdAt)}
                                    </small>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
