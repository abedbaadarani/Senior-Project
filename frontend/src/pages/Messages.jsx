import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activePartnerId, setActivePartnerId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConv, setLoadingConv] = useState(true);
    const [loadingMsg, setLoadingMsg] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize from location state if we navigated here to message someone specific
    useEffect(() => {
        if (location.state?.partnerId) {
            setActivePartnerId(location.state.partnerId);
        }
    }, [location.state]);

    const fetchConversations = async () => {
        try {
            const data = await client('/messages/conversations');
            setConversations(data);
            // If we don't have an active partner but we have conversations, select the first one
            if (!activePartnerId && !location.state?.partnerId && data.length > 0) {
                setActivePartnerId(data[0].partnerId);
            }
        } catch (err) {
            console.error('Failed to fetch conversations', err);
        } finally {
            setLoadingConv(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll conversations
        return () => clearInterval(interval);
    }, [activePartnerId]);

    const fetchMessages = async (partnerId) => {
        setLoadingMsg(true);
        try {
            const data = await client(`/messages/${partnerId}`);
            setMessages(data);
            scrollToBottom();

            // Update unread count locally for this conversation since we just read it
            setConversations(prev => prev.map(c =>
                c.partnerId === partnerId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setLoadingMsg(false);
        }
    };

    useEffect(() => {
        if (activePartnerId) {
            fetchMessages(activePartnerId);
            const interval = setInterval(() => fetchMessages(activePartnerId), 5000); // Poll messages
            return () => clearInterval(interval);
        }
    }, [activePartnerId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activePartnerId) return;

        const tempMessage = {
            id: Date.now(),
            content: newMessage,
            senderId: user.id,
            receiverId: activePartnerId,
            createdAt: new Date().toISOString(),
            sender: user
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        scrollToBottom();

        try {
            await client('/messages/send', {
                method: 'POST',
                body: { receiverId: activePartnerId, content: tempMessage.content }
            });
            // Next poll will sync the real DB message
        } catch (err) {
            console.error('Failed to send message', err);
            // Remove temp message on failure
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
            alert('Failed to send message');
        }
    };

    const activePartnerDef = conversations.find(c => c.partnerId === activePartnerId)?.partner || location.state?.partner;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
            {/* Sidebar: Conversations List */}
            <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>Direct Messages</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loadingConv ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                    ) : conversations.length === 0 && !location.state?.partnerId ? (
                        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            No active conversations. Visit the Alumni Directory or an applicant profile to start messaging.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Insert fake conversation stub if coming from another page to a new partner */}
                            {location.state?.partnerId && !conversations.some(c => c.partnerId === location.state.partnerId) && (
                                <div
                                    onClick={() => setActivePartnerId(location.state.partnerId)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        background: activePartnerId === location.state.partnerId ? 'white' : 'transparent',
                                        borderLeft: activePartnerId === location.state.partnerId ? '4px solid var(--primary-color)' : '4px solid transparent',
                                    }}
                                >
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--primary-color)' }}>{location.state.partner?.name || 'New Conversation'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start a conversation...</p>
                                </div>
                            )}

                            {conversations.map(conv => (
                                <div
                                    key={conv.partnerId}
                                    onClick={() => setActivePartnerId(conv.partnerId)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        background: activePartnerId === conv.partnerId ? 'white' : 'transparent',
                                        borderLeft: activePartnerId === conv.partnerId ? '4px solid var(--primary-color)' : '4px solid transparent',
                                        transition: 'background 0.2s',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={e => { if (activePartnerId !== conv.partnerId) e.currentTarget.style.background = '#f1f5f9' }}
                                    onMouseLeave={e => { if (activePartnerId !== conv.partnerId) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-color)' }}>{conv.partner.name}</h4>
                                        {conv.unreadCount > 0 && (
                                            <span style={{ background: '#ef4444', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                {conv.unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: conv.unreadCount > 0 ? '#0f172a' : 'var(--text-muted)', fontWeight: conv.unreadCount > 0 ? '700' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {conv.latestMessage.senderId === user.id ? 'You: ' : ''}
                                        {conv.latestMessage.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            {activePartnerId ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                    {/* Chat Header */}
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', color: 'var(--primary-color)' }}>{activePartnerDef?.name || 'Loading...'}</h3>
                            {activePartnerDef?.role && <span className={'badge'} style={{ background: 'var(--secondary-color)', fontSize: '0.75rem', padding: '2px 8px' }}>{activePartnerDef.role}</span>}
                        </div>
                    </div>

                    {/* Messages Feed */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
                        {loadingMsg && messages.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading messages...</p>
                        ) : messages.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👋</div>
                                <p>No messages here yet. Say hello!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMine = msg.senderId === user.id;
                                const showHeader = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                return (
                                    <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                        {showHeader && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', padding: '0 4px' }}>
                                                {isMine ? 'You' : msg.sender?.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: '16px',
                                            background: isMine ? 'var(--primary-color)' : 'white',
                                            color: isMine ? 'white' : 'var(--text-dark)',
                                            border: isMine ? 'none' : '1px solid var(--border-color)',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            lineHeight: '1.4',
                                            borderBottomRightRadius: isMine ? '4px' : '16px',
                                            borderBottomLeftRadius: isMine ? '16px' : '4px'
                                        }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Box */}
                    <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'white' }}>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                style={{ flex: 1, borderRadius: '24px', padding: '12px 20px', background: '#f1f5f9', border: 'none' }}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={!newMessage.trim()}
                                style={{ borderRadius: '24px', padding: '0 24px', opacity: !newMessage.trim() ? 0.5 : 1 }}
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column' }}>
                    <div style={{ fontSize: '4rem', opacity: 0.2, marginBottom: '20px' }}>💬</div>
                    <h3 style={{ color: 'var(--text-muted)' }}>Select a conversation to start messaging</h3>
                </div>
            )}
        </div>
    );
};

export default Messages;
