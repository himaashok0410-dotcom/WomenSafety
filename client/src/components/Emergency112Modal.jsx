import React from 'react';
import { PhoneCall, X, Shield, MapPin, Radio, AlertCircle } from 'lucide-react';

export default function Emergency112Modal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ borderTop: '6px solid #059669' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#D1FAE5', color: '#059669', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46' }}>
                National Emergency: 112
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                India All-in-One Emergency Response Support System (ERSS)
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong>112</strong> is the unified, single emergency number operational across all States and Union Territories in India, connecting directly to Police, Fire, and Ambulance dispatchers.
          </p>
        </div>

        {/* Dispatcher Checklist */}
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
            Key details to state to the 112 operator:
          </p>
          <ul style={{ fontSize: '0.8rem', color: '#15803D', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
            <li>Your exact current location, street name, or closest prominent landmark.</li>
            <li>Vehicle registration number and cab model (if commuting).</li>
            <li>Nature of the situation and immediate physical threat level.</li>
            <li>Request a woman police officer assistance unit if needed.</li>
          </ul>
        </div>

        {/* Direct Call Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a
            href="tel:112"
            className="btn btn-call btn-lg btn-block"
            style={{ textDecoration: 'none', fontWeight: 800 }}
          >
            <PhoneCall size={22} />
            Call 112 Directly Now
          </a>

          <button className="btn btn-secondary btn-block" onClick={onClose}>
            Back to Application
          </button>
        </div>
      </div>
    </div>
  );
}
