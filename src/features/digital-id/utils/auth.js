/**
 * Client-only auth gate for the Digital ID editor.
 *
 * There is no backend for this app, so "login" here means comparing
 * against a single hardcoded email/password pair rather than calling
 * an API. That's a real limit worth being explicit about: anything
 * shipped in the JS bundle — these credentials included — can be read
 * by opening devtools, so this keeps casual visitors out of the
 * editor, not a determined one. Swap `checkCredentials` for a real
 * request once there's a backend to check against, and nothing else
 * in `useAuth` or `LoginForm` has to change.
 */

const AUTH_EMAIL = 'baadigital@gmail.com';
const AUTH_PASSWORD = 'bennethaloyon';

/** sessionStorage key: survives a refresh, clears when the tab closes. */
export const AUTH_SESSION_KEY = 'digital-id-authenticated';

/**
 * @param {string} email
 * @param {string} password
 * @returns {boolean}
 */
export function checkCredentials(email, password) {
  return (
    email.trim().toLowerCase() === AUTH_EMAIL.toLowerCase() && password.trim() === AUTH_PASSWORD
  );
}

/**
 * Read the persisted auth flag. Wrapped in try/catch because
 * sessionStorage can throw in some sandboxed or private-browsing
 * contexts — treated the same as "not logged in" rather than crashing
 * the page.
 */
export function readAuthFlag() {
  try {
    return window.sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * @param {boolean} value
 */
export function writeAuthFlag(value) {
  try {
    if (value) {
      window.sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    } else {
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch {
    // Nothing to do — the session just won't survive a refresh.
  }
}
