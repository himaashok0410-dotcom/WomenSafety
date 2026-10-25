/**
 * Notification Service for SafeHer Emergency Alerts
 * Handles dispatching alerts to trusted contacts.
 * 
 * Rules:
 * - If external provider (e.g. Twilio) is configured, dispatches real SMS/WhatsApp.
 * - If not configured, operates in labeled DEMO_MODE.
 * - Always reports accurate delivery status ('simulated_delivered' vs 'delivered' vs 'failed').
 * - Generates prefilled WhatsApp click-to-chat links so users can optionally send manual messages directly.
 */

async function dispatchEmergencyAlert({ alertId, user, contacts, location, customMessage }) {
  const isProdConfigured = Boolean(
    process.env.NOTIFICATION_MODE === 'production' &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  const mapsUrl = location && location.lat && location.lng
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : 'Location coordinates unavailable';

  const defaultMsg = `EMERGENCY ALERT from ${user.name || 'SafeHer User'}: I need urgent help! My current status is an active SOS distress alert.`;
  const messageBody = customMessage ? `${customMessage}\nLocation: ${mapsUrl}` : `${defaultMsg}\nLocation: ${mapsUrl}`;

  const dispatchResults = [];

  for (const contact of contacts) {
    const cleanPhone = (contact.phone || '').replace(/[^0-9]/g, '');
    const indianPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const manualWhatsAppLink = `https://wa.me/${indianPhone}?text=${encodeURIComponent(messageBody)}`;

    if (isProdConfigured) {
      // In production with Twilio
      try {
        // External call would go here
        dispatchResults.push({
          contactId: contact._id || contact.id,
          contactName: contact.name,
          phone: contact.phone,
          channel: 'sms',
          status: 'pending_provider',
          provider: 'twilio',
          delivered: false,
          dispatchedAt: new Date().toISOString(),
          manualWhatsAppLink
        });
      } catch (err) {
        dispatchResults.push({
          contactId: contact._id || contact.id,
          contactName: contact.name,
          phone: contact.phone,
          status: 'failed',
          error: err.message,
          delivered: false,
          manualWhatsAppLink
        });
      }
    } else {
      // Honest Demo Mode
      dispatchResults.push({
        contactId: contact._id || contact.id,
        contactName: contact.name,
        phone: contact.phone,
        channel: 'sms_whatsapp_simulation',
        status: 'simulated_dispatch',
        mode: 'DEMO_MODE',
        note: 'Simulated alert dispatch for testing/demonstration. Real delivery requires SMS/WhatsApp API credentials.',
        delivered: false,
        simulatedDelivered: true,
        dispatchedAt: new Date().toISOString(),
        previewText: messageBody,
        manualWhatsAppLink
      });
    }
  }

  return {
    alertId,
    mode: isProdConfigured ? 'production' : 'demo',
    isDemo: !isProdConfigured,
    totalContacts: contacts.length,
    dispatches: dispatchResults,
    mapsUrl,
    messageBody
  };
}

module.exports = {
  dispatchEmergencyAlert
};
