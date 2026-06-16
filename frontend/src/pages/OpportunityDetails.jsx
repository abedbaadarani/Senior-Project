import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OpportunityForm from '../components/OpportunityForm';
import ConfirmModal from '../components/ConfirmModal';
import { CardSkeleton } from '../components/Skeleton';
import { formatDate, daysUntil, timeAgo } from '../utils/dateUtils';
import '../styles/Opportunities.css';

const STATUS_META = {
  PENDING:      { label: 'Pending',      bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  REVIEWED:     { label: 'Reviewed',     bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  INTERVIEWING: { label: 'Interviewing', bg: 'rgba(124,58,237,0.15)',  text: '#a78bfa', border: 'rgba(124,58,237,0.3)' },
  ACCEPTED:     { label: 'Accepted',     bg: 'rgba(16,185,129,0.15)',  text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  REJECTED:     { label: 'Rejected',     bg: 'rgba(239,68,68,0.15)',   text: '#f87171', border: 'rgba(239,68,68,0.3)'  },
};

const PIPELINE = ['PENDING','REVIEWED','INTERVIEWING','ACCEPTED','REJECTED'];
const PIPELINE_COLORS = {
  PENDING:      '#f59e0b',
  REVIEWED:     '#3b82f6',
  INTERVIEWING: '#7c3aed',
  ACCEPTED:     '#10b981',
  REJECTED:     '#ef4444',
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || { label: status, bg: 'rgba(255,255,255,0.05)', text: '#94a3b8', border: 'rgba(255,255,255,0.1)' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
      fontSize: '0.75rem', fontWeight: '700',
      background: m.bg, color: m.text, border: `1px solid ${m.border}`,
    }}>
      {m.label}
    </span>
  );
};

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [isEditing, setIsEditing]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [isBookmarked, setIsBookmarked]       = useState(false);
  const [togglingBookmark, setTogglingBookmark] = useState(false);
  const [hasApplied, setHasApplied]   = useState(false);
  const [applying, setApplying]       = useState(false);
  const [applicants, setApplicants]   = useState([]);

  // Delete confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Recommendation state
  const [showRecForm, setShowRecForm]   = useState(false);
  const [recStudentId, setRecStudentId] = useState('');
  const [searchTerm, setSearchTerm]     = useState('');
  const [recMessage, setRecMessage]     = useState('');
  const [recSubmitting, setRecSubmitting] = useState(false);
  const [candidates, setCandidates]     = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (showRecForm && candidates.length === 0) {
      client('/users/candidates')
        .then(data => setCandidates(data))
        .catch(err => console.error('Failed to fetch candidates:', err));
    }
  }, [showRecForm, candidates.length]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await client(`/opportunities/${id}`);
        setOpportunity(data);

        if (user) {
          if (user.role === 'STUDENT' || user.role === 'ALUMNI') {
            const [bkData, applyData] = await Promise.all([
              client('/opportunities/bookmarks'),
              client(`/applications/check/${id}`),
            ]);
            setIsBookmarked(bkData.some(b => b.id === id));
            setHasApplied(applyData.applied);
          }
          if (user.id === data.createdByUserId || user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') {
            const applicantsData = await client(`/applications/opportunity/${id}`);
            setApplicants(applicantsData);
          }
          // Fetch recommendations for this opportunity
          try {
            const recsData = await client(`/recommendations/opportunity/${id}`);
            setRecommendations(recsData);
          } catch (_) { /* no recommendations or no access */ }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, user]);

  const handleDelete = async () => {
    try {
      await client(`/opportunities/${id}`, { method: 'DELETE' });
      showToast('Opportunity deleted successfully.', 'success');
      const wasOwner = user && opportunity && user.id === opportunity.createdByUserId;
      navigate(wasOwner ? '/my-opportunities' : '/opportunities');
    } catch (err) {
      showToast(err.message || 'Failed to delete opportunity.', 'error');
    }
  };

  const handleToggleBookmark = async () => {
    setTogglingBookmark(true);
    try {
      const data = await client(`/opportunities/${id}/bookmark`, { method: 'POST' });
      setIsBookmarked(data.bookmarked);
      showToast(data.bookmarked ? 'Opportunity saved to bookmarks.' : 'Bookmark removed.', 'info');
    } catch (err) {
      showToast('Failed to update bookmark.', 'error');
    } finally {
      setTogglingBookmark(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await client('/applications/apply', { method: 'POST', body: { opportunityId: id } });
      setHasApplied(true);
      showToast('Your application was submitted successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit application.', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await client(`/applications/${appId}/status`, { method: 'PATCH', body: { status: newStatus } });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      showToast(`Application status updated to ${newStatus}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleEdit = async (formData) => {
    setSubmitting(true);
    try {
      const data = await client(`/opportunities/${id}`, { method: 'PATCH', body: formData });
      setOpportunity(data.opportunity);
      setIsEditing(false);
      showToast('Opportunity updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update opportunity.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    if (!recStudentId) { showToast('Please select a student from the list.', 'warning'); return; }
    setRecSubmitting(true);
    try {
      await client('/recommendations', {
        body: { studentId: recStudentId, opportunityId: id, message: recMessage }
      });
      showToast('Recommendation submitted successfully!', 'success');
      setShowRecForm(false);
      setRecStudentId(''); setSearchTerm(''); setRecMessage('');
    } catch (err) {
      showToast(err.message || 'Failed to submit recommendation.', 'error');
    } finally {
      setRecSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <CardSkeleton /><CardSkeleton />
    </div>
  );
  if (error) return <div className="error-message">{error}</div>;
  if (!opportunity) return <div>Opportunity not found.</div>;

  const isOwner = user && user.id === opportunity.createdByUserId;
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'HEAD_ADMIN');
  const days    = daysUntil(opportunity.deadline);

  if (isEditing) {
    return (
      <div className="details-page">
        <button className="btn-secondary" style={{ marginBottom: '20px' }} onClick={() => setIsEditing(false)}>
          ← Cancel Edit
        </button>
        <OpportunityForm defaultValues={opportunity} onSubmit={handleEdit} isSubmitting={submitting} />
      </div>
    );
  }

  // Pipeline stats for owner/admin
  const pipelineCounts = PIPELINE.reduce((acc, s) => {
    acc[s] = applicants.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="details-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/opportunities">Opportunities</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">{opportunity.title}</span>
      </nav>

      <div className="card">
        {/* Top badges row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`badge badge-${opportunity.type.toLowerCase()}`}>{opportunity.type}</span>
            <span className="badge badge-mode">{opportunity.mode}</span>
            {opportunity.createdByRole && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                Posted by {opportunity.createdByRole === 'INSTRUCTOR' ? '👨‍🏫 Instructor' : '🏅 Alumni'}
              </span>
            )}
          </div>
          {opportunity.createdAt && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {timeAgo(opportunity.createdAt)}
            </span>
          )}
        </div>

        {/* Title + Company + Bookmark */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)', fontSize: '1.6rem' }}>{opportunity.title}</h1>
            <p style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--text-muted)' }}>
              🏢 {opportunity.company} &nbsp;·&nbsp; 📍 {opportunity.location}
            </p>
          </div>

          {user && (user.role === 'STUDENT' || user.role === 'ALUMNI') && (
            <button
              onClick={handleToggleBookmark}
              disabled={togglingBookmark}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Opportunity'}
              style={{
                background: isBookmarked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isBookmarked ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '10px', cursor: 'pointer',
                fontSize: '1.5rem', padding: '8px 12px', lineHeight: 1,
                color: isBookmarked ? '#ef4444' : '#94a3b8',
                transition: 'all 0.2s',
              }}
            >
              {isBookmarked ? '♥' : '♡'}
            </button>
          )}
        </div>

        {/* Deadline pill */}
        {opportunity.deadline && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', marginTop: '8px' }}>
            <span style={{
              padding: '5px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600',
              background: days !== null && days < 0 ? 'rgba(239,68,68,0.12)' : days !== null && days <= 5 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)',
              color: days !== null && days < 0 ? '#f87171' : days !== null && days <= 5 ? '#fbbf24' : '#34d399',
              border: `1px solid ${days !== null && days < 0 ? 'rgba(239,68,68,0.25)' : days !== null && days <= 5 ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.2)'}`,
            }}>
              {days !== null && days < 0
                ? `⛔ Deadline passed (${formatDate(opportunity.deadline)})`
                : days === 0 ? '⚡ Deadline is today!'
                : days !== null && days <= 5 ? `⏰ ${days} day${days !== 1 ? 's' : ''} left`
                : `📅 Deadline: ${formatDate(opportunity.deadline)}`}
            </span>
          </div>
        )}

        {/* Owner / Admin actions */}
        {(isOwner || isAdmin) && (
          <div className="details-actions" style={{ marginBottom: '24px' }}>
            {isOwner && (
              <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Post</button>
            )}
            <button className="btn-danger" onClick={() => setConfirmOpen(true)}>Delete Post</button>
          </div>
        )}

        {/* Apply button */}
        {user && (user.role === 'STUDENT' || user.role === 'ALUMNI') && !isOwner && (
          <div style={{ marginBottom: '24px' }}>
            <button
              className={hasApplied ? 'btn-secondary' : 'btn-primary'}
              onClick={handleApply}
              disabled={applying || hasApplied}
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700' }}
            >
              {applying ? 'Submitting…' : hasApplied ? '✓ Application Submitted' : '🚀 Apply Now'}
            </button>
          </div>
        )}

        {/* Instructor recommend button */}
        {user && user.role === 'INSTRUCTOR' && (
          <div style={{ marginBottom: '20px' }}>
            <button
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
              onClick={() => setShowRecForm(!showRecForm)}
            >
              {showRecForm ? 'Cancel Endorsement' : '🌟 Recommend a Student'}
            </button>
          </div>
        )}

        {/* Recommendation form */}
        {showRecForm && (
          <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(37,99,235,0.07)', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#60a5fa', marginBottom: '16px' }}>Endorse a Student</h3>
            <form onSubmit={handleRecommendationSubmit}>
              <div className="form-group">
                <label>Select Student *</label>
                <input
                  type="text"
                  className="form-control"
                  list="candidateOptions"
                  placeholder="Search by name or university ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    const matched = candidates.find(c => {
                      const sid = c.universityId || c.email.split('@')[0];
                      return `${c.name}${c.fatherName ? ` ${c.fatherName}` : ''} (${c.role}) - ID: ${sid}` === e.target.value;
                    });
                    setRecStudentId(matched ? matched.id : '');
                  }}
                />
                <datalist id="candidateOptions">
                  {candidates.map(c => {
                    const sid = c.universityId || c.email.split('@')[0];
                    return <option key={c.id} value={`${c.name}${c.fatherName ? ` ${c.fatherName}` : ''} (${c.role}) - ID: ${sid}`} />;
                  })}
                </datalist>
                {recStudentId && (
                  <p style={{ color: '#34d399', fontSize: '0.82rem', marginTop: '4px' }}>✓ Student selected</p>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Recommendation Message *</label>
                <textarea
                  className="form-control" rows="3"
                  value={recMessage} onChange={e => setRecMessage(e.target.value)}
                  required placeholder="Why is this student a great fit for this role?"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={recSubmitting || !recStudentId}>
                {recSubmitting ? 'Submitting…' : 'Submit Endorsement'}
              </button>
            </form>
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>About this role</h3>
          <p style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-color)' }}>{opportunity.description}</p>
        </div>

        {/* Requirements */}
        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>Requirements</h3>
            <ul className="requirements-list">
              {opportunity.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* ── Endorsements section ── */}
      {recommendations.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--primary-color)' }}>
            Endorsements ({recommendations.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recommendations.map(rec => (
              <div key={rec.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderLeft: '4px solid #7c3aed',
                borderRadius: '10px', padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#f8fafc' }}>
                      {rec.student?.name || 'Student'}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: '#94a3b8' }}>
                      {rec.student?.university_id && <span>ID: <strong style={{ color: '#e2e8f0' }}>{rec.student.university_id}</strong></span>}
                      {rec.student?.email && <span>{rec.student.email}</span>}
                      {rec.student?.major && <span>Major: {rec.student.major}</span>}
                      {rec.student?.graduation_year && <span>Graduation: {rec.student.graduation_year}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{
                  padding: '12px 16px', borderRadius: '8px',
                  background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
                  fontStyle: 'italic', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '8px',
                }}>
                  "{rec.message}"
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Endorsed by <strong style={{ color: '#a78bfa' }}>{rec.instructor?.name || 'Instructor'}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Applicants section ── */}
      {(isOwner || isAdmin) && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>Applicants ({applicants.length})</h3>
          </div>

          {/* Pipeline overview */}
          {applicants.length > 0 && (
            <div className="pipeline-track" style={{ marginBottom: '24px' }}>
              {PIPELINE.map(stage => {
                const count = pipelineCounts[stage];
                const color = PIPELINE_COLORS[stage];
                return (
                  <div
                    key={stage}
                    className="pipeline-stage"
                    style={{
                      background: count > 0 ? `${color}20` : 'rgba(255,255,255,0.02)',
                      color: count > 0 ? color : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{count}</div>
                    <div>{stage}</div>
                  </div>
                );
              })}
            </div>
          )}

          {applicants.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No applications yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {applicants.map(app => {
                const sm = STATUS_META[app.status] || STATUS_META.PENDING;
                return (
                  <div key={app.id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${sm.border}`,
                    borderLeft: `4px solid ${sm.text}`,
                    borderRadius: '10px', padding: '16px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: '12px',
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#f8fafc' }}>{app.user.name}</h4>
                      <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {app.user.email}{app.user.major ? ` · ${app.user.major}` : ''}
                      </p>
                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        {app.user.cvUrl       && <a href={app.user.cvUrl}       target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none' }}>📄 CV</a>}
                        {app.user.linkedinUrl && <a href={app.user.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none' }}>in LinkedIn</a>}
                        {app.user.githubUrl   && <a href={app.user.githubUrl}   target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.85rem', textDecoration: 'none' }}>GitHub</a>}
                        <button
                          onClick={() => navigate('/messages', { state: { partnerId: app.user.id, partner: app.user } })}
                          style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontFamily: 'inherit' }}
                        >
                          💬 Message
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <select
                        value={app.status}
                        onChange={e => handleUpdateStatus(app.id, e.target.value)}
                        style={{
                          padding: '8px 12px', borderRadius: '8px',
                          border: `1px solid ${sm.border}`,
                          background: sm.bg, color: sm.text,
                          fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
                        }}
                      >
                        {PIPELINE.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Applied {timeAgo(app.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete this opportunity?"
        message={`"${opportunity.title}" will be permanently removed and all applications will be lost. This cannot be undone.`}
        confirmText="Delete"
        cancelText="Keep it"
        type="danger"
        onConfirm={() => { setConfirmOpen(false); handleDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default OpportunityDetails;
