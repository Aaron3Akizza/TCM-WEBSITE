import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }    from '../components/layout/Navbar';
import { Footer }    from '../components/layout/Footer';
import { ITSupport } from '../components/ui/ITSupport';
import { supabase }  from '../lib/supabase';
import { isValidEmail } from '../lib/utils';
import {
  Mail, Lock, ArrowRight, Eye, EyeOff,
  Loader2, AlertTriangle, RefreshCw,
} from 'lucide-react';

/* ── Map raw Supabase errors to friendly messages ── */
function friendlyError(raw: string): { msg: string; isUnverified: boolean } {
  const r = raw.toLowerCase();

  if (r.includes('invalid login credentials') || r.includes('invalid credentials'))
    return { msg: 'Incorrect email or password. Please check and try again.', isUnverified: false };

  if (r.includes('email not confirmed') || r.includes('not confirmed'))
    return {
      msg: 'Your email address has not been verified yet. Please check your inbox (and spam/junk folder) for the verification email.',
      isUnverified: true,
    };

  if (r.includes('too many requests') || r.includes('rate limit'))
    return { msg: 'Too many attempts. Please wait a few minutes before trying again.', isUnverified: false };

  if (r.includes('user not found') || r.includes('no user'))
    return { msg: 'No account found with that email address. Please check your email or register.', isUnverified: false };

  if (r.includes('network') || r.includes('fetch'))
    return { msg: 'Network error. Please check your internet connection and try again.', isUnverified: false };

  return { msg: raw, isUnverified: false };
}

/* ── ForgotPassword inline panel ── */
const ForgotPassword: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [err,     setErr]     = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!isValidEmail(email)) { setErr('Please enter a valid email address.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/auth/callback?type=recovery` }
    );
    setLoading(false);
    if (error) { setErr(error.message || 'Failed to send reset email.'); return; }
    setSent(true);
  };

  return (
    <div className="bg-tcm-gray-soft border border-tcm-gold/20 rounded-2xl p-5">
      {sent ? (
        <div>
          <p className="font-bold text-tcm-navy text-sm mb-1">Reset Email Sent!</p>
          <p className="text-tcm-gray-dark text-xs leading-relaxed mb-1">
            Check your inbox for a password reset link. Also check your{' '}
            <strong>Spam / Junk</strong> folder if you don't see it within a
            few minutes.
          </p>
          <p className="text-tcm-gray-mid text-xs">The link expires in 1 hour.</p>
        </div>
      ) : (
        <form onSubmit={send} noValidate>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-tcm-navy text-sm">Reset your password</p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-tcm-gray-mid hover:text-tcm-navy transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-tcm-gray-mid text-xs mb-4">
            Enter the email you registered with and we'll send you a reset link.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              autoComplete="email"
              className="input-field flex-1 text-sm py-2.5"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-4 py-2.5 text-xs flex-shrink-0"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : 'Send'
              }
            </button>
          </div>
          {err && (
            <p className="text-red-500 text-xs font-medium mt-2">⚠ {err}</p>
          )}
        </form>
      )}
    </div>
  );
};

/* ── Main SignIn page ── */
export const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [isUnverified,setIsUnverified]= useState(false);
  const [showForgot,  setShowForgot]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email:    email.trim().toLowerCase(),
        password,
      });

      if (err) {
        const { msg, isUnverified: unv } = friendlyError(err.message);
        setError(msg);
        setIsUnverified(unv);
      } else if (data.user) {
        navigate('/profile');
      }
    } catch (err: any) {
      const { msg } = friendlyError(err?.message || 'Something went wrong.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-4">

          {/* ── Card ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
            <div className="p-8 md:p-10">

              {/* Logo */}
              <div className="flex justify-center mb-7">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/40 shadow-gold">
                  <img
                    src="/assets/logo/tcm-logo.jpg"
                    alt="Transform Christian Ministries"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h1 className="text-3xl font-black text-tcm-navy text-center tracking-tight mb-1">
                Welcome Back
              </h1>
              <p className="text-tcm-gray-mid text-sm text-center mb-8">
                Sign in to your TCM member account
              </p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="signin-email" className="text-sm font-semibold text-tcm-navy">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                    <input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); setIsUnverified(false); }}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      autoComplete="email"
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signin-password" className="text-sm font-semibold text-tcm-navy">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowForgot(v => !v); setError(''); setIsUnverified(false); }}
                      className="text-xs text-tcm-orange hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                    <input
                      id="signin-password"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Your password"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                      className="input-field pl-10 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password inline panel */}
                {showForgot && (
                  <ForgotPassword onClose={() => setShowForgot(false)} />
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-600 text-sm font-medium leading-snug">
                          {error}
                        </p>
                        {/* Unverified: show resend + instructions */}
                        {isUnverified && (
                          <div className="mt-3 space-y-2">
                            <Link
                              to="/resend-verification"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-tcm-orange hover:underline"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Resend verification email
                            </Link>
                            <p className="text-red-500/80 text-xs">
                              Remember to check your <strong>Spam / Junk</strong> folder.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 justify-center"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                    : <>Sign In <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              {/* Register link */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-tcm-gray-mid">
                Not a member yet?{' '}
                <Link to="/membership" className="text-tcm-orange font-bold hover:underline">
                  Register here
                </Link>
              </div>
            </div>
          </div>

          {/* IT Support */}
          <ITSupport variant="card" />

        </div>
      </main>
      <Footer />
    </div>
  );
};
