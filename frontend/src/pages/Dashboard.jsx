import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getMyJobs, getMyApplications } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUsers, FiBookmark, FiTrendingUp, FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      user?.role === 'employer' ? getMyJobs() : getMyApplications(),
    ])
      .then(([statsRes, itemsRes]) => {
        setStats(statsRes.data.stats);
        if (user?.role === 'employer') {
          setRecentItems((itemsRes.data.jobs || []).slice(0, 5));
        } else {
          setRecentItems((itemsRes.data.applications || []).slice(0, 5));
        }
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [user]);

  const isEmployer = user?.role === 'employer';

  const employerStats = [
    { icon: '💼', label: 'Total Jobs Posted', value: stats.total_jobs || 0, color: 'var(--primary)' },
    { icon: '✅', label: 'Active Jobs', value: stats.active_jobs || 0, color: 'var(--success)' },
    { icon: '👥', label: 'Total Applications', value: stats.total_applications || 0, color: 'var(--secondary)' },
  ];

  const seekerStats = [
    { icon: '📨', label: 'Jobs Applied', value: stats.total_applied || 0, color: 'var(--primary)' },
    { icon: '⭐', label: 'Shortlisted', value: stats.shortlisted || 0, color: 'var(--success)' },
    { icon: '🔖', label: 'Saved Jobs', value: stats.saved_jobs || 0, color: 'var(--secondary)' },
  ];

  const statCards = isEmployer ? employerStats : seekerStats;

  const statusColor = {
    pending: 'badge-warning', reviewed: 'badge-info',
    shortlisted: 'badge-success', rejected: 'badge-danger', hired: 'badge-primary',
    active: 'badge-success', closed: 'badge-danger', draft: 'badge-warning',
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">
            Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0]}!</span> 👋
          </h1>
          <p className="page-subtitle">
            {isEmployer ? 'Manage your job postings and applicants' : 'Track your job applications and career progress'}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Stats */}
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          {statCards.map(stat => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ fontSize: '1.75rem' }}>{stat.icon}</div>
              <div>
                <div className="stat-value">{loading ? '—' : stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {isEmployer ? (
              <>
                <Link to="/post-job" className="btn btn-primary"><FiPlus /> Post New Job</Link>
                <Link to="/applications" className="btn btn-outline"><FiUsers /> View Applicants</Link>
                <Link to="/jobs" className="btn btn-ghost"><FiEye /> Browse Jobs</Link>
              </>
            ) : (
              <>
                <Link to="/jobs" className="btn btn-primary"><FiBriefcase /> Find Jobs</Link>
                <Link to="/applications" className="btn btn-outline"><FiTrendingUp /> My Applications</Link>
                <Link to="/profile" className="btn btn-ghost"><FiUsers /> Edit Profile</Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              {isEmployer ? 'Recent Job Postings' : 'Recent Applications'}
            </h2>
            <Link to={isEmployer ? '/applications' : '/applications'} className="btn btn-ghost btn-sm">View All</Link>
          </div>

          {loading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : recentItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', background: 'var(--bg-card2)', borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                      {isEmployer ? item.title : item.job_title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {isEmployer
                        ? `${item.application_count || 0} applicants · ${item.location || 'Remote'}`
                        : `${item.company_name} · Applied ${new Date(item.applied_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <span className={`badge ${statusColor[item.status] || 'badge-primary'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">{isEmployer ? '💼' : '📨'}</div>
              <div className="empty-state-title">{isEmployer ? 'No jobs posted yet' : 'No applications yet'}</div>
              <p>{isEmployer ? 'Post your first job to get started' : 'Start applying to land your dream job'}</p>
              <Link to={isEmployer ? '/post-job' : '/jobs'} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                {isEmployer ? 'Post a Job' : 'Browse Jobs'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
