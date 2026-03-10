import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        major: user?.major || '',
        cvFile: null,
        linkedinUrl: user?.linkedinUrl || '',
        githubUrl: user?.githubUrl || '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        if (e.target.id === 'cvFile') {
            setFormData({ ...formData, cvFile: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.id]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            let dataToSend = formData;

            // If they selected a file, we must use FormData
            if (formData.cvFile) {
                dataToSend = new FormData();
                dataToSend.append('major', formData.major);
                dataToSend.append('linkedinUrl', formData.linkedinUrl);
                dataToSend.append('githubUrl', formData.githubUrl);
                dataToSend.append('cvFile', formData.cvFile);
            }

            await updateUser(dataToSend);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = () => {
        let score = 25; // Base score for having an account
        if (formData.major) score += 25;
        if (formData.cvFile || user?.cvUrl) score += 25;
        if (formData.linkedinUrl) score += 25;
        return score;
    };

    const completion = calculateCompletion();

    return (
        <div>
            <h1 className="page-title">My Profile</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                Complete your profile to stand out to alumni and instructors.
            </p>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                    <div className="card" style={{ margin: 0 }}>
                        <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Profile Completion</h3>
                        <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: '8px', height: '12px', overflow: 'hidden', marginTop: '16px', border: '1px solid var(--border-color)' }}>
                            <div style={{ backgroundColor: completion === 100 ? '#10b981' : 'var(--primary-color)', height: '100%', width: `${completion}%`, transition: 'width 0.3s ease' }}></div>
                        </div>
                        <p style={{ textAlign: 'right', margin: '8px 0 0 0', fontWeight: 'bold', color: completion === 100 ? '#10b981' : 'var(--text-color)' }}>
                            {completion}%
                        </p>
                        {completion < 100 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '16px' }}>
                                Add your CV and social links to reach 100% completion!
                            </p>
                        )}
                        {completion === 100 && (
                            <p style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '16px', fontWeight: '500' }}>
                                Awesome! Your profile is fully complete.
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ flex: '1 1 400px' }}>
                    <div className="card" style={{ margin: 0 }}>
                        {message.text && (
                            <div style={{
                                backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: message.type === 'success' ? '#065f46' : '#991b1b',
                                padding: '12px',
                                borderRadius: '4px',
                                borderLeft: `4px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                                marginBottom: '24px'
                            }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="major">Major / Program of Study</label>
                                <input
                                    id="major"
                                    type="text"
                                    className="form-control"
                                    value={formData.major}
                                    onChange={handleChange}
                                    placeholder="e.g. Computer Science"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="cvFile">Resume/CV (PDF, Word, etc.)</label>
                                {user?.cvUrl && (
                                    <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-color)' }}>
                                        Current CV: <a href={user.cvUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>View File</a>
                                    </p>
                                )}
                                <input
                                    id="cvFile"
                                    type="file"
                                    className="form-control"
                                    onChange={handleChange}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="linkedinUrl">LinkedIn Profile Link</label>
                                <input
                                    id="linkedinUrl"
                                    type="url"
                                    className="form-control"
                                    value={formData.linkedinUrl}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label htmlFor="githubUrl">GitHub / Portfolio Link (Optional)</label>
                                <input
                                    id="githubUrl"
                                    type="url"
                                    className="form-control"
                                    value={formData.githubUrl}
                                    onChange={handleChange}
                                    placeholder="https://github.com/..."
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Saving Changes...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
