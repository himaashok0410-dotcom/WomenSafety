import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, XCircle, AlertCircle, PlusCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useSafety } from '../context/SafetyContext';

export default function SafetyCheckIn() {
  const { activeCheckIn, refreshAllStatus } = useSafety();

  const [durationMinutes, setDurationMinutes] = useState(15);
  const [label, setLabel] = useState('Walking across campus / Corridor');
  const [locationNotes, setLocationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Local live countdown clock synced with server active checkin
  useEffect(() => {
    if (!activeCheckIn || activeCheckIn.status === 'safe' || activeCheckIn.status === 'cancelled') {
      setRemainingSecs(0);
      return;
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const deadline = new Date(activeCheckIn.expectedTime).getTime();
      return Math.max(0, Math.floor((deadline - now) / 1000));
    };

    setRemainingSecs(calculateRemaining());

    const interval = setInterval(() => {
      const left = calculateRemaining();
      setRemainingSecs(left);
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCheckIn]);

  const handleStartCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      await api.startCheckIn({
        durationMinutes: Number(durationMinutes),
        label: label.trim(),
        locationNotes: locationNotes.trim()
      });
      await refreshAllStatus();
      setFeedback(`Check-in timer started for ${durationMinutes} minutes.`);
    } catch (err) {
      alert('Error starting check-in: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSafe = async () => {
    if (!activeCheckIn) return;
    setLoading(true);
    try {
      await api.confirmCheckInSafe(activeCheckIn._id || activeCheckIn.id);
      await refreshAllStatus();
      setFeedback('Confirmed! Great to know you are safe.');
    } catch (err) {
      alert('Error confirming safety: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCheckIn = async () => {
    if (!activeCheckIn) return;
    setLoading(true);
    try {
      await api.cancelCheckIn(activeCheckIn._id || activeCheckIn.id);
      await refreshAllStatus();
      setFeedback('Check-in timer cancelled.');
    } catch (err) {
      alert('Error cancelling check-in: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOverdue = activeCheckIn && (activeCheckIn.status === 'overdue' || remainingSecs <= 0);

  return (
    <div className="page-container" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Safety Check-In Timer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0.35rem auto 0' }}>
          Schedule an expected arrival time. Confirming "I'm Safe" prevents unnecessary worry and maintains proactive accountability.
        </p>
      </div>

      {feedback && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600 }}>
          {feedback}
        </div>
      )}

      {/* Active Check-In Display */}
      {activeCheckIn && (activeCheckIn.status === 'active' || isOverdue) ? (
        <div className="card" style={{ borderTop: `6px solid ${isOverdue ? 'var(--danger)' : 'var(--accent-pink)'}`, textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '2rem' }}>
          <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-pink'}`} style={{ marginBottom: '1rem' }}>
            {isOverdue ? 'Check-In Overdue' : 'Timer In Progress'}
          </span>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>{activeCheckIn.label}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Scheduled until {new Date(activeCheckIn.expectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>

          {/* Big Countdown Clock */}
          <div style={{ margin: '1.75rem 0' }}>
            <div
              style={{
                fontSize: '3.5rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: isOverdue ? 'var(--danger)' : 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1
              }}
            >
              {formatTime(remainingSecs)}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {isOverdue ? 'Timer expired. Please confirm your safety.' : 'Remaining until check-in is expected'}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
            <button
              className="btn btn-pink btn-lg btn-block"
              onClick={handleConfirmSafe}
              disabled={loading}
              style={{ fontWeight: 800 }}
            >
              <CheckCircle2 size={22} />
              I'm Safe! (Confirm Check-In)
            </button>

            <button
              className="btn btn-secondary btn-block"
              onClick={handleCancelCheckIn}
              disabled={loading}
            >
              <XCircle size={18} />
              Cancel Check-In
            </button>
          </div>

          {/* Honest Technical Limitation Note */}
          <div className="notice-box notice-box-warning" style={{ marginTop: '1.75rem', textAlign: 'left' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.78rem' }}>
              <strong>Transparency Notice:</strong> Web browsers rely on an active tab or awake device to deliver timers. An expired timer triggers a backend overdue flag, but web apps cannot guarantee emergency dispatch when a device is off or out of coverage.
            </p>
          </div>
        </div>
      ) : (
        /* Create Check-In Form */
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={22} color="var(--accent-pink)" />
            Set a Safety Check-In Timer
          </h2>

          <form onSubmit={handleStartCheckIn}>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[5, 15, 30, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`btn ${durationMinutes === m ? 'btn-pink' : 'btn-secondary'} btn-sm`}
                    onClick={() => setDurationMinutes(m)}
                  >
                    {m} mins
                  </button>
                ))}
              </div>
              <p className="form-hint">
                Expected check-in at: {new Date(Date.now() + durationMinutes * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Check-In Activity / Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Walking home from library / Auto ride to station"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location Notes (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Crossing beach road / Auto KA 19 8899"
                value={locationNotes}
                onChange={(e) => setLocationNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-pink btn-block btn-lg"
              disabled={loading}
              style={{ fontWeight: 800, marginTop: '1rem' }}
            >
              Start {durationMinutes}-Minute Check-In Timer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
