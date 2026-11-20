import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, applyJob, toggleSaveJob } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMapPin, FiBriefcase, FiDollarSign, FiCalendar, FiUsers, FiBookmark, FiArrowLeft } from 'react-icons/fi';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getJob(id)
      .then(res => setJob(res.data.job))
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async e => {
    e.preventDefault();
    if (!user) return toast.error('Please login to apply');
    if (user.role !== 'jobseeker') return toast.error('Only job seekers can apply');
    setApplying(true);
    try {
      await applyJob(id, { cover_letter: coverLetter });
      toast.success('Application submitted successfully! 🎉');
      setShowApplyForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${(min/100000).toFixed(1)}L - ₹${(max/100000).toFixed(1)}L`;
    return `₹${((min || max)/100000).toFixed(1)}L`;
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!job) return <div className="page"><div className="empty-state"><div className="empty-state-icon">❌</div><div className="empty-state-title">Job not found</div></div></div>;

  return (
    <div className="page">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          <FiArrowLeft /> Back to Jobs
        </button>

        <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="company-logo" style={{ width: '70px', height: '70px', fontSize: '1.75rem', borderRadius: '16px' }}>
                  {job.company_name?.charAt(0) || 'C'}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{job.title}</h1>
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{job.company_name}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <span className="badge badge-primary">{job.job_type}</span>
                    {job.category && <span className="badge badge-info">{job.category}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                  {user?.role === 'jobseeker' && (
                    <button className="btn btn-primary btn-lg" onClick={() => setShowApplyForm(!showApplyForm)}>
                      {showApplyForm ? 'Cancel' : '🚀 Apply Now'}
                    </button>
                  )}
                  {!user && (
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                      Login to Apply
                    </button>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1.25rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                {[
                  { icon: <FiMapPin />, label: 'Location', value: job.location || 'Not specified' },
                  { icon: <FiDollarSign />, label: 'Salary', value: formatSalary(job.salary_min, job.salary_max) },
                  { icon: <FiBriefcase />, label: 'Experience', value: job.experience_required || 'Any' },
                  { icon: <FiCalendar />, label: 'Deadline', value: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open' },
                  { icon: <FiUsers />, label: 'Views', value: `${job.views || 0} views` },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Apply Form */}
              {showApplyForm && (
                <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Submit Application</h3>
                  <form onSubmit={handleApply}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Cover Letter</label>
                      <textarea
                        className="form-control"
                        placeholder="Tell the employer why you're the perfect candidate..."
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        rows={5}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={applying}>
                      {applying ? 'Submitting...' : '🚀 Submit Application'}
                    </button>
                  </form>
                </div>
              )}

              {/* Description */}
              <div>
                <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Job Description</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{job.description}</p>
              </div>

              {job.requirements && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Requirements</h2>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
                </div>
              )}

              {job.skills_required && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h2 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>Required Skills</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {job.skills_required.split(',').map(skill => (
                      <span key={skill} className="badge badge-primary" style={{ padding: '0.35rem 0.9rem' }}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
