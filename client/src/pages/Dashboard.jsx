import React from 'react';
import { Radio, AlertOctagon, PhoneCall, MapPin, Clock, Users, ShieldCheck, ArrowRight, Phone, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import SOSButton from '../components/SOSButton';

export default function Dashboard({ setCurrentTab }) {
  const { user } = useAuth();
  const {
    activeAlert,
    activeJourney,
    activeCheckIn,
    contacts,
    cancelSOS,
    setIsSOSModalOpen,
    setIs112ModalOpen,
    setIsFakeCallOpen
  } = useSafety();

  return (
    <div className="page-container">
      {/* Active Distress SOS Banner */}
      {activeAlert && (
        <div className="active-sos-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertOctagon size={28} />
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.05rem' }}>EMERGENCY SOS ALERT ACTIVE</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Your contacts were alerted. Status is broadcasting.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsSOSModalOpen(true)}
              style={{ fontWeight: 700 }}
            >
              View Dispatch
            </button>
            <button
              className="btn btn-sm"
              onClick={() => cancelSOS('User confirmed safe')}
              style={{ background: 'white', color: 'var(--danger)', fontWeight: 800 }}
            >
              Cancel Alert (I'm Safe)
            </button>
          </div>
        </div>
      )}

      {/* Hero SOS Hold Activation Section */}
      <div className="sos-hero-card">
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Emergency Assistance Center</h2>
        <p style={{ fontSize: '0.86rem', opacity: 0.9, maxWidth: '520px', margin: '0.4rem auto 0' }}>
          Hold the SOS button for 2.5 seconds to broadcast your distress alert and GPS coordinates to your trusted contacts.
        </p>

        <SOSButton
          onActivate={() => setIsSOSModalOpen(true)}
          disabled={Boolean(activeAlert)}
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-call btn-sm"
            onClick={() => setIs112ModalOpen(true)}
          >
            <PhoneCall size={16} />
            Direct 112 (Indian Police)
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsSOSModalOpen(true)}
            style={{ color: 'var(--danger)', fontWeight: 700 }}
          >
            {activeAlert ? 'Review Active SOS' : 'Quick Open SOS Dialog'}
          </button>
        </div>
      </div>

      {/* Quick Access Action Grid */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem' }}>Rapid Safety Tools</h3>
        <div className="quick-action-grid">
          <div className="quick-action-btn" onClick={() => setCurrentTab('journey')}>
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #7C3AED, #9333EA)' }}>
              <MapPin size={22} />
            </div>
            <span className="quick-action-label">Safe Journey</span>
            <span className="quick-action-sub">{activeJourney ? 'Active Trip' : 'Share live trip'}</span>
          </div>

          <div className="quick-action-btn" onClick={() => setCurrentTab('checkin')}>
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #EC4899, #DB2777)' }}>
              <Clock size={22} />
            </div>
            <span className="quick-action-label">Safety Check-In</span>
            <span className="quick-action-sub">{activeCheckIn ? 'Timer running' : 'Set timer'}</span>
          </div>

          <div className="quick-action-btn" onClick={() => setIsFakeCallOpen(true)}>
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
              <Phone size={22} />
            </div>
            <span className="quick-action-label">Fake Call</span>
            <span className="quick-action-sub">Discreet escape</span>
          </div>

          <div className="quick-action-btn" onClick={() => setIs112ModalOpen(true)}>
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #E11D48, #BE123C)' }}>
              <PhoneCall size={22} />
            </div>
            <span className="quick-action-label">Dial 112</span>
            <span className="quick-action-sub">All-in-one helpline</span>
          </div>
        </div>
      </div>

      {/* Status Columns: Active Journey & Active Check-In */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Active Journey Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MapPin size={20} color="var(--primary)" />
              Safe Journey Status
            </h3>
            {activeJourney ? (
              <span className="badge badge-purple">In Transit</span>
            ) : (
              <span className="badge badge-success">Idle</span>
            )}
          </div>

          {activeJourney ? (
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Destination</p>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>{activeJourney.destination}</p>
              
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Estimated Arrival</p>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1.25rem' }}>
                {new Date(activeJourney.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary btn-sm btn-block"
                  onClick={() => setCurrentTab('journey')}
                >
                  Manage Live Journey
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Starting a commute or cab ride? Share your live route and estimated arrival time with trusted family using a revocable share link.
              </p>
              <button
                className="btn btn-secondary btn-sm btn-block"
                onClick={() => setCurrentTab('journey')}
              >
                Start New Journey
              </button>
            </div>
          )}
        </div>

        {/* Active Check-In Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={20} color="var(--accent-pink)" />
              Safety Check-In
            </h3>
            {activeCheckIn ? (
              <span className={`badge ${activeCheckIn.status === 'overdue' ? 'badge-danger' : 'badge-pink'}`}>
                {activeCheckIn.status === 'overdue' ? 'Overdue' : 'Active Timer'}
              </span>
            ) : (
              <span className="badge badge-success">Ready</span>
            )}
          </div>

          {activeCheckIn ? (
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Current Label</p>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>{activeCheckIn.label}</p>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Expected Time</p>
              <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-pink)', marginBottom: '1.25rem' }}>
                {new Date(activeCheckIn.expectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              <button
                className="btn btn-pink btn-sm btn-block"
                onClick={() => setCurrentTab('checkin')}
              >
                Confirm "I'm Safe"
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Walking across campus at night or taking an isolated road? Set a proactive 15 or 30-minute timer that requests your confirmation.
              </p>
              <button
                className="btn btn-secondary btn-sm btn-block"
                onClick={() => setCurrentTab('checkin')}
              >
                Start Check-In Timer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trusted Contacts Preview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={20} color="var(--primary)" />
            Emergency Contacts Network ({contacts.length})
          </h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentTab('contacts')}
          >
            Manage Contacts
            <ArrowRight size={16} />
          </button>
        </div>

        {contacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No emergency contacts added yet. Add family or close friends so they receive your SOS distress broadcasts.
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setCurrentTab('contacts')}
            >
              Add First Contact
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {contacts.map((c) => (
              <div
                key={c.id || c._id}
                style={{
                  background: '#FAF5FF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.phone} • {c.relationship}</p>
                </div>
                {c.isEmergencyContact && (
                  <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>SOS Recipient</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
