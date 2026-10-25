import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { getCurrentCoordinates } from '../services/geolocation';

const SafetyContext = createContext(null);

export function SafetyProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [activeAlert, setActiveAlert] = useState(null);
  const [activeJourney, setActiveJourney] = useState(null);
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loadingSafety, setLoadingSafety] = useState(false);

  // Global modals
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [is112ModalOpen, setIs112ModalOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);

  const refreshAllStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [alertRes, journeyRes, checkinRes, contactsRes] = await Promise.allSettled([
        api.getActiveAlert(),
        api.getActiveJourney(),
        api.getActiveCheckIn(),
        api.getContacts()
      ]);

      if (alertRes.status === 'fulfilled' && alertRes.value.success) {
        setActiveAlert(alertRes.value.alert || null);
      }
      if (journeyRes.status === 'fulfilled' && journeyRes.value.success) {
        setActiveJourney(journeyRes.value.journey || null);
      }
      if (checkinRes.status === 'fulfilled' && checkinRes.value.success) {
        setActiveCheckIn(checkinRes.value.checkin || null);
      }
      if (contactsRes.status === 'fulfilled' && contactsRes.value.success) {
        setContacts(contactsRes.value.contacts || []);
      }
    } catch (err) {
      console.warn('Safety status sync error:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllStatus();
      const interval = setInterval(refreshAllStatus, 15000);
      return () => clearInterval(interval);
    } else {
      setActiveAlert(null);
      setActiveJourney(null);
      setActiveCheckIn(null);
      setContacts([]);
    }
  }, [isAuthenticated, refreshAllStatus]);

  // SOS Trigger
  const triggerSOS = async ({ customMessage = '', location = null } = {}) => {
    let loc = location;
    if (!loc) {
      try {
        loc = await getCurrentCoordinates();
      } catch (e) {
        console.warn('GPS location unavailable, proceeding with alert without coords:', e.message);
      }
    }

    const res = await api.triggerAlert({ location: loc, customMessage });
    if (res.alert) {
      setActiveAlert(res.alert);
    }
    return res;
  };

  // SOS Cancel
  const cancelSOS = async (reason = 'User confirmed safe / False alarm') => {
    if (!activeAlert) return;
    const res = await api.cancelAlert(activeAlert._id || activeAlert.id, { reason });
    setActiveAlert(null);
    return res;
  };

  return (
    <SafetyContext.Provider
      value={{
        activeAlert,
        activeJourney,
        activeCheckIn,
        contacts,
        loadingSafety,
        refreshAllStatus,
        triggerSOS,
        cancelSOS,
        isSOSModalOpen,
        setIsSOSModalOpen,
        is112ModalOpen,
        setIs112ModalOpen,
        isFakeCallOpen,
        setIsFakeCallOpen
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error('useSafety must be used within a SafetyProvider');
  return ctx;
}
