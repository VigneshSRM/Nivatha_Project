import React, { useState, useEffect } from 'react';
import { getProfile, updateSeekerProfile, updateEmployerProfile } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiGlobe, FiLinkedin } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isEmployer = user?.role === 'employer';

  useEffect(() => {
    getProfile()
      .then(res => {
        setUserData(res.data.user);
        setProfile(res.data.profile);
        setForm({ ...res.data.user, ...(res.data.profile || {}) });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEmployer) await updateEmployerProfile(form);
      else await updateSeekerProfile(form);
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">My <span className="gradient-text">Profile</span></h1>
          <p className="page-subtitle">Manage your personal and professional information</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {/* Profile Header */}
          <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--gradient-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {userData.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{userData.full_name}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{userData.email}</div>
              <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                {userData.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>👤 Personal Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="full_name" type="text" className="form-control"
                      value={form.full_name || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" type="tel" className="form-control" placeholder="+91 9876543210"
                      value={form.phone || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {isEmployer ? (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>🏢 Company Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <input name="company_name" className="form-control" value={form.company_name || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Industry</label>
                      <input name="industry" className="form-control" placeholder="e.g. Technology, Finance"
                        value={form.industry || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Company Size</label>
                      <select name="company_size" className="form-control" value={form.company_size || ''} onChange={handleChange}>
                        <option value="">Select size</option>
                        <option>1-10</option><option>11-50</option><option>51-200</option>
                        <option>201-500</option><option>500+</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input name="location" className="form-control" placeholder="City, Country"
                        value={form.location || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Website</label>
                    <input name="company_website" type="url" className="form-control" placeholder="https://yourcompany.com"
                      value={form.company_website || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Description</label>
                    <textarea name="company_description" className="form-control" rows={4} placeholder="Tell candidates about your company..."
                      value={form.company_description || ''} onChange={handleChange} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>💼 Professional Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Professional Headline</label>
                    <input name="headline" className="form-control" placeholder="e.g. Full Stack Developer | React & Node.js"
                      value={form.headline || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio / Summary</label>
                    <textarea name="bio" className="form-control" rows={4} placeholder="Tell employers about yourself..."
                      value={form.bio || ''} onChange={handleChange} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Experience (years)</label>
                      <input name="experience_years" type="number" className="form-control" min={0}
                        value={form.experience_years || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Education</label>
                      <input name="education" className="form-control" placeholder="e.g. B.Tech Computer Science"
                        value={form.education || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Skills (comma separated)</label>
                    <input name="skills" className="form-control" placeholder="e.g. React, Node.js, Python, SQL"
                      value={form.skills || ''} onChange={handleChange} />
                  </div>
                  {form.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {form.skills.split(',').filter(Boolean).map(skill => (
                        <span key={skill} className="badge badge-primary">{skill.trim()}</span>
                      ))}
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input name="location" className="form-control" placeholder="City, Country"
                      value={form.location || ''} onChange={handleChange} />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">LinkedIn URL</label>
                      <input name="linkedin_url" type="url" className="form-control" placeholder="https://linkedin.com/in/..."
                        value={form.linkedin_url || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Portfolio URL</label>
                      <input name="portfolio_url" type="url" className="form-control" placeholder="https://yourportfolio.com"
                        value={form.portfolio_url || ''} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                {saving ? 'Saving...' : '✅ Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
