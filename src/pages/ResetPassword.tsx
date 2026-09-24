import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar }  from '../components/layout/Navbar';
import { Footer }  from '../components/layout/Footer';
import { ITSupport } from '../components/ui/ITSupport';
import { supabase }  from '../lib/supabase';
import { Eye, EyeOff, Loader2, CheckCircle2, Lock } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showPwd2,  setShowPwd2]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');
  const [hasSession, setHasSession] = useState(false);
  const [checking,   setChecking]   = useState(true);

  // Verify we have an active recovery session before showing the form
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setChecking(false);
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== password2) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/sign-in'), 3000);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-tcm-gold animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange rounded-full mb-8" />
            <Lock className="w-10 h-10 text-tcm-gray-mid mx-auto mb-4" />
            <h2 className="text-2xl font-black text-tcm-navy mb-3">Link Expired or Invalid</h2>
            <p className="text-tcm-gray-mid text-sm leading-relaxed mb-6">
              This password reset link has expired or has already been used.
              Please request a new one from the sign-in page.
            </p>
            <Link to="/sign-in" className="btn-primary inline-flex px-8 py-3">
              Back to Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                <div className="text-center py-4">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-5" />
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-2">
                    Password Updated!
                  </h2>
                  <p className="text-tcm-gray-mid text-sm">
                    Your password has been changed successfully.
                    Redirecting you to sign in…
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-tcm-navy text-center tracking-tight mb-1">
                    Set New Password
                  </h1>
                  <p className="text-tcm-gray-mid text-sm text-center mb-8">
                    Choose a strong password for your TCM account.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="new-password" className="text-sm font-semibold text-tcm-navy">
                        New Password <span className="text-tcm-orange">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                        <input
                          id="new-password"
                          type={showPwd ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          required
                          autoComplete="new-password"
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

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="confirm-password" className="text-sm font-semibold text-tcm-navy">
                        Confirm Password <span className="text-tcm-orange">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                        <input
                          id="confirm-password"
                          type={showPwd2 ? 'text' : 'password'}
                          value={password2}
                          onChange={e => setPassword2(e.target.value)}
                          placeholder="Repeat your new password"
                          required
                          autoComplete="new-password"
                          className="input-field pl-10 pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd2(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                          aria-label={showPwd2 ? 'Hide password' : 'Show password'}
                        >
                          {showPwd2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
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
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                        : 'Update Password'
                      }
                    </button>
                  </form>
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
