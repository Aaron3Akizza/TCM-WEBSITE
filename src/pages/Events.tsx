import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useEvents } from '../hooks/useEvents';
import { formatTime } from '../lib/utils';

/** Parse a YYYY-MM-DD string as local midnight to avoid UTC day-shift. */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export const Events: React.FC = () => {
  const { events, loading } = useEvents();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Banner */}
      <header className="relative pt-[68px]">
        <div className="relative h-64 md:h-72 bg-tcm-navy overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-4 md:px-8">
            <div>
              <span className="label-tag [&::before]:bg-white text-white mb-3 block">Calendar</span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">Upcoming Events</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-tym-bg">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
          {loading ? (
            <LoadingSpinner />
          ) : events.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-tcm-navy mb-2">No upcoming events</h3>
              <p className="text-gray-400 text-sm">Check back soon — something is always brewing.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group block"
                >
                  <article className="bg-white rounded-2xl border border-gray-100 hover:border-tcm-orange/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Date sidebar */}
                      <div className="md:w-28 bg-tcm-navy flex-shrink-0 flex flex-col items-center justify-center py-6 md:py-8 px-4">
                        <span className="text-tcm-orange text-xs font-black uppercase tracking-widest mb-1">
                          {parseLocalDate(event.event_date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-white text-4xl font-black leading-none">
                          {parseLocalDate(event.event_date).getDate()}
                        </span>
                        <span className="text-white/40 text-xs mt-1">
                          {parseLocalDate(event.event_date).getFullYear()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-tcm-navy mb-2 group-hover:text-tcm-orange transition-colors duration-200">
                            {event.title}
                          </h3>
                          {event.short_description && (
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">
                              {event.short_description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4">
                            {event.start_time && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatTime(event.start_time)}</span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-tcm-orange group-hover:gap-3 transition-all duration-200">
                            View Details <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
