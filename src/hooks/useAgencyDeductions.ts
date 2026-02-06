
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export interface AgencyDeduction {
  id: string;
  agency_uid: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  created_at: string;
}

export function useAgencyDeductions(agencyUid: string | null | undefined, category: string = 'SQ') {
  const [deductions, setDeductions] = useState<AgencyDeduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeductions = async () => {
    if (!agencyUid) {
      setDeductions([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("agency_deductions")
        .select("*")
        .eq("agency_uid", agencyUid)
        .eq("category", category);

      if (error) throw error;

      setDeductions(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching agency deductions:", err);
      setError("Failed to load deductions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeductions();

    if (!agencyUid) return;

    // Real-time subscription
    const channel = supabase
      .channel(`agency_deductions:${agencyUid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agency_deductions",
          filter: `agency_uid=eq.${agencyUid}`
        },
        () => {
          fetchDeductions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agencyUid, category]);

  const totalDeducted = useMemo(() => {
    return deductions.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [deductions]);

  return { deductions, totalDeducted, loading, error };
}
