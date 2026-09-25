/**
 * Client-side mirror of the server's user validation rules
 * (server/features/auth/controllers/authController.js), so invalid input
 * is caught before a request is sent. Keep the two in sync.
 */
export const ROLES = ['user', 'admin'];
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function validateUsername(value) {
  if (!value) return 'Username is required.';
  if (!USERNAME_PATTERN.test(value)) {
    return 'Username must be 3-50 characters: letters, numbers, dots, dashes or underscores.';
  }
  return null;
}

export function validateEmail(value) {
  if (!value) return 'Email is required.';
  if (value.length > 191 || !EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email address.';
  }
  return null;
}

/** `required: false` for the edit form, where a blank password means "keep the current one". */
export function validatePassword(value, { required = true } = {}) {
  if (!value) {
    return required ? 'Password is required.' : null;
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function validateRole(value) {
  if (value && !ROLES.includes(value)) {
    return 'Role must be "user" or "admin".';
  }
  return null;
}

/** Best-effort match of a server error message to the field it concerns, for the tooltip. */
export function fieldForServerError(message = '') {
  const m = message.toLowerCase();
  if (m.includes('username')) return 'username';
  if (m.includes('email')) return 'email';
  if (m.includes('password')) return 'password';
  if (m.includes('role')) return 'role';
  return null;
}
