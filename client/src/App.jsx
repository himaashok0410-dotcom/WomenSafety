import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SafetyProvider, useSafety } from './context/SafetyContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import SOSModal from './components/SOSModal';
import Emergency112Modal from './components/Emergency112Modal';
import FakeCallModal from './components/FakeCallModal';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SafeJourney from './pages/SafeJourney';
import SharedJourneyView from './pages/SharedJourneyView';
import SafetyCheckIn from './pages/SafetyCheckIn';
import Contacts from './pages/Contacts';
import Resources from './pages/Resources';
import Login from './pages/Login';
import Register from './pages/Register';

function MainApp() {
  const { isAuthenticated, loading } = useAuth();
  const { isSOSModalOpen, setIsSOSModalOpen, is112ModalOpen, setIs112ModalOpen, isFakeCallOpen, setIsFakeCallOpen } = useSafety();

  const [currentTab, setCurrentTab] = useState('home');
  const [sharedToken, setSharedToken] = useState(null);

  // Check URL hash for shared journey tokens (e.g. #shared/TOKEN or ?token=TOKEN)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#shared/')) {
        const token = hash.replace('#shared/', '').trim();
        setSharedToken(token);
      } else {
        setSharedToken(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // When user signs in, automatically direct them to Dashboard if on Home/Login/Register
  useEffect(() => {
    if (isAuthenticated && (currentTab === 'login' || currentTab === 'register' || currentTab === 'home')) {
      setCurrentTab('dashboard');
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="sos-pulse-ring" style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem', position: 'relative' }}></div>
          <p style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1.1rem' }}>SafeHer</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading security modules...</p>
        </div>
      </div>
    );
  }

  // If a shared token is active, show the public shared viewer
  if (sharedToken) {
    return (
      <div className="app-container">
        <SharedJourneyView
          token={sharedToken}
          onBackHome={() => {
            window.location.hash = '';
            setSharedToken(null);
            setCurrentTab('home');
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="main-content">
        {currentTab === 'home' && <Home setCurrentTab={setCurrentTab} />}
        {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}
        {currentTab === 'journey' && <SafeJourney />}
        {currentTab === 'checkin' && <SafetyCheckIn />}
        {currentTab === 'contacts' && <Contacts />}
        {currentTab === 'resources' && <Resources />}
        {currentTab === 'login' && <Login setCurrentTab={setCurrentTab} />}
        {currentTab === 'register' && <Register setCurrentTab={setCurrentTab} />}
      </main>

      {/* Global Interactive Modals */}
      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
      />

      <Emergency112Modal
        isOpen={is112ModalOpen}
        onClose={() => setIs112ModalOpen(false)}
      />

      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SafetyProvider>
          <MainApp />
        </SafetyProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
