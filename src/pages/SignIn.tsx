import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from '../lib/auth';

export const SignIn: React.FC = () => {
  const navigate                    = useNavigate();
  const [email,    setEmail]        = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd,  setShowPwd]      = useState(false);
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { user, error: err } = await signIn(email, password);
      if (err) setError(err.message);
      else if (user) navigate('/profile');
    } catch (err: any) { setError(err.message || 'An error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tcm-gray-soft flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-tcm-navy via-tcm-gold to-tcm-orange" />
            <div className="p-8 md:p-10">
              <div className="flex justify-center mb-7">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-tcm-gold/40 shadow-gold">
                  <img src="/assets/logo/tcm-logo.jpg" alt="TCM" className="w-full h-full object-cover" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-tcm-navy text-center tracking-tight mb-1">Welcome Back</h1>
              <p className="text-tcm-gray-mid text-sm text-center mb-8">Sign in to your TCM account</p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-tcm-navy">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" required disabled={loading} autoComplete="email"
                      className="input-field pl-10" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-semibold text-tcm-navy">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tcm-gray-mid pointer-events-none" />
                    <input id="password" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Your password" required disabled={loading} autoComplete="current-password"
                      className="input-field pl-10 pr-11" />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tcm-gray-mid hover:text-tcm-navy transition-colors"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}>
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">⚠ {error}</div>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 justify-center">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-tcm-gray-mid">
                Don't have an account?{' '}
                <Link to="/membership" className="text-tcm-orange font-bold hover:underline">Become a Member</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
