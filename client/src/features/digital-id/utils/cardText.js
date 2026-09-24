/**
 * Text helpers for the ID card front. Pure functions: they only decide
 * how a string is broken into lines and how large it may be set, so the
 * layout (DigitalIdFront) stays declarative.
 */

/**
 * "BAA Digital Marketing Services" -> { primary: "BAA Digital",
 * secondary: "Marketing Services" }. The first two words are set large
 * and the rest smaller, as in the card layout. One or two words stay
 * on a single line.
 */
export function splitCompanyName(organization = '') {
  const words = organization.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return { primary: words.join(' '), secondary: '' };
  return { primary: words.slice(0, 2).join(' '), secondary: words.slice(2).join(' ') };
}

/**
 * "Nalche Congayo" -> ["Nalche", "Congayo"]; the last word gets its own
 * line. Credentials after a comma ("Benneth A. Aloyon, MIT") stay
 * attached to the last line: ["Benneth A.", "Aloyon, MIT"].
 */
export function splitFullName(fullName = '') {
  const [main = '', ...credentials] = fullName.split(',');
  const words = main.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const last = words.pop();
  const tail = credentials.length ? `${last}, ${credentials.join(',').trim()}` : last;
  return words.length ? [words.join(' '), tail] : [tail];
}

/**
 * Font size (in cqw, i.e. % of card width) for the name block. Steps
 * down with the longest line so long names never run into the QR code.
 */
export function nameFontSize(lines) {
  const longest = Math.max(0, ...lines.map((line) => line.length));
  if (longest <= 8) return 8.8;
  if (longest <= 10) return 7.2;
  if (longest <= 12) return 6;
  if (longest <= 15) return 5;
  return 4.2;
}
