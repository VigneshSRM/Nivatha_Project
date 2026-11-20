import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🔍</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
    </div>
  </div>
);

export default NotFound;
