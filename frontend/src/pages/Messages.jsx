import React, { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import SkeletonBase, { ListSkeleton } from '../components/Skeleton';
import { timeAgo } from '../utils/dateUtils';

const ROLE_COLORS = {
  HEAD_ADMIN: '#dc2626', ADMIN: '#7c3aed', INSTRUCTOR: '#2563eb',
  ALUMNI: '#059669', STUDENT: '#d97706',
};

const Messages = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [conversations, setConversations]     = useState([]);
  const [activePartnerId, setActivePartnerId] = useState(null);
  const [messages, setMessages]               = useState([]);
  const [newMessage, setNewMessage]           = useState('');
  const [loadingConv, setLoadingConv]         = useState(true);
  const [loadingMsg, setLoadingMsg]           = useState(false);
  const messagesEndRef = useRef(null);
  const [showNewChat, setShowNewChat]         = useState(false);
  const [allUsers, setAllUsers]               = useState([]);
  const [userSearch, setUserSearch]           = useState('');
  const [loadingUsers, setLoadingUsers]       = useState(false);

  useEffect(() => {
    if (location.state?.partnerId) setActivePartnerId(location.state.partnerId);
  }, [location.state]);

  const openNewChat = async () => {
    setShowNewChat(true);
    setUserSearch('');
    if (allUsers.length === 0) {
      setLoadingUsers(true);
      try {
        const data = await client('/users');
        setAllUsers(data.filter(u => u.id !== user.id));
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoadingUsers(false);
      }
    }
  };

  const startConversation = (partner) => {
    setActivePartnerId(partner.id);
    setShowNewChat(false);
    if (!conversations.some(c => c.partnerId === partner.id)) {
      setConversations(prev => [{
        partnerId: partner.id,
        partner: { id: partner.id, name: partner.name, email: partner.email, role: partner.role },
        latestMessage: null,
        unreadCount: 0,
      }, ...prev]);
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const q = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  const fetchConversations = async () => {
    try {
      const data = await client('/messages/conversations');
      setConversations(data);
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
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [activePartnerId]);

  const fetchMessages = async (partnerId) => {
    setLoadingMsg(true);
    try {
      const data = await client(`/messages/${partnerId}`);
      setMessages(data);
      scrollToBottom();
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
      const interval = setInterval(() => fetchMessages(activePartnerId), 5000);
      return () => clearInterval(interval);
    }
  }, [activePartnerId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartnerId) return;

    const tempMessage = {
      id: Date.now(),
      content: newMessage,
      senderId: user.id,
      receiverId: activePartnerId,
      createdAt: new Date().toISOString(),
      sender: user,
      _temp: true,
    };

    setMessages(prev => [...prev, tempMessage]);
    const sentContent = newMessage;
    setNewMessage('');
    scrollToBottom();

    try {
      await client('/messages/send', {
        method: 'POST',
        body: { receiverId: activePartnerId, content: sentContent }
      });
    } catch (err) {
      showToast('Failed to send message. Please try again.', 'error');
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const activePartnerDef = conversations.find(c => c.partnerId === activePartnerId)?.partner || location.state?.partner;
  const roleColor = ROLE_COLORS[activePartnerDef?.role] || '#64748b';

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 120px)',
      background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(16px)',
    }}>
      {/* Conversations sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.1rem', fontWeight: '700' }}>💬 Messages</h2>
          <button
            onClick={openNewChat}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff',
              border: 'none', borderRadius: '8px', padding: '6px 12px',
              fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
            }}
          >
            + New
          </button>
        </div>

        {showNewChat && (
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
              {loadingUsers ? (
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '12px 0' }}>Loading...</p>
              ) : filteredUsers.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '12px 0' }}>No users found</p>
              ) : (
                filteredUsers.slice(0, 10).map(u => {
                  const rc = ROLE_COLORS[u.role] || '#64748b';
                  return (
                    <div
                      key={u.id}
                      onClick={() => startConversation(u)}
                      style={{
                        padding: '10px', borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${rc}, ${rc}bb)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: '700', fontSize: '0.8rem',
                      }}>
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{u.role?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button
              onClick={() => setShowNewChat(false)}
              style={{ width: '100%', marginTop: '8px', padding: '6px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConv ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[1,2,3,4].map(i => <ListSkeleton key={i} />)}
            </div>
          ) : conversations.length === 0 && !location.state?.partnerId ? (
            <div style={{ padding: '20px' }}>
              <EmptyState icon="💬" title="No messages" message="Visit the Alumni Directory to start networking." />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {location.state?.partnerId && !conversations.some(c => c.partnerId === location.state.partnerId) && (
                <div
                  onClick={() => setActivePartnerId(location.state.partnerId)}
                  style={{
                    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: activePartnerId === location.state.partnerId ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderLeft: activePartnerId === location.state.partnerId ? '3px solid #f97316' : '3px solid transparent',
                  }}
                >
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#f8fafc' }}>
                    {location.state.partner?.name || 'New Conversation'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>Start a conversation…</p>
                </div>
              )}

              {conversations.map(conv => (
                <div
                  key={conv.partnerId}
                  onClick={() => setActivePartnerId(conv.partnerId)}
                  style={{
                    padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', transition: 'background 0.15s',
                    background: activePartnerId === conv.partnerId ? 'rgba(255,255,255,0.08)' : 'transparent',
                    borderLeft: activePartnerId === conv.partnerId ? '3px solid #f97316' : '3px solid transparent',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (activePartnerId !== conv.partnerId) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (activePartnerId !== conv.partnerId) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#f8fafc', fontWeight: '600' }}>{conv.partner.name}</h4>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {conv.unreadCount > 0 && (
                        <span style={{ background: '#f97316', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '800' }}>
                          {conv.unreadCount}
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{timeAgo(conv.latestMessage?.createdAt)}</span>
                    </div>
                  </div>
                  <p style={{
                    margin: 0, fontSize: '0.8rem',
                    color: conv.unreadCount > 0 ? '#fb923c' : '#94a3b8',
                    fontWeight: conv.unreadCount > 0 ? '600' : '400',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {conv.latestMessage?.senderId === user.id ? 'You: ' : ''}{conv.latestMessage?.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      {activePartnerId ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', minWidth: 0 }}>
          {/* Chat header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}bb)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '800', fontSize: '1rem',
            }}>
              {activePartnerDef?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: '700' }}>
                {activePartnerDef?.name || 'Loading…'}
              </h3>
              {activePartnerDef?.role && (
                <span style={{
                  background: `${roleColor}20`, color: roleColor,
                  border: `1px solid ${roleColor}40`, fontSize: '0.7rem',
                  padding: '2px 8px', borderRadius: '6px', fontWeight: '700',
                }}>
                  {activePartnerDef.role.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          {/* Messages feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.1)' }}>
            {loadingMsg && messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ alignSelf: 'flex-start', maxWidth: '60%', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '16px' }}>
                  <SkeletonBase width="200px" height="14px" />
                </div>
                <div style={{ alignSelf: 'flex-end', maxWidth: '60%', background: 'rgba(249,115,22,0.1)', padding: '12px 16px', borderRadius: '16px' }}>
                  <SkeletonBase width="140px" height="14px" />
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ margin: 'auto' }}>
                <EmptyState icon="👋" title="Say Hello!" message="Send the first message to start networking." />
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.senderId === user.id;
                const showHeader = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                const showTime   = idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId;

                return (
                  <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: showTime ? '12px' : '2px' }}>
                    {showHeader && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px', padding: '0 4px' }}>
                        {isMine ? 'You' : msg.sender?.name}
                      </span>
                    )}
                    <div style={{
                      padding: '10px 16px', borderRadius: '16px', lineHeight: '1.45',
                      background: isMine ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(255,255,255,0.06)',
                      color: '#f8fafc',
                      border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isMine ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
                      borderBottomRightRadius: isMine ? '4px' : '16px',
                      borderBottomLeftRadius: isMine ? '16px' : '4px',
                      opacity: msg._temp ? 0.7 : 1,
                    }}>
                      {msg.content}
                    </div>
                    {showTime && (
                      <span style={{ fontSize: '0.68rem', color: '#475569', marginTop: '4px', padding: '0 4px' }}>
                        {timeAgo(msg.createdAt)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Type a message…"
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState icon="💬" title="Select a conversation" message="Click on a contact to view your message history." />
        </div>
      )}
    </div>
  );
};

export default Messages;
