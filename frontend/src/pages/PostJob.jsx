import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../api/api';
import toast from 'react-hot-toast';
import { FiBriefcase } from 'react-icons/fi';

const jobTypes = ['full-time', 'part-time', 'remote', 'internship', 'contract'];
const categories = ['Technology', 'Finance', 'Design', 'Marketing', 'Healthcare', 'Education', 'Legal', 'Engineering', 'Sales', 'HR', 'Other'];

const PostJob = () => {
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', skills_required: '',
    job_type: 'full-time', category: 'Technology', location: '',
    salary_min: '', salary_max: '', experience_required: '',
    education_required: '', deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description are required');
    setLoading(true);
    try {
      await createJob(form);
      toast.success('Job posted successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Post a <span className="gradient-text">New Job</span></h1>
          <p className="page-subtitle">Fill in the details to attract the right candidates</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiBriefcase /> Basic Information
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input name="title" type="text" className="form-control" placeholder="e.g. Senior React Developer"
                    value={form.title} onChange={handleChange} required />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Job Type *</label>
                    <select name="job_type" className="form-control" value={form.job_type} onChange={handleChange}>
                      {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select name="category" className="form-control" value={form.category} onChange={handleChange}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input name="location" type="text" className="form-control" placeholder="e.g. Bangalore, India / Remote"
                    value={form.location} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>📋 Job Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Description *</label>
                  <textarea name="description" className="form-control" placeholder="Describe the role, responsibilities, and company culture..."
                    value={form.description} onChange={handleChange} rows={6} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea name="requirements" className="form-control" placeholder="List the key requirements for this position..."
                    value={form.requirements} onChange={handleChange} rows={4} />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (comma separated)</label>
                  <input name="skills_required" type="text" className="form-control"
                    placeholder="e.g. React, Node.js, MySQL, AWS"
                    value={form.skills_required} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Compensation & Requirements */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>💰 Compensation & Requirements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Min Salary (₹/year)</label>
                    <input name="salary_min" type="number" className="form-control" placeholder="e.g. 600000"
                      value={form.salary_min} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Salary (₹/year)</label>
                    <input name="salary_max" type="number" className="form-control" placeholder="e.g. 1200000"
                      value={form.salary_max} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Experience Required</label>
                    <input name="experience_required" type="text" className="form-control" placeholder="e.g. 2-4 years"
                      value={form.experience_required} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Education Required</label>
                    <input name="education_required" type="text" className="form-control" placeholder="e.g. B.Tech / BCA"
                      value={form.education_required} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input name="deadline" type="date" className="form-control"
                    value={form.deadline} onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/dashboard')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Posting...' : '🚀 Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
