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
    const fetchOpp = async () => {
      try {
        const data = await client(`/opportunities/${id}`);
        setOpportunity(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch details');
      } finally {
        setLoading(false);
      }
    };
    fetchOpp();
  }, [id]);

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
          <h1 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>{opportunity.title}</h1>
          <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-muted)' }}>
            {opportunity.company} • {opportunity.location}
          </p>

          {(isOwner || isAdmin) && (
            <div className="details-actions">
              {isOwner && (
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Post</button>
              )}
              <button className="btn-danger" onClick={handleDelete}>Delete Post</button>
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
      </div>
    </div>
  );
};

export default OpportunityDetails;
