import React, { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidEmail } from '../../lib/utils';

export const Newsletter: React.FC = () => {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'|'dup'>('idle');
  const [msg,    setMsg]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) { setStatus('error'); setMsg('Please enter a valid email.'); return; }
    setStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert([{ email }]);
      if (error) {
        if (error.code === '23505') { setStatus('dup'); setMsg("You're already subscribed!"); }
        else throw error;
      } else { setStatus('success'); setEmail(''); }
    } catch { setStatus('error'); setMsg('Something went wrong. Please try again.'); }
  };

  return (
    <section className="py-18 bg-tcm-navy-mid relative overflow-hidden" aria-label="Newsletter signup">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-tcm-gold/8 rounded-full blur-3xl pointer-events-none" />
      <div className="container-tcm text-center relative z-10 py-14">
        <div className="w-14 h-14 rounded-2xl bg-tcm-gold/15 border border-tcm-gold/30 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-6 h-6 text-tcm-gold" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">Stay Connected</h2>
        <p className="text-white/50 text-base mb-8 max-w-md mx-auto">
          Get updates on events, devotionals, and ministry news delivered to your inbox.
        </p>
        {status === 'success' ? (
          <div className="inline-flex items-center gap-3 bg-white/8 border border-tcm-gold/30 rounded-2xl px-6 py-4">
            <CheckCircle2 className="w-5 h-5 text-tcm-gold flex-shrink-0" />
            <p className="text-white font-semibold">You're subscribed — welcome to the family!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email" value={email} onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              placeholder="Enter your email address" disabled={status === 'loading'} aria-label="Email address"
              className="flex-1 px-4 py-3 rounded-full border-2 border-white/15 bg-white/8 text-white placeholder-white/35 text-sm focus:outline-none focus:border-tcm-gold transition-colors disabled:opacity-50"
            />
            <button type="submit" disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-tcm-gold text-tcm-navy font-black text-sm uppercase tracking-wider hover:bg-tcm-gold-lt transition-colors disabled:opacity-50 flex-shrink-0 shadow-gold">
              {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</> : 'Subscribe'}
            </button>
          </form>
        )}
        {(status === 'error' || status === 'dup') && (
          <p className={`mt-3 text-sm font-medium ${status === 'dup' ? 'text-tcm-gold' : 'text-red-400'}`}>{msg}</p>
        )}
        <p className="text-white/25 text-xs mt-5">No spam. Unsubscribe any time.</p>
      </div>
    </section>
  );
};
