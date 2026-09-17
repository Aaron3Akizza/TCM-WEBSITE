import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '../../lib/utils';

export const EventsPreview: React.FC = () => {
  const { events, loading } = useEvents();
  const preview = events.slice(0, 3);

  return (
    <section className="section-padding bg-tym-slate relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tym-crimson/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="label-tag [&::before]:bg-white text-white mb-4 block">Upcoming Events</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              What's Happening
              <br />
              <span className="text-gradient bg-gradient-to-r from-tym-crimson to-red-400 bg-clip-text text-transparent">
                in TCM
              </span>
            </h2>
          </div>
          <Link to="/events">
            <Button variant="outline-light" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
              All Events
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner light />
        ) : preview.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/40 text-lg">No upcoming events right now.</p>
            <p className="text-white/25 text-sm mt-2">Check back soon — something is always brewing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {preview.map((event, i) => (
              <Link
                key={event.id}
                to={`/events/${event.slug}`}
                className="group block"
              >
                <article className="h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-tym-crimson/40 transition-all duration-300 hover:-translate-y-1">
                  {/* Top accent */}
                  <div className={`h-1 ${i === 0 ? 'bg-tym-crimson' : 'bg-white/10 group-hover:bg-tym-crimson/60'} transition-colors duration-300`} />

                  <div className="p-6">
                    {/* Date badge */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-tym-crimson/20 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-tym-crimson" />
                      </div>
                      <span className="text-xs font-bold text-white/60 uppercase tracking-widest">
                        {formatDate(event.event_date)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-tym-crimson transition-colors duration-200 leading-snug">
                      {event.title}
                    </h3>

                    {event.short_description && (
                      <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-2">
                        {event.short_description}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                      {event.start_time && (
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatTime(event.start_time)}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
