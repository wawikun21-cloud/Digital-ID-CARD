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

const MOCK_DIGITAL_ID = {
  id: 'CIT-2026-0001',
  idNumber: '000001',
  name: 'Benneth A. Aloyon, MIT',
  position: 'Dean, College of Information Technology',
  secondaryRole: 'Founder, BAA Digital Marketing Services',
  department: 'College of Information Technology',
  organization: 'BAA Digital',
  bio: 'Turning bold ideas into working systems — one launch at a time.',
  photo: null,
  logo: null,
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
};

const API_BASE = `${import.meta.env.VITE_API_BASE ?? '/api'}/digital-id`;

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then((response) => response.blob());
}

function appendFields(target, digitalId) {
  target.set('id_number', digitalId.idNumber ?? '');
  target.set('name', digitalId.name);
  target.set('position', digitalId.position);
  target.set('secondary_role', digitalId.secondaryRole);
  target.set('department', digitalId.department);
  target.set('organization', digitalId.organization);
  target.set('bio', digitalId.bio);
  target.set('contact_phone', digitalId.contact.phone);
  target.set('contact_website', digitalId.contact.website);
  target.set('contact_email', digitalId.contact.email);
  target.set('issued', digitalId.issued);
  target.set('expires', digitalId.expires);
  target.set('social_links', JSON.stringify(digitalId.socialLinks));
}

function cloneDefault() {
  return {
    ...MOCK_DIGITAL_ID,
    contact: { ...MOCK_DIGITAL_ID.contact },
    socialLinks: MOCK_DIGITAL_ID.socialLinks.map((link) => ({ ...link })),
  };
}

export async function fetchDigitalId() {
  const res = await fetch(API_BASE, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load digital ID');
  const data = await res.json();
  return {
    ...cloneDefault(),
    ...data,
    photo: data.photo || null,
    logo: data.logo || null,
    contact: { ...MOCK_DIGITAL_ID.contact, ...(data.contact ?? {}) },
  };
}

/**
 * `uploads` says which images changed since the last save. The photo and
 * logo come back from the API as data URLs, so without this every
 * keystroke in the form would re-upload both files.
 *
 * @param {object} digitalId
 * @param {{ photo?: boolean, logo?: boolean }} [uploads]
 */
export async function saveDigitalId(digitalId, uploads = {}) {
  const sendPhoto = Boolean(uploads.photo) && isDataUrl(digitalId.photo);
  const sendLogo = Boolean(uploads.logo) && isDataUrl(digitalId.logo);
  let body;

  if (sendPhoto || sendLogo) {
    body = new FormData();
    appendFields(body, digitalId);
    if (sendPhoto) body.set('photo', await dataUrlToBlob(digitalId.photo), 'photo.png');
    if (sendLogo) body.set('logo', await dataUrlToBlob(digitalId.logo), 'logo.png');
  } else {
    body = new URLSearchParams();
    appendFields(body, digitalId);
  }

  const res = await fetch(API_BASE, {
    method: 'PUT',
    body,
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to save digital ID');
  return res.json();
}

export async function clearStoredDigitalId() {
  const res = await fetch(API_BASE, { method: 'DELETE', credentials: 'include' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to clear digital ID');
}

export function getDefaultDigitalId() {
  return cloneDefault();
}
