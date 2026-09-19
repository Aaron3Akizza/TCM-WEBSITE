import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ChevronRight, X } from 'lucide-react';

interface NavLink { label: string; path: string; }

interface MobileMenuProps {
  navLinks:  NavLink[];
  isOpen:    boolean;
  onClose:   () => void;
  user:      any;
  signOut:   () => Promise<void>;
  isActive:  (path: string) => boolean;
  Logo:      React.FC<{ className?: string }>;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  navLinks, isOpen, onClose, user, signOut, isActive, Logo,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={[
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Slide-in drawer */}
      <aside
        aria-label="Mobile navigation"
        className={[
          'fixed top-0 right-0 z-50 h-full w-[288px] bg-white shadow-2xl',
          'flex flex-col transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-[68px] border-b border-gray-100 flex-shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <span className="font-black text-[16px] tracking-[0.12em] text-tym-slate select-none">TCM</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-tym-slate" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navLinks.map((link, i) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              style={{ animationDelay: `${i * 35}ms` }}
              className={[
                'flex items-center justify-between px-5 py-3.5 text-sm font-semibold',
                'transition-colors duration-150 group',
                isActive(link.path)
                  ? 'text-tym-crimson bg-red-50 border-r-[3px] border-tym-crimson'
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
          ))}
        </nav>

        {/* Auth CTA */}
        <div className="px-5 py-5 border-t border-gray-100 flex flex-col gap-2.5 flex-shrink-0">
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
                <Button variant="primary" size="md" className="w-full">Join the Movement →</Button>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
