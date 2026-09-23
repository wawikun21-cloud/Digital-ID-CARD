import { getDigitalId, saveDigitalId, deleteDigitalId } from '../services/digitalIdService.js';

function normalizeBody(body) {
  const isFormData = !body || typeof body !== 'object' || body instanceof String;
  if (!isFormData && typeof body.name === 'string') {
    return {
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

export async function putDigitalIdHandler(req, res) {
  try {
    let photoBuffer = null;

    if (req.file) {
      photoBuffer = req.file.buffer;
    } else if (typeof req.body.photo === 'string') {
      const dataUrl = req.body.photo;
      const match = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) {
        photoBuffer = Buffer.from(match[2], 'base64');
      }
    }

    const normalized = normalizeBody(req.body);
    const stripped = stripAdminFields(normalized, req.user.role);
    const saved = await saveDigitalId(req.user.id, stripped, photoBuffer);
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
