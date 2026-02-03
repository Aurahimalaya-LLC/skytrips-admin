"use client";

import { useState } from "react";
import countriesData from "@/data/countries.json";

export interface DomainRoutingConfig {
  enabled: boolean;
  mappings: {
    region: string;
    domain: string;
    countryCode: string;
  }[];
  fallbackDomain: string;
}

interface DomainRoutingTabProps {
  config: DomainRoutingConfig;
  onChange: (config: DomainRoutingConfig) => void;
}

export default function DomainRoutingTab({ config, onChange }: DomainRoutingTabProps) {
  const [localConfig, setLocalConfig] = useState<DomainRoutingConfig>(config);

  const handleToggle = () => {
    const newConfig = { ...localConfig, enabled: !localConfig.enabled };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleMappingChange = (index: number, field: string, value: string) => {
    const newMappings = [...localConfig.mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    const newConfig = { ...localConfig, mappings: newMappings };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const handleCountrySelect = (index: number, code: string) => {
    const country = countriesData.find((c) => c.code === code);
    if (country) {
      const newMappings = [...localConfig.mappings];
      newMappings[index] = {
        ...newMappings[index],
        region: country.name,
        countryCode: country.code,
      };
      const newConfig = { ...localConfig, mappings: newMappings };
      setLocalConfig(newConfig);
      onChange(newConfig);
    }
  };

  const handleFallbackChange = (value: string) => {
    const newConfig = { ...localConfig, fallbackDomain: value };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const addMapping = () => {
    const newMappings = [
      ...localConfig.mappings,
      { region: "", domain: "", countryCode: "" },
    ];
    const newConfig = { ...localConfig, mappings: newMappings };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  const removeMapping = (index: number) => {
    const newMappings = localConfig.mappings.filter((_, i) => i !== index);
    const newConfig = { ...localConfig, mappings: newMappings };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">public</span>
          <h2 className="text-lg font-bold text-foreground">
            Dynamic Domain Routing
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${localConfig.enabled ? 'text-green-600' : 'text-slate-400'}`}>
            {localConfig.enabled ? 'System Active' : 'System Inactive'}
          </span>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              localConfig.enabled ? "bg-primary" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localConfig.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex gap-4">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-full h-fit">
          <span className="material-symbols-outlined text-[20px]">info</span>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-blue-900">How it works</h4>
          <p className="text-sm text-blue-700/80 leading-relaxed">
            When enabled, the system automatically detects the user's location based on their IP address and redirects them to the regional domain configured below. This helps improve local SEO and provides a tailored experience for specific markets.
          </p>
        </div>
      </div>

      {/* Fallback Domain Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Default Fallback Domain</h3>
              <p className="text-xs text-muted-foreground mt-1">Used for all international users and when geo-detection fails.</p>
            </div>
          </div>
          <div className="max-w-md">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <span className="material-symbols-outlined text-[18px]">language</span>
              </span>
              <input
                type="text"
                value={localConfig.fallbackDomain}
                onChange={(e) => handleFallbackChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="skytripsworld.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Mappings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">map</span>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Regional Mappings</h3>
          </div>
          <button
            onClick={addMapping}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Mapping
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {localConfig.mappings.map((mapping, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/30 transition-colors group relative"
            >
              <button
                onClick={() => removeMapping(index)}
                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Region / Country</label>
                  <div className="relative">
                    <select
                      value={mapping.countryCode}
                      onChange={(e) => handleCountrySelect(index, e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none"
                    >
                      <option value="">Select Country</option>
                      {countriesData.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <span className="material-symbols-outlined text-slate-500 text-[20px]">arrow_drop_down</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Country Code (ISO)</label>
                  <input
                    type="text"
                    value={mapping.countryCode}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-border rounded-lg text-sm font-medium text-slate-500 cursor-not-allowed"
                    placeholder="Auto-filled"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Target Domain</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                      <span className="material-symbols-outlined text-[18px]">link</span>
                    </span>
                    <input
                      type="text"
                      value={mapping.domain}
                      onChange={(e) => handleMappingChange(index, "domain", e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      placeholder="skytrips.com.np"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {localConfig.mappings.length === 0 && (
            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-3">explore_off</span>
              <p className="text-sm text-slate-500 font-medium">No regional mappings configured yet.</p>
              <button
                onClick={addMapping}
                className="mt-4 text-primary font-bold text-sm hover:underline"
              >
                Create your first mapping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
