/**
 * Presentation helpers for Digital ID data. Pure functions only —
 * no fetching, no component state.
 */

/**
 * Derive up to two initials from a full name, ignoring trailing
 * credentials like "MIT" or "PhD" written after a comma.
 * @param {string} fullName
 */
export function getInitials(fullName = '') {
  const namePart = fullName.split(',')[0].trim();
  const parts = namePart.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Format an ISO date ("2026-01-15") as a compact display date ("Jan 2026").
 * @param {string} isoDate
 */
export function formatIssueDate(isoDate) {
  if (!isoDate) return '';
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

/**
 * Current origin, derived from the browser at runtime so the QR code
 * always points at the deployed host without a hardcoded domain.
 */
export function getVerifyBaseUrl() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

/**
 * Build the public verification URL for an ID number. Derived rather
 * than stored, so editing the ID number in the form keeps the QR code
 * in sync instead of silently pointing at the old credential.
 * @param {string} id
 */
export function buildVerifyUrl(id = '') {
  const trimmed = String(id).trim();
  const base = getVerifyBaseUrl();
  if (!trimmed) return base;
  return `${base}/verify/${encodeURIComponent(trimmed)}`;
}

/**
 * Clamp a value between a min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * A short, collision-safe-enough id for list items created client-side
 * (social link rows). Not used for anything security-sensitive.
 */
export function createLocalId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const SOCIAL_PLATFORMS = [
  { test: /facebook\.com|fb\.com/i, label: 'Facebook', icon: 'facebook' },
  { test: /instagram\.com/i, label: 'Instagram', icon: 'instagram' },
  { test: /twitter\.com|x\.com/i, label: 'X (Twitter)', icon: 'x' },
  { test: /linkedin\.com/i, label: 'LinkedIn', icon: 'linkedin' },
  { test: /youtube\.com|youtu\.be/i, label: 'YouTube', icon: 'youtube' },
  { test: /github\.com/i, label: 'GitHub', icon: 'github' },
  { test: /tiktok\.com/i, label: 'TikTok', icon: 'tiktok' },
  { test: /wa\.me|whatsapp\.com/i, label: 'WhatsApp', icon: 'whatsapp' },
  { test: /t\.me|telegram\.me|telegram\.org/i, label: 'Telegram', icon: 'telegram' },
];

/**
 * Identify which platform a social link belongs to, by matching its
 * domain against a small known list. Anything unrecognized (a personal
 * site, a portfolio) falls back to a generic "Website" link icon,
 * labeled with its own hostname.
 *
 * Returns a plain `{ label, icon }` description rather than a
 * component reference, so this stays a pure data function — the
 * caller (DigitalIdBack) maps `icon` to the actual icon component.
 *
 * @param {string} url
 * @returns {{ label: string, icon: string }}
 */
export function detectSocialPlatform(url = '') {
  const match = SOCIAL_PLATFORMS.find((platform) => platform.test.test(url));
  if (match) return { label: match.label, icon: match.icon };

  try {
    const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const hostname = new URL(withScheme).hostname.replace(/^www\./, '');
    return { label: hostname || 'Website', icon: 'link' };
  } catch {
    return { label: 'Website', icon: 'link' };
  }
}

/**
 * Normalize a social link so it always has a real, clickable href,
 * even if the user typed a bare domain without a scheme.
 * @param {string} url
 */
export function toHref(url = '') {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
