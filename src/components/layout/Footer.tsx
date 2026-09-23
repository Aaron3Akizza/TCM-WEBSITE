import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Share2, AtSign, PlayCircle, ArrowRight } from 'lucide-react';

const quickLinks = [
  { label: 'About',        path: '/about'        },
  { label: 'Ministries',   path: '/what-we-do'   },
  { label: 'Events',       path: '/events'       },
  { label: 'Gallery',      path: '/gallery'      },
  { label: 'Media',        path: '/media'        },
  { label: 'Membership',   path: '/membership'   },
  { label: 'Support Us',   path: '/support'      },
  { label: 'Contact',      path: '/contact'      },
];

const socials = [
  {
    icon: PlayCircle,
    href: 'https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC',
    label: 'YouTube',
    bg: 'hover:bg-red-600',
  },
  { icon: Share2,  href: '#', label: 'Facebook',  bg: 'hover:bg-blue-600'   },
  { icon: AtSign,  href: '#', label: 'Instagram',  bg: 'hover:bg-pink-600'  },
  { icon: Mail,    href: 'mailto:info@tcm.org', label: 'Email', bg: 'hover:bg-tcm-gold' },
];

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-gradient text-white relative overflow-hidden" role="contentinfo">
      {/* Top gold line */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-tcm-gold to-transparent" />

      {/* Dot grid decoration */}
      <div className="absolute inset-0 dot-grid pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

        {/* ── Main Grid ── */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-tcm-gold/50 group-hover:ring-tcm-gold transition-all duration-200 flex-shrink-0">
                <img src="/assets/logo/tcm-logo.jpg" alt="TCM Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-[13px] tracking-widest text-white uppercase">Transform</span>
                <span className="font-semibold text-[10px] tracking-[0.18em] text-tcm-gold uppercase">Christian Ministries</span>
              </div>
            </Link>

            <p className="text-white/50 text-sm leading-relaxed mb-2">
              <span className="text-tcm-gold font-semibold italic">
                "Catch the Fire · Ignite Others"
              </span>
            </p>
            <p className="text-white/40 text-xs leading-relaxed mb-5">
              Rooted in 2 Corinthians 5:17 — raising a generation of transformed leaders for God's Kingdom.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2 flex-wrap">
              {socials.map(({ icon: Icon, href, label, bg }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={[
                    'w-9 h-9 rounded-full bg-white/8 border border-white/15',
                    'flex items-center justify-center',
                    'transition-all duration-200',
                    bg,
                    'hover:border-transparent hover:scale-110',
                  ].join(' ')}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-tcm-gold mb-5">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="group flex items-center gap-2 text-sm text-white/55 hover:text-white transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 text-tcm-gold/0 group-hover:text-tcm-gold transition-all duration-200 -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-tcm-gold mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-tcm-gold mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+256779340046" className="block text-sm text-white/65 hover:text-white transition-colors">
                    +256 779 340 046
                  </a>
                  <a href="tel:+256704812493" className="block text-sm text-white/65 hover:text-white transition-colors">
                    +256 704 812 493
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-tcm-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white/55">Uganda</span>
              </li>
              <li className="flex items-start gap-3">
                <PlayCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <a
                  href="https://youtube.com/@transformclub-o4f?si=l1oPb9_XGyjJBrhC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/65 hover:text-red-400 transition-colors"
                >
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>

          {/* Scripture + Join */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-tcm-gold mb-5">
              Our Foundation
            </h4>
            <blockquote className="border-l-2 border-tcm-gold/50 pl-4 mb-6">
              <p className="text-white/60 text-sm leading-relaxed italic" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                "Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new."
              </p>
              <cite className="text-tcm-gold text-xs font-bold not-italic mt-2 block">
                — 2 Corinthians 5:17
              </cite>
            </blockquote>
            <Link
              to="/membership"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-tcm-gold text-tcm-navy text-xs font-black uppercase tracking-wider hover:bg-tcm-gold-lt transition-colors shadow-gold"
            >
              Become a Member →
            </Link>
          </div>

        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {year} Transform Christian Ministries. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <span>·</span>
            <span className="text-tcm-gold/60">Catch the Fire · Ignite Others</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
