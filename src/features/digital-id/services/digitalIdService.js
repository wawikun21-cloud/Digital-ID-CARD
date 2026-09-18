/**
 * Digital ID data source.
 *
 * `fetchDigitalId` is async on purpose: today it resolves a local mock
 * object, but the call site never needs to change when this is wired up
 * to a real endpoint. Swap the body of this function for a `fetch(...)`
 * call and nothing in the components has to know the difference.
 *
 * Persistence lives here too, for the same reason: edits are saved to
 * localStorage today and `fetchDigitalId` merges them over the mock on
 * every load, so a refresh shows what was last saved instead of
 * resetting to the seed data. Once this is wired to a real API, saving
 * becomes a `PUT`/`PATCH` call and fetching just returns what the
 * server has — nothing above the service layer has to change either
 * way.
 */

import defaultProfilePhoto from '../../../assets/default-profile.jpg';

/**
 * Photo used when a Digital ID has no uploaded picture of its own.
 * Exported so the form can offer "restore default" after an upload.
 */
export const DEFAULT_PROFILE_PHOTO = defaultProfilePhoto;

const MOCK_DIGITAL_ID = {
  id: 'CIT-2026-0001',
  name: 'Benneth A. Aloyon, MIT',
  position: 'Dean, College of Information Technology',
  secondaryRole: 'Founder, BAA Digital Marketing Services',
  department: 'College of Information Technology',
  organization: 'BAA Digital',
  bio: 'Turning bold ideas into working systems — one launch at a time.',
  photo: DEFAULT_PROFILE_PHOTO,
  contact: {
    phone: '+63 931 984 9574',
    website: 'www.baadigital.com',
    email: 'bennethaloyon@gmail.com',
  },
  socialLinks: [
    { id: 'social-seed-1', url: 'https://www.facebook.com/iamdeanbaa' },
    { id: 'social-seed-2', url: 'https://www.instagram.com/iamdeanbaa?stkn=M3NqNDI4NGF5Y3lr' },
  ],
  issued: '2026-01-15',
  expires: '2028-01-15',
  // No `qrData` on purpose: the card derives the verification URL from
  // the ID number via buildVerifyUrl(), so an edited ID number and its
  // QR code can never drift apart. Set `qrData` here only to pin a
  // one-off value that shouldn't follow the ID.
};

const STORAGE_KEY = 'digital-id:record';

/**
 * A deep-enough clone of the seed record — safe to hand out for a
 * reset without a caller's later edits mutating MOCK_DIGITAL_ID
 * itself (contact and socialLinks are nested, so a shallow copy
 * wouldn't be enough).
 */
function cloneDefault() {
  return {
    ...MOCK_DIGITAL_ID,
    contact: { ...MOCK_DIGITAL_ID.contact },
    socialLinks: MOCK_DIGITAL_ID.socialLinks.map((link) => ({ ...link })),
  };
}

/**
 * Read whatever was last saved, wrapped in try/catch because
 * localStorage can throw in private-browsing or sandboxed contexts —
 * treated the same as "nothing saved yet" rather than crashing.
 */
function readStoredDigitalId() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persist an edited record. Merged over the default on the next
 * fetch, not swapped in wholesale, so a field the current schema
 * doesn't know about yet never gets silently dropped.
 * @param {object} digitalId
 * @returns {boolean} whether the save actually persisted
 */
export function saveDigitalId(digitalId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(digitalId));
    return true;
  } catch {
    return false;
  }
}

/** Discard saved edits so the next fetch returns the seed data again. */
export function clearStoredDigitalId() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing saved, or storage unavailable — either way there's
    // nothing to clear.
  }
}

/**
 * A fresh copy of the seed record, for a "reset to default" action.
 * Does not touch what's in storage — pair with clearStoredDigitalId
 * to actually discard the saved edits.
 */
export function getDefaultDigitalId() {
  return cloneDefault();
}

/**
 * @returns {Promise<typeof MOCK_DIGITAL_ID>}
 */
export async function fetchDigitalId() {
  // TODO: replace with a real request, e.g.
  // const res = await fetch(`/api/digital-id/${employeeId}`);
  // if (!res.ok) throw new Error('Failed to load digital ID');
  // return res.json();
  const stored = readStoredDigitalId();
  if (!stored) return Promise.resolve(cloneDefault());

  // Shallow-merge over the default so fields added to the schema after
  // a record was saved (a new `bio`, say) still show up instead of
  // coming back undefined.
  return Promise.resolve({
    ...cloneDefault(),
    ...stored,
    contact: { ...MOCK_DIGITAL_ID.contact, ...(stored.contact ?? {}) },
  });
}
