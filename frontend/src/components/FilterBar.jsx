import React, { useState } from 'react';

const FilterBar = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [mode, setMode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search, type, mode });
  };

  return (
    <form className="filter-bar card" onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-control"
        placeholder="Search jobs, internships, companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">Any Type</option>
        <option value="JOB">Job</option>
        <option value="INTERNSHIP">Internship</option>
      </select>
      
      <select className="form-control" value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="">Any Mode</option>
        <option value="ONSITE">Onsite</option>
        <option value="REMOTE">Remote</option>
        <option value="HYBRID">Hybrid</option>
      </select>

      <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
        Filter
      </button>
    </form>
  );
};

export default FilterBar;
