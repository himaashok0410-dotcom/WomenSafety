const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'healthy',
    service: 'SafeHer API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    notificationService: {
      mode: process.env.NOTIFICATION_MODE || 'demo',
      provider: process.env.NOTIFICATION_MODE === 'production' ? 'Twilio SMS/WhatsApp' : 'Simulated Demo Dispatcher',
      disclaimer: 'SOS alerts notify configured emergency contacts. Direct police assistance requires dialing 112.'
    },
    uptimeSeconds: Math.floor(process.uptime())
  });
});

module.exports = router;
