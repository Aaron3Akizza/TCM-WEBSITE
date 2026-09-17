import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ChevronRight } from 'lucide-react';

interface NavLink {
  label: string;
  path:  string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
  isOpen:   boolean;
  onClose:  () => void;
  user:     any;
  signOut:  () => Promise<void>;
  isActive: (path: string) => boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  navLinks,
  isOpen,
  onClose,
  user,
  signOut,
  isActive,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-40 bg-tym-slate/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={[
          'fixed top-0 right-0 z-50 h-full w-[300px] bg-white shadow-2xl',
          'flex flex-col transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tym-slate text-white flex items-center justify-center font-black text-xs">
              TCM
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-[13px] tracking-widest text-tym-slate uppercase">Transform</span>
              <span className="font-semibold text-[9px] tracking-widest text-tym-crimson uppercase">Christian Ministry</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <span className="text-lg font-bold text-tym-slate leading-none">✕</span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col">
            {navLinks.map((link, i) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={onClose}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={[
                    'flex items-center justify-between px-6 py-3.5 text-sm font-semibold',
                    'transition-colors duration-150 group',
                    isActive(link.path)
                      ? 'text-tym-crimson bg-red-50 border-r-2 border-tym-crimson'
                      : 'text-tym-slate hover:text-tym-crimson hover:bg-gray-50',
                  ].join(' ')}
                >
                  {link.label}
                  <ChevronRight
                    className={[
                      'w-4 h-4 transition-transform duration-200 group-hover:translate-x-1',
                      isActive(link.path) ? 'text-tym-crimson' : 'text-gray-300',
                    ].join(' ')}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth CTA */}
        <div className="px-6 py-6 border-t border-gray-100 flex flex-col gap-3">
          {user ? (
            <>
              <Link to="/profile" onClick={onClose}>
                <Button variant="outline" size="md" className="w-full">Profile</Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={async () => { await signOut(); onClose(); }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/sign-in" onClick={onClose}>
                <Button variant="outline" size="md" className="w-full">Sign In</Button>
              </Link>
              <Link to="/get-involved" onClick={onClose}>
                <Button variant="primary" size="md" className="w-full" iconRight={<span>→</span>}>
                  Join the Movement
                </Button>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
