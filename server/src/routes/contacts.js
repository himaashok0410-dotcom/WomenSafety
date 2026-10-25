const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Validation helper for Indian & international phone numbers
function isValidPhoneNumber(phone) {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

// All contact routes require authentication
router.use(authenticateToken);

// GET /api/contacts - list logged in user's contacts
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const contacts = await db.contacts.find({ userId: req.user.id });
    res.json({
      success: true,
      count: contacts.length,
      contacts: contacts.map(c => ({
        id: c._id,
        name: c.name,
        phone: c.phone,
        relationship: c.relationship || 'Contact',
        email: c.email || '',
        isEmergencyContact: Boolean(c.isEmergencyContact),
        notes: c.notes || '',
        createdAt: c.createdAt
      }))
    });
  } catch (err) {
    console.error('Fetch contacts error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve contacts.' });
  }
});

// POST /api/contacts - add new trusted contact
router.post('/', async (req, res) => {
  try {
    const { name, phone, relationship, email, isEmergencyContact, notes } = req.body;
    const db = getDatabase();

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Contact name is required.' });
    }

    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.'
      });
    }

    const contact = await db.contacts.create({
      userId: req.user.id,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship ? relationship.trim() : 'Friend/Family',
      email: email ? email.trim() : '',
      isEmergencyContact: isEmergencyContact !== undefined ? Boolean(isEmergencyContact) : true,
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Trusted contact added successfully.',
      contact: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        email: contact.email,
        isEmergencyContact: contact.isEmergencyContact,
        notes: contact.notes
      }
    });
  } catch (err) {
    console.error('Create contact error:', err);
    res.status(500).json({ success: false, error: 'Failed to create contact.' });
  }
});

// PUT /api/contacts/:id - update contact
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, relationship, email, isEmergencyContact, notes } = req.body;
    const db = getDatabase();

    const existing = await db.contacts.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Contact not found or unauthorized.' });
    }

    if (phone && !isValidPhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit mobile number.'
      });
    }

    const updated = await db.contacts.findByIdAndUpdate(id, {
      ...(name && { name: name.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(relationship && { relationship: relationship.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(isEmergencyContact !== undefined && { isEmergencyContact: Boolean(isEmergencyContact) }),
      ...(notes !== undefined && { notes: notes.trim() })
    });

    res.json({
      success: true,
      message: 'Contact updated successfully.',
      contact: {
        id: updated._id,
        name: updated.name,
        phone: updated.phone,
        relationship: updated.relationship,
        email: updated.email,
        isEmergencyContact: updated.isEmergencyContact,
        notes: updated.notes
      }
    });
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({ success: false, error: 'Failed to update contact.' });
  }
});

// DELETE /api/contacts/:id - delete contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = await db.contacts.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Contact not found or unauthorized.' });
    }

    await db.contacts.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Trusted contact deleted successfully.'
    });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete contact.' });
  }
});

module.exports = router;
