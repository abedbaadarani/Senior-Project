import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../styles/Opportunities.css';

const AlumniDirectory = () => {
    const [alumni, setAlumni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters state
    const [search, setSearch] = useState('');
    const [major, setMajor] = useState('');
    const [gradYear, setGradYear] = useState('');

    const navigate = useNavigate();

    const fetchAlumni = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (major) query.append('major', major);
            if (gradYear) query.append('graduationYear', gradYear);

            const endpoint = query.toString() ? `/alumni?${query.toString()}` : '/alumni';
            const data = await client(endpoint);
            setAlumni(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch alumni');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlumni();
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchAlumni();
    };

    const handleClearFilters = () => {
        setSearch('');
        setMajor('');
        setGradYear('');
        setLoading(true);
        client('/alumni')
            .then(data => setAlumni(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 className="page-title" style={{ color: '#e2e8f0', margin: '0 0 8px 0' }}>Alumni Directory</h1>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                        Discover, network, and connect with verified LIU alumni.
                    </p>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filter Section - Glassmorphism */}
            <div className="card" style={{
                marginBottom: '32px',
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
                padding: '24px',
                borderRadius: '16px',
            }}>
                <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    
                    {/* Search Field */}
                    <div style={{ flex: '2 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search Name</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. John Doe"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff',
                                    paddingLeft: '40px', borderRadius: '10px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Major Field */}
                    <div style={{ flex: '2 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter by Major</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>📚</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Computer Science"
                                value={major}
                                onChange={e => setMajor(e.target.value)}
                                style={{
                                    background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff',
                                    paddingLeft: '40px', borderRadius: '10px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Year Field */}
                    <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class Of</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Year"
                            value={gradYear}
                            onChange={e => setGradYear(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px' }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flex: '1 1 180px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px 0', borderRadius: '10px' }}>Search</button>
                        <button type="button" className="btn-secondary" onClick={handleClearFilters} style={{ flex: 1, padding: '10px 0', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>Clear</button>
                    </div>
                </form>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ animation: 'spin 1s linear infinite', fontSize: '2rem' }}>⚙️</div>
                    <p>Loading alumni network...</p>
                </div>
            ) : alumni.length === 0 ? (
                <div className="card" style={{
                    textAlign: 'center', padding: '60px',
                    background: 'rgba(255,255,255,0.02)', borderColor: 'transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>👥</div>
                    <h3 style={{ color: '#e2e8f0', margin: '0 0 8px 0' }}>No alumni match your search.</h3>
                    <p style={{ color: '#64748b', margin: 0 }}>Try clearing your filters or using different keywords.</p>
                    <button onClick={handleClearFilters} className="btn-secondary" style={{ marginTop: '24px', padding: '8px 24px', borderRadius: '8px' }}>
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {alumni.map(person => (
                        <div key={person.id} className="card" style={{
                            margin: 0, padding: '24px',
                            background: 'rgba(255,255,255,0.04)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            display: 'flex', flexDirection: 'column',
                            transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 6px 0', color: '#f8fafc', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {person.name}
                                        {person.isApproved && <span style={{ color: '#38bdf8', fontSize: '0.9rem' }} title="Verified Alumni">✓</span>}
                                    </h3>
                                    <p style={{ margin: '0', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                                        {person.major || 'LIU Alumni'}
                                    </p>
                                </div>
                                {person.graduationYear && (
                                    <span style={{
                                        backgroundColor: 'rgba(249,115,22,0.15)',
                                        color: '#fb923c',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        border: '1px solid rgba(249,115,22,0.25)'
                                    }}>
                                        Class of {person.graduationYear}
                                    </span>
                                )}
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => navigate('/messages', { state: { partnerId: person.id, partner: person } })}
                                    className="btn-primary"
                                    style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1, textAlign: 'center', border: 'none', borderRadius: '8px' }}
                                >
                                    💬 Message
                                </button>

                                {person.linkedinUrl && (
                                    <a href={person.linkedinUrl} target="_blank" rel="noreferrer"
                                        style={{ padding: '8px', flexShrink: 0, textAlign: 'center', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        🔗
                                    </a>
                                )}
                                {person.githubUrl && (
                                    <a href={person.githubUrl} target="_blank" rel="noreferrer"
                                        style={{ padding: '8px', flexShrink: 0, textAlign: 'center', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        💻
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlumniDirectory;
