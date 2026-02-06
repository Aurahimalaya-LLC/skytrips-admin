
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface AirlineAgency {
  uid: string;
  agency_name: string;
  iata_code: string;
  commission_rate: number;
  commission_type: 'PERCENTAGE' | 'FIXED';
}

export function useAirlineAgencies(airlineCode: string) {
  const [agencies, setAgencies] = useState<AirlineAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgencies = useCallback(async () => {
    if (!airlineCode) {
      setAgencies([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch commissions for this airline and join with agency details
      const { data, error } = await supabase
        .from("airline_commissions")
        .select(`
          value,
          commission_type,
          agencies!inner (
            uid,
            agency_name,
            iata_code
          )
        `)
        .eq("airline_iata", airlineCode)
        .eq("status", "ACTIVE")
        .returns<Array<{
          value: number;
          commission_type: 'PERCENTAGE' | 'FIXED';
          agencies: {
            uid: string;
            agency_name: string;
            iata_code: string;
          }
        }>>();

      if (error) throw error;

      const formatted: AirlineAgency[] = (data || []).map((item) => ({
        uid: item.agencies.uid,
        agency_name: item.agencies.agency_name,
        iata_code: item.agencies.iata_code || 'N/A',
        commission_rate: Number(item.value),
        commission_type: item.commission_type
      }));

      // Sort by commission rate descending (best deals first)
      formatted.sort((a, b) => b.commission_rate - a.commission_rate);

      setAgencies(formatted);
      setError(null);
    } catch (err) {
      console.error("Error fetching airline agencies:", err);
      setError("Failed to load agencies for this airline");
    } finally {
      setLoading(false);
    }
  }, [airlineCode]);

  useEffect(() => {
    fetchAgencies();

    // Subscribe to changes in airline_commissions
    const channel = supabase
      .channel(`airline_commissions:${airlineCode}`)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "airline_commissions",
          filter: `airline_iata=eq.${airlineCode}`
        },
        () => {
          fetchAgencies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAgencies, airlineCode]);

  return { agencies, loading, error };
}
