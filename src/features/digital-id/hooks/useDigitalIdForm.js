import { useCallback, useEffect, useRef, useState } from 'react';
import { createLocalId } from '../utils/digitalIdUtils';
import {
  saveDigitalId,
  clearStoredDigitalId,
  getDefaultDigitalId,
} from '../services/digitalIdService';

/**
 * Owns the editable copy of the Digital ID. Starts from whatever data
 * was fetched (mock today, an API later) and lets the person change
 * any field, including adding/removing social links, without ever
 * mutating the original object in place.
 *
 * Every change is persisted as it happens — there's no separate Save
 * action, matching the rest of the form's "changes apply as you type"
 * behaviour — so a refresh picks up where editing left off instead of
 * reverting to the seed data.
 */
export function useDigitalIdForm(initialDigitalId = null) {
  const [digitalId, setDigitalId] = useState(initialDigitalId);
  // Distinguishes "just loaded, nothing to save yet" from "the person
  // changed something" so loading a record doesn't immediately
  // re-save it as if it were an edit.
  const hasLoadedRef = useRef(false);

  const loadDigitalId = useCallback((data) => {
    hasLoadedRef.current = true;
    setDigitalId(data);
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current || !digitalId) return;
    saveDigitalId(digitalId);
  }, [digitalId]);

  const updateField = useCallback((field, value) => {
    setDigitalId((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateContactField = useCallback((field, value) => {
    setDigitalId((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }, []);

  const addSocialLink = useCallback(() => {
    setDigitalId((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: createLocalId('social'), url: '' }],
    }));
  }, []);

  const updateSocialLink = useCallback((id, url) => {
    setDigitalId((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link) => (link.id === id ? { ...link, url } : link)),
    }));
  }, []);

  const removeSocialLink = useCallback((id) => {
    setDigitalId((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((link) => link.id !== id),
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    clearStoredDigitalId();
    setDigitalId(getDefaultDigitalId());
  }, []);

  return {
    digitalId,
    loadDigitalId,
    updateField,
    updateContactField,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    resetToDefault,
  };
}
