import React, { useState, useEffect } from 'react';
import { getMyApplications, getMyJobs, getJobApplications, updateAppStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMapPin, FiCalendar, FiChevronDown } from 'react-icons/fi';

const statusColors = {
  pending: 'badge-warning', reviewed: 'badge-info',
  shortlisted: 'badge-success', rejected: 'badge-danger', hired: 'badge-primary',
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const isEmployer = user?.role === 'employer';

  useEffect(() => {
    if (isEmployer) {
      getMyJobs()
        .then(res => {
          setMyJobs(res.data.jobs || []);
          if (res.data.jobs?.length > 0) {
            setSelectedJob(res.data.jobs[0].id);
          }
        })
        .finally(() => setLoading(false));
    } else {
      getMyApplications()
        .then(res => setApplications(res.data.applications || []))
        .finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (isEmployer && selectedJob) {
      setLoading(true);
      getJobApplications(selectedJob)
        .then(res => setApplications(res.data.applications || []))
        .finally(() => setLoading(false));
    }
  }, [selectedJob]);

  const handleStatusChange = async (appId, status) => {
    try {
      await updateAppStatus(appId, status);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">
            {isEmployer ? '👥 Applicants' : '📨 My Applications'}
          </h1>
          <p className="page-subtitle">
            {isEmployer ? 'Review and manage job applicants' : 'Track your job application status'}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Employer job selector */}
        {isEmployer && myJobs.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Select Job to View Applicants</label>
            <select
              className="form-control"
              style={{ maxWidth: '400px' }}
              value={selectedJob || ''}
              onChange={e => setSelectedJob(e.target.value)}
            >
              {myJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.application_count || 0} applicants)
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : applications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map(app => (
              <div key={app.id} className="card" style={{ cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div className="company-logo" style={{ background: 'var(--gradient-main)' }}>
                      {isEmployer
                        ? (app.full_name?.charAt(0) || 'U')
                        : (app.company_name?.charAt(0) || 'C')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                        {isEmployer ? app.full_name : app.job_title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {isEmployer ? app.email : app.company_name}
                      </div>
                      {isEmployer && app.headline && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>{app.headline}</div>
                      )}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {!isEmployer && app.job_type && <span className="badge badge-primary">{app.job_type}</span>}
                        {!isEmployer && app.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <FiMapPin size={12} />{app.location}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <FiCalendar size={12} />
                          {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                        {isEmployer && app.experience_years !== undefined && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {app.experience_years}yr exp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className={`badge ${statusColors[app.status] || 'badge-primary'}`}>
                      {app.status}
                    </span>
                    {isEmployer && (
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                      >
                        {['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {app.cover_letter && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-card2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>COVER LETTER</div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{app.cover_letter}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">{isEmployer ? '👥' : '📨'}</div>
            <div className="empty-state-title">
              {isEmployer ? 'No applicants yet' : 'No applications yet'}
            </div>
            <p>{isEmployer ? 'Applications will appear here' : 'Start applying to jobs'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
