import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Phone, Mail, ShieldAlert, Check, X, Lock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { useSafety } from '../context/SafetyContext';
import { useToast } from '../context/ToastContext';

export default function Contacts() {
  const { contacts, refreshAllStatus } = useSafety();
  const toast = useToast();


  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'Family',
    email: '',
    isEmergencyContact: true,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      relationship: 'Family',
      email: '',
      isEmergencyContact: true,
      notes: ''
    });
    setIsAdding(false);
    setEditingId(null);
    setErrorMsg('');
  };

  const handleEdit = (c) => {
    setFormData({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship || 'Friend',
      email: c.email || '',
      isEmergencyContact: Boolean(c.isEmergencyContact),
      notes: c.notes || ''
    });
    setEditingId(c.id || c._id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter the contact name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (editingId) {
        await api.updateContact(editingId, formData);
        toast.success(`${formData.name} updated successfully.`);
      } else {
        await api.createContact(formData);
        toast.success(`${formData.name} added to your trusted contacts.`);
      }
      await refreshAllStatus();
      resetForm();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save contact.');
      toast.error(err.message || 'Failed to save contact.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your trusted contacts?`)) return;
    try {
      await api.deleteContact(id);
      await refreshAllStatus();
      toast.success(`${name} removed from contacts.`);
    } catch (err) {
      toast.error('Error deleting contact: ' + err.message);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Trusted Emergency Network</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            People notified when you broadcast an Emergency SOS alert or share a journey.
          </p>
        </div>

        {!isAdding && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { resetForm(); setIsAdding(true); }}
          >
            <Plus size={18} />
            Add Trusted Contact
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal / Drawer */}
      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem', borderTop: '5px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {editingId ? 'Edit Trusted Contact' : 'Add New Trusted Contact'}
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}><X size={18} /></button>
          </div>

          {errorMsg && (
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sunita Sharma / Ananya Rao"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number * (10 Digits)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select
                  className="form-select"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Friend/Roommate">Friend / Roommate</option>
                  <option value="Guardian/Warden">Guardian / Warden</option>
                  <option value="Partner">Partner</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="contact@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Private Notes (Hostel room number, vehicle details, etc.)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Stays 5 mins away; has spare flat key"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div style={{ background: '#FAF5FF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isEmergencyContact}
                  onChange={(e) => setFormData({ ...formData, isEmergencyContact: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                Include this contact in high-priority SOS emergency broadcasts
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Contact' : 'Save Contact'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Users size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No Trusted Contacts Yet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
            Add people you trust. In emergencies, SafeHer will prepare instant alerts with your live coordinates for them.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { resetForm(); setIsAdding(true); }}
          >
            <Plus size={18} />
            Add First Contact
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {contacts.map((c) => {
            const clean = (c.phone || '').replace(/[^0-9]/g, '');
            const indianPhone = clean.length === 10 ? `91${clean}` : clean;
            const waTestUrl = `https://wa.me/${indianPhone}?text=${encodeURIComponent(`Hi ${c.name}, I have listed you as a trusted safety contact on SafeHer.`)}`;

            return (
              <div key={c.id || c._id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={22} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{c.name}</h3>
                        <span className="badge badge-purple">{c.relationship}</span>
                        {c.isEmergencyContact && (
                          <span className="badge badge-danger">SOS Priority</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} />
                          {c.phone}
                        </span>
                        {c.email && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Mail size={14} />
                            {c.email}
                          </span>
                        )}
                      </div>

                      {c.notes && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                          Note: {c.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a
                      href={`tel:${c.phone}`}
                      className="btn btn-secondary btn-sm"
                      title="Direct Call"
                    >
                      <Phone size={14} />
                      Call
                    </a>

                    <a
                      href={waTestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      title="Test via WhatsApp"
                    >
                      WhatsApp
                      <ExternalLink size={12} />
                    </a>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleEdit(c)}
                      title="Edit Contact"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(c.id || c._id, c.name)}
                      style={{ color: 'var(--danger)' }}
                      title="Delete Contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Privacy Guarantee Card */}
      <div className="card" style={{ marginTop: '2.5rem', background: '#FAF5FF', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Lock size={24} color="var(--primary)" />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Contact Data Privacy Notice</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Your contacts' phone numbers and identities are strictly private. They are never indexed, shared with advertisers, or made public through any directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
