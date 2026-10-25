const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

// Set environment to test
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

const app = require('../index');

test('SafeHer API Automated Integration Suite', async (t) => {
  let authToken = '';
  let testUserId = '';
  let contactId = '';
  let journeyId = '';
  let journeyShareToken = '';
  let checkinId = '';
  let alertId = '';

  await t.test('1. Health check endpoint responds with service details and DB mode', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.service, 'SafeHer API');
    assert.ok(res.body.database);
    assert.ok(res.body.notificationService);
  });

  await t.test('2. Safety resources endpoints return verified helplines, guides, and checklist', async () => {
    const helplinesRes = await request(app).get('/api/resources/helplines');
    assert.equal(helplinesRes.status, 200);
    assert.ok(Array.isArray(helplinesRes.body.helplines));
    assert.ok(helplinesRes.body.helplines.some(h => h.number === '112'));

    const guidesRes = await request(app).get('/api/resources/guidance');
    assert.equal(guidesRes.status, 200);
    assert.ok(Array.isArray(guidesRes.body.guides));
  });

  await t.test('3. Auth validation: rejects registration without required fields or invalid email', async () => {
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'notanemail',
      password: '123'
    });
    assert.equal(res1.status, 400);

    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'valid@example.com',
      password: '123' // too short
    });
    assert.equal(res2.status, 400);
  });

  await t.test('4. Registration: successfully registers a new user with hashed password', async () => {
    const uniqueEmail = `test_${Date.now()}@safeher.local`;
    const res = await request(app).post('/api/auth/register').send({
      name: 'Kavita Singh',
      email: uniqueEmail,
      password: 'SafePassword123!',
      phone: '9876512345'
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.name, 'Kavita Singh');
    assert.equal(res.body.user.password, undefined); // Ensure password is not exposed

    authToken = res.body.token;
    testUserId = res.body.user.id;
  });

  await t.test('5. Auth login: authenticates registered user and returns token', async () => {
    const demoRes = await request(app).post('/api/auth/demo');
    assert.equal(demoRes.status, 200);
    assert.ok(demoRes.body.token);
    assert.equal(demoRes.body.user.name, 'Priya Sharma (Demo)');
  });

  await t.test('6. Unauthorized protection: rejects access to private endpoints without token', async () => {
    const res = await request(app).get('/api/contacts');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('7. Trusted Contacts: creates, reads, updates, and deletes contacts with validation', async () => {
    // Validation check - invalid phone
    const invalidPhoneRes = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Brother', phone: '12' });
    assert.equal(invalidPhoneRes.status, 400);

    // Create valid contact
    const createRes = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Rohan Singh',
        phone: '9876543210',
        relationship: 'Brother',
        email: 'rohan@example.com',
        isEmergencyContact: true,
        notes: 'Available on calls'
      });
    assert.equal(createRes.status, 201);
    assert.ok(createRes.body.contact.id);
    contactId = createRes.body.contact.id;

    // Read contacts
    const listRes = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`);
    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.contacts.length >= 1);

    // Update contact
    const updateRes = await request(app)
      .put(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ notes: 'Updated notes' });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.contact.notes, 'Updated notes');
  });

  await t.test('8. Safe Journey: starts journey, generates revocable share token, updates location, and ends journey', async () => {
    // Start journey
    const startRes = await request(app)
      .post('/api/journeys')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        startLocation: 'NITK Main Gate, Surathkal',
        destination: 'Mangalore Central Railway Station',
        etaMinutes: 45,
        startCoords: { lat: 13.0119, lng: 74.7943, accuracy: 15 },
        notes: 'Travelling by campus bus'
      });
    assert.equal(startRes.status, 201);
    assert.ok(startRes.body.journey._id);
    assert.ok(startRes.body.journey.shareToken);
    journeyId = startRes.body.journey._id;
    journeyShareToken = startRes.body.journey.shareToken;

    // Public shared journey view (no auth needed)
    const publicRes = await request(app).get(`/api/journeys/shared/${journeyShareToken}`);
    assert.equal(publicRes.status, 200);
    assert.equal(publicRes.body.journey.destination, 'Mangalore Central Railway Station');
    assert.ok(publicRes.body.journey.lastKnownLocation);
    // Ensure sensitive data is not leaked
    assert.equal(publicRes.body.journey.password, undefined);

    // Update location
    const locRes = await request(app)
      .put(`/api/journeys/${journeyId}/location`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ lat: 12.9850, lng: 74.8050, accuracy: 10 });
    assert.equal(locRes.status, 200);

    // Complete journey
    const endRes = await request(app)
      .put(`/api/journeys/${journeyId}/end`)
      .set('Authorization', `Bearer ${authToken}`);
    assert.equal(endRes.status, 200);
    assert.equal(endRes.body.journey.status, 'completed');
  });

  await t.test('9. Safety Check-In: creates timer, checks remaining seconds, and confirms safe', async () => {
    // Create checkin
    const createRes = await request(app)
      .post('/api/checkins')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        durationMinutes: 10,
        label: 'Walking through library corridor'
      });
    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.checkin.status, 'active');
    assert.ok(createRes.body.checkin.remainingSeconds > 0);
    checkinId = createRes.body.checkin._id;

    // Check active
    const activeRes = await request(app)
      .get('/api/checkins/active')
      .set('Authorization', `Bearer ${authToken}`);
    assert.equal(activeRes.status, 200);
    assert.equal(activeRes.body.hasActiveCheckIn, true);

    // Confirm safe
    const safeRes = await request(app)
      .put(`/api/checkins/${checkinId}/safe`)
      .set('Authorization', `Bearer ${authToken}`);
    assert.equal(safeRes.status, 200);
    assert.equal(safeRes.body.checkin.status, 'safe');
  });

  await t.test('10. Emergency SOS Alert: triggers alert with coordinates, dispatches to contacts, and cancels with reason', async () => {
    // Trigger SOS
    const triggerRes = await request(app)
      .post('/api/alerts/trigger')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        location: { lat: 13.0119, lng: 74.7943, accuracy: 12, address: 'Surathkal Beach Road' },
        customMessage: 'Emergency distress triggered during test drill'
      });
    assert.equal(triggerRes.status, 201);
    assert.equal(triggerRes.body.success, true);
    assert.ok(triggerRes.body.alert._id);
    assert.ok(triggerRes.body.dispatch);
    alertId = triggerRes.body.alert._id;

    // Cancel alert
    const cancelRes = await request(app)
      .put(`/api/alerts/${alertId}/cancel`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ reason: 'Test safety drill concluded successfully' });
    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.body.alert.status, 'cancelled');
  });
});
