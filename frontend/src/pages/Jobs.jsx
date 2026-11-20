import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getJobs, toggleSaveJob, getSavedJobs } from '../api/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';

const jobTypes = ['', 'full-time', 'part-time', 'remote', 'internship', 'contract'];
const categories = ['', 'Technology', 'Finance', 'Design', 'Marketing', 'Healthcare', 'Education', 'Legal', 'Engineering', 'Sales', 'HR'];

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    job_type: '',
    location: '',
    page: 1,
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs(filters);
      setJobs(res.data.jobs);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    if (!user) return;
    try {
      const res = await getSavedJobs();
      setSavedJobIds(res.data.jobs.map(j => j.id));
    } catch {}
  };

  useEffect(() => { fetchJobs(); }, [filters]);
  useEffect(() => { fetchSaved(); }, [user]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSave = async (jobId) => {
    if (!user) return toast.error('Please login to save jobs');
    try {
      const res = await toggleSaveJob(jobId);
      setSavedJobIds(prev =>
        res.data.saved ? [...prev, jobId] : prev.filter(id => id !== jobId)
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Find Your <span className="gradient-text">Perfect Job</span></h1>
          <p className="page-subtitle">{pagination.total || 0} opportunities available</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div style={{ position: 'relative', flex: 2, minWidth: '250px' }}>
          <FiSearch size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="filter-input"
            placeholder="Search jobs, companies, skills..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select className="filter-input" style={{ flex: 1, minWidth: '150px' }} value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-input" style={{ flex: 1, minWidth: '140px' }} value={filters.job_type} onChange={e => handleFilterChange('job_type', e.target.value)}>
          <option value="">All Types</option>
          {jobTypes.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="text"
          className="filter-input"
          placeholder="Location..."
          value={filters.location}
          onChange={e => handleFilterChange('location', e.target.value)}
          style={{ flex: 1, minWidth: '140px' }}
        />
      </div>

      {/* Results */}
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: '200px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid-auto">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onSave={handleSave}
                saved={savedJobIds.includes(job.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No jobs found</div>
            <p>Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${filters.page === page ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, page }))}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
