import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { getEventBySlug, registerForEvent, isUserRegisteredForEvent } from '../hooks/useEvents';
import { formatDate, formatTime } from '../lib/utils';import { Calendar, Clock, MapPin, CheckCircle2, ArrowLeft, Users } from 'lucide-react';
import type { Event } from '../types';

export const EventDetails: React.FC = () => {
  const { slug }                          = useParams<{ slug: string }>();
  const navigate                          = useNavigate();
  const { user }                          = useAuth();
  const [event,       setEvent]           = useState<Event | null>(null);
  const [loading,     setLoading]         = useState(true);
  const [registered,  setRegistered]      = useState(false);
  const [registering, setRegistering]     = useState(false);
  const [regMessage,  setRegMessage]      = useState('');
  const [regError,    setRegError]        = useState('');

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await getEventBySlug(slug);
      setEvent(data);
      if (data && user) {
        const isReg = await isUserRegisteredForEvent(data.id, user.id);
        setRegistered(isReg);
      }
      setLoading(false);
    };
    load();
  }, [slug, user]);

  const handleRegister = async () => {
    if (!user) { navigate('/sign-in'); return; }
    if (!event) return;
    setRegistering(true);
    setRegError('');
    try {
      const { error } = await registerForEvent(event.id, user.id);
      if (error) { setRegError('Could not register. Please try again.'); }
      else { setRegistered(true); setRegMessage('You\'re registered! See you there.'); }
    } catch {
      setRegError('Something went wrong. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px]"><LoadingSpinner /></main>
      <Footer />
    </div>
  );

  if (!event) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px] flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-3xl font-black text-tym-slate mb-3">Event not found</h2>
          <p className="text-gray-500 mb-6">This event may have been removed or the link is incorrect.</p>
          <Link to="/events"><Button variant="primary">View All Events</Button></Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <header className="relative pt-[72px]">
        <div className="relative h-64 md:h-80 bg-tym-slate overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10 h-full flex items-end max-w-7xl mx-auto px-4 md:px-8 pb-8">
            <div>
              <Link to="/events" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-semibold mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Events
              </Link>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{event.title}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-tym-bg">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Main content ── */}
            <article className="lg:col-span-2">
              {/* Meta chips */}
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-sm font-semibold text-tym-slate shadow-sm">
                  <Calendar className="w-4 h-4 text-tym-crimson" />
                  {formatDate(event.event_date)}
                </span>
                {event.start_time && (
                  <span className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-sm font-semibold text-tym-slate shadow-sm">
                    <Clock className="w-4 h-4 text-tym-crimson" />
                    {formatTime(event.start_time)}
                    {event.end_time && ` – ${formatTime(event.end_time)}`}
                  </span>
                )}
                {event.location && (
                  <span className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-sm font-semibold text-tym-slate shadow-sm">
                    <MapPin className="w-4 h-4 text-tym-crimson" />
                    {event.location}
                  </span>
                )}
              </div>

              {event.description && (
                <div className="bg-white rounded-2xl p-8 border border-gray-100">
                  <h2 className="text-xl font-bold text-tym-slate mb-4">About this Event</h2>
                  <p className="text-gray-500 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </article>

            {/* ── Registration sidebar ── */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-tym-crimson/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-tym-crimson" />
                  </div>
                  <div>
                    <p className="font-bold text-tym-slate text-sm">Registration</p>
                    <p className="text-gray-400 text-xs">
                      {event.registration_required ? 'Required for this event' : 'Open to all'}
                    </p>
                  </div>
                </div>

                {registered ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-green-700 text-sm">You're registered!</p>
                      {regMessage && <p className="text-green-600 text-xs mt-0.5">{regMessage}</p>}
                    </div>
                  </div>
                ) : (
                  <>
                    {regError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <p className="text-red-600 text-sm font-medium">{regError}</p>
                      </div>
                    )}
                    {user ? (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        isLoading={registering}
                        onClick={handleRegister}
                      >
                        Register Now
                      </Button>
                    ) : (
                      <div>
                        <p className="text-gray-400 text-sm mb-4">Sign in to register for this event.</p>
                        <Link to="/sign-in">
                          <Button variant="primary" size="lg" className="w-full">Sign In to Register</Button>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </aside>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
