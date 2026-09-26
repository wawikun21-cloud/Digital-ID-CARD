/**
 * Digital ID data source.
 *
 * `fetchDigitalId` calls the real backend endpoint and returns what
 * the server has for the current user. Saving is a `PUT` call; fetching
 * just returns what the server has — nothing above the service layer
 * has to change either way.
 */

const API_BASE = `${import.meta.env.VITE_API_BASE ?? '/api'}/digital-id`;

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

function dataUrlToBlob(dataUrl) {
  return fetch(dataUrl).then((response) => response.blob());
}

function appendFields(target, digitalId) {
  target.set('id_number', digitalId.idNumber ?? '');
  target.set('address', digitalId.address ?? '');
  target.set('name', digitalId.name);
  target.set('position', digitalId.position);
  target.set('secondary_role', digitalId.secondaryRole);
  target.set('department', digitalId.department);
  target.set('organization', digitalId.organization);
  target.set('bio', digitalId.bio);
  target.set('website_link', digitalId.websiteLink ?? '');
  target.set('contact_phone', digitalId.contact.phone);
  target.set('contact_website', digitalId.contact.website);
  target.set('contact_email', digitalId.contact.email);
  target.set('issued', digitalId.issued);
  target.set('expires', digitalId.expires);
  target.set('social_links', JSON.stringify(digitalId.socialLinks));
}

export async function fetchDigitalId() {
  const res = await fetch(API_BASE, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load digital ID');
  return await res.json();
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

/**
 * Admin-only: read or update another user's four "hidden" card fields
 * (company name, position, the front-QR link, the "Link (shown on the
 * card)" field) from the Users list, rather than that person's own
 * edit form. Backed by server/features/digital-id/routes/digital-id.js's
 * /admin/:userId routes, which the server also restricts to admins.
 */
export async function fetchDigitalIdForUser(userId) {
  const res = await fetch(`${API_BASE}/admin/${userId}`, { credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Failed to load this user's card details." }));
    throw new Error(data.error || "Failed to load this user's card details.");
  }
  return res.json();
}

export async function updateDigitalIdForUser(userId, fields) {
  const res = await fetch(`${API_BASE}/admin/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Failed to update this user's card details." }));
    throw new Error(data.error || "Failed to update this user's card details.");
  }
  return res.json();
}


export async function clearStoredDigitalId() {
  const res = await fetch(API_BASE, { method: 'DELETE', credentials: 'include' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to clear digital ID');
}