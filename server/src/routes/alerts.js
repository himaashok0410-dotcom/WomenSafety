const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { dispatchEmergencyAlert } = require('../services/notificationService');

router.use(authenticateToken);

// GET /api/alerts/active - check if user currently has an active SOS alert
router.get('/active', async (req, res) => {
  try {
    const db = getDatabase();
    const alerts = await db.alerts.find({ userId: req.user.id, status: 'active' });
    const active = alerts.length > 0 ? alerts[alerts.length - 1] : null;

    res.json({
      success: true,
      hasActiveAlert: Boolean(active),
      alert: active
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to check active alert status.' });
  }
});

// GET /api/alerts/history - get alert log
router.get('/history', async (req, res) => {
  try {
    const db = getDatabase();
    const alerts = await db.alerts.find({ userId: req.user.id });
    res.json({
      success: true,
      count: alerts.length,
      alerts: alerts.reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve alert history.' });
  }
});

// POST /api/alerts/trigger - Trigger Emergency SOS Alert
router.post('/trigger', async (req, res) => {
  try {
    const { location, customMessage, targetContactIds } = req.body;
    const db = getDatabase();

    // Check for recent alert within last 15 seconds to prevent accidental double-tap duplicates
    const existingActive = await db.alerts.find({ userId: req.user.id, status: 'active' });
    if (existingActive.length > 0) {
      const mostRecent = existingActive[existingActive.length - 1];
      const secondsAgo = (Date.now() - new Date(mostRecent.createdAt).getTime()) / 1000;
      if (secondsAgo < 15) {
        return res.status(200).json({
          success: true,
          isDuplicateSafeguard: true,
          message: 'An active SOS alert was already triggered a few seconds ago. Your existing alert is broadcasted.',
          alert: mostRecent
        });
      }
    }

    // Fetch user contacts
    const allContacts = await db.contacts.find({ userId: req.user.id });
    let recipientContacts = allContacts.filter(c => c.isEmergencyContact);

    // If specific contacts were selected, filter to those
    if (Array.isArray(targetContactIds) && targetContactIds.length > 0) {
      recipientContacts = allContacts.filter(c => targetContactIds.includes(c._id || c.id));
    }

    // If no emergency contacts exist, use all available contacts or warn
    if (recipientContacts.length === 0 && allContacts.length > 0) {
      recipientContacts = allContacts;
    }

    // Create the alert record
    const alertRecord = await db.alerts.create({
      userId: req.user.id,
      userName: req.user.name,
      userPhone: req.user.phone || '',
      status: 'active',
      location: location ? {
        lat: Number(location.lat),
        lng: Number(location.lng),
        accuracy: location.accuracy ? Number(location.accuracy) : null,
        address: location.address || null,
        timestamp: new Date().toISOString()
      } : null,
      customMessage: customMessage ? customMessage.trim() : '',
      dispatchedContactsCount: recipientContacts.length,
      cancelledAt: null,
      cancellationReason: null
    });

    // Dispatch via notification service
    const dispatchResult = await dispatchEmergencyAlert({
      alertId: alertRecord._id,
      user: req.user,
      contacts: recipientContacts,
      location: alertRecord.location,
      customMessage: alertRecord.customMessage
    });

    // Update alert record with dispatch details
    const updatedAlert = await db.alerts.findByIdAndUpdate(alertRecord._id, {
      dispatchDetails: dispatchResult
    });

    res.status(201).json({
      success: true,
      message: recipientContacts.length > 0
        ? `SOS Alert activated! Notifying ${recipientContacts.length} trusted contact(s).`
        : 'SOS Alert activated! Note: No trusted contacts were found. Please dial 112 immediately.',
      alert: updatedAlert,
      dispatch: dispatchResult,
      nationalEmergencyNumber: '112',
      emergencyAdvice: 'If you are in immediate physical danger, dial 112 directly for Indian Police & Emergency response.'
    });
  } catch (err) {
    console.error('SOS trigger error:', err);
    res.status(500).json({ success: false, error: 'Failed to broadcast emergency alert.' });
  }
});

// PUT /api/alerts/:id/cancel - Cancel active emergency alert
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const db = getDatabase();

    const existing = await db.alerts.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Alert not found or unauthorized.' });
    }

    const updated = await db.alerts.findByIdAndUpdate(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason ? reason.trim() : 'User confirmed safe / False alarm'
    });

    res.json({
      success: true,
      message: 'Emergency SOS alert cancelled. Your status has been cleared.',
      alert: updated
    });
  } catch (err) {
    console.error('SOS cancel error:', err);
    res.status(500).json({ success: false, error: 'Failed to cancel emergency alert.' });
  }
});

module.exports = router;
