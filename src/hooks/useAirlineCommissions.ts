
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface CommissionDetails {
  id: string;
  agency_uid: string;
  airline_name: string;
  airline_iata: string;
  commission_type: 'PERCENTAGE' | 'FIXED';
  value: number;
  class_type?: string;
  origin?: string;
  destination?: string;
  updated_at: string;
}

export function useAirlineCommissions(airlineCode: string | undefined) {
  const [commissions, setCommissions] = useState<Record<string, CommissionDetails>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    if (!airlineCode) {
      setCommissions({});
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("airline_commissions")
        .select("*")
        .eq("airline_iata", airlineCode)
        .eq("status", "ACTIVE");

      if (error) throw error;

      // Map by agency_uid for easy lookup
      const map: Record<string, CommissionDetails> = {};
      data?.forEach((item: any) => {
        // If multiple exist, maybe take the most specific or most recent?
        // For now, we just overwrite, assuming one active rule per airline per agency for simplicity
        // or we could store an array if needed.
        map[item.agency_uid] = {
            id: item.id,
            agency_uid: item.agency_uid,
            airline_name: item.airline_name,
            airline_iata: item.airline_iata,
            commission_type: item.commission_type,
            value: Number(item.value),
            class_type: item.class_type,
            origin: item.origin,
            destination: item.destination,
            updated_at: item.updated_at
        };
      });

      setCommissions(map);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching airline commissions:", err);
      setError("Failed to load commission details");
    } finally {
      setLoading(false);
    }
  }, [airlineCode]);

  useEffect(() => {
    fetchCommissions();
    
    if (!airlineCode) return;

    // Real-time subscription
    const channel = supabase
      .channel(`commissions:${airlineCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "airline_commissions",
          filter: `airline_iata=eq.${airlineCode}`
        },
        () => {
          fetchCommissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCommissions, airlineCode]);

  return { commissions, loading, error };
}
