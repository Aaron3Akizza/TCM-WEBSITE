import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { signIn } from '../lib/auth';

export const SignIn: React.FC = () => {
  const navigate                    = useNavigate();
  const [email,    setEmail]        = useState('');
  const [password, setPassword]     = useState('');
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, error: err } = await signIn(email, password);
      if (err) { setError(err.message); }
      else if (user) { navigate('/profile'); }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[68px] bg-tym-bg flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-tym-crimson to-red-400" />

            <div className="p-8 md:p-10">
              {/* Logo mark */}
              <div className="flex justify-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-tym-slate flex items-center justify-center">
                  <span className="text-white font-black text-sm tracking-wider">TCM</span>
                </div>
              </div>

              <h1 className="text-3xl font-black text-tym-slate text-center tracking-tight mb-1">
                Welcome Back
              </h1>
              <p className="text-gray-400 text-sm text-center mb-8">
                Sign in to your TCM account
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  iconLeft={<Mail className="w-4 h-4" />}
                  required
                  disabled={loading}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconLeft={<Lock className="w-4 h-4" />}
                  required
                  disabled={loading}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                    ⚠ {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  iconRight={<ArrowRight className="w-4 h-4" />}
                  className="w-full"
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-tym-crimson font-bold hover:underline">
                  Create one
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="hover:text-tym-crimson transition-colors">Terms</a>
            {' '}and{' '}
            <a href="#" className="hover:text-tym-crimson transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
