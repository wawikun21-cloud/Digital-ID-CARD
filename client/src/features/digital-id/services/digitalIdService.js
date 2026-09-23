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
};

const API_BASE = `${import.meta.env.VITE_API_BASE ?? '/api'}/digital-id`;

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

async function toFormData(digitalId) {
  const form = new FormData();
  form.set('id', digitalId.id);
  form.set('name', digitalId.name);
  form.set('position', digitalId.position);
  form.set('secondary_role', digitalId.secondaryRole);
  form.set('department', digitalId.department);
  form.set('organization', digitalId.organization);
  form.set('bio', digitalId.bio);
  form.set('contact_phone', digitalId.contact.phone);
  form.set('contact_website', digitalId.contact.website);
  form.set('contact_email', digitalId.contact.email);
  form.set('issued', digitalId.issued);
  form.set('expires', digitalId.expires);
  form.set('social_links', JSON.stringify(digitalId.socialLinks));

  if (isDataUrl(digitalId.photo)) {
    const response = await fetch(digitalId.photo);
    const blob = await response.blob();
    form.set('photo', blob, 'photo.jpg');
  }

  return form;
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
    photo: data.photo ? data.photo : DEFAULT_PROFILE_PHOTO,
    contact: { ...MOCK_DIGITAL_ID.contact, ...(data.contact ?? {}) },
  };
}

function isDefaultPhoto(value) {
  return value === DEFAULT_PROFILE_PHOTO;
}

export async function saveDigitalId(digitalId) {
  const hasPhoto = isDataUrl(digitalId.photo);
  let body;

  if (hasPhoto) {
    body = await toFormData(digitalId);
  } else {
    body = {
      id: digitalId.id,
      name: digitalId.name,
      position: digitalId.position,
      secondary_role: digitalId.secondaryRole,
      department: digitalId.department,
      organization: digitalId.organization,
      bio: digitalId.bio,
      contact_phone: digitalId.contact.phone,
      contact_website: digitalId.contact.website,
      contact_email: digitalId.contact.email,
      issued: digitalId.issued,
      expires: digitalId.expires,
      social_links: JSON.stringify(digitalId.socialLinks),
      photo: null,
    };
  }

  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: hasPhoto ? undefined : { 'Content-Type': 'application/json' },
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
