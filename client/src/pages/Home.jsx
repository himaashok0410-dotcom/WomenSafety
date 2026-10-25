import React from 'react';
import { Shield, MapPin, Clock, PhoneCall, Radio, CheckCircle, ArrowRight, HeartHandshake, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';

export default function Home({ setCurrentTab }) {
  const { isAuthenticated, demoLogin } = useAuth();
  const { setIsSOSModalOpen, setIs112ModalOpen, setIsFakeCallOpen } = useSafety();

  const handleJudgeDemo = async () => {
    await demoLogin();
    setCurrentTab('dashboard');
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '2.5rem 1rem 3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-light)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '1.25rem' }}>
          <Shield size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
            recHERsion’26 • ACM-W NITK Surathkal
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
          Your Journey. Your Choice.{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent-pink))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your Safety.
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          SafeHer empowers women with immediate emergency assistance, private live-journey tracking with revocable share links, proactive safety check-ins, and verified India helpline access.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {isAuthenticated ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setCurrentTab('dashboard')}
            >
              Open Safety Dashboard
              <ArrowRight size={20} />
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleJudgeDemo}
              >
                Launch Demo as Priya (Judge 1-Click)
                <ArrowRight size={20} />
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => setCurrentTab('login')}
              >
                Sign In / Register
              </button>
            </>
          )}

          <button
            className="btn btn-call btn-lg"
            onClick={() => setIs112ModalOpen(true)}
          >
            <PhoneCall size={20} />
            Direct 112 Emergency
          </button>
        </div>

        {/* Fast Action Shortcuts */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setIsSOSModalOpen(true)}
            style={{ fontWeight: 800 }}
          >
            Emergency SOS
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsFakeCallOpen(true)}
          >
            Fake Call Simulator
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentTab('resources')}
          >
            India Helplines & Legal Rights
          </button>
        </div>
      </section>

      {/* Core Safety Pillars */}
      <section style={{ margin: '3rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Engineered for Real-World Safety</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Practical tools built with strict privacy and honest device transparency</p>
        </div>

        <div className="grid-3">
          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Radio size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Hold-to-Activate SOS</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              A 2.5-second hold interaction and 5-second countdown prevent accidental pocket alerts while broadcasting your exact GPS coordinates and custom message to emergency contacts.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <MapPin size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Safe Journey & Revocable Sharing</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Share your live travel route and ETA with family via unguessable, encrypted tokens. You maintain 100% control to revoke access immediately upon arrival.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-pink-light)', color: 'var(--accent-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Clock size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Proactive Safety Check-In</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Set a timer before walking through unfamiliar corridors or cab rides. A single tap confirms "I'm Safe", with status sync and transparent timer safeguards.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Legal Rights Banner */}
      <section style={{ margin: '3rem 0' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #FAF5FF, #FDF2F8)', border: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Lock size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Zero Tracking When Inactive • Protected Privacy</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                SafeHer never monetizes location data or tracks users in background without consent. All emergency contacts are stored securely and never exposed through public search.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentTab('resources')}
            >
              Learn Your Legal Rights
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
