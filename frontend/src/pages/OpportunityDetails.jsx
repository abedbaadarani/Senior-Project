import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import OpportunityForm from '../components/OpportunityForm';
import '../styles/Opportunities.css';

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [togglingBookmark, setTogglingBookmark] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicants, setApplicants] = useState([]);

  // Recommendation State
  const [showRecForm, setShowRecForm] = useState(false);
  const [recStudentId, setRecStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [recMessage, setRecMessage] = useState('');
  const [recSubmitting, setRecSubmitting] = useState(false);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (showRecForm && candidates.length === 0) {
      client('/users/candidates')
        .then(data => setCandidates(data))
        .catch(err => console.error('Failed to fetch candidates:', err));
    }
  }, [showRecForm, candidates.length]);

  useEffect(() => {
    const fetchOppAndBookmark = async () => {
      try {
        const data = await client(`/opportunities/${id}`);
        setOpportunity(data);

        if (user) {
          if (user.role === 'STUDENT' || user.role === 'ALUMNI') {
            const bookmarksData = await client('/opportunities/bookmarks');
            setIsBookmarked(bookmarksData.some(b => b.id === parseInt(id, 10)));

            const applyData = await client(`/applications/check/${id}`);
            setHasApplied(applyData.applied);
          }
          if (user.id === data.createdByUserId || user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') {
            const applicantsData = await client(`/applications/opportunity/${id}`);
            setApplicants(applicantsData);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchOppAndBookmark();
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      await client(`/opportunities/${id}`, { method: 'DELETE' });
      const wasOwner = user && opportunity && user.id === opportunity.createdByUserId;
      navigate(wasOwner ? '/my-opportunities' : '/opportunities');
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleToggleBookmark = async () => {
    setTogglingBookmark(true);
    try {
      const data = await client(`/opportunities/${id}/bookmark`, { method: 'POST' });
      setIsBookmarked(data.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setTogglingBookmark(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await client('/applications/apply', {
        method: 'POST',
        body: { opportunityId: id }
      });
      setHasApplied(true);
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await client(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleEdit = async (formData) => {
    setSubmitting(true);
    try {
      const data = await client(`/opportunities/${id}`, {
        method: 'PATCH',
        body: formData
      });
      setOpportunity(data.opportunity);
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setRecSubmitting(true);
    try {
      await client('/recommendations', {
        body: {
          studentId: recStudentId,
          opportunityId: id,
          message: recMessage
        }
      });
      alert('Recommendation submitted successfully!');
      setShowRecForm(false);
      setRecStudentId('');
      setSearchTerm('');
      setRecMessage('');
    } catch (err) {
      alert(err.message || 'Failed to submit recommendation');
    } finally {
      setRecSubmitting(false);
    }
  };

  if (loading) return <div>Loading details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!opportunity) return <div>Opportunity not found.</div>;

  const isOwner = user && user.id === opportunity.createdByUserId;
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'HEAD_ADMIN');

  if (isEditing) {
    return (
      <div className="details-page">
        <button className="btn-secondary" style={{ marginBottom: '20px' }} onClick={() => setIsEditing(false)}>
          ← Cancel Edit
        </button>
        <OpportunityForm
          defaultValues={opportunity}
          onSubmit={handleEdit}
          isSubmitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className="details-page">
      <Link to="/opportunities" className="back-link">← Back to Board</Link>

      <div className="card">
        <div className="details-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className={`badge badge-${opportunity.type.toLowerCase()}`}>{opportunity.type}</span>
              <span className="badge badge-mode">{opportunity.mode}</span>
            </div>
            {opportunity.createdByRole && (
              <span className="badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontWeight: 'normal', fontSize: '0.85rem' }}>
                Posted by {opportunity.createdByRole === 'INSTRUCTOR' ? 'Instructor' : 'Alumni'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>{opportunity.title}</h1>
              <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                {opportunity.company} • {opportunity.location}
              </p>
            </div>

            {user && (user.role === 'STUDENT' || user.role === 'ALUMNI') && (
              <button
                onClick={handleToggleBookmark}
                disabled={togglingBookmark}
                title={isBookmarked ? "Remove Bookmark" : "Save Opportunity"}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '2rem',
                  color: isBookmarked ? '#ef4444' : '#cbd5e1',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                {isBookmarked ? '♥' : '♡'}
              </button>
            )}
          </div>

          {(isOwner || isAdmin) && (
            <div className="details-actions">
              {isOwner && (
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Post</button>
              )}
              <button className="btn-danger" onClick={handleDelete}>Delete Post</button>
            </div>
          )}

          {user && (user.role === 'STUDENT' || user.role === 'ALUMNI') && !isOwner && (
            <div style={{ marginTop: '24px' }}>
              <button
                className={hasApplied ? "btn-secondary" : "btn-primary"}
                onClick={handleApply}
                disabled={applying || hasApplied}
                style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}
              >
                {applying ? 'Applying...' : hasApplied ? '✓ Application Submitted' : 'Apply Now'}
              </button>
            </div>
          )}

          {user && user.role === 'INSTRUCTOR' && (
            <div style={{ marginTop: '16px' }}>
              <button
                className="btn-primary"
                style={{ backgroundColor: 'var(--secondary-color)' }}
                onClick={() => setShowRecForm(!showRecForm)}
              >
                {showRecForm ? 'Cancel Endorsement' : 'Recommend a Student'}
              </button>
            </div>
          )}
        </div>

        {showRecForm && (
          <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Recommend Student</h3>
            <form onSubmit={handleRecommendationSubmit}>
              <div className="form-group">
                <label>Select Student *</label>
                <input
                  type="text"
                  className="form-control"
                  list="candidateOptions"
                  placeholder="Type to search (Name or ID)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    const matched = candidates.find(c => {
                      const studentId = c.email.split('@')[0];
                      return `${c.name} ${c.fatherName ? `(${c.fatherName})` : ''} - ID: ${studentId}` === e.target.value;
                    });
                    if (matched) {
                      setRecStudentId(matched.id);
                    } else {
                      setRecStudentId('');
                    }
                  }}
                  required
                />
                <datalist id="candidateOptions">
                  {candidates.map(c => {
                    const studentId = c.email.split('@')[0];
                    return (
                      <option key={c.id} value={`${c.name} ${c.fatherName ? `(${c.fatherName})` : ''} - ID: ${studentId}`} />
                    );
                  })}
                </datalist>
                {recStudentId && <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold' }}>✓ Student Selected</div>}
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Recommendation Message *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={recMessage}
                  onChange={(e) => setRecMessage(e.target.value)}
                  required
                  placeholder="Why is this student a good fit?"
                ></textarea>
              </div>
              <button type="submit" className="btn-primary" disabled={recSubmitting}>
                {recSubmitting ? 'Submitting...' : 'Submit Endorsement'}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--primary-color)' }}>About this role</h3>
          <p style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{opportunity.description}</p>
        </div>

        {opportunity.requirements && opportunity.requirements.length > 0 && (
          <div>
            <h3 style={{ color: 'var(--primary-color)' }}>Requirements</h3>
            <ul className="requirements-list">
              {opportunity.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {opportunity.deadline && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <p><strong>Application Deadline:</strong> {new Date(opportunity.deadline).toLocaleDateString()}</p>
          </div>
        )}

        {(isOwner || isAdmin) && (
          <div style={{ marginTop: '48px' }}>
            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', color: 'var(--primary-color)' }}>
              Applicants ({applicants.length})
            </h3>
            {applicants.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No applications yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {applicants.map(app => (
                  <div key={app.id} className="card" style={{ padding: '16px', margin: 0, borderLeft: `4px solid ${app.status === 'PENDING' ? '#f59e0b' : app.status === 'REVIEWED' ? '#3b82f6' : app.status === 'INTERVIEWING' ? '#8b5cf6' : app.status === 'ACCEPTED' ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{app.user.name}</h4>
                        <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)' }}>
                          {app.user.email} • {app.user.major || 'No major specified'}
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {app.user.cvUrl && <a href={app.user.cvUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>📄 View CV</a>}
                          {app.user.linkedinUrl && <a href={app.user.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>in LinkedIn</a>}
                          {app.user.githubUrl && <a href={app.user.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>
                            <svg style={{ width: '16px', height: '16px', verticalAlign: 'text-bottom', marginRight: '4px' }} viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"></path></svg>
                            GitHub
                          </a>}
                          <button
                            onClick={() => navigate('/messages', { state: { partnerId: app.user.id, partner: app.user } })}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary-color)',
                              textDecoration: 'none',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: 0,
                              fontFamily: 'inherit'
                            }}>
                            💬 Message
                          </button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'white',
                            fontWeight: 'bold',
                            color: app.status === 'PENDING' ? '#d97706' : app.status === 'REVIEWED' ? '#2563eb' : app.status === 'INTERVIEWING' ? '#7c3aed' : app.status === 'ACCEPTED' ? '#059669' : '#dc2626'
                          }}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="INTERVIEWING">Interviewing</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
};

export default OpportunityDetails;
