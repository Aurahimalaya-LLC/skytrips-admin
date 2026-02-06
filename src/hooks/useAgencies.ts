import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Agency {
  uid: string;
  agency_name: string;
  commission_rate: number;
  status: string;
  iata_code?: string;
}

export function useAgencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      
      // Try fetching from API first (Bypasses RLS issues)
      const response = await fetch('/api/agencies?pageSize=100&status=active');
      if (response.ok) {
        const result = await response.json();
        const formatted: Agency[] = (result.data || []).map((a: any) => ({
          uid: a.uid,
          agency_name: a.agency_name,
          commission_rate: typeof a.commission_rate === 'number' ? a.commission_rate : 2.5,
          status: a.status,
          iata_code: a.iata_code || ''
        }));
        setAgencies(formatted);
        setError(null);
        return;
      }

      // Fallback to direct Supabase query if API fails
      // We try to fetch commission_rate. If it doesn't exist in DB yet, 
      // this might throw or return null. We'll handle data transformation below.
      const { data, error } = await supabase
        .from("agencies")
        .select("uid, agency_name, status, commission_rate, iata_code")
        .eq("status", "active")
        .order("agency_name");

      if (error) throw error;

      // Transform data to ensure commission_rate exists (fallback to 2.5 if missing/null)
      const formatted: Agency[] = (data || []).map((a: any) => ({
        uid: a.uid,
        agency_name: a.agency_name,
        commission_rate: typeof a.commission_rate === 'number' ? a.commission_rate : 2.5,
        status: a.status,
        iata_code: a.iata_code || ''
      }));

      setAgencies(formatted);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching agencies:", err);
      // Fallback for demo purposes if table structure doesn't match
      // 42703 is Postgres code for undefined_column
      if (err.code === 'PGRST204' || err.code === '42703' || err.message?.includes('commission_rate')) {
         // Column might be missing, try fetching without it
         try {
            const { data } = await supabase.from("agencies").select("uid, agency_name, status, iata_code").eq("status", "active");
            const fallback = (data || []).map((a: any) => ({
                uid: a.uid,
                agency_name: a.agency_name,
                commission_rate: 2.5, // Default
                status: a.status,
                iata_code: a.iata_code || ''
            }));
            setAgencies(fallback);
            setError(null); // Clear error if fallback succeeds
         } catch (retryErr) {
             setError("Failed to load agencies");
         }
      } else {
        setError(err.message || "Failed to load agencies");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();

    // Real-time subscription
    const channel = supabase
      .channel("public:agencies")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agencies" },
        (payload) => {
          // Simple strategy: refetch all on any change to keep sort order and consistency
          // Optimizations can be applied for large datasets
          fetchAgencies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { agencies, loading, error };
}
