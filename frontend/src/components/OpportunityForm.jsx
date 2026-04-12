import React, { useState } from 'react';

const DESC_MAX = 2000;
const REQ_MAX  = 1000;

const FieldError = ({ msg }) =>
  msg ? <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{msg}</p> : null;

const CharCounter = ({ value, max }) => {
  const len = value?.length || 0;
  const cls = len > max * 0.95 ? 'at-limit' : len > max * 0.8 ? 'near-limit' : '';
  return <p className={`char-counter ${cls}`}>{len} / {max}</p>;
};

const OpportunityForm = ({ defaultValues, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title:        defaultValues?.title        || '',
    company:      defaultValues?.company      || '',
    type:         defaultValues?.type         || 'JOB',
    location:     defaultValues?.location     || '',
    mode:         defaultValues?.mode         || 'ONSITE',
    description:  defaultValues?.description  || '',
    requirements: defaultValues?.requirements ? defaultValues.requirements.join('\n') : '',
    deadline:     defaultValues?.deadline     || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim())       e.title       = 'Job title is required.';
    if (!formData.company.trim())     e.company     = 'Company name is required.';
    if (!formData.location.trim())    e.location    = 'Location is required.';
    if (!formData.description.trim()) e.description = 'Please provide a job description.';
    if (formData.description.length > DESC_MAX) e.description = `Description must be under ${DESC_MAX} characters.`;
    if (formData.requirements.length > REQ_MAX) e.requirements = `Requirements must be under ${REQ_MAX} characters.`;
    if (formData.deadline) {
      const d = new Date(formData.deadline);
      const today = new Date(); today.setHours(0,0,0,0);
      if (!defaultValues && d < today) e.deadline = 'Deadline cannot be in the past.';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const requirementsArray = formData.requirements
      .split('\n')
      .map(r => r.trim())
      .filter(r => r !== '');

    onSubmit({ ...formData, requirements: requirementsArray });
  };

  const inputStyle = (field) => ({
    borderColor: errors[field] ? 'rgba(239,68,68,0.6)' : undefined,
    boxShadow: errors[field] ? '0 0 0 3px rgba(239,68,68,0.12)' : undefined,
  });

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2 className="page-title" style={{ marginTop: 0 }}>
        {defaultValues ? 'Edit Opportunity' : 'Create New Opportunity'}
      </h2>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: '1 1 200px' }}>
          <label htmlFor="title">Job Title *</label>
          <input id="title" type="text" className="form-control" value={formData.title}
            onChange={handleChange} style={inputStyle('title')} placeholder="e.g. Frontend Developer" />
          <FieldError msg={errors.title} />
        </div>

        <div className="form-group" style={{ flex: '1 1 200px' }}>
          <label htmlFor="company">Company Name *</label>
          <input id="company" type="text" className="form-control" value={formData.company}
            onChange={handleChange} style={inputStyle('company')} placeholder="e.g. Google" />
          <FieldError msg={errors.company} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="type">Type *</label>
          <select id="type" className="form-control" value={formData.type} onChange={handleChange}>
            <option value="JOB">Job</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="mode">Work Mode *</label>
          <select id="mode" className="form-control" value={formData.mode} onChange={handleChange}>
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location *</label>
        <input id="location" type="text" className="form-control" value={formData.location}
          onChange={handleChange} style={inputStyle('location')} placeholder="e.g. Beirut, Lebanon" />
        <FieldError msg={errors.location} />
      </div>

      <div className="form-group">
        <label htmlFor="description">Job Description *</label>
        <textarea id="description" className="form-control" rows="6" value={formData.description}
          onChange={handleChange} style={inputStyle('description')}
          placeholder="Describe the role, responsibilities, and what makes this opportunity great..." />
        <CharCounter value={formData.description} max={DESC_MAX} />
        <FieldError msg={errors.description} />
      </div>

      <div className="form-group">
        <label htmlFor="requirements">Requirements <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(one per line)</span></label>
        <textarea id="requirements" className="form-control" rows="4" value={formData.requirements}
          onChange={handleChange} style={inputStyle('requirements')}
          placeholder={"React\nNode.js\n3+ years experience"} />
        <CharCounter value={formData.requirements} max={REQ_MAX} />
        <FieldError msg={errors.requirements} />
      </div>

      <div className="form-group">
        <label htmlFor="deadline">Application Deadline</label>
        <input id="deadline" type="date" className="form-control" value={formData.deadline}
          onChange={handleChange} style={inputStyle('deadline')}
          min={!defaultValues ? new Date().toISOString().split('T')[0] : undefined} />
        <FieldError msg={errors.deadline} />
      </div>

      <div style={{ marginTop: '32px' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues ? 'Save Changes' : 'Publish Post'}
        </button>
      </div>
    </form>
  );
};

export default OpportunityForm;
