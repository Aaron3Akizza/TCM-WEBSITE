import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, AtSign, PlayCircle, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

const quickLinks = [
  { label: 'About',        path: '/about' },
  { label: 'Vision',       path: '/vision' },
  { label: 'What We Do',   path: '/what-we-do' },
  { label: 'Events',       path: '/events' },
  { label: 'Get Involved', path: '/get-involved' },
  { label: 'Media',        path: '/media' },
  { label: 'Contact',      path: '/contact' },
];

const socials = [
  { icon: Share2,   href: 'https://facebook.com',  label: 'Facebook'  },
  { icon: AtSign,   href: 'https://instagram.com', label: 'Instagram' },
  { icon: PlayCircle, href: 'https://youtube.com',   label: 'YouTube'   },
  { icon: Mail,     href: 'mailto:info@tcm.org',   label: 'Email'     },
];

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tym-slate text-white relative overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* ── Main grid ── */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-tym-crimson flex items-center justify-center font-black text-xs text-white">
                TCM
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-[14px] tracking-widest uppercase">Transform</span>
                <span className="font-semibold text-[10px] tracking-widest text-red-300 uppercase">Christian Ministry</span>
              </div>
            </div>

            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Raising a generation rooted in Christ, walking in purpose and
              transforming their communities for the Kingdom.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-tym-crimson hover:border-tym-crimson transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-5">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="group flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 text-tym-crimson opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-5">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Sign In',          path: '/sign-in' },
                { label: 'Join the Movement', path: '/get-involved' },
              ].map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="group flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 text-tym-crimson opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
              {[
                { label: 'Privacy Policy',   href: '#' },
                { label: 'Terms & Conditions', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-5">
              Get in Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-tym-crimson mt-0.5 flex-shrink-0" />
                <a href="mailto:info@tcm.org" className="text-sm text-white/60 hover:text-white transition-colors duration-200">
                  info@tcm.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-tym-crimson mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60">+256 700 000 000</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-tym-crimson mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/60">Uganda</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {year} Transform Christian Ministry (TCM). All Rights Reserved.
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-tym-crimson" />
            <span className="text-white/30 text-xs font-medium tracking-wider uppercase">
              Built for the Kingdom
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
