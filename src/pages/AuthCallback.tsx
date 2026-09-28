import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

type Status = 'processing' | 'success' | 'error';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status,  setStatus]  = useState<Status>('processing');
  const [message, setMessage] = useState('Verifying your account…');
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const handle = async () => {
      try {
        // ── Read both query params AND hash fragment ──────────────────
        // Supabase uses two different flows:
        //   PKCE flow  → ?code=xxxx                  (newer)
        //   Implicit   → #access_token=xxx&type=xxx  (older / email links)
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams  = new URLSearchParams(
          window.location.hash.replace('#', '')
        );

        const code        = queryParams.get('code');
        const errorParam  = queryParams.get('error');
        const errorDesc   = queryParams.get('error_description');

        // Check for explicit error in URL (e.g. expired link)
        if (errorParam) {
          throw new Error(
            errorDesc?.replace(/\+/g, ' ') ||
            'Verification failed. The link may have expired.'
          );
        }

        // ── Handle PKCE flow (code in query string) ───────────────────
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // ── Handle implicit flow (tokens in hash) ─────────────────────
        // Supabase JS client detects the hash automatically when you
        // call getSession() — we just need to wait a moment for it.
        if (!code && hashParams.get('access_token')) {
          // Give the Supabase client time to process the hash tokens
          await new Promise(r => setTimeout(r, 800));
        }

        // ── Get the session (works for both flows) ────────────────────
        const { data: { session }, error: sessionErr } =
          await supabase.auth.getSession();

        if (sessionErr) throw sessionErr;

        if (!session) {
          // Wait a bit more and try again — sometimes it takes a moment
          await new Promise(r => setTimeout(r, 1500));
          const { data: { session: session2 } } =
            await supabase.auth.getSession();

          if (!session2) {
            throw new Error(
              'Could not verify your account. The link may have expired or already been used.'
            );
          }
        }

        // ── Determine what type of link this was ──────────────────────
        const type = queryParams.get('type') ||
                     hashParams.get('type')   ||
                     '';

        const isPasswordReset = type === 'recovery';
        setIsRecovery(isPasswordReset);

        if (isPasswordReset) {
          setStatus('success');
          setMessage('Identity verified. Redirecting to set your new password…');
          setTimeout(() => navigate('/reset-password'), 1800);
        } else {
          // Email confirmation (signup or email change)
          setStatus('success');
          setMessage(
            'Your email has been verified! Welcome to Transform Christian Ministries.'
          );
          setTimeout(() => navigate('/profile'), 2500);
        }

      } catch (err: any) {
        console.error('[AuthCallback] Error:', err);
        const raw = err?.message || '';

        let friendlyMessage = 'Verification failed. Please try again.';

        if (raw.includes('expired') || raw.includes('invalid'))
          friendlyMessage = 'This link has expired or is invalid. Please request a new verification email.';
        else if (raw.includes('already') || raw.includes('used'))
          friendlyMessage = 'This link has already been used. If your email is verified, just sign in.';
        else if (raw.includes('network') || raw.includes('fetch'))
          friendlyMessage = 'Network error. Please check your connection and try again.';
        else if (raw)
          friendlyMessage = raw;

        setStatus('error');
        setMessage(friendlyMessage);
      }
    };

    handle();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
            <div className="p-10 text-center">

              {/* Logo */}
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/40 mx-auto mb-8">
                <img
                  src="/assets/logo/tcm-logo.jpg"
                  alt="Transform Christian Ministries"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Processing */}
              {status === 'processing' && (
                <>
                  <Loader2 className="w-12 h-12 text-tcm-gold animate-spin mx-auto mb-5" />
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-2">
                    Verifying…
                  </h2>
                  <p className="text-tcm-gray-mid text-sm leading-relaxed">
                    Please wait while we verify your account.
                    <br />Do not close this page.
                  </p>
                </>
              )}

              {/* Success */}
              {status === 'success' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-9 h-9 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-3">
                    {isRecovery ? 'Identity Verified!' : 'Email Verified!'}
                  </h2>
                  <p className="text-tcm-gray-mid text-sm leading-relaxed mb-4">
                    {message}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 text-tcm-gold animate-spin" />
                    <span className="text-tcm-gray-mid text-xs">Redirecting you now…</span>
                  </div>
                </>
              )}

              {/* Error */}
              {status === 'error' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
                    <XCircle className="w-9 h-9 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-3">
                    Verification Failed
                  </h2>
                  <p className="text-tcm-gray-mid text-sm leading-relaxed mb-6">
                    {message}
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/resend-verification"
                      className="btn-primary w-full justify-center py-3 inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Request New Verification Email
                    </Link>
                    <Link
                      to="/sign-in"
                      className="btn-outline-navy w-full justify-center py-3 inline-flex"
                    >
                      Back to Sign In
                    </Link>
                  </div>

                  {/* IT Support */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-tcm-gray-mid text-xs leading-relaxed">
                      Still having trouble? Contact IT Admin{' '}
                      <strong className="text-tcm-navy">Aaron Akizza</strong>
                      {' '}on{' '}
                      <a
                        href="https://wa.me/256774720129"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 font-semibold hover:underline"
                      >
                        WhatsApp 0774720129
                      </a>
                      {' '}or{' '}
                      <a
                        href="mailto:aaronakizza@gmail.com"
                        className="text-tcm-orange font-semibold hover:underline"
                      >
                        aaronakizza@gmail.com
                      </a>
                    </p>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
