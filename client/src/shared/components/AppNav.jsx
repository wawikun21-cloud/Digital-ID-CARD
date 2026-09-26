import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useConfirm } from './ConfirmProvider';
import logoMark from '../../assets/id-card/logo-mark.png';
import { IdCardIcon, UsersIcon, LogoutIcon, MenuIcon } from './icons';

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
  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
const linkActive = 'bg-ink text-paper';
const linkInactive = 'text-ink-soft hover:bg-cream hover:text-ink';

export default function AppNav({ collapsed, onToggleCollapsed }) {
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const items = useNavItems();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const initial = (user?.full_name || user?.username || '?').trim().charAt(0).toUpperCase();

  // Close the profile menu on an outside click.
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

  async function handleLogout() {
    setMenuOpen(false);
    const confirmed = await confirm({
      title: 'Log out',
      message: 'Log out of your Digital ID?',
      confirmLabel: 'Log out',
    });
    if (confirmed) {
      logout();
    }
  }

  function toggleCollapsed() {
    setMenuOpen(false);
    onToggleCollapsed();
  }

  return (
    <>
      {/* Desktop / tablet sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-paper py-5 transition-[width] duration-200 ease-in-out md:flex ${
          collapsed ? 'w-20 px-2' : 'w-64 px-3'
        }`}
      >
        <div
          className={`flex items-center gap-2 border-b border-line pb-4 ${collapsed ? 'justify-center' : 'px-1.5'}`}
        >
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-soft transition hover:bg-cream hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <MenuIcon width={20} height={20} />
          </button>
          {!collapsed && (
            <>
              <img src={logoMark} alt="BAA Digital" className="h-6 w-auto shrink-0 object-contain" />
              <span className="h-5 w-px shrink-0 bg-line" aria-hidden="true" />
              <span className="truncate text-sm font-medium text-ink-soft">Digital ID</span>
            </>
          )}
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1.5">
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
              <Icon width={20} height={20} />
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
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-semibold text-ink">
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
              <LogoutIcon width={20} height={20} />
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
                <LogoutIcon width={20} height={20} />
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