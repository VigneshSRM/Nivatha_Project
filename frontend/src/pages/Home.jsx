import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiBriefcase, FiUsers, FiTrendingUp, FiStar } from 'react-icons/fi';
import { getJobs } from '../api/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const categories = [
  { icon: '💻', name: 'Technology', count: '2.5K+' },
  { icon: '📊', name: 'Finance', count: '1.2K+' },
  { icon: '🎨', name: 'Design', count: '800+' },
  { icon: '📣', name: 'Marketing', count: '950+' },
  { icon: '🏥', name: 'Healthcare', count: '600+' },
  { icon: '📚', name: 'Education', count: '700+' },
  { icon: '⚖️', name: 'Legal', count: '400+' },
  { icon: '🏗️', name: 'Engineering', count: '1.1K+' },
];

const Home = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getJobs({ limit: 6 }).then(res => setFeaturedJobs(res.data.jobs || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${searchTerm}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <FiTrendingUp size={14} /> #1 Job Portal in India
          </div>
          <h1>
            Find Your <span className="gradient-text">Dream Job</span><br />
            with SmartHire
          </h1>
          <p>Connect with top employers. Discover thousands of opportunities and take the next step in your career journey.</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <FiSearch size={20} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }} />
            <input
              type="text"
              placeholder="Search job title, company, or skills..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search Jobs
            </button>
          </form>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Popular: <span style={{ color: 'var(--primary-light)', cursor: 'pointer' }} onClick={() => navigate('/jobs?search=React')}>React Developer</span>,{' '}
            <span style={{ color: 'var(--primary-light)', cursor: 'pointer' }} onClick={() => navigate('/jobs?search=Python')}>Python</span>,{' '}
            <span style={{ color: 'var(--primary-light)', cursor: 'pointer' }} onClick={() => navigate('/jobs?category=Design')}>UI/UX Designer</span>
          </p>

          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-value">50K+</div><div className="hero-stat-label">Jobs Posted</div></div>
            <div className="hero-stat"><div className="hero-stat-value">20K+</div><div className="hero-stat-label">Companies</div></div>
            <div className="hero-stat"><div className="hero-stat-value">500K+</div><div className="hero-stat-label">Job Seekers</div></div>
            <div className="hero-stat"><div className="hero-stat-value">95%</div><div className="hero-stat-label">Success Rate</div></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
            <p className="section-subtitle">Explore opportunities in top industries</p>
          </div>
          <div className="grid-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="card"
                style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={() => navigate(`/jobs?category=${cat.name}`)}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{cat.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>{cat.count} Jobs</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured <span className="gradient-text">Jobs</span></h2>
            <p className="section-subtitle">Hand-picked opportunities from top companies</p>
          </div>

          {featuredJobs.length > 0 ? (
            <div className="grid-auto">
              {featuredJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">💼</div>
              <div className="empty-state-title">No jobs yet</div>
              <p>Be the first to post a job!</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/jobs" className="btn btn-primary btn-lg">
              View All Jobs <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How <span className="gradient-text">SmartHire</span> Works</h2>
          </div>
          <div className="grid-3">
            {[
              { step: '01', icon: '👤', title: 'Create Profile', desc: 'Sign up and build your professional profile with your skills and experience.' },
              { step: '02', icon: '🔍', title: 'Search & Apply', desc: 'Browse thousands of jobs and apply with a single click.' },
              { step: '03', icon: '🎉', title: 'Get Hired', desc: 'Connect with employers and land your dream job.' },
            ].map(item => (
              <div key={item.step} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>STEP {item.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ textAlign: 'center', background: 'var(--gradient-card)', padding: '4rem 2rem' }}>
            <h2 className="section-title">Ready to <span className="gradient-text">Get Hired?</span></h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join 500,000+ professionals who found their dream job on SmartHire</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/jobs" className="btn btn-primary btn-lg">Explore Jobs</Link>
              {user?.role === 'employer' ? (
                <Link to="/post-job" className="btn btn-outline btn-lg">Post a Job</Link>
              ) : (
                <Link to="/dashboard" className="btn btn-outline btn-lg">My Dashboard</Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>© 2024 SmartHire. Built with ❤️ for job seekers and employers.</p>
      </footer>
    </div>
  );
};

export default Home;
