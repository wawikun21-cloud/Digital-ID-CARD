import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { IdCardIcon, UsersIcon, LogoutIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

/**
 * The primary navigation for authenticated pages: a collapsible sidebar
 * on larger screens, a fixed bottom tab bar on small screens. Rendered
 * once by AuthenticatedLayout, which owns the collapsed/expanded state
 * so it can reserve matching space for the page content.
 */
function useNavItems() {
  const { user } = useAuth();
  const items = [{ to: '/', label: 'My ID', Icon: IdCardIcon, end: true }];
  if (user?.role === 'admin') {
    items.push({ to: '/admin', label: 'Users', Icon: UsersIcon, end: false });
  }
  return items;
}

const linkBase =
  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
const linkActive = 'bg-ink text-paper';
const linkInactive = 'text-ink-soft hover:bg-cream hover:text-ink';

export default function AppNav({ collapsed, onToggleCollapsed }) {
  const { user, logout } = useAuth();
  const items = useNavItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const initial = (user?.full_name || user?.username || '?').trim().charAt(0).toUpperCase();

  // Close the profile menu on an outside click, and whenever the sidebar collapses.
  useEffect(() => {
    if (!menuOpen) return undefined;
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (collapsed) setMenuOpen(false);
  }, [collapsed]);

  function handleLogout() {
    setMenuOpen(false);
    if (window.confirm('Log out of your Digital ID?')) {
      logout();
    }
  }

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-paper py-6 transition-[width] duration-200 ease-in-out md:flex ${
          collapsed ? 'w-20 px-2' : 'w-60 px-4'
        }`}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-paper text-ink-soft shadow-sm transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>

        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center px-0' : 'px-2'}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-paper">
            <IdCardIcon width={18} height={18} />
          </span>
          {!collapsed && <span className="truncate font-serif text-lg font-semibold text-ink">Digital ID</span>}
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive} ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon width={18} height={18} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        <div ref={profileRef} className="relative border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            title={collapsed ? user?.full_name || user?.username : undefined}
            className={`flex w-full items-center gap-3 rounded-xl py-2 text-left transition hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              collapsed ? 'justify-center px-0' : 'px-2'
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-semibold text-ink">
              {initial}
            </span>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{user?.full_name || user?.username}</p>
                <p className="truncate text-xs capitalize text-ink-soft">{user?.role}</p>
              </div>
            )}
          </button>

          {menuOpen && !collapsed && (
            <button type="button" onClick={handleLogout} className={`${linkBase} ${linkInactive} mt-1 w-full`}>
              <LogoutIcon width={18} height={18} />
              Log out
            </button>
          )}

          {menuOpen && collapsed && (
            <div className="absolute bottom-0 left-full z-40 ml-3 w-52 rounded-xl border border-line bg-paper p-3 shadow-lg">
              <p className="truncate px-1 text-sm font-medium text-ink">{user?.full_name || user?.username}</p>
              <p className="truncate px-1 text-xs capitalize text-ink-soft">{user?.role}</p>
              <button
                type="button"
                onClick={handleLogout}
                className={`${linkBase} ${linkInactive} mt-2 w-full`}
              >
                <LogoutIcon width={18} height={18} />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-line bg-paper pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
        aria-label="Primary"
      >
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                isActive ? 'text-ink' : 'text-ink-soft'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                    isActive ? 'bg-ink text-paper' : 'text-ink-soft'
                  }`}
                >
                  <Icon width={18} height={18} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-ink-soft transition"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft">
            <LogoutIcon width={18} height={18} />
          </span>
          Log out
        </button>
      </nav>
    </>
  );
}