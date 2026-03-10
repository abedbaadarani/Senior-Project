import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const OpportunityCard = ({ opportunity, mine, initialBookmarked }) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked || false);
  const [toggling, setToggling] = useState(false);

  const handleToggleBookmark = async () => {
    setToggling(true);
    try {
      const data = await client(`/opportunities/${opportunity.id}/bookmark`, { method: 'POST' });
      setIsBookmarked(data.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="card opportunity-card">
      <div className="opportunity-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className={`badge badge-${opportunity.type.toLowerCase()}`}>{opportunity.type}</span>
          <span className="badge badge-mode">{opportunity.mode}</span>
        </div>
        {opportunity.createdByRole && (
          <span className="badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontWeight: 'normal', fontSize: '0.75rem' }}>
            Posted by {opportunity.createdByRole === 'INSTRUCTOR' ? 'Instructor' : 'Alumni'}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="opportunity-title" style={{ margin: 0, paddingRight: '12px' }}>{opportunity.title}</h3>
        {!mine && (
          <button
            onClick={handleToggleBookmark}
            disabled={toggling}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: isBookmarked ? '#ef4444' : '#cbd5e1',
              padding: 0,
              lineHeight: 1
            }}
          >
            {isBookmarked ? '♥' : '♡'}
          </button>
        )}
      </div>

      <p className="opportunity-company" style={{ marginTop: '8px' }}>{opportunity.company} • {opportunity.location}</p>

      <p className="opportunity-description">
        {opportunity.description.length > 120
          ? `${opportunity.description.substring(0, 120)}...`
          : opportunity.description}
      </p>

      <div className="opportunity-footer">
        {mine ? (
          <Link to={`/opportunities/${opportunity.id}`} className="btn-secondary">Manage Post</Link>
        ) : (
          <Link to={`/opportunities/${opportunity.id}`} className="btn-primary">View Details</Link>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
