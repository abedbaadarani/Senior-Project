import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import SkeletonBase, { ListSkeleton } from '../components/Skeleton';

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
        <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
            {/* Sidebar: Conversations List */}
            <div style={{ width: '300px', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem' }}>Direct Messages</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loadingConv ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <ListSkeleton />
                            <ListSkeleton />
                            <ListSkeleton />
                            <ListSkeleton />
                            <ListSkeleton />
                        </div>
                    ) : conversations.length === 0 && !location.state?.partnerId ? (
                        <div style={{ padding: '20px' }}>
                            <EmptyState icon="💬" title="No messages" message="Visit the Alumni Directory to start networking." />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Insert fake conversation stub if coming from another page to a new partner */}
                            {location.state?.partnerId && !conversations.some(c => c.partnerId === location.state.partnerId) && (
                                <div
                                    onClick={() => setActivePartnerId(location.state.partnerId)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        background: activePartnerId === location.state.partnerId ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        borderLeft: activePartnerId === location.state.partnerId ? '4px solid #f97316' : '4px solid transparent',
                                    }}
                                >
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#f8fafc' }}>{location.state.partner?.name || 'New Conversation'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Start a conversation...</p>
                                </div>
                            )}

                            {conversations.map(conv => (
                                <div
                                    key={conv.partnerId}
                                    onClick={() => setActivePartnerId(conv.partnerId)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        background: activePartnerId === conv.partnerId ? 'rgba(255,255,255,0.08)' : 'transparent',
                                        borderLeft: activePartnerId === conv.partnerId ? '4px solid #f97316' : '4px solid transparent',
                                        transition: 'background 0.2s',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={e => { if (activePartnerId !== conv.partnerId) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                                    onMouseLeave={e => { if (activePartnerId !== conv.partnerId) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>{conv.partner.name}</h4>
                                        {conv.unreadCount > 0 && (
                                            <span style={{ background: '#f97316', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                {conv.unreadCount} new
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: conv.unreadCount > 0 ? '#fb923c' : '#94a3b8', fontWeight: conv.unreadCount > 0 ? '700' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent' }}>
                    {/* Chat Header */}
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', color: '#f8fafc' }}>{activePartnerDef?.name || 'Loading...'}</h3>
                            {activePartnerDef?.role && <span style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.25)', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>{activePartnerDef.role}</span>}
                        </div>
                    </div>

                    {/* Messages Feed */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.1)' }}>
                        {loadingMsg && messages.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ alignSelf: 'flex-start', maxWidth: '70%', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                                    <SkeletonBase width="150px" height="16px" style={{ marginBottom: '8px' }} />
                                    <SkeletonBase width="250px" height="16px" />
                                </div>
                                <div style={{ alignSelf: 'flex-end', maxWidth: '70%', background: 'rgba(249,115,22,0.1)', padding: '12px 16px', borderRadius: '16px', borderBottomRightRadius: '4px' }}>
                                    <SkeletonBase width="200px" height="16px" style={{ marginBottom: '8px' }} />
                                    <SkeletonBase width="100px" height="16px" />
                                </div>
                                <div style={{ alignSelf: 'flex-start', maxWidth: '70%', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                                    <SkeletonBase width="180px" height="16px" />
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div style={{ margin: 'auto', maxWidth: '400px' }}>
                                <EmptyState icon="👋" title="Say Hello!" message="Send the first message to start networking." />
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMine = msg.senderId === user.id;
                                const showHeader = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                return (
                                    <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                                        {showHeader && (
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', padding: '0 4px' }}>
                                                {isMine ? 'You' : msg.sender?.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: '16px',
                                            background: isMine ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.05)',
                                            color: '#f8fafc',
                                            border: isMine ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: isMine ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
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
                    <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                style={{ flex: 1, borderRadius: '24px', padding: '12px 20px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
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
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', flexDirection: 'column' }}>
                    <EmptyState icon="💬" title="Select a conversation" message="Click on a contact in the sidebar to view your message history." />
                </div>
            )}
        </div>
    );
};

export default Messages;
