import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2, X, UserCheck } from 'lucide-react';

export default function FakeCallModal({ isOpen, onClose }) {
  const [callerName, setCallerName] = useState('Dad (Home)');
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [state, setState] = useState('setup'); // 'setup', 'waiting', 'ringing', 'connected'
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (state === 'waiting') {
      timer = setTimeout(() => {
        setState('ringing');
        if (navigator.vibrate) {
          navigator.vibrate([400, 300, 400, 300, 400]);
        }
      }, delaySeconds * 1000);
    }
    return () => clearTimeout(timer);
  }, [state, delaySeconds]);

  // Call timer when connected
  useEffect(() => {
    let interval;
    if (state === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state]);

  const handleStartFakeCall = () => {
    setState('waiting');
  };

  const handleAnswer = () => {
    setState('connected');
    setCallDuration(0);
  };

  const handleHangup = () => {
    setState('setup');
    setCallDuration(0);
    onClose();
  };

  const formatCallTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ background: state === 'ringing' || state === 'connected' ? '#09090b' : 'rgba(15, 23, 42, 0.7)' }}>
      {state === 'setup' && (
        <div className="modal-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                <Phone size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Fake Incoming Call</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Discreet Escape Strategy</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={20} /></button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Simulate a realistic incoming phone call on your device to create an excuse to walk away from uncomfortable or suspicious situations.
          </p>

          <div className="form-group">
            <label className="form-label">Caller Identity</label>
            <select
              className="form-select"
              value={callerName}
              onChange={(e) => setCallerName(e.target.value)}
            >
              <option value="Dad (Home)">Dad (Home)</option>
              <option value="Mom">Mom</option>
              <option value="Inspector Rao (Police)">Inspector Rao (Police)</option>
              <option value="Brother">Brother</option>
              <option value="Hostel Warden">Hostel Warden</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Trigger Delay</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[3, 10, 30].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn ${delaySeconds === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  onClick={() => setDelaySeconds(s)}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={handleStartFakeCall} style={{ marginTop: '1rem' }}>
            Arm Fake Call ({delaySeconds}s delay)
          </button>
        </div>
      )}

      {state === 'waiting' && (
        <div className="modal-content" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div className="sos-pulse-ring" style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem', position: 'relative' }}></div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Arming Simulation...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Keep your phone screen visible. Call from <strong>{callerName}</strong> will ring in {delaySeconds} seconds.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={handleHangup} style={{ marginTop: '1.5rem' }}>
            Cancel
          </button>
        </div>
      )}

      {/* Realistic Ringing Screen */}
      {state === 'ringing' && (
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center', color: 'white', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Incoming Call
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.75rem' }}>{callerName}</div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Mobile • +91 98765 00000</div>

          <div style={{ margin: '4rem 0 3rem' }}>
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                border: '2px solid rgba(255,255,255,0.3)',
                animation: 'pulseRing 1.5s infinite'
              }}
            >
              <UserCheck size={48} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {/* Decline */}
            <button
              onClick={handleHangup}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#e11d48',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(225,29,72,0.5)'
              }}
              title="Decline"
            >
              <PhoneOff size={28} />
            </button>

            {/* Answer */}
            <button
              onClick={handleAnswer}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#10b981',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(16,185,129,0.5)'
              }}
              title="Answer"
            >
              <Phone size={28} />
            </button>
          </div>
        </div>
      )}

      {/* Realistic Connected Call Screen */}
      {state === 'connected' && (
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center', color: 'white', padding: '2rem 1rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{callerName}</div>
          <div style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 600, marginTop: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {formatCallTime(callDuration)}
          </div>

          <div style={{ margin: '3.5rem 0 3rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                <Mic size={22} color="white" />
              </div>
              <span style={{ fontSize: '0.75rem' }}>Mute</span>
            </div>
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                <Volume2 size={22} color="white" />
              </div>
              <span style={{ fontSize: '0.75rem' }}>Speaker</span>
            </div>
          </div>

          <button
            onClick={handleHangup}
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#e11d48',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              margin: '0 auto',
              boxShadow: '0 4px 15px rgba(225,29,72,0.5)'
            }}
            title="End Call"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
