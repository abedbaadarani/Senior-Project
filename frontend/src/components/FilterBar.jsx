import React, { useState } from 'react';

const FilterBar = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [type, setType]     = useState('');
  const [mode, setMode]     = useState('');
  const [sort, setSort]     = useState('newest');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search, type, mode, sort });
  };

  const handleClear = () => {
    setSearch(''); setType(''); setMode(''); setSort('newest');
    onFilterChange({ search: '', type: '', mode: '', sort: 'newest' });
  };

  const hasFilters = search || type || mode || sort !== 'newest';

  return (
    <form className="filter-bar card" onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
      {/* Row 1: Search */}
      <input
        type="text"
        className="form-control"
        placeholder="🔍  Search jobs, companies, keywords..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ flex: '1 1 220px' }}
      />

      {/* Row 2: Dropdowns */}
      <select className="form-control" value={type} onChange={e => setType(e.target.value)} style={{ flex: '1 1 130px' }}>
        <option value="">Any Type</option>
        <option value="JOB">Job</option>
        <option value="INTERNSHIP">Internship</option>
      </select>

      <select className="form-control" value={mode} onChange={e => setMode(e.target.value)} style={{ flex: '1 1 130px' }}>
        <option value="">Any Mode</option>
        <option value="ONSITE">Onsite</option>
        <option value="REMOTE">Remote</option>
        <option value="HYBRID">Hybrid</option>
      </select>

      <select className="form-control" value={sort} onChange={e => setSort(e.target.value)} style={{ flex: '1 1 160px' }}>
        <option value="newest">⬇ Newest First</option>
        <option value="oldest">⬆ Oldest First</option>
        <option value="deadline">⏰ Deadline Soon</option>
        <option value="az">🔤 A → Z</option>
      </select>

      <button type="submit" className="btn-primary" style={{ width: 'auto', flexShrink: 0 }}>
        Filter
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            width: 'auto', flexShrink: 0,
            padding: '10px 16px', borderRadius: '8px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            color: '#94a3b8', cursor: 'pointer', fontWeight: '600',
            fontSize: '0.88rem', transition: 'all 0.2s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        >
          ✕ Clear
        </button>
      )}
    </form>
  );
};

export default FilterBar;
