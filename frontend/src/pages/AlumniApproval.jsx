import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { CardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const AlumniApproval = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pendingAlumni, setPendingAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modal, setModal] = useState({ open: false, type: '', alumni: null });

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await client('/alumni/pending');
      setPendingAlumni(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch pending alumni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (['INSTRUCTOR', 'ADMIN', 'HEAD_ADMIN'].includes(user?.role)) fetchPending();
  }, [user]);

  const doApprove = async () => {
    const { alumni } = modal;
    setModal({ open: false, type: '', alumni: null });
    try {
      await client(`/alumni/${alumni.id}/approve`, { method: 'PATCH' });
      setPendingAlumni(prev => prev.filter(a => a.id !== alumni.id));
      showToast(`${alumni.name} has been verified as alumni!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve alumni.', 'error');
    }
  };

  const doReject = async () => {
    const { alumni } = modal;
    setModal({ open: false, type: '', alumni: null });
    try {
      await client(`/alumni/${alumni.id}/reject`, { method: 'DELETE' });
      setPendingAlumni(prev => prev.filter(a => a.id !== alumni.id));
      showToast(`${alumni.name}'s request has been rejected.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to reject alumni.', 'error');
    }
  };

  if (!['INSTRUCTOR', 'ADMIN', 'HEAD_ADMIN'].includes(user?.role)) {
    return <div className="error-message">Unauthorized. Only Instructors, Admins, and Head Admins can verify alumni credentials.</div>;
  }

  return (
    <div>
      <h1 className="page-title">Alumni Approvals</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Review and verify graduated students so they can access the Alumni & Opportunity Platform.
      </p>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : pendingAlumni.length === 0 ? (
        <EmptyState
          icon="✅"
          title="All caught up!"
          message="There are no pending alumni registration requests at this time."
        />
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {pendingAlumni.length} request{pendingAlumni.length !== 1 ? 's' : ''} awaiting review
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {pendingAlumni.map(alumni => (
              <div key={alumni.id} className="card" style={{ margin: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '800', fontSize: '1.1rem',
                  }}>
                    {alumni.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>{alumni.name}</h3>
                    <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '700', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '99px' }}>
                      Alumni Request
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                  {[
                    { label: 'Email',           val: alumni.email },
                    { label: 'University ID',   val: alumni.universityId   || '—' },
                    { label: "Father's Name",   val: alumni.fatherName     || '—' },
                    { label: 'Graduation Year', val: alumni.graduationYear || '—' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight: '600', color: '#e2e8f0' }}>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, background: 'linear-gradient(135deg, #059669, #047857)' }}
                    onClick={() => setModal({ open: true, type: 'approve', alumni })}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="btn-danger"
                    style={{ flex: 1 }}
                    onClick={() => setModal({ open: true, type: 'reject', alumni })}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Approve modal */}
      <ConfirmModal
        isOpen={modal.open && modal.type === 'approve'}
        title={`Approve ${modal.alumni?.name}?`}
        message={`This will grant ${modal.alumni?.name} full alumni access to the Alumni & Opportunity Platform. They will be notified.`}
        confirmText="Approve Alumni"
        cancelText="Cancel"
        type="info"
        onConfirm={doApprove}
        onCancel={() => setModal({ open: false, type: '', alumni: null })}
      />

      {/* Reject modal */}
      <ConfirmModal
        isOpen={modal.open && modal.type === 'reject'}
        title={`Reject ${modal.alumni?.name}'s request?`}
        message={`This will permanently delete their registration. They will need to re-register if they wish to join later.`}
        confirmText="Reject & Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={doReject}
        onCancel={() => setModal({ open: false, type: '', alumni: null })}
      />
    </div>
  );
};

export default AlumniApproval;
