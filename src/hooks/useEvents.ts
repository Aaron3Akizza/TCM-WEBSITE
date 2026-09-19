import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types';

interface UseEventsReturn {
  events:  Event[];
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useEvents(): UseEventsReturn {
  const [events,  setEvents]  = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0); // increment to trigger a refetch

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error: err } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', today)
          .order('event_date', { ascending: true });

        if (cancelled) return;

        if (err) {
          setError(err.message);
        } else {
          setEvents((data as Event[]) ?? []);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Failed to fetch events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((n) => n + 1), []);

  return { events, loading, error, refetch };
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }
  return (data as Event) ?? null;
}

export async function registerForEvent(
  eventId: string,
  userId:  string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from('event_registrations')
    .insert([{ event_id: eventId, user_id: userId }]);
  return { error };
}

export async function isUserRegisteredForEvent(
  eventId: string,
  userId:  string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle(); // avoids throwing when no row found

  if (error) return false;
  return !!data;
}
