import React, { useState, useEffect } from 'react';
import client from '../api/client';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityForm from '../components/OpportunityForm';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import '../styles/Opportunities.css';

const MyOpportunities = () => {
  const { showToast } = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchMyOpportunities = async () => {
    setLoading(true);
    try {
      const data = await client('/opportunities/mine');
      setOpportunities(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch your posts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyOpportunities(); }, []);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await client('/opportunities', { body: formData });
      showToast('Opportunity posted successfully!', 'success');
      setShowForm(false);
      fetchMyOpportunities();
    } catch (err) {
      showToast(err.message || 'Failed to create post.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Posts</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Manage the opportunities you have posted to the LIU network.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Post'}
        </button>
      </div>

      {showForm ? (
        <OpportunityForm onSubmit={handleCreate} isSubmitting={submitting} />
      ) : (
        <>
          {loading ? (
            <div className="opportunities-grid">
              <CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          ) : opportunities.length === 0 ? (
            <EmptyState
              icon="✏️"
              title="No posts yet"
              message="You haven't posted any opportunities yet. Click the button above to create your first one."
              actionText="Create your first post"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
                {opportunities.length} post{opportunities.length !== 1 ? 's' : ''} published
              </p>
              <div className="opportunities-grid">
                {opportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} mine={true} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyOpportunities;
