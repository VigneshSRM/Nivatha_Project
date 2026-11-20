import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiBriefcase, FiDollarSign, FiClock, FiBookmark } from 'react-icons/fi';

const JobCard = ({ job, onSave, saved }) => {
  const navigate = useNavigate();

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L`;
    return `₹${((min || max)/100000).toFixed(1)}L`;
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const jobTypeColor = {
    'full-time': 'badge-success',
    'part-time': 'badge-warning',
    'remote': 'badge-primary',
    'internship': 'badge-info',
    'contract': 'badge-danger',
  };

  return (
    <div className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className="job-card-header">
        <div className="company-logo">
          {job.company_logo
            ? <img src={job.company_logo} alt={job.company_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
            : getInitials(job.company_name || job.employer_name)
          }
        </div>
        <div style={{ flex: 1 }}>
          <div className="job-title">{job.title}</div>
          <div className="company-name">{job.company_name || job.employer_name}</div>
        </div>
        {onSave && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.4rem', color: saved ? 'var(--primary)' : 'var(--text-muted)' }}
            onClick={(e) => { e.stopPropagation(); onSave(job.id); }}
          >
            <FiBookmark size={18} fill={saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="job-meta">
        {job.location && (
          <span className="job-meta-item"><FiMapPin size={13} />{job.location}</span>
        )}
        {job.experience_required && (
          <span className="job-meta-item"><FiBriefcase size={13} />{job.experience_required}</span>
        )}
        <span className="job-meta-item"><FiDollarSign size={13} />{formatSalary(job.salary_min, job.salary_max)}</span>
      </div>

      <div className="job-footer">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`badge ${jobTypeColor[job.job_type] || 'badge-primary'}`}>
            {job.job_type}
          </span>
          {job.category && (
            <span className="badge badge-info">{job.category}</span>
          )}
        </div>
        <span className="job-meta-item">
          <FiClock size={12} />{timeAgo(job.created_at)}
        </span>
      </div>
    </div>
  );
};

export default JobCard;
