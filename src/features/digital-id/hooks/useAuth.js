import { useCallback, useState } from 'react';
import { checkCredentials, readAuthFlag, writeAuthFlag } from '../utils/auth';

/**
 * Owns whether the editor is unlocked. Lazily reads sessionStorage
 * once on mount so a refresh doesn't bounce someone who already
 * logged in back to the login screen.
 */
export function useAuth() {
  const [authenticated, setAuthenticated] = useState(readAuthFlag);

  const login = useCallback((email, password) => {
    const ok = checkCredentials(email, password);
    if (ok) {
      writeAuthFlag(true);
      setAuthenticated(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    writeAuthFlag(false);
    setAuthenticated(false);
  }, []);

  return { authenticated, login, logout };
}
