import React, { useState } from 'react';
import { Mail, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidEmail } from '../../lib/utils';

export const Newsletter: React.FC = () => {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'|'dup'>('idle');
  const [msg,    setMsg]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setMsg('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmed)) {
      setStatus('error');
      setMsg('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: trimmed.toLowerCase() }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('dup');
          setMsg("You're already subscribed — thank you!");
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch {
      setStatus('error');
      setMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <section
      className="py-20 bg-tcm-navy-mid relative overflow-hidden"
      aria-label="Newsletter signup"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-tcm-gold/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container-tcm text-center relative z-10">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-tcm-gold/15 border border-tcm-gold/30 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-6 h-6 text-tcm-gold" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
          Stay Connected
        </h2>
        <p className="text-white/55 text-base mb-8 max-w-md mx-auto">
          Get updates on events, devotionals, and ministry news delivered to your inbox.
        </p>

        {/* ── Success state ── */}
        {status === 'success' ? (
          <div className="inline-flex items-center gap-3 bg-white/10 border border-tcm-gold/40 rounded-2xl px-6 py-4 max-w-sm mx-auto">
            <CheckCircle2 className="w-5 h-5 text-tcm-gold flex-shrink-0" />
            <p className="text-white font-semibold text-sm text-left">
              You're subscribed — welcome to the family!
            </p>
          </div>
        ) : (
          <>
            {/* ── Input + button ── */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              noValidate
            >
              {/*
                Input sits on a white background so typed text is always
                visible regardless of browser or OS color scheme.
              */}
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
                  placeholder="Enter your email address"
                  disabled={status === 'loading'}
                  aria-label="Email address for newsletter"
                  aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                  autoComplete="email"
                  className={[
                    /* White background, dark text — fully visible on all devices */
                    'w-full pl-10 pr-4 py-3 rounded-full',
                    'border-2 bg-white text-tcm-navy placeholder-gray-400 text-sm',
                    'focus:outline-none transition-colors duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    status === 'error'
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-tcm-gold',
                  ].join(' ')}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tcm-gold text-tcm-navy font-black text-sm uppercase tracking-wider hover:bg-tcm-gold-lt active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-gold"
              >
                {status === 'loading'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</>
                  : 'Subscribe'
                }
              </button>
            </form>

            {/* ── Error message ── */}
            {status === 'error' && (
              <div
                id="newsletter-error"
                className="inline-flex items-center gap-2 mt-3 bg-red-500/15 border border-red-400/30 rounded-full px-4 py-2"
                role="alert"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs font-medium">{msg}</p>
              </div>
            )}

            {/* ── Already subscribed ── */}
            {status === 'dup' && (
              <div className="inline-flex items-center gap-2 mt-3 bg-tcm-gold/15 border border-tcm-gold/30 rounded-full px-4 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-tcm-gold flex-shrink-0" />
                <p className="text-tcm-gold text-xs font-medium">{msg}</p>
              </div>
            )}
          </>
        )}

        <p className="text-white/25 text-xs mt-5">No spam. Unsubscribe any time.</p>
      </div>
    </section>
  );
};
