import React, { useState, useEffect } from 'react';
import { PhoneCall, Shield, BookOpen, CheckSquare, ExternalLink, Scale, MessageSquare, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function Resources({ onOpenFakeCall }) {
  const [helplines, setHelplines] = useState([]);
  const [guides, setGuides] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [activeTab, setActiveTab] = useState('helplines'); // 'helplines', 'guides', 'checklist'

  useEffect(() => {
    async function loadData() {
      try {
        const [hRes, gRes, cRes] = await Promise.all([
          api.getHelplines(),
          api.getGuidance(),
          api.getChecklist()
        ]);
        if (hRes.success) setHelplines(hRes.helplines);
        if (gRes.success) setGuides(gRes.guides);
        if (cRes.success) setChecklist(cRes.checklist);
      } catch (err) {
        console.warn('Failed to load resources dynamically, using defaults:', err.message);
      }
    }
    loadData();
  }, []);

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Safety Resource Centre & Helplines</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '580px', margin: '0.4rem auto 0' }}>
          Verified emergency contacts across India, legal rights education (Zero FIR), evidence preservation guidance, and situational readiness checklists.
        </p>
      </div>

      {/* Resource Category Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'helplines' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('helplines')}
        >
          <PhoneCall size={16} />
          Emergency Helplines (India)
        </button>

        <button
          className={`btn ${activeTab === 'guides' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('guides')}
        >
          <Scale size={16} />
          Legal Rights & Evidence Guide
        </button>

        <button
          className={`btn ${activeTab === 'checklist' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('checklist')}
        >
          <CheckSquare size={16} />
          Readiness Checklist
        </button>
      </div>

      {/* TAB 1: Helplines */}
      {activeTab === 'helplines' && (
        <div>
          {/* Primary 112 Banner */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #065F46, #047857)', color: 'white', marginBottom: '2rem', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: '0.4rem' }}>
                  National Priority
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>112 — National Emergency Response</h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.95, maxWidth: '520px', marginTop: '0.25rem' }}>
                  Unified all-in-one 24/7 service integrating Police, Medical Ambulance, and Fire response across all Indian States & UTs.
                </p>
              </div>

              <a
                href="tel:112"
                className="btn btn-lg"
                style={{ background: 'white', color: '#065F46', fontWeight: 800, textDecoration: 'none' }}
              >
                <PhoneCall size={20} />
                Call 112 Now
              </a>
            </div>
          </div>

          {/* Helpline Directory Grid */}
          <div className="grid-2">
            {helplines.map((h) => (
              <div key={h.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-purple">{h.badge || 'Helpline'}</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary-dark)' }}>
                      {h.number}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>{h.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {h.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <a
                    href={h.telUrl}
                    className="btn btn-secondary btn-sm btn-block"
                    style={{ textDecoration: 'none' }}
                  >
                    <PhoneCall size={14} />
                    Call {h.number}
                  </a>

                  {h.whatsappUrl && (
                    <a
                      href={h.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm btn-block"
                      style={{ textDecoration: 'none' }}
                    >
                      WhatsApp
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Legal Rights & Evidence Guide */}
      {activeTab === 'guides' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {guides.map((g) => (
            <div key={g.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
                  <Scale size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{g.title}</h3>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {g.summary}
              </p>

              <div style={{ background: '#FAF5FF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {g.steps.map((step, idx) => (
                    <li key={idx} style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Readiness Checklist */}
      {activeTab === 'checklist' && (
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Personal Safety Checklist</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Check off key preparations before traveling late at night or navigating unfamiliar corridors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {checklist.map((item) => (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  background: checkedItems[item.id] ? '#F0FDF4' : '#FAF5FF',
                  border: `1px solid ${checkedItems[item.id] ? '#BBF7D0' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(checkedItems[item.id])}
                  onChange={() => toggleCheck(item.id)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--success)', marginTop: '2px' }}
                />
                <span
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: checkedItems[item.id] ? '#15803D' : 'var(--text-main)',
                    textDecoration: checkedItems[item.id] ? 'line-through' : 'none'
                  }}
                >
                  {item.task}
                </span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCheckedItems({})}
            >
              Reset Checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
