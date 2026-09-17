import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Phone, Shield, Calendar, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate               = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate('/sign-in');
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px]"><LoadingSpinner /></main>
      <Footer />
    </div>
  );

  if (!user) return null;

  const fields = [
    { icon: User,     label: 'Full Name',   value: profile?.full_name ?? user.email?.split('@')[0] ?? '—' },
    { icon: Mail,     label: 'Email',       value: user.email ?? '—' },
    { icon: Phone,    label: 'Phone',       value: profile?.phone ?? 'Not provided' },
    { icon: Shield,   label: 'Role',        value: profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Member' },
    { icon: Calendar, label: 'Member Since',value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-[72px] bg-tym-bg">
        {/* Header */}
        <div className="bg-tym-slate py-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="max-w-3xl mx-auto px-4 md:px-8 relative z-10 flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-tym-crimson flex items-center justify-center flex-shrink-0 shadow-xl glow-crimson">
              <span className="text-white font-black text-2xl">
                {(profile?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Your Profile</p>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {profile?.full_name ?? 'Welcome Back'}
              </h1>
              <span className="inline-flex items-center gap-1.5 mt-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold text-white/80">
                <Shield className="w-3 h-3 text-tym-crimson" />
                {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile card */}
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-tym-slate">Account Details</h2>
              <span className="text-xs text-gray-400 font-medium">Edit profile coming soon</span>
            </div>
            <div className="divide-y divide-gray-50">
              {fields.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-5 px-8 py-5">
                  <div className="w-9 h-9 rounded-xl bg-tym-bg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-tym-crimson" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="font-semibold text-tym-slate text-sm truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              size="md"
              iconLeft={<LogOut className="w-4 h-4" />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
