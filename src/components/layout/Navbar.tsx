import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle2, LogOut, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MobileMenu } from './MobileMenu';
import { navigationLinks } from '../../data/navigation';

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

  /* Close mobile menu on route change — intentional side-effect */
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={[
          'fixed w-full top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-navy-gradient shadow-navy border-b border-white/10'
            : 'bg-navy-gradient border-b border-white/10',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Logo ── */}
            <Link
              to="/"
              className="flex items-center gap-3 group flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tcm-gold rounded-lg"
              aria-label="Transform Christian Ministries — Home"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-tcm-gold/40 group-hover:ring-tcm-gold transition-all duration-200">
                <img
                  src="/assets/logo/tcm-logo.jpg"
                  alt="TCM Logo"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-[14px] tracking-widest text-white uppercase">
                  Transform
                </span>
                <span className="font-semibold text-[10px] tracking-[0.18em] text-tcm-gold uppercase">
                  Christian Ministries
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={[
                    'nav-link',
                    isActive(link.path) ? 'nav-link-active' : 'nav-link-idle',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ── Desktop CTAs ── */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Link
                to="/membership"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-tcm-gold text-tcm-navy text-xs font-black uppercase tracking-wider hover:bg-tcm-gold-lt transition-colors duration-200 shadow-gold"
                aria-label="Become a member"
              >
                <Users className="w-3.5 h-3.5" />
                Join
              </Link>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/30 text-white/85 text-xs font-semibold hover:border-tcm-gold hover:text-tcm-gold transition-colors duration-200"
                  >
                    <UserCircle2 className="w-3.5 h-3.5" />
                    Profile
                  </Link>
                  <button
                    onClick={async () => { await signOut(); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 text-white/60 text-xs font-semibold hover:border-red-400/60 hover:text-red-400 transition-colors duration-200"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/30 text-white/85 text-xs font-semibold hover:border-white hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* ── Hamburger ── */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tcm-gold"
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span className={['absolute transition-all duration-200', isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'].join(' ')}>
                <X className="w-5 h-5 text-white" />
              </span>
              <span className={['absolute transition-all duration-200', isOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'].join(' ')}>
                <Menu className="w-5 h-5 text-white" />
              </span>
            </button>

          </div>
        </div>

        {/* Gold bottom line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-tcm-gold/50 to-transparent" />
      </nav>

      <MobileMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        navLinks={navigationLinks}
        user={user}
        signOut={signOut}
        isActive={isActive}
      />
    </>
  );
};
