import { useCallback, useState } from 'react';
import { createLocalId } from '../utils/digitalIdUtils';

/**
 * Owns the editable copy of the Digital ID. Starts from whatever data
 * was fetched (mock today, an API later) and lets the person change
 * any field, including adding/removing social links, without ever
 * mutating the original object in place.
 */
export function useDigitalIdForm(initialDigitalId = null) {
  const [digitalId, setDigitalId] = useState(initialDigitalId);

  const loadDigitalId = useCallback((data) => setDigitalId(data), []);

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

  return {
    digitalId,
    loadDigitalId,
    updateField,
    updateContactField,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
  };
}
