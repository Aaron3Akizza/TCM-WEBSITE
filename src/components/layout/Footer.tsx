import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, AtSign, Play, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tym-slate text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Organization Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tym-crimson text-white font-black text-sm leading-none flex-shrink-0">
                TCM
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-base text-white tracking-wide">TRANSFORM</span>
                <span className="font-semibold text-xs text-red-300 tracking-widest uppercase">Christian Ministry</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Raising a generation rooted in Christ, walking in purpose and
              transforming their communities for the Kingdom.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-600 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/get-involved"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  Get Involved
                </Link>
              </li>
              <li>
                <Link
                  to="/media"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/sign-in"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-tym-crimson transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-tym-crimson transition-colors"
                aria-label="Facebook"
              >
                <Share2 className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-tym-crimson transition-colors"
                aria-label="Instagram"
              >
                <AtSign className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-700 hover:bg-tym-crimson transition-colors"
                aria-label="YouTube"
              >
                <Play className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@tcm.org"
                className="p-2 rounded-full bg-gray-700 hover:bg-tym-crimson transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700"></div>

        {/* Bottom Footer */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-300">
            © {currentYear} Transform Christian Ministry (TCM). All Rights Reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-300">
            <a href="#" className="hover:text-tym-crimson transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-tym-crimson transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
