import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, Users, UserCircle2, LogOut } from 'lucide-react';

interface NavLink { label: string; path: string; }
interface MobileMenuProps {
  isOpen:   boolean;
  onClose:  () => void;
  navLinks: NavLink[];
  user:     any;
  signOut:  () => Promise<void>;
  isActive: (path: string) => boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen, onClose, navLinks, user, signOut, isActive,
}) => (
  <>
    {/* Backdrop */}
    <div
      onClick={onClose}
      aria-hidden="true"
      className={[
        'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    />

    {/* Drawer */}
    <aside
      id="mobile-menu"
      aria-label="Mobile navigation"
      className={[
        'fixed top-0 right-0 z-50 h-full w-[300px] flex flex-col lg:hidden',
        'bg-navy-gradient shadow-2xl',
        'transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-[68px] border-b border-white/10 flex-shrink-0">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-tcm-gold/50">
            <img src="/assets/logo/tcm-logo.jpg" alt="TCM" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[13px] tracking-widest text-white uppercase">Transform</span>
            <span className="font-semibold text-[9px] tracking-[0.18em] text-tcm-gold uppercase">Christian Ministries</span>
          </div>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Gold separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-tcm-gold/40 to-transparent flex-shrink-0" />

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4">
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
                ? 'text-tcm-gold bg-white/8 border-r-[3px] border-tcm-gold'
                : 'text-white/75 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            {link.label}
            <ChevronRight className={[
              'w-4 h-4 transition-transform duration-200 group-hover:translate-x-1',
              isActive(link.path) ? 'text-tcm-gold' : 'text-white/25',
            ].join(' ')} />
          </Link>
        ))}
      </nav>

      {/* Auth + Join CTA */}
      <div className="px-5 py-5 border-t border-white/10 flex flex-col gap-2.5 flex-shrink-0">
        <Link
          to="/membership"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-tcm-gold text-tcm-navy font-black text-sm uppercase tracking-wider hover:bg-tcm-gold-lt transition-colors shadow-gold"
        >
          <Users className="w-4 h-4" />
          Become a Member
        </Link>

        {user ? (
          <div className="flex gap-2">
            <Link to="/profile" onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-white/25 text-white/75 text-sm font-semibold hover:border-tcm-gold hover:text-tcm-gold transition-colors">
              <UserCircle2 className="w-4 h-4" /> Profile
            </Link>
            <button
              onClick={async () => { await signOut(); onClose(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-white/20 text-white/50 text-sm font-semibold hover:border-red-400/60 hover:text-red-400 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        ) : (
          <Link to="/sign-in" onClick={onClose}
            className="flex items-center justify-center w-full py-2.5 rounded-full border border-white/25 text-white/75 text-sm font-semibold hover:border-white hover:text-white transition-colors">
            Sign In
          </Link>
        )}
      </div>
    </aside>
  </>
);
