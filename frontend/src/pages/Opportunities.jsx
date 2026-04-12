import React, { useState, useEffect, useMemo } from 'react';
import client from '../api/client';
import FilterBar from '../components/FilterBar';
import OpportunityCard from '../components/OpportunityCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import '../styles/Opportunities.css';

const applySort = (list, sort) => {
  const arr = [...list];
  if (sort === 'oldest')   return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (sort === 'deadline') return arr.sort((a, b) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
  if (sort === 'az')       return arr.sort((a, b) => a.title.localeCompare(b.title));
  // default: newest
  return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSort, setActiveSort] = useState('newest');

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
    setActiveSort(filters.sort || 'newest');
    try {
      const query = new URLSearchParams();
      if (filters.search) query.append('search', filters.search);
      if (filters.type)   query.append('type',   filters.type);
      if (filters.mode)   query.append('mode',   filters.mode);

      const endpoint = query.toString() ? `/opportunities?${query}` : '/opportunities';
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

  const sorted = useMemo(() => applySort(opportunities, activeSort), [opportunities, activeSort]);

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
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="🧳"
          title="No opportunities found"
          message="Adjust your search filters or check back later for new postings."
        />
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
            Showing {sorted.length} result{sorted.length !== 1 ? 's' : ''}
          </p>
          <div className="opportunities-grid">
            {sorted.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                mine={false}
                initialBookmarked={bookmarkedIds.has(opp.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Opportunities;
