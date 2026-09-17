import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';
import { navigationLinks } from '../../data/navigation';

export const Navbar: React.FC = () => {
  const [isOpen,     setIsOpen]     = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const { user, signOut }           = useAuth();
  const location                    = useLocation();

  /* Detect scroll to add glass effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menu on route change */
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        className={[
          'fixed w-full top-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass border-b border-gray-200/60 shadow-sm py-0'
            : 'bg-tym-bg/95 border-b border-transparent py-0',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              {/* Badge */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-tym-slate text-white font-black text-xs tracking-wider overflow-hidden flex-shrink-0 group-hover:bg-tym-crimson transition-colors duration-300">
                <span className="relative z-10">TCM</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              </div>
              {/* Wordmark */}
              <div className="flex flex-col leading-none">
                <span className="font-black text-[15px] tracking-widest text-tym-slate uppercase">
                  Transform
                </span>
                <span className="font-semibold text-[10px] tracking-[0.18em] text-tym-crimson uppercase">
                  Christian Ministry
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={[
                    'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
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
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">Profile</Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => { await signOut(); }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/get-involved">
                    <Button variant="primary" size="sm" iconRight={<span>→</span>}>
                      Join Us
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* ── Hamburger ── */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <span
                className={[
                  'absolute transition-all duration-200',
                  isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90',
                ].join(' ')}
              >
                <X className="w-5 h-5 text-tym-slate" />
              </span>
              <span
                className={[
                  'absolute transition-all duration-200',
                  isOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0',
                ].join(' ')}
              >
                <Menu className="w-5 h-5 text-tym-slate" />
              </span>
            </button>

          </div>
        </div>

        {/* ── Active page indicator bar ── */}
        <div className="h-[2px] bg-gray-100">
          <div className="h-full bg-tym-crimson w-0 transition-all duration-500" />
        </div>
      </nav>

      <MobileMenu
        navLinks={navigationLinks}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        signOut={signOut}
        isActive={isActive}
      />
    </>
  );
};
