import { getDigitalId, saveDigitalIdForUser, deleteDigitalId } from '../services/digitalIdService.js';

function normalizeBody(body) {
  const isFormData = !body || typeof body !== 'object' || body instanceof String;
  if (!isFormData && typeof body.name === 'string') {
    return {
      id_number: body.id_number ?? body.idNumber,
      name: body.name,
      position: body.position,
      secondary_role: body.secondary_role ?? body.secondaryRole,
      department: body.department,
      organization: body.organization,
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
    name: body.name,
    position: body.position,
    secondary_role: body.secondary_role,
    department: body.department,
    organization: body.organization,
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
    const saved = await saveDigitalIdForUser(req.user.id, stripped, photoBuffer, null, logoBuffer);
    res.json(saved);
  } catch (err) {
    console.error('PUT /api/digital-id error', err);
    res.status(500).json({ error: 'Failed to save digital ID.' });
  }
}

export async function deleteDigitalIdHandler(req, res) {
  try {
    await deleteDigitalId(req.user.id);
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/digital-id error', err);
    res.status(500).json({ error: 'Failed to reset digital ID.' });
  }
}
