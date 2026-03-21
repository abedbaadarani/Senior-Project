import React, { useState, useEffect } from 'react';
import client from '../api/client';
import FilterBar from '../components/FilterBar';
import OpportunityCard from '../components/OpportunityCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import '../styles/Opportunities.css';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = async () => {
    try {
      const data = await client('/opportunities/bookmarks');
      setBookmarkedIds(new Set(data.map(opp => opp.id)));
    } catch (err) {
      console.error('Failed to fetch bookmarks', err);
    }
  };

  const fetchOpportunities = async (filters = {}) => {
    setLoading(true);
    try {
      // Build query string cleanly
      const query = new URLSearchParams();
      if (filters.search) query.append('search', filters.search);
      if (filters.type) query.append('type', filters.type);
      if (filters.mode) query.append('mode', filters.mode);

      const endpoint = query.toString() ? `/opportunities?${query.toString()}` : '/opportunities';

      const data = await client(endpoint);
      setOpportunities(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
    fetchOpportunities();
  }, []);

  return (
    <div>
      <h1 className="page-title">Opportunities Board</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Discover jobs, internships, and connections exclusively for the LIU network.
      </p>

      {error && <div className="error-message">{error}</div>}

      <FilterBar onFilterChange={fetchOpportunities} />

      {loading ? (
        <div className="opportunities-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : opportunities.length === 0 ? (
        <EmptyState 
          icon="🧳" 
          title="No opportunities found" 
          message="Adjust your search filters or check back later for new postings." 
        />
      ) : (
        <div className="opportunities-grid">
          {opportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} mine={false} initialBookmarked={bookmarkedIds.has(opp.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
