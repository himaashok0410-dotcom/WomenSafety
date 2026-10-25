const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDatabase } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// PUBLIC ROUTE: GET /api/journeys/shared/:token
// Used by trusted contacts to view the live journey without logging in
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || token.length < 16) {
      return res.status(400).json({ success: false, error: 'Invalid share link format.' });
    }

    const db = getDatabase();
    const journey = await db.journeys.findOne({ shareToken: token });

    if (!journey) {
      return res.status(404).json({
        success: false,
        error: 'Journey tracking link not found, expired, or invalid.'
      });
    }

    if (journey.isRevoked) {
      return res.status(410).json({
        success: false,
        error: 'This live tracking link has been revoked by the traveler for privacy or safety reasons.'
      });
    }

    // Sanitize output - never expose private traveler email, password, or contact lists
    res.json({
      success: true,
      journey: {
        id: journey._id,
        travelerName: journey.travelerName || 'SafeHer User',
        startLocation: journey.startLocation,
        destination: journey.destination,
        status: journey.status, // 'active', 'completed', 'expired', 'cancelled'
        startedAt: journey.createdAt,
        estimatedArrivalTime: journey.estimatedArrivalTime,
        etaMinutes: journey.etaMinutes,
        lastKnownLocation: journey.lastKnownLocation || null,
        lastUpdatedLocationAt: journey.lastUpdatedLocationAt || null,
        endedAt: journey.endedAt || null,
        notes: journey.notes || '',
        limitationNotice: 'Location updates occur when the traveler\'s browser is active with location permissions granted. Web applications cannot track location when the device is fully asleep or the browser is terminated.'
      }
    });
  } catch (err) {
    console.error('Shared journey fetch error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch shared journey status.' });
  }
});

// PROTECTED ROUTES BELOW - require authentication
router.use(authenticateToken);

// GET /api/journeys/active - get current active journey for logged in user
router.get('/active', async (req, res) => {
  try {
    const db = getDatabase();
    const journeys = await db.journeys.find({ userId: req.user.id, status: 'active' });
    const active = journeys.length > 0 ? journeys[journeys.length - 1] : null;

    res.json({
      success: true,
      hasActiveJourney: Boolean(active),
      journey: active
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve active journey.' });
  }
});

// GET /api/journeys - list past journeys
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const journeys = await db.journeys.find({ userId: req.user.id });
    res.json({
      success: true,
      count: journeys.length,
      journeys: journeys.reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve journeys.' });
  }
});

// POST /api/journeys - start a new safe journey
router.post('/', async (req, res) => {
  try {
    const { startLocation, destination, etaMinutes, startCoords, notes } = req.body;
    const db = getDatabase();

    if (!startLocation || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both starting point and destination.'
      });
    }

    const eta = Number(etaMinutes) || 30;
    const estimatedArrivalTime = new Date(Date.now() + eta * 60 * 1000).toISOString();
    const shareToken = crypto.randomBytes(24).toString('hex');

    const journey = await db.journeys.create({
      userId: req.user.id,
      travelerName: req.user.name,
      startLocation: startLocation.trim(),
      destination: destination.trim(),
      etaMinutes: eta,
      estimatedArrivalTime,
      status: 'active',
      isRevoked: false,
      shareToken,
      lastKnownLocation: startCoords ? {
        lat: startCoords.lat,
        lng: startCoords.lng,
        accuracy: startCoords.accuracy || null,
        timestamp: new Date().toISOString()
      } : null,
      lastUpdatedLocationAt: startCoords ? new Date().toISOString() : null,
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Safe journey initiated.',
      journey,
      shareUrl: `/shared/${shareToken}`
    });
  } catch (err) {
    console.error('Create journey error:', err);
    res.status(500).json({ success: false, error: 'Failed to start safe journey.' });
  }
});

// PUT /api/journeys/:id/location - update live location for active journey
router.put('/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, accuracy } = req.body;
    const db = getDatabase();

    const existing = await db.journeys.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Journey not found or unauthorized.' });
    }

    if (existing.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Cannot update location of an inactive journey.' });
    }

    const updated = await db.journeys.findByIdAndUpdate(id, {
      lastKnownLocation: {
        lat: Number(lat),
        lng: Number(lng),
        accuracy: accuracy ? Number(accuracy) : null,
        timestamp: new Date().toISOString()
      },
      lastUpdatedLocationAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Location updated successfully.',
      lastKnownLocation: updated.lastKnownLocation
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update location.' });
  }
});

// PUT /api/journeys/:id/end - safely complete the journey
router.put('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = await db.journeys.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Journey not found or unauthorized.' });
    }

    const updated = await db.journeys.findByIdAndUpdate(id, {
      status: 'completed',
      endedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Journey marked as safely completed.',
      journey: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to end journey.' });
  }
});

// PUT /api/journeys/:id/revoke - revoke share link
router.put('/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = await db.journeys.findById(id);
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Journey not found or unauthorized.' });
    }

    const updated = await db.journeys.findByIdAndUpdate(id, {
      isRevoked: true
    });

    res.json({
      success: true,
      message: 'Live tracking share link has been revoked.',
      journey: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to revoke link.' });
  }
});

module.exports = router;
