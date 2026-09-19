import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';
import { navigationLinks } from '../../data/navigation';

/* ── TCM Hologram Logo Mark ─────────────────────────────── */
const TCMLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 48 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Transform Christian Ministry"
    role="img"
  >
    <path
      fill="#DC2626"
      d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
    />
    {/* Highlight gleam */}
    <path
      d="M20 2 L14 12 L22 12 L16 22"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const Navbar: React.FC = () => {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut }       = useAuth();
  const location                = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change — intentional side effect */
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        className={[
          'fixed w-full top-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass border-b border-gray-200/60 shadow-md'
            : 'bg-tym-bg/95 border-b border-gray-100',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Logo: symbol only ── */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-tym-crimson rounded-lg"
              aria-label="Transform Christian Ministry — Home"
            >
              <TCMLogo className="w-8 h-8 group-hover:opacity-80 transition-opacity duration-200" />
              {/* Wordmark: "TCM" only — no expanded name */}
              <span className="font-black text-[17px] tracking-[0.12em] text-tym-slate group-hover:text-tym-crimson transition-colors duration-200 select-none">
                TCM
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={[
                    'px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 whitespace-nowrap',
                    isActive(link.path)
                      ? 'bg-tym-crimson/10 text-tym-crimson'
                      : 'text-tym-slate hover:bg-gray-100 hover:text-tym-crimson',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop CTA ── */}
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">Profile</Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={async () => { await signOut(); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/get-involved">
                    <Button variant="primary" size="sm">Join Us →</Button>
                  </Link>
                </>
              )}
            </div>

            {/* ── Hamburger ── */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tym-crimson"
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              <span className={['absolute transition-all duration-200', isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'].join(' ')}>
                <X className="w-5 h-5 text-tym-slate" />
              </span>
              <span className={['absolute transition-all duration-200', isOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'].join(' ')}>
                <Menu className="w-5 h-5 text-tym-slate" />
              </span>
            </button>

          </div>
        </div>

        {/* Active page underline */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100/80" />
      </nav>

      <MobileMenu
        navLinks={navigationLinks}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        signOut={signOut}
        isActive={isActive}
        Logo={TCMLogo}
      />
    </>
  );
};
