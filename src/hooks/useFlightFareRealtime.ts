import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useFlightFareRealtime(onUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('flight_fares_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flight_fares',
        },
        (payload) => {
          console.log('Realtime change detected:', payload);
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}
