import React, { useState, useEffect } from 'react';
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

    const { user } = useAuth();
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
        // Notice: Need to wait for states to flush, easiest way is direct call since we want empty string clears
        setLoading(true);
        client('/alumni')
            .then(data => setAlumni(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    return (
        <div>
            <h1 className="page-title">Alumni Directory</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Discover, network, and connect with verified LIU alumni. Filter by their major or the year they graduated.
            </p>

            {error && <div className="error-message">{error}</div>}

            {/* Filter Section */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Search Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. John Doe"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Filter by Major</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Computer Science"
                            value={major}
                            onChange={e => setMajor(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: '0 1 150px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Graduation Year</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="e.g. 2023"
                            value={gradYear}
                            onChange={e => setGradYear(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>Search</button>
                        <button type="button" className="btn-secondary" onClick={handleClearFilters}>Clear</button>
                    </div>
                </form>
            </div>

            {loading ? (
                <p>Loading alumni...</p>
            ) : alumni.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <h3 style={{ color: 'var(--text-muted)' }}>No alumni match your search.</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {alumni.map(person => (
                        <div key={person.id} className="card" style={{ margin: 0, padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', color: 'var(--primary-color)' }}>{person.name}</h3>
                                    <p style={{ margin: '0', fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                        {person.major || 'No major specified'}
                                    </p>
                                </div>
                                {person.graduationYear && (
                                    <span className="badge" style={{ backgroundColor: 'var(--secondary-color)', color: '#fff' }}>
                                        Class of {person.graduationYear}
                                    </span>
                                )}
                            </div>

                            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {person.linkedinUrl && (
                                    <a href={person.linkedinUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.9rem', flex: 1, textAlign: 'center' }}>
                                        LinkedIn
                                    </a>
                                )}
                                {person.githubUrl && (
                                    <a href={person.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.9rem', flex: 1, textAlign: 'center' }}>
                                        GitHub
                                    </a>
                                )}
                                <button
                                    onClick={() => navigate('/messages', { state: { partnerId: person.id, partner: person } })}
                                    className="btn-primary"
                                    style={{ padding: '6px 16px', fontSize: '0.9rem', flex: 1, textAlign: 'center', border: 'none', cursor: 'pointer' }}
                                >
                                    Message
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlumniDirectory;
