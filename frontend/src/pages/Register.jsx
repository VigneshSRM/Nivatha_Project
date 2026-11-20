import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiBriefcase } from 'react-icons/fi';

const Register = () => {
  const [role, setRole] = useState('jobseeker');
  const [form, setForm] = useState({ full_name: '', email: '', password: '', company_name: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await register({ ...form, role });
      loginUser(res.data.token, res.data.user);
      toast.success('Account created successfully! 🎉');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
          <h1 className="auth-title">Join SmartHire</h1>
          <p className="auth-subtitle">Create your free account today</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector" style={{ marginBottom: '1.5rem' }}>
          <div className={`role-option ${role === 'jobseeker' ? 'selected' : ''}`} onClick={() => setRole('jobseeker')}>
            <div className="role-option-icon">🎓</div>
            <div className="role-option-label">Job Seeker</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Find jobs</div>
          </div>
          <div className={`role-option ${role === 'employer' ? 'selected' : ''}`} onClick={() => setRole('employer')}>
            <div className="role-option-icon">🏢</div>
            <div className="role-option-label">Employer</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Hire talent</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="full_name" type="text" className="form-control" placeholder="John Doe"
                value={form.full_name} onChange={handleChange} style={{ paddingLeft: '2.75rem' }} required />
            </div>
          </div>

          {role === 'employer' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div style={{ position: 'relative' }}>
                <FiBriefcase size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input name="company_name" type="text" className="form-control" placeholder="Acme Corp"
                  value={form.company_name} onChange={handleChange} style={{ paddingLeft: '2.75rem' }} required />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="email" type="email" className="form-control" placeholder="you@example.com"
                value={form.email} onChange={handleChange} style={{ paddingLeft: '2.75rem' }} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="password" type="password" className="form-control" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange} style={{ paddingLeft: '2.75rem' }} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : `Create ${role === 'employer' ? 'Employer' : ''} Account →`}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
