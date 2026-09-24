import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar }    from '../components/layout/Navbar';
import { Footer }    from '../components/layout/Footer';
import { ITSupport } from '../components/ui/ITSupport';
import { supabase }  from '../lib/supabase';
import { isValidEmail } from '../lib/utils';
import { Mail, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';

export const ResendVerification: React.FC = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resend({
        type:  'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (err) throw err;
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full space-y-4">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
            <div className="p-8 md:p-10">

              <div className="flex justify-center mb-7">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/40 shadow-gold">
                  <img src="/assets/logo/tcm-logo.jpg" alt="TCM" className="w-full h-full object-cover" />
                </div>
              </div>

              {success ? (
                <div className="text-center">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-5" />
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-3">
                    Email Sent!
                  </h2>
                  <p className="text-tcm-gray-dark text-sm leading-relaxed mb-5">
                    A new verification email has been sent to <strong className="text-tcm-navy">{email}</strong>.
                  </p>

                  {/* Step-by-step instructions */}
                  <div className="bg-tcm-gray-soft rounded-2xl p-5 text-left mb-6 space-y-3">
                    <p className="text-xs font-black text-tcm-navy uppercase tracking-wider mb-3">
                      What to do next:
                    </p>
                    {[
                      'Open your email inbox.',
                      'Look for an email from Transform Christian Ministries or Supabase.',
                      'If you don\'t see it, check your Spam or Junk folder.',
                      'Click the "Confirm your email" or "Verify email" link inside.',
                      'You will be redirected back to the TCM website.',
                      'Once verified, sign in with your email and password.',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-tcm-gold/20 text-tcm-navy text-[11px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-tcm-gray-dark text-sm leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-tcm-gray-mid text-xs mb-6">
                    The verification link expires after 24 hours. If it expires,
                    return to this page and resend.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Link to="/sign-in" className="btn-primary w-full justify-center py-3">
                      Go to Sign In
                    </Link>
                    <button
                      onClick={() => { setSuccess(false); setEmail(''); }}
                      className="btn-outline-navy w-full justify-center py-3"
                    >
                      Send to a Different Email
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-tcm-navy text-center tracking-tight mb-1">
                    Resend Verification
                  </h1>
                  <p className="text-tcm-gray-mid text-sm text-center mb-8">
                    Enter your registered email and we'll send a new
                    verification link to your inbox.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="resend-email" className="text-sm font-semibold text-tcm-navy">
                        Email Address <span className="text-tcm-orange">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                        <input
                          id="resend-email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={loading}
                          autoComplete="email"
                          className="input-field pl-10"
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                        ⚠ {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3.5 justify-center"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                        : <><RefreshCw className="w-4 h-4" /> Resend Verification Email</>
                      }
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-tcm-gray-mid">
                    Already verified?{' '}
                    <Link to="/sign-in" className="text-tcm-orange font-bold hover:underline">
                      Sign In
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          <ITSupport variant="card" />
        </div>
      </main>
      <Footer />
    </div>
  );
};
