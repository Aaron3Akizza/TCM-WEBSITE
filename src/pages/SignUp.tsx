import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signUp } from '../lib/auth';

export const SignUp: React.FC = () => {
  const navigate                            = useNavigate();
  const [fullName,        setFullName]      = useState('');
  const [email,           setEmail]         = useState('');
  const [password,        setPassword]      = useState('');
  const [confirmPassword, setConfirm]       = useState('');
  const [loading,         setLoading]       = useState(false);
  const [error,           setError]         = useState('');
  const [success,         setSuccess]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { user, error: err } = await signUp(email, password, fullName);
      if (err) { setError(err.message); }
      else if (user) { setSuccess(true); }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px] bg-tym-bg flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-tym-crimson to-red-400" />

            <div className="p-8 md:p-10">
              {success ? (
                <div className="text-center py-6 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-black text-tym-slate">Account Created!</h2>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Check your email to verify your account, then sign in to get started.
                  </p>
                  <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}
                    onClick={() => navigate('/sign-in')}>
                    Go to Sign In
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-tym-slate flex items-center justify-center">
                      <span className="text-white font-black text-sm tracking-wider">TCM</span>
                    </div>
                  </div>

                  <h1 className="text-3xl font-black text-tym-slate text-center tracking-tight mb-1">
                    Join TCM
                  </h1>
                  <p className="text-gray-400 text-sm text-center mb-8">
                    Create your account and join the movement
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input label="Full Name" placeholder="Your full name"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      iconLeft={<User className="w-4 h-4" />} required disabled={loading} />

                    <Input label="Email" type="email" placeholder="your@email.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      iconLeft={<Mail className="w-4 h-4" />} required disabled={loading} />

                    <Input label="Password" type="password" placeholder="At least 6 characters"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      iconLeft={<Lock className="w-4 h-4" />} required disabled={loading} />

                    <Input label="Confirm Password" type="password" placeholder="Repeat your password"
                      value={confirmPassword} onChange={(e) => setConfirm(e.target.value)}
                      iconLeft={<Lock className="w-4 h-4" />} required disabled={loading} />

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
                        ⚠ {error}
                      </div>
                    )}

                    <Button type="submit" variant="primary" size="lg" isLoading={loading}
                      iconRight={<ArrowRight className="w-4 h-4" />} className="w-full">
                      Create Account
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/sign-in" className="text-tym-crimson font-bold hover:underline">
                      Sign in
                    </Link>
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
