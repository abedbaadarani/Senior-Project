import React from 'react';
import { Link } from 'react-router-dom';

const OpportunityCard = ({ opportunity, mine }) => {
  return (
    <div className="card opportunity-card">
      <div className="opportunity-header">
        <span className={`badge badge-${opportunity.type.toLowerCase()}`}>{opportunity.type}</span>
        <span className="badge badge-mode">{opportunity.mode}</span>
      </div>
      <h3 className="opportunity-title">{opportunity.title}</h3>
      <p className="opportunity-company">{opportunity.company} • {opportunity.location}</p>
      
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
