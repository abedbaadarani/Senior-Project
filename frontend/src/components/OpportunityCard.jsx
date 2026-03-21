import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const TYPE_COLORS = {
  JOB:        { bg: '#ede9fe', text: '#5b21b6' },
  INTERNSHIP: { bg: '#dcfce7', text: '#15803d' },
  RESEARCH:   { bg: '#dbeafe', text: '#1e40af' },
  VOLUNTEER:  { bg: '#fef9c3', text: '#854d0e' },
};

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

  const typeStyle = TYPE_COLORS[opportunity.type?.toUpperCase()] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <div className="card opportunity-card">
      {/* Header row: badges + bookmark */}
      <div className="opportunity-header">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ background: typeStyle.bg, color: typeStyle.text }} className="badge">
            {opportunity.type}
          </span>
          <span className="badge badge-mode">{opportunity.mode}</span>
        </div>

        {!mine && (
          <button
            className="bookmark-btn"
            onClick={handleToggleBookmark}
            disabled={toggling}
            title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
            style={{ color: isBookmarked ? '#ef4444' : '#cbd5e1' }}
          >
            {isBookmarked ? '♥' : '♡'}
          </button>
        )}
      </div>

      {/* Title */}
      <h3 className="opportunity-title">{opportunity.title}</h3>

      {/* Company + location */}
      <p className="opportunity-company">
        <span>🏢</span>
        {opportunity.company}
        {opportunity.location && (
          <span style={{ color: '#94a3b8' }}> · 📍 {opportunity.location}</span>
        )}
      </p>

      {/* Description excerpt */}
      <p className="opportunity-description">
        {opportunity.description?.length > 110
          ? `${opportunity.description.substring(0, 110)}…`
          : opportunity.description}
      </p>

      {/* Footer: posted by chip + CTA button */}
      <div className="opportunity-footer">
        {opportunity.createdByRole && (
          <span style={{
            fontSize: '0.72rem', fontWeight: '600', color: '#94a3b8',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            padding: '3px 9px', borderRadius: '99px',
            marginRight: 'auto',
          }}>
            {opportunity.createdByRole === 'INSTRUCTOR' ? '👨‍🏫 Instructor' : '🏅 Alumni'}
          </span>
        )}

        {mine ? (
          <Link to={`/opportunities/${opportunity.id}`} className="btn-secondary">
            Manage ›
          </Link>
        ) : (
          <Link to={`/opportunities/${opportunity.id}`} className="btn-primary">
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default OpportunityCard;
