import React, { useState } from 'react';
import { LogIn, Shield, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ setCurrentTab }) {
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      setCurrentTab('dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
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
    <div className="page-container" style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="card" style={{ borderTop: '5px solid var(--primary)', padding: '2rem 1.75rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="brand-icon-wrap" style={{ width: '48px', height: '48px', margin: '0 auto 0.75rem' }}>
            <Shield size={26} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Sign In to SafeHer</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Access your private contacts and active journeys
          </p>
        </div>

        {/* 1-Click Demo Login for Hackathon Judges */}
        <div style={{ background: '#FAF5FF', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '0.4rem' }}>
            Evaluating for recHERsion'26?
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm btn-block"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{ fontWeight: 800 }}
          >
            <UserCheck size={16} />
            Instant 1-Click Demo Login (Priya Sharma)
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Pre-configured with sample emergency contacts & trips
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '0.75rem', fontWeight: 700 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => setCurrentTab('register')}
            style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
