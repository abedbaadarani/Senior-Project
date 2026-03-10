import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

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
                    position: 'absolute', right: 0, top: '100%', marginTop: '8px',
                    background: 'white', borderRadius: '8px', width: '300px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 100, border: '1px solid #e2e8f0',
                    maxHeight: '400px', display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: '#0f172a' }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                style={{ background: 'none', border: 'none', color: '#e67e22', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, padding: '0' }}>
                        {notifications.length === 0 ? (
                            <p style={{ padding: '16px', margin: 0, textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                No notifications yet.
                            </p>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={(e) => handleMarkAsRead(notif.id, notif.link, e)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f1f5f9',
                                        background: notif.isRead ? 'white' : '#f0f9ff',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'white' : '#f0f9ff'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{notif.title}</strong>
                                        {!notif.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{notif.message}</p>
                                    <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '6px', display: 'block' }}>
                                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
