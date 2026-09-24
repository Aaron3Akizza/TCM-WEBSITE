import React from 'react';
import { MessageCircle, Mail, HelpCircle } from 'lucide-react';

interface ITSupportProps {
  /** 'card' = white card with border (default), 'inline' = compact line */
  variant?: 'card' | 'inline' | 'banner';
  className?: string;
}

export const IT_ADMIN = {
  name:      'Aaron Akizza',
  whatsapp:  '0774720129',
  phone:     '0774720129',
  email:     'aaronakizza@gmail.com',
  waLink:    'https://wa.me/256774720129',
  mailLink:  'mailto:aaronakizza@gmail.com',
};

export const ITSupport: React.FC<ITSupportProps> = ({ variant = 'card', className = '' }) => {

  if (variant === 'inline') {
    return (
      <p className={`text-xs text-tcm-gray-mid text-center ${className}`}>
        Need help?{' '}
        <a
          href={IT_ADMIN.waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-tcm-orange font-semibold hover:underline"
        >
          WhatsApp IT Admin
        </a>
        {' '}or email{' '}
        <a
          href={IT_ADMIN.mailLink}
          className="text-tcm-orange font-semibold hover:underline"
        >
          {IT_ADMIN.email}
        </a>
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-tcm-navy-mid border border-tcm-gold/20 rounded-2xl p-5 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-tcm-gold/15 border border-tcm-gold/30 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-tcm-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm mb-0.5">Need Help? Contact TCM IT Admin</p>
            <p className="text-white/50 text-xs mb-3">
              For registration, login, verification, or any website issues.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={IT_ADMIN.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600/20 border border-green-500/30 text-green-300 text-xs font-bold hover:bg-green-600/30 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp {IT_ADMIN.phone}
              </a>
              <a
                href={IT_ADMIN.mailLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tcm-gold/15 border border-tcm-gold/30 text-tcm-gold text-xs font-bold hover:bg-tcm-gold/25 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {IT_ADMIN.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: 'card'
  return (
    <div className={`bg-white rounded-2xl border border-tcm-gold/20 shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-tcm-gold/10 border border-tcm-gold/30 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-tcm-gold" />
        </div>
        <div>
          <p className="font-black text-tcm-navy text-sm">Need Help?</p>
          <p className="text-tcm-gray-mid text-xs">Contact TCM IT Admin</p>
        </div>
      </div>

      <p className="text-tcm-gray-dark text-sm leading-relaxed mb-4">
        Having trouble registering, verifying your email, logging in, or updating
        your profile? Contact our IT Administrator for support.
      </p>

      <div className="border-t border-gray-100 pt-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-tcm-gray-mid uppercase tracking-wider w-14">Admin</span>
          <span className="text-sm font-semibold text-tcm-navy">{IT_ADMIN.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-tcm-gray-mid uppercase tracking-wider w-14">WhatsApp</span>
          <a
            href={IT_ADMIN.waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {IT_ADMIN.phone}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-tcm-gray-mid uppercase tracking-wider w-14">Email</span>
          <a
            href={IT_ADMIN.mailLink}
            className="text-sm font-semibold text-tcm-orange hover:underline transition-colors break-all"
          >
            {IT_ADMIN.email}
          </a>
        </div>
      </div>

      <p className="text-[11px] text-tcm-gray-mid mt-4 leading-relaxed">
        Please message on WhatsApp or email with your full name and the issue
        you are experiencing. We will assist you as soon as possible.
      </p>
    </div>
  );
};
