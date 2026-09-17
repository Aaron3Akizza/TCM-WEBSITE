import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Vision', path: '/vision' },
    { label: 'What We Do', path: '/what-we-do' },
    { label: 'Get Involved', path: '/get-involved' },
    { label: 'Media', path: '/media' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-tym-bg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              {/* TCM Logo Mark */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tym-slate text-white font-black text-sm leading-none flex-shrink-0">
                <span>TCM</span>
              </div>
              {/* Brand Name */}
              <div className="flex flex-col leading-tight">
                <span className="font-black text-base text-tym-slate tracking-wide">
                  TRANSFORM
                </span>
                <span className="font-semibold text-xs text-tym-crimson tracking-widest uppercase">
                  Christian Ministry
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'text-tym-slate border-b-2 border-tym-crimson pb-1'
                      : 'text-tym-slate hover:text-tym-crimson'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link to="/profile">
                    <Button variant="outline" size="md">
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={async () => {
                      await signOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/sign-in">
                    <Button variant="outline" size="md">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/get-involved">
                    <Button variant="primary" size="md">
                      JOIN THE MOVEMENT →
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-tym-slate" />
              ) : (
                <Menu className="w-6 h-6 text-tym-slate" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <MobileMenu
          navLinks={navLinks}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          user={user}
          signOut={signOut}
        />
      )}
    </>
  );
};
