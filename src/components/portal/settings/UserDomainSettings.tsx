"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DomainMapping = {
  region: string;
  domain: string;
  countryCode: string;
};

type DomainRoutingConfig = {
  enabled: boolean;
  fallbackDomain: string;
  mappings: DomainMapping[];
};

export default function UserDomainSettings() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<DomainRoutingConfig | null>(null);
  const [preference, setPreference] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Fetch configuration
      const { data } = await supabase.from("settings").select("domain_routing").single();
      
      if (data?.domain_routing) {
        setConfig(data.domain_routing);
      }
      
      // 2. Read existing preference
      const match = document.cookie.match(new RegExp('(^| )preferred_domain=([^;]+)'));
      if (match) {
        setPreference(match[2]);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    
    if (preference) {
      // Set cookie for 1 year
      const d = new Date();
      d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = `preferred_domain=${preference};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    } else {
      // Clear cookie (Auto)
      document.cookie = "preferred_domain=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // Reload to apply changes (middleware will catch it)
    window.location.reload();
  };

  if (loading) return null;
  if (!config?.enabled) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
      <h2 className="text-xl font-semibold mb-4">Region Preferences</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Choose your preferred region to override automatic detection.
      </p>

      <div className="flex items-center gap-4">
        <select
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          className="flex-1 p-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Auto (Detect based on location)</option>
          <option value={config.fallbackDomain}>
            Global ({config.fallbackDomain})
          </option>
          {config.mappings?.map((m) => (
            <option key={m.domain} value={m.domain}>
              {m.region || m.countryCode} ({m.domain})
            </option>
          ))}
        </select>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? "Saving..." : "Save Preference"}
        </button>
      </div>
    </div>
  );
}
