import React, { useState } from 'react';

const OpportunityForm = ({ defaultValues, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: defaultValues?.title || '',
    company: defaultValues?.company || '',
    type: defaultValues?.type || 'JOB',
    location: defaultValues?.location || '',
    mode: defaultValues?.mode || 'ONSITE',
    description: defaultValues?.description || '',
    requirements: defaultValues?.requirements ? defaultValues.requirements.join('\n') : '',
    deadline: defaultValues?.deadline || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requirementsArray = formData.requirements
      .split('\n')
      .map(r => r.trim())
      .filter(r => r !== '');
      
    onSubmit({
      ...formData,
      requirements: requirementsArray
    });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2 className="page-title" style={{ marginTop: 0 }}>
        {defaultValues ? 'Edit Opportunity' : 'Create Opportunity'}
      </h2>

      <div className="form-group">
        <label htmlFor="title">Job Title *</label>
        <input id="title" type="text" className="form-control" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="company">Company Name *</label>
        <input id="company" type="text" className="form-control" value={formData.company} onChange={handleChange} required />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="type">Type *</label>
          <select id="type" className="form-control" value={formData.type} onChange={handleChange} required>
            <option value="JOB">Job</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label htmlFor="mode">Work Mode *</label>
          <select id="mode" className="form-control" value={formData.mode} onChange={handleChange} required>
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location *</label>
        <input id="location" type="text" className="form-control" value={formData.location} onChange={handleChange} required placeholder="e.g. New York, NY" />
      </div>

      <div className="form-group">
        <label htmlFor="description">Job Description *</label>
        <textarea id="description" className="form-control" rows="5" value={formData.description} onChange={handleChange} required></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="requirements">Requirements (One per line)</label>
        <textarea id="requirements" className="form-control" rows="4" value={formData.requirements} onChange={handleChange} placeholder="React&#10;NodeJS&#10;3+ Years Experience"></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="deadline">Application Deadline</label>
        <input id="deadline" type="date" className="form-control" value={formData.deadline} onChange={handleChange} />
      </div>

      <div style={{ marginTop: '32px' }}>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </button>
      </div>
    </form>
  );
};

export default OpportunityForm;
