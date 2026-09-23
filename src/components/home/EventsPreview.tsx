import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { formatTime } from '../../lib/utils';

function parseLocalDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const EventsPreview: React.FC = () => {
  const { events, loading } = useEvents();
  const preview = events.slice(0, 3);

  return (
    <section className="section-pad bg-navy-gradient relative overflow-hidden" aria-label="Upcoming events">
      <div className="absolute inset-0 dot-grid" />
      <div className="container-tcm relative z-10">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="label-tag-light mb-4 block">Upcoming Events</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              What's Happening<br />
              <span className="text-gold-gradient">in TCM</span>
            </h2>
          </div>
          <Link to="/events" className="btn-outline-gold flex-shrink-0 self-start md:self-auto">
            All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? <LoadingSpinner light /> : preview.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/40 text-lg">No upcoming events right now.</p>
            <p className="text-white/25 text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {preview.map((event, i) => {
              const d = parseLocalDate(event.event_date);
              return (
                <Link key={event.id} to={`/events/${event.slug}`} className="group block">
                  <article className="h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-tcm-gold/40 transition-all duration-300 hover:-translate-y-1">
                    <div className={`h-1 ${i === 0 ? 'bg-tcm-gold' : 'bg-white/10 group-hover:bg-tcm-gold/50'} transition-colors duration-300`} />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-tcm-gold/15 border border-tcm-gold/30 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-tcm-gold text-[10px] font-bold uppercase">{d.toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-white font-black text-lg leading-none">{d.getDate()}</span>
                        </div>
                        <div>
                          {event.start_time && (
                            <div className="flex items-center gap-1 text-[11px] text-white/45">
                              <Clock className="w-3 h-3" />{formatTime(event.start_time)}
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 text-[11px] text-white/45 mt-0.5">
                              <MapPin className="w-3 h-3" /><span className="truncate max-w-[130px]">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-tcm-gold transition-colors duration-200 leading-snug">
                        {event.title}
                      </h3>
                      {event.short_description && (
                        <p className="text-white/45 text-sm leading-relaxed line-clamp-2">{event.short_description}</p>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
