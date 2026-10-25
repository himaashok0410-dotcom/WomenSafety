import React, { useState, useEffect } from 'react';
import { AlertOctagon, X, PhoneCall, MapPin, Send, CheckCircle2, ShieldAlert, ExternalLink } from 'lucide-react';
import { useSafety } from '../context/SafetyContext';
import { getCurrentCoordinates } from '../services/geolocation';

export default function SOSModal({ isOpen, onClose }) {
  const { contacts, triggerSOS, activeAlert, cancelSOS } = useSafety();

  const [step, setStep] = useState('countdown'); // 'countdown', 'dispatching', 'dispatched'
  const [countdown, setCountdown] = useState(5);
  const [customMsg, setCustomMsg] = useState('');
  const [location, setLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('requesting'); // 'requesting', 'acquired', 'failed'
  const [dispatchResult, setDispatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Acquire location on open
  useEffect(() => {
    if (isOpen) {
      if (activeAlert) {
        setStep('dispatched');
        setDispatchResult(activeAlert.dispatchDetails || null);
        return;
      }

      setStep('countdown');
      setCountdown(5);
      setLocStatus('requesting');

      getCurrentCoordinates()
        .then((coords) => {
          setLocation(coords);
          setLocStatus('acquired');
        })
        .catch((err) => {
          console.warn('Geolocation acquisition error:', err.message);
          setLocStatus('failed');
        });
    }
  }, [isOpen, activeAlert]);

  // Countdown timer for accidental trigger safeguard
  useEffect(() => {
    let timer;
    if (isOpen && step === 'countdown' && !activeAlert) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            executeDispatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, step, location, customMsg, activeAlert]);

  const executeDispatch = async () => {
    setStep('dispatching');
    setLoading(true);
    try {
      const res = await triggerSOS({
        customMessage: customMsg,
        location: location
      });
      setDispatchResult(res.dispatch);
      setStep('dispatched');
    } catch (err) {
      alert('Error triggering alert: ' + err.message);
      setStep('countdown');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (activeAlert) {
      await cancelSOS('User cancelled distress alert');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ borderTop: '6px solid var(--danger)' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <AlertOctagon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)' }}>
                {step === 'countdown' ? 'Emergency Distress Countdown' : 'SOS Distress Broadcast'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {step === 'dispatched' ? 'Alert Active & Dispatched' : 'Safeguard Activated'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleCancel} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Safeguard Countdown */}
        {step === 'countdown' && (
          <div>
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  margin: '0 auto 1rem',
                  border: '3px solid var(--danger)'
                }}
              >
                {countdown}
              </div>
              <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                Broadcasting emergency alert in {countdown}s...
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Accidental trigger? Tap the cancel button below immediately.
              </p>
            </div>

            {/* GPS Location Status */}
            <div className="notice-box" style={{ marginBottom: '1rem' }}>
              <MapPin size={18} style={{ color: locStatus === 'acquired' ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem' }}>
                {locStatus === 'acquired' && (
                  <span>
                    <strong>GPS Coordinates Acquired:</strong> {location.lat}, {location.lng} (Accuracy: ~{location.accuracy}m)
                  </span>
                )}
                {locStatus === 'requesting' && <span>Detecting your high-accuracy GPS coordinates...</span>}
                {locStatus === 'failed' && (
                  <span style={{ color: 'var(--danger)' }}>
                    Location unavailable (permission denied or timeout). Alert will dispatch without GPS map link.
                  </span>
                )}
              </div>
            </div>

            {/* Target Contacts Preview */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">
                Recipient Emergency Contacts ({contacts.filter(c => c.isEmergencyContact).length || contacts.length})
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {contacts.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No trusted contacts added yet. We recommend dialing 112 directly.
                  </p>
                ) : (
                  contacts.map(c => (
                    <span key={c.id || c._id} className="badge badge-purple">
                      {c.name} ({c.phone})
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary btn-block"
                onClick={handleCancel}
                style={{ fontWeight: 700 }}
              >
                Cancel (False Alarm)
              </button>
              <button
                className="btn btn-danger btn-block"
                onClick={executeDispatch}
                disabled={loading}
                style={{ fontWeight: 800 }}
              >
                Send SOS Now
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Dispatching */}
        {step === 'dispatching' && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div className="sos-pulse-ring" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', position: 'relative' }}></div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Broadcasting SOS Alert...</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Packaging coordinates and notifying your trusted network.
            </p>
          </div>
        )}

        {/* STEP 3: Dispatched & Live Active Distress */}
        {step === 'dispatched' && (
          <div>
            <div style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)' }}>
                  Emergency Alert Dispatched
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Your trusted emergency contacts have been notified with your current coordinates.
                </p>
              </div>
            </div>

            {/* National 112 Call Banner */}
            <div style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9F1239' }}>
                Are you in immediate physical danger?
              </p>
              <p style={{ fontSize: '0.78rem', color: '#BE123C', margin: '0.25rem 0 0.75rem' }}>
                Pressing SOS does not automatically dispatch police. Call national emergency 112 directly.
              </p>
              <a
                href="tel:112"
                className="btn btn-call btn-block"
                style={{ textDecoration: 'none' }}
              >
                <PhoneCall size={18} />
                Direct Dial 112 (Indian Police)
              </a>
            </div>

            {/* Interactive WhatsApp Links for Real Immediate Manual Send */}
            {dispatchResult && dispatchResult.dispatches && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  Direct One-Click WhatsApp Dispatch ({dispatchResult.mode === 'demo' ? 'Interactive Demo' : 'Live'})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dispatchResult.dispatches.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        background: '#FAF5FF',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{d.contactName}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.phone} • {d.mode || 'Dispatched'}</p>
                      </div>
                      <a
                        href={d.manualWhatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.75rem', gap: '0.35rem' }}
                      >
                        Send via WhatsApp
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel Active Alert Button */}
            <button
              className="btn btn-secondary btn-block"
              onClick={handleCancel}
              style={{ fontWeight: 700, color: 'var(--success)' }}
            >
              I Am Safe Now (Cancel SOS Alert)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
