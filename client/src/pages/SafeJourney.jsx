import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Share2, Copy, Check, ShieldCheck, XCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useSafety } from '../context/SafetyContext';
import { getCurrentCoordinates } from '../services/geolocation';

export default function SafeJourney() {
  const { activeJourney, refreshAllStatus } = useSafety();

  const [startLocation, setStartLocation] = useState('NITK Surathkal Campus');
  const [destination, setDestination] = useState('');
  const [etaMinutes, setEtaMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  const [includeLocation, setIncludeLocation] = useState(true);
  const [locStatus, setLocStatus] = useState('idle'); // 'idle', 'requesting', 'acquired', 'error'
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // When active journey exists, check if link was copied
  const shareUrl = activeJourney?.shareToken
    ? `${window.location.origin}/#shared/${activeJourney.shareToken}`
    : '';

  const handleFetchCoords = async () => {
    setLocStatus('requesting');
    try {
      const pos = await getCurrentCoordinates();
      setCoords(pos);
      setLocStatus('acquired');
    } catch (err) {
      setLocStatus('error');
      console.warn('Geolocation error:', err.message);
    }
  };

  const handleStartJourney = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      setErrorMsg('Please specify your destination.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let currentPos = coords;
      if (includeLocation && !currentPos) {
        try {
          currentPos = await getCurrentCoordinates();
        } catch (e) {
          console.warn('Could not acquire GPS coords on launch, proceeding anyway:', e.message);
        }
      }

      await api.startJourney({
        startLocation: startLocation.trim(),
        destination: destination.trim(),
        etaMinutes: Number(etaMinutes),
        startCoords: currentPos,
        notes: notes.trim()
      });

      await refreshAllStatus();
      setDestination('');
      setNotes('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initiate journey.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndJourney = async () => {
    if (!activeJourney) return;
    setLoading(true);
    try {
      await api.endJourney(activeJourney._id || activeJourney.id);
      await refreshAllStatus();
    } catch (err) {
      alert('Error ending journey: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!activeJourney) return;
    if (!window.confirm('Are you sure you want to revoke the shared tracking link? Trusted contacts will no longer be able to view your route.')) {
      return;
    }
    setLoading(true);
    try {
      await api.revokeJourneyShare(activeJourney._id || activeJourney.id);
      await refreshAllStatus();
    } catch (err) {
      alert('Error revoking share link: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappShareUrl = activeJourney?.shareToken
    ? `https://wa.me/?text=${encodeURIComponent(`Hi! Tracking my commute with SafeHer: I am travelling to ${activeJourney.destination}. Follow my journey status here: ${shareUrl}`)}`
    : '';

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Safe Journey & Travel Tracking</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Share your live route, ETA, and verified GPS position with trusted people using revocable, private links.
        </p>
      </div>

      {/* Active Journey View */}
      {activeJourney ? (
        <div className="card" style={{ borderTop: '5px solid var(--primary)', marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <span className="badge badge-purple" style={{ marginBottom: '0.4rem' }}>Live Journey Active</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{activeJourney.destination}</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Started from {activeJourney.startLocation} at {new Date(activeJourney.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              className="btn btn-sm"
              onClick={handleEndJourney}
              disabled={loading}
              style={{ background: 'var(--success-light)', color: 'var(--success)', fontWeight: 700 }}
            >
              <ShieldCheck size={18} />
              I Have Arrived Safely
            </button>
          </div>

          {/* ETA & Status Info */}
          <div className="grid-2" style={{ margin: '1rem 0' }}>
            <div style={{ background: '#FAF5FF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Clock size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)' }}>Estimated Arrival (ETA)</span>
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {new Date(activeJourney.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Duration set to {activeJourney.etaMinutes} minutes
              </p>
            </div>

            <div style={{ background: '#FAF5FF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <MapPin size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)' }}>GPS Location Sharing</span>
              </div>
              {activeJourney.lastKnownLocation ? (
                <div>
                  <p style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                    {activeJourney.lastKnownLocation.lat}, {activeJourney.lastKnownLocation.lng}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${activeJourney.lastKnownLocation.lat},${activeJourney.lastKnownLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}
                  >
                    View on Google Maps <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Location sharing not enabled for this trip
                </p>
              )}
            </div>
          </div>

          {/* Shareable Link Box */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', margin: '1.25rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Share2 size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Shareable Tracking Link</span>
              </div>
              {activeJourney.isRevoked ? (
                <span className="badge badge-danger">Link Revoked</span>
              ) : (
                <span className="badge badge-success">Link Active</span>
              )}
            </div>

            {activeJourney.isRevoked ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>
                This tracking link has been revoked. Contacts opening this link will see that tracking has ended.
              </p>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  Anyone with this unguessable link can view your journey status and ETA without needing to log in.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="form-input"
                    style={{ flex: 1, minWidth: '220px', fontSize: '0.82rem', background: 'white' }}
                  />

                  <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
                    {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    Share via WhatsApp
                  </a>

                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={handleRevokeShare}
                    style={{ color: 'var(--danger)' }}
                    title="Revoke access"
                  >
                    <XCircle size={16} />
                    Revoke
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Browser Limitation Notice */}
          <div className="notice-box notice-box-info">
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <p>
              <strong>Device Notice:</strong> Location tracking updates while the SafeHer browser tab remains active. Continuous background tracking cannot run if the device enters deep sleep or the browser application is terminated.
            </p>
          </div>
        </div>
      ) : (
        /* Create New Journey Form */
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto 2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={22} color="var(--primary)" />
            Start a Safe Journey
          </h2>

          {errorMsg && (
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleStartJourney}>
            <div className="form-group">
              <label className="form-label">Starting Point</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. NITK Library / Surathkal"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mangalore Central / Home / Hostel"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Travel Time (ETA)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`btn ${etaMinutes === mins ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setEtaMinutes(mins)}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
              <p className="form-hint">
                Expected arrival: {new Date(Date.now() + etaMinutes * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Optional Travel Notes (Cab number, driver name, route)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. White Swift Dzire, KA 19 XX 1234, Uber"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Geolocation Consent Toggle */}
            <div style={{ background: '#FAF5FF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                Include my browser GPS coordinates for live tracking
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginLeft: '1.8rem' }}>
                Coordinates are only shared with individuals who possess your secret share link.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ fontWeight: 800 }}
            >
              {loading ? 'Starting Journey...' : 'Start Journey & Generate Share Link'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
