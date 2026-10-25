import React, { useState } from 'react';
import { UserPlus, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ setCurrentTab }) {
  const { register, demoLogin } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      setCurrentTab('dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await demoLogin();
      setCurrentTab('dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '460px', margin: '2rem auto' }}>
      <div className="card" style={{ borderTop: '5px solid var(--accent-pink)', padding: '2rem 1.75rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="brand-icon-wrap" style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem' }}>
            <Shield size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create SafeHer Account</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Join the safety network for yourself and your loved ones
          </p>
        </div>

        {/* 1-Click Demo Login Shortcut */}
        <div style={{ background: '#FAF5FF', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm btn-block"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{ fontWeight: 800 }}
          >
            <UserCheck size={16} />
            Quick Demo Login (Skip Registration)
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Priya Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Phone Number (Optional)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min 6 chars"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-pink btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '0.75rem', fontWeight: 700 }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setCurrentTab('login')}
            style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
