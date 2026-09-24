import { useCallback, useRef, useState } from 'react';
import { createLocalId } from '../utils/digitalIdUtils';
import {
  saveDigitalId,
  clearStoredDigitalId,
  getDefaultDigitalId,
} from '../services/digitalIdService';

/**
 * Owns the editable copy of the Digital ID. Starts from whatever data
 * was fetched and lets the person change any field, including adding
 * and removing social links, without mutating the original object.
 *
 * Edits apply to the card live but are only sent to the server when
 * `save()` is called (the form's Save button). `dirty` tells the form
 * whether there is anything to save; `saveStatus` reports the result.
 */
export function useDigitalIdForm(initialDigitalId = null) {
  const [digitalId, setDigitalId] = useState(initialDigitalId);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success' | 'error', message }

  const latestRef = useRef(initialDigitalId);
  // Images (photo/logo) changed since the last successful save. Only
  // these are uploaded; a text-only save doesn't resend the files.
  const pendingUploadsRef = useRef({ photo: false, logo: false });

  const apply = useCallback((updater) => {
    setDigitalId((prev) => {
      const next = updater(prev);
      latestRef.current = next;
      return next;
    });
    setDirty(true);
    setSaveStatus(null);
  }, []);

  const loadDigitalId = useCallback((data) => {
    latestRef.current = data;
    pendingUploadsRef.current = { photo: false, logo: false };
    setDigitalId(data);
    setDirty(false);
  }, []);

  const save = useCallback(async () => {
    const snapshot = latestRef.current;
    if (!snapshot) return;
    const uploads = { ...pendingUploadsRef.current };

    setSaving(true);
    setSaveStatus(null);
    try {
      await saveDigitalId(snapshot, uploads);
      // Keep flags for any image picked while this request was in flight.
      if (latestRef.current.photo === snapshot.photo) pendingUploadsRef.current.photo = false;
      if (latestRef.current.logo === snapshot.logo) pendingUploadsRef.current.logo = false;
      setDirty(latestRef.current !== snapshot);
      setSaveStatus({ type: 'success', message: 'Saved.' });
    } catch (error) {
      setSaveStatus({ type: 'error', message: error.message || 'Could not save.' });
    } finally {
      setSaving(false);
    }
  }, []);

  const updateField = useCallback(
    (field, value) => {
      if (field === 'photo' || field === 'logo') pendingUploadsRef.current[field] = true;
      apply((prev) => ({ ...prev, [field]: value }));
    },
    [apply],
  );

  const updateContactField = useCallback(
    (field, value) => {
      apply((prev) => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
    },
    [apply],
  );

  const addSocialLink = useCallback(() => {
    apply((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { id: createLocalId('social'), url: '' }],
    }));
  }, [apply]);

  const updateSocialLink = useCallback(
    (id, url) => {
      apply((prev) => ({
        ...prev,
        socialLinks: prev.socialLinks.map((link) => (link.id === id ? { ...link, url } : link)),
      }));
    },
    [apply],
  );

  const removeSocialLink = useCallback(
    (id) => {
      apply((prev) => ({
        ...prev,
        socialLinks: prev.socialLinks.filter((link) => link.id !== id),
      }));
    },
    [apply],
  );

  const resetToDefault = useCallback(async () => {
    try {
      await clearStoredDigitalId();
    } catch (error) {
      setSaveStatus({ type: 'error', message: error.message });
      return;
    }
    pendingUploadsRef.current = { photo: false, logo: false };
    const defaults = getDefaultDigitalId();
    latestRef.current = defaults;
    setDigitalId(defaults);
    setDirty(true);
    setSaveStatus(null);
  }, []);

  return {
    digitalId,
    dirty,
    saving,
    saveStatus,
    save,
    loadDigitalId,
    updateField,
    updateContactField,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    resetToDefault,
  };
}