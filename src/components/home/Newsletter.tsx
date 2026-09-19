import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidEmail } from '../../lib/utils';

export const Newsletter: React.FC = () => {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          setStatus('duplicate');
          setMessage('You\'re already subscribed!');
        } else {
          throw error;
        }
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-20 bg-tym-slate relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-tym-crimson/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 md:px-8 text-center relative z-10">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-tym-crimson/20 border border-tym-crimson/30 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-6 h-6 text-tym-crimson" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
          Stay in the Loop
        </h2>
        <p className="text-white/50 text-base mb-10">
          Get updates on events, devotionals, and ministry news delivered to
          your inbox.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-5">
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
            <p className="text-white font-semibold">You're subscribed — welcome to the family!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                disabled={status === 'loading'}
                aria-label="Email address"
                className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/40 text-sm transition-colors duration-200 focus:outline-none focus:border-tym-crimson disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={status === 'loading'}
              className="flex-shrink-0"
            >
              Subscribe
            </Button>
          </form>
        )}

        {(status === 'error' || status === 'duplicate') && (
          <p className={`mt-3 text-sm font-medium ${status === 'duplicate' ? 'text-yellow-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        <p className="text-white/25 text-xs mt-5">
          No spam. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
};
