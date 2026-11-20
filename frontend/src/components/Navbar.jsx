import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiUser, FiLogOut, FiBell, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚡ SmartHire
      </Link>

      <div className="navbar-nav">
        {user && (
          <>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>Find Jobs</Link>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/applications" className={`nav-link ${isActive('/applications') ? 'active' : ''}`}>
              {user.role === 'employer' ? 'Applicants' : 'My Applications'}
            </Link>
            {user.role === 'employer' && (
              <Link to="/post-job" className={`nav-link ${isActive('/post-job') ? 'active' : ''}`}>Post Job</Link>
            )}
          </>
        )}
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/profile" className="btn btn-ghost btn-sm" style={{ gap: '0.4rem' }}>
              <FiUser size={15} />
              {user.full_name?.split(' ')[0]}
            </Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              <FiLogOut size={15} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
