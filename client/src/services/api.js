const BASE_URL = import.meta.env.VITE_API_URL || '';

function getToken() {
  return localStorage.getItem('safeher_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('safeher_token', token);
  } else {
    localStorage.removeItem('safeher_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  demoLogin: () => request('/api/auth/demo', { method: 'POST' }),
  getProfile: () => request('/api/auth/me'),

  // Health
  getHealth: () => request('/api/health'),

  // Contacts
  getContacts: () => request('/api/contacts'),
  createContact: (body) => request('/api/contacts', { method: 'POST', body: JSON.stringify(body) }),
  updateContact: (id, body) => request(`/api/contacts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteContact: (id) => request(`/api/contacts/${id}`, { method: 'DELETE' }),

  // Journeys
  getActiveJourney: () => request('/api/journeys/active'),
  getJourneys: () => request('/api/journeys'),
  startJourney: (body) => request('/api/journeys', { method: 'POST', body: JSON.stringify(body) }),
  updateJourneyLocation: (id, coords) => request(`/api/journeys/${id}/location`, { method: 'PUT', body: JSON.stringify(coords) }),
  endJourney: (id) => request(`/api/journeys/${id}/end`, { method: 'PUT' }),
  revokeJourneyShare: (id) => request(`/api/journeys/${id}/revoke`, { method: 'PUT' }),
  getSharedJourney: (token) => request(`/api/journeys/shared/${token}`),

  // Check-Ins
  getActiveCheckIn: () => request('/api/checkins/active'),
  getCheckInHistory: () => request('/api/checkins/history'),
  startCheckIn: (body) => request('/api/checkins', { method: 'POST', body: JSON.stringify(body) }),
  confirmCheckInSafe: (id) => request(`/api/checkins/${id}/safe`, { method: 'PUT' }),
  cancelCheckIn: (id) => request(`/api/checkins/${id}/cancel`, { method: 'PUT' }),

  // Emergency Alerts (SOS)
  getActiveAlert: () => request('/api/alerts/active'),
  getAlertHistory: () => request('/api/alerts/history'),
  triggerAlert: (body) => request('/api/alerts/trigger', { method: 'POST', body: JSON.stringify(body) }),
  cancelAlert: (id, body) => request(`/api/alerts/${id}/cancel`, { method: 'PUT', body: JSON.stringify(body) }),

  // Resources
  getHelplines: () => request('/api/resources/helplines'),
  getGuidance: () => request('/api/resources/guidance'),
  getChecklist: () => request('/api/resources/checklist')
};
