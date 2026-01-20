"use client";

import { useState } from "react";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: string;
  isBase: boolean;
  autoFetch: boolean;
  status: boolean;
  isLocked?: boolean;
}

export default function CurrencyTab() {
  const [currencies, setCurrencies] = useState<Currency[]>([
    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      rate: "1.0000",
      isBase: true,
      autoFetch: false,
      status: true,
      isLocked: true,
    },
    {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      rate: "0.9245",
      isBase: false,
      autoFetch: true,
      status: true,
    },
    {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      rate: "0.7832",
      isBase: false,
      autoFetch: false,
      status: false,
    },
  ]);

  const [apiKey, setApiKey] = useState("............");
  const [showApiKey, setShowApiKey] = useState(false);

  const toggleAutoFetch = (code: string) => {
    setCurrencies(currencies.map(c => 
      c.code === code && !c.isBase ? { ...c, autoFetch: !c.autoFetch } : c
    ));
  };

  const toggleStatus = (code: string) => {
    setCurrencies(currencies.map(c => 
      c.code === code && !c.isBase ? { ...c, status: !c.status } : c
    ));
  };

  return (
    <div className="flex flex-col gap-6 font-display">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600">payments</span>
          Currency Management
        </h2>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Currency
        </button>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Default Base Currency Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Default Base Currency</h3>
            <p className="text-sm text-slate-500 mb-6">Internal accounting and base pricing currency.</p>
            
            <div className="relative">
              <select className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 pr-8 font-medium cursor-pointer outline-none transition-all hover:border-slate-300">
                <option>USD - US Dollar ($)</option>
                <option>EUR - Euro (€)</option>
                <option>GBP - British Pound (£)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Update Method Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Rate Update Method</h3>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded border border-blue-100 uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">api</span>
              API Configuration
            </span>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full p-1.5 shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Mandatory Auto-Update</h4>
              <p className="text-xs text-slate-500 mt-0.5">Automated synchronization via external provider.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">API Provider</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 font-medium outline-none cursor-pointer hover:border-slate-300">
                  <option>Fixer.io</option>
                  <option>OpenExchangeRates</option>
                  <option>CurrencyLayer</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">API Key</label>
              <div className="flex gap-2">
                <div className="relative w-full">
                  <input 
                    type={showApiKey ? "text" : "password"} 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-9 font-medium outline-none transition-colors hover:border-slate-300"
                  />
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showApiKey ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[16px]">link</span>
                  Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Currencies Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Supported Currencies</h3>
            <p className="text-sm text-slate-500 mt-1">Manage additional currencies available for customers.</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-wide uppercase">Live Market Rates</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Currency Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exchange Rate (1 USD =)</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Auto Fetch</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currencies.map((currency) => (
                <tr key={currency.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0 font-bold text-[10px] text-slate-500">
                         {/* Simple flag placeholder using text if image fails, or generic icon */}
                         {currency.code === 'USD' && <span className="bg-blue-100 text-blue-700 w-full h-full flex items-center justify-center">US</span>}
                         {currency.code === 'EUR' && <span className="bg-indigo-100 text-indigo-700 w-full h-full flex items-center justify-center">EU</span>}
                         {currency.code === 'GBP' && <span className="bg-red-100 text-red-700 w-full h-full flex items-center justify-center">GB</span>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{currency.name}</span>
                        <span className="text-xs font-medium text-slate-400">{currency.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{currency.symbol}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {currency.isBase ? (
                        <>
                          <span className="text-sm font-bold text-slate-900 font-mono">1.0000</span>
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">BASE</span>
                        </>
                      ) : (
                        <div className="relative max-w-[140px]">
                          <input 
                            type="text" 
                            defaultValue={currency.rate}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded px-3 py-1.5 font-mono focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                          {currency.autoFetch && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-blue-200">
                              <span className="material-symbols-outlined text-[10px]">sync</span>
                              AUTO
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleAutoFetch(currency.code)}
                      disabled={currency.isBase}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        currency.autoFetch ? 'bg-blue-600' : 'bg-slate-200'
                      } ${currency.isBase ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currency.autoFetch ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    {currency.autoFetch && !currency.isBase && (
                       <div className="mt-1 flex justify-center">
                         <span className="bg-blue-500 text-white text-[10px] p-0.5 rounded-full block">
                            <span className="material-symbols-outlined text-[12px] block">check</span>
                         </span>
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                     <button 
                      onClick={() => toggleStatus(currency.code)}
                      disabled={currency.isLocked}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        currency.status ? 'bg-blue-600' : 'bg-slate-200'
                      } ${currency.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currency.status ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                     {currency.status && !currency.isLocked && (
                       <div className="mt-1 flex justify-center">
                         <span className="bg-blue-500 text-white text-[10px] p-0.5 rounded-full block">
                            <span className="material-symbols-outlined text-[12px] block">check</span>
                         </span>
                       </div>
                    )}
                     {/* Lock Icon Overlay for Locked Items if status is true */}
                     {currency.isLocked && currency.status && (
                       <div className="mt-1 flex justify-center">
                         <span className="bg-blue-500 text-white text-[10px] p-0.5 rounded-full block">
                            <span className="material-symbols-outlined text-[12px] block">check</span>
                         </span>
                       </div>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currency.isLocked ? (
                      <span className="text-slate-300">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                      </span>
                    ) : (
                      <button className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
            Last successful sync: 2 hours ago (Dec 12, 14:30 GMT)
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
            <span className="material-symbols-outlined text-[16px] animate-spin-slow">sync</span>
            Sync Rates Now
          </button>
        </div>
      </div>
    </div>
  );
}
