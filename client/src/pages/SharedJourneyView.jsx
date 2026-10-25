import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, ShieldCheck, AlertCircle, RefreshCw, ExternalLink, Shield } from 'lucide-react';
import { api } from '../services/api';

export default function SharedJourneyView({ token, onBackHome }) {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastChecked, setLastChecked] = useState(new Date());

  const fetchShared = async () => {
    if (!token) {
      setError('No journey tracking token provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.getSharedJourney(token);
      if (res.success && res.journey) {
        setJourney(res.journey);
        setLastChecked(new Date());
      } else {
        setError(res.error || 'Journey not found or expired.');
      }
    } catch (err) {
      setError(err.message || 'Unable to load shared journey details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShared();
    const interval = setInterval(fetchShared, 20000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading && !journey) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="sos-pulse-ring" style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem', position: 'relative' }}></div>
        <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Loading SafeHer Journey Status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ maxWidth: '560px', margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', borderTop: '5px solid var(--danger)' }}>
          <AlertCircle size={44} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>Tracking Unavailable</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {error}
          </p>
          <button className="btn btn-secondary btn-block" onClick={onBackHome}>
            Go to SafeHer Home
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = journey.status === 'completed';
  const isActive = journey.status === 'active';

  return (
    <div className="page-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <div className="brand-icon-wrap" style={{ width: '36px', height: '36px' }}>
            <Shield size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800 }}>SafeHer Live Trip Status</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Secure Contact Viewer</p>
          </div>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={fetchShared}
          disabled={loading}
          style={{ fontSize: '0.78rem', gap: '0.35rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="card" style={{ borderTop: `6px solid ${isCompleted ? 'var(--success)' : 'var(--primary)'}` }}>
        <div className="card-header">
          <div>
            <span className={`badge ${isCompleted ? 'badge-success' : 'badge-purple'}`} style={{ marginBottom: '0.4rem' }}>
              {isCompleted ? 'Safely Arrived' : 'Journey In Progress'}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{journey.travelerName}'s Travel</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Bound for: <strong>{journey.destination}</strong>
            </p>
          </div>
        </div>

        {/* Route Details */}
        <div style={{ background: '#FAF5FF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.15rem', margin: '1rem 0' }}>
          <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.75rem' }}>
            <Navigation size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Starting Point</p>
              <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>{journey.startLocation}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <MapPin size={18} color="var(--accent-pink)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Destination</p>
              <p style={{ fontSize: '0.92rem', fontWeight: 700 }}>{journey.destination}</p>
            </div>
          </div>
        </div>

        {/* ETA & Location Coordinates */}
        <div className="grid-2" style={{ margin: '1rem 0' }}>
          <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <Clock size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Expected Arrival Time</span>
            </div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              {new Date(journey.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Planned travel time: ~{journey.etaMinutes} mins
            </p>
          </div>

          <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <MapPin size={16} color="var(--accent-pink)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Last Reported Coordinates</span>
            </div>
            {journey.lastKnownLocation ? (
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  {journey.lastKnownLocation.lat}, {journey.lastKnownLocation.lng}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${journey.lastKnownLocation.lat},${journey.lastKnownLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.72rem', marginTop: '0.4rem', gap: '0.3rem' }}
                >
                  Open in Google Maps
                  <ExternalLink size={12} />
                </a>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                GPS coordinates not attached
              </p>
            )}
          </div>
        </div>

        {journey.notes && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', margin: '1rem 0' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>Traveler Notes</p>
            <p style={{ fontSize: '0.85rem', color: '#78350F', marginTop: '0.2rem' }}>{journey.notes}</p>
          </div>
        )}

        <div className="notice-box notice-box-info" style={{ marginTop: '1.25rem' }}>
          <p style={{ fontSize: '0.78rem' }}>
            {journey.limitationNotice}
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Last checked: {lastChecked.toLocaleTimeString()} • Powered by SafeHer (recHERsion'26)
        </div>
      </div>
    </div>
  );
}
