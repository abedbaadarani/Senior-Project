import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/Layout.css';

const STEPS = [
  { key: 'account',  label: 'Account created',           icon: '🎉', check: () => true           },
  { key: 'major',    label: 'Major / Program added',      icon: '🎓', check: (u, f) => !!(f.major || u?.major) },
  { key: 'cv',       label: 'Resume / CV uploaded',       icon: '📄', check: (u, f) => !!(f.cvFile || u?.cvUrl) },
  { key: 'linkedin', label: 'LinkedIn profile linked',    icon: '💼', check: (u, f) => !!(f.linkedinUrl || u?.linkedinUrl) },
  { key: 'github',   label: 'GitHub / Portfolio linked',  icon: '🔗', check: (u, f) => !!(f.githubUrl  || u?.githubUrl)  },
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    major:       user?.major       || '',
    cvFile:      null,
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl:   user?.githubUrl   || '',
  });
  const [cvFileName, setCvFileName] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) setErrors(prev => ({ ...prev, [e.target.id]: '' }));
  };

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      showToast('Only PDF or Word files are accepted.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5 MB.', 'error');
      return;
    }
    setFormData(prev => ({ ...prev, cvFile: file }));
    setCvFileName(file.name);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const validate = () => {
    const e = {};
    if (formData.linkedinUrl && !formData.linkedinUrl.startsWith('http')) {
      e.linkedinUrl = 'Must be a valid URL starting with http(s)://';
    }
    if (formData.githubUrl && !formData.githubUrl.startsWith('http')) {
      e.githubUrl = 'Must be a valid URL starting with http(s)://';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      let dataToSend = formData;
      if (formData.cvFile) {
        dataToSend = new FormData();
        dataToSend.append('major',       formData.major);
        dataToSend.append('linkedinUrl', formData.linkedinUrl);
        dataToSend.append('githubUrl',   formData.githubUrl);
        dataToSend.append('cvFile',      formData.cvFile);
      }
      await updateUser(dataToSend);
      showToast('Profile updated successfully!', 'success');
      setCvFileName('');
      setFormData(prev => ({ ...prev, cvFile: null }));
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const doneCount = STEPS.filter(s => s.check(user, formData)).length;
  const completion = Math.round((doneCount / STEPS.length) * 100);
  const barColor = completion === 100 ? '#10b981' : completion >= 60 ? '#f97316' : '#6366f1';

  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Complete your profile to stand out to alumni, instructors, and employers.
      </p>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── Left: Completion card ── */}
        <div style={{ flex: '1 1 280px', maxWidth: '340px' }}>
          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '20px' }}>
              Profile Completion
            </h3>

            {/* Progress ring replacement — wide bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {doneCount} of {STEPS.length} steps completed
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: barColor }}>
                  {completion}%
                </span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${completion}%`, height: '100%', borderRadius: '99px',
                  background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Checklist */}
            <div>
              {STEPS.map(step => {
                const done = step.check(user, formData);
                return (
                  <div key={step.key} className="completion-item">
                    <div className={`completion-check ${done ? 'done' : 'undone'}`}>
                      {done ? '✓' : '○'}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: done ? 'var(--text-color)' : 'var(--text-muted)', textDecoration: done ? 'none' : 'none' }}>
                      {step.icon} {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {completion === 100 && (
              <div style={{
                marginTop: '20px', padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                color: '#34d399', fontSize: '0.85rem', fontWeight: '600', textAlign: 'center',
              }}>
                🎉 Your profile is 100% complete!
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div style={{ flex: '1 1 380px' }}>
          <div className="card" style={{ margin: 0 }}>
            <form onSubmit={handleSubmit} noValidate>

              {/* Major */}
              <div className="form-group">
                <label htmlFor="major">Major / Program of Study</label>
                <input
                  id="major" type="text" className="form-control"
                  value={formData.major} onChange={handleChange}
                  placeholder="e.g. Computer Science"
                />
              </div>

              {/* CV Drag-and-drop */}
              <div className="form-group">
                <label>Resume / CV</label>
                {user?.cvUrl && !cvFileName && (
                  <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
                    Current file:{' '}
                    <a href={user.cvUrl} target="_blank" rel="noreferrer"
                      style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                      View CV ↗
                    </a>
                  </p>
                )}

                <div
                  className={`dropzone ${dragging ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="drop-icon">{cvFileName ? '📄' : '☁️'}</div>
                  {cvFileName ? (
                    <p className="drop-text">
                      <strong>{cvFileName}</strong>
                      <br />
                      <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>Click to replace</span>
                    </p>
                  ) : (
                    <p className="drop-text">
                      <strong>Drag & drop</strong> your CV here, or <strong>click to browse</strong>
                      <br />
                      <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>PDF or Word • Max 5 MB</span>
                    </p>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>

              {/* LinkedIn */}
              <div className="form-group">
                <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
                <input
                  id="linkedinUrl" type="url" className="form-control"
                  value={formData.linkedinUrl} onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourname"
                  style={errors.linkedinUrl ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
                />
                {errors.linkedinUrl && (
                  <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.linkedinUrl}</p>
                )}
              </div>

              {/* GitHub */}
              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label htmlFor="githubUrl">GitHub / Portfolio URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="githubUrl" type="url" className="form-control"
                  value={formData.githubUrl} onChange={handleChange}
                  placeholder="https://github.com/yourname"
                  style={errors.githubUrl ? { borderColor: 'rgba(239,68,68,0.6)' } : {}}
                />
                {errors.githubUrl && (
                  <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.githubUrl}</p>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
