const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Helper to calculate status and remaining seconds
function evaluateCheckIn(checkin) {
  if (checkin.status === 'safe' || checkin.status === 'cancelled') {
    return { ...checkin, isExpired: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  const deadline = new Date(checkin.expectedTime).getTime();
  const remainingSeconds = Math.max(0, Math.floor((deadline - now) / 1000));
  const isExpired = remainingSeconds <= 0;

  return {
    ...checkin,
    isExpired,
    remainingSeconds,
    status: isExpired ? 'overdue' : checkin.status
  };
}

// GET /api/checkins/active - get current active check-in
router.get('/active', async (req, res) => {
  try {
    const db = getDatabase();
    const all = await db.checkins.find({ userId: req.user.id });
    const pending = all.filter(c => c.status === 'active' || c.status === 'overdue');
    const active = pending.length > 0 ? evaluateCheckIn(pending[pending.length - 1]) : null;

    res.json({
      success: true,
      hasActiveCheckIn: Boolean(active),
      checkin: active,
      limitationNotice: 'Web browser timers run actively when the tab or device is awake. If your device shuts down or the browser is cleared, automated background push alerts may be delayed without native OS services.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve active check-in.' });
  }
});

// GET /api/checkins/history - list past check-ins
router.get('/history', async (req, res) => {
  try {
    const db = getDatabase();
    const all = await db.checkins.find({ userId: req.user.id });
    res.json({
      success: true,
      checkins: all.map(evaluateCheckIn).reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve check-in history.' });
  }
});

// POST /api/checkins - start a new check-in timer
router.post('/', async (req, res) => {
  try {
    const { durationMinutes, label, locationNotes } = req.body;
    const db = getDatabase();

    const duration = Number(durationMinutes) || 15;
    if (duration < 1 || duration > 1440) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 1 minute and 24 hours.'
      });
    }

    // Cancel any older active check-in
    const existingActive = await db.checkins.find({ userId: req.user.id, status: 'active' });
    for (const item of existingActive) {
      await db.checkins.findByIdAndUpdate(item._id, { status: 'cancelled' });
    }

    const expectedTime = new Date(Date.now() + duration * 60 * 1000).toISOString();

    const checkin = await db.checkins.create({
      userId: req.user.id,
      label: label ? label.trim() : 'Safety Check-In',
      locationNotes: locationNotes ? locationNotes.trim() : '',
      durationMinutes: duration,
      expectedTime,
      status: 'active',
      confirmedSafeAt: null
    });

    res.status(201).json({
      success: true,
      message: `Check-in scheduled for ${duration} minutes.`,
      checkin: evaluateCheckIn(checkin)
    });
  } catch (err) {
    console.error('Create checkin error:', err);
    res.status(500).json({ success: false, error: 'Failed to create check-in.' });
  }
});

// PUT /api/checkins/:id/safe - confirm "I'm Safe"
router.put('/:id/safe', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = await db.checkins.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Check-in not found or unauthorized.' });
    }

    const updated = await db.checkins.findByIdAndUpdate(id, {
      status: 'safe',
      confirmedSafeAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Great to hear you are safe! Check-in confirmed.',
      checkin: evaluateCheckIn(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to confirm check-in.' });
  }
});

// PUT /api/checkins/:id/cancel - cancel check-in
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = await db.checkins.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Check-in not found or unauthorized.' });
    }

    const updated = await db.checkins.findByIdAndUpdate(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Safety check-in cancelled.',
      checkin: evaluateCheckIn(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to cancel check-in.' });
  }
});

module.exports = router;
