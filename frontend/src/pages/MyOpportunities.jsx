import React, { useState, useEffect } from 'react';
import client from '../api/client';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityForm from '../components/OpportunityForm';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import '../styles/Opportunities.css';

const MyOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMyOpportunities = async () => {
    setLoading(true);
    try {
      const data = await client('/opportunities/mine');
      setOpportunities(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch your posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOpportunities();
  }, []);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      await client('/opportunities', { body: formData });
      setShowForm(false);
      fetchMyOpportunities(); // refresh list
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Posts</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage the opportunities you have posted to the network.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel Creation' : '+ Create Post'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm ? (
        <OpportunityForm onSubmit={handleCreate} isSubmitting={submitting} />
      ) : (
        <>
          {loading ? (
            <div className="opportunities-grid">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : opportunities.length === 0 ? (
            <EmptyState 
              icon="✏️" 
              title="No posts yet" 
              message="You haven't posted any opportunities yet. Click the button above to create your first one."
            />
          ) : (
            <div className="opportunities-grid">
              {opportunities.map(opp => (
                <OpportunityCard key={opp.id} opportunity={opp} mine={true} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyOpportunities;
