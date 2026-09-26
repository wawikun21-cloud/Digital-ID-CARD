import { getDigitalId, saveDigitalIdForUser, deleteDigitalIdByUserId } from '../services/digitalIdService.js';

function normalizeBody(body) {
  const isFormData = !body || typeof body !== 'object' || body instanceof String;
  if (!isFormData && typeof body.name === 'string') {
    return {
      id_number: body.id_number ?? body.idNumber,
      address: body.address,
      name: body.name,
      position: body.position,
      secondary_role: body.secondary_role ?? body.secondaryRole,
      department: body.department,
      organization: body.organization,
      website_link: body.website_link ?? body.websiteLink,
      bio: body.bio,
      contact_phone: body.contact?.phone ?? body.contact_phone,
      contact_website: body.contact?.website ?? body.contact_website,
      contact_email: body.contact?.email ?? body.contact_email,
      issued: body.issued,
      expires: body.expires,
      social_links: Array.isArray(body.socialLinks)
        ? body.socialLinks
        : body.social_links
          ? JSON.parse(body.social_links)
          : undefined,
      background: body.background,
      logo: body.logo,
    };
  }

  return {
    id_number: body.id_number,
    address: body.address,
    name: body.name,
    position: body.position,
    secondary_role: body.secondary_role,
    department: body.department,
    organization: body.organization,
    website_link: body.website_link,
    bio: body.bio,
    contact_phone: body.contact_phone,
    contact_website: body.contact_website,
    contact_email: body.contact_email,
    issued: body.issued,
    expires: body.expires,
    social_links: body.social_links ? JSON.parse(body.social_links) : undefined,
    background: body.background,
    logo: body.logo,
  };
}

function stripAdminFields(body, userRole) {
  if (userRole === 'admin') {
    return body;
  }
  const { background, logo, ...rest } = body;
  return rest;
}

// Only an admin may set these — company name, position, the front-QR
// link, and the "Link (shown on the card)" field. Keyed by the column
// name saveDigitalIdForUser expects; each getter reads the matching
// property off a fetched record (see models/digitalIdModel.js#rowToRecord).
const ADMIN_ONLY_FIELDS = {
  organization: (current) => current.organization,
  position: (current) => current.position,
  website_link: (current) => current.websiteLink,
  contact_website: (current) => current.contact?.website ?? '',
};

/**
 * A non-admin's request keeps whatever is already saved for the
 * admin-only fields, no matter what they submit for those keys — this
 * runs regardless of what the client shows, so it also covers a direct
 * API call that skips the disabled inputs entirely.
 */
async function lockAdminOnlyFields(body, userId, userRole) {
  if (userRole === 'admin') {
    return body;
  }
  const current = await getDigitalId(userId);
  const locked = { ...body };
  for (const [field, readCurrentValue] of Object.entries(ADMIN_ONLY_FIELDS)) {
    locked[field] = readCurrentValue(current);
  }
  return locked;
}

export async function getDigitalIdHandler(req, res) {
  try {
    const data = await getDigitalId(req.user.id);
    res.json(data);
  } catch (err) {
    console.error('GET /api/digital-id error', err);
    res.status(500).json({ error: 'Failed to load digital ID.' });
  }
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function isPng(buffer) {
  return Buffer.isBuffer(buffer) && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
}

export async function putDigitalIdHandler(req, res) {
  try {
    const photoBuffer = req.files?.photo?.[0]?.buffer ?? null;
    // Only admins may change the company logo (same rule as stripAdminFields).
    const logoBuffer = req.user.role === 'admin' ? (req.files?.logo?.[0]?.buffer ?? null) : null;

    if ((photoBuffer && !isPng(photoBuffer)) || (logoBuffer && !isPng(logoBuffer))) {
      return res.status(400).json({ error: 'Photo and logo must be PNG images.' });
    }

    const normalized = normalizeBody(req.body);
    const stripped = stripAdminFields(normalized, req.user.role);
    const locked = await lockAdminOnlyFields(stripped, req.user.id, req.user.role);
    const saved = await saveDigitalIdForUser(req.user.id, locked, photoBuffer, null, logoBuffer);
    res.json(saved);
  } catch (err) {
    console.error('PUT /api/digital-id error', err);
    res.status(500).json({ error: 'Failed to save digital ID.' });
  }
}

/**
 * Admin-only: read or update another user's "hidden" card fields —
 * company name, position, the front-QR link, and the "Link (shown on
 * the card)" field. These are the same four fields a non-admin cannot
 * touch on their own card (see ADMIN_ONLY_FIELDS above); this is where
 * an admin sets them instead, from the Users list rather than that
 * person's own edit form.
 */
export async function getDigitalIdForAdminHandler(req, res) {
  try {
    const data = await getDigitalId(req.params.userId);
    res.json(data);
  } catch (err) {
    console.error('GET /api/digital-id/admin/:userId error', err);
    res.status(500).json({ error: "Failed to load this user's card details." });
  }
}

export async function putDigitalIdForAdminHandler(req, res) {
  try {
    const current = await getDigitalId(req.params.userId);
    // Only the four admin-managed fields change; everything else on the
    // record (name, bio, photo, social links, dates...) is carried over
    // as-is, since this endpoint only asks the person for those four.
    const merged = {
      id_number: current.idNumber,
      address: current.address,
      name: current.name,
      position: req.body.position ?? current.position,
      secondary_role: current.secondaryRole,
      department: current.department,
      organization: req.body.organization ?? current.organization,
      website_link: req.body.website_link ?? current.websiteLink,
      bio: current.bio,
      contact_phone: current.contact.phone,
      contact_website: req.body.contact_website ?? current.contact.website,
      contact_email: current.contact.email,
      issued: current.issued,
      expires: current.expires,
      social_links: current.socialLinks,
    };
    const saved = await saveDigitalIdForUser(req.params.userId, merged);
    res.json(saved);
  } catch (err) {
    console.error('PUT /api/digital-id/admin/:userId error', err);
    res.status(500).json({ error: "Failed to update this user's card details." });
  }
}

export async function deleteDigitalIdHandler(req, res) {
  try {
    await deleteDigitalIdByUserId(req.user.id);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/digital-id error', err);
    res.status(500).json({ error: 'Failed to reset digital ID.' });
  }
}