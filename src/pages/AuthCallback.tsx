import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

type Status = 'processing' | 'success' | 'error';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status,  setStatus]  = useState<Status>('processing');
  const [message, setMessage] = useState('Verifying your account…');

  useEffect(() => {
    const handle = async () => {
      try {
        // Supabase appends tokens to the URL hash (#) or as query params (?).
        // exchangeCodeForSession handles PKCE flows (query param `code`).
        // For hash-based flows, onAuthStateChange fires automatically.
        const params = new URLSearchParams(window.location.search);
        const code   = params.get('code');
        const type   = params.get('type'); // 'recovery' | 'signup' | 'magiclink'

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Now check session to understand what just happened
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Hash-based token — Supabase handles it automatically via
          // onAuthStateChange; give it a moment then check again.
          await new Promise(r => setTimeout(r, 1500));
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (!s2) throw new Error('Could not establish session. The link may have expired.');
        }

        // Route based on link type
        if (type === 'recovery') {
          setStatus('success');
          setMessage('Password reset verified. Redirecting…');
          setTimeout(() => navigate('/reset-password'), 1500);
        } else {
          // signup confirmation or magic link
          setStatus('success');
          setMessage('Email verified! Welcome to TCM. Redirecting to your profile…');
          setTimeout(() => navigate('/profile'), 2000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err?.message?.includes('expired')
            ? 'This verification link has expired. Please request a new one.'
            : err?.message || 'Verification failed. The link may be invalid or already used.'
        );
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
                <img src="/assets/logo/tcm-logo.jpg" alt="TCM" className="w-full h-full object-cover" />
              </div>

              {status === 'processing' && (
                <>
                  <Loader2 className="w-12 h-12 text-tcm-gold animate-spin mx-auto mb-5" />
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-2">
                    Verifying…
                  </h2>
                  <p className="text-tcm-gray-mid text-sm">{message}</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-5" />
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-2">
                    Verified!
                  </h2>
                  <p className="text-tcm-gray-mid text-sm">{message}</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-5" />
                  <h2 className="text-2xl font-black text-tcm-navy tracking-tight mb-3">
                    Verification Failed
                  </h2>
                  <p className="text-tcm-gray-mid text-sm mb-6">{message}</p>
                  <div className="flex flex-col gap-3">
                    <a
                      href="/resend-verification"
                      className="btn-primary w-full justify-center py-3"
                    >
                      Resend Verification Email
                    </a>
                    <a
                      href="/sign-in"
                      className="btn-outline-navy w-full justify-center py-3"
                    >
                      Back to Sign In
                    </a>
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
