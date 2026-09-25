import { useEffect, useState } from 'react';
import AppNav from './AppNav';

const STORAGE_KEY = 'digital-id.sidebar-collapsed';

function readStoredCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Wraps every protected page (see App.jsx's ProtectedRoute) with the
 * shared sidebar/bottom-nav. Owns the sidebar's collapsed state so the
 * content gutter can match the sidebar's actual width, and remembers the
 * choice across visits.
 */
export default function AuthenticatedLayout({ children }) {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // Private browsing or storage disabled: the preference just won't persist.
    }
  }, [collapsed]);

  return (
    <div className="min-h-svh bg-cream">
      <AppNav collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <div
        className={`pb-20 transition-[padding] duration-200 ease-in-out md:pb-0 ${
          collapsed ? 'md:pl-20' : 'md:pl-60'
        }`}
      >
        {children}
      </div>
    </div>
  );
}