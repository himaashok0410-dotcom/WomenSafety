import React from 'react';
import { Shield, MapPin, Users, Clock, BookOpen, LogOut, LogIn, PhoneCall, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { activeAlert, activeJourney, activeCheckIn, setIsSOSModalOpen, setIs112ModalOpen } = useSafety();

  return (
    <>
      {/* Desktop & Top Sticky Header */}
      <header className="navbar">
        <div className="nav-inner">
          <div className="brand-link" onClick={() => setCurrentTab('home')}>
            <div className="brand-icon-wrap">
              <Shield size={22} strokeWidth={2.4} />
            </div>
            <div className="brand-text">
              <h1>SafeHer</h1>
              <p>recHERsion’26 • NITK</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <button
              className={`nav-link ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentTab('dashboard')}
            >
              <Radio size={18} />
              Dashboard
            </button>

            <button
              className={`nav-link ${currentTab === 'journey' ? 'active' : ''}`}
              onClick={() => setCurrentTab('journey')}
            >
              <MapPin size={18} />
              Safe Journey
              {activeJourney && <span className="badge badge-purple" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>Active</span>}
            </button>

            <button
              className={`nav-link ${currentTab === 'checkin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('checkin')}
            >
              <Clock size={18} />
              Check-In
              {activeCheckIn && <span className="badge badge-pink" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>Timed</span>}
            </button>

            <button
              className={`nav-link ${currentTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setCurrentTab('contacts')}
            >
              <Users size={18} />
              Contacts
            </button>

            <button
              className={`nav-link ${currentTab === 'resources' ? 'active' : ''}`}
              onClick={() => setCurrentTab('resources')}
            >
              <BookOpen size={18} />
              Resources & Helplines
            </button>

            {/* Quick 112 Call Shortcut */}
            <button
              className="btn btn-call btn-sm"
              onClick={() => setIs112ModalOpen(true)}
              title="National Emergency Number: 112"
            >
              <PhoneCall size={16} />
              Call 112
            </button>

            {/* SOS Quick Launch */}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setIsSOSModalOpen(true)}
              style={{ fontWeight: 800 }}
            >
              SOS Alert
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={logout}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentTab('login')}
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <Radio size={20} />
          <span>Home</span>
        </button>

        <button
          className={`mobile-nav-item ${currentTab === 'journey' ? 'active' : ''}`}
          onClick={() => setCurrentTab('journey')}
        >
          <MapPin size={20} />
          <span>Journey</span>
        </button>

        {/* Center Floating SOS Button */}
        <button
          className="mobile-sos-center"
          onClick={() => setIsSOSModalOpen(true)}
          title="Emergency SOS"
          aria-label="Emergency SOS"
        >
          <span style={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.04em' }}>SOS</span>
        </button>

        <button
          className={`mobile-nav-item ${currentTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setCurrentTab('checkin')}
        >
          <Clock size={20} />
          <span>Check-In</span>
        </button>

        <button
          className={`mobile-nav-item ${currentTab === 'resources' ? 'active' : ''}`}
          onClick={() => setCurrentTab('resources')}
        >
          <BookOpen size={20} />
          <span>Help 112</span>
        </button>
      </nav>
    </>
  );
}
