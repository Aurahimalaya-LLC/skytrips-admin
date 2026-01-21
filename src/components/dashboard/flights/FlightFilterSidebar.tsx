"use client";

interface FlightFilterSidebarProps {
  selectedAirlines: string[];
  selectedStops: string[];
  directOnly: boolean;
  refundableOnly: boolean;
  priceRange?: { min?: number; max?: number };
  priceFilterMin?: number;
  priceFilterMax?: number;
  transitOptions?: { direct?: number; oneStop?: number; twoPlusStops?: number };
  departureTimes?: { min?: string; max?: string };
  arrivalTimes?: { min?: string; max?: string };
  airlinesSummary?: Array<{ code?: string; name?: string; flightCount?: number; position?: number }>;
  onToggleDirect: () => void;
  onToggleRefundable: () => void;
  onToggleAirline: (code: string) => void;
  onToggleStop: (val: string) => void;
  onChangePriceRange?: (min?: number, max?: number) => void;
  selectedTime?: string;
  onChangeTime?: (id: string) => void;
}

export default function FlightFilterSidebar({
  selectedAirlines,
  selectedStops,
  directOnly,
  refundableOnly,
  priceRange,
  priceFilterMin,
  priceFilterMax,
  transitOptions,
  departureTimes,
  arrivalTimes,
  airlinesSummary,
  onToggleDirect,
  onToggleRefundable,
  onToggleAirline,
  onToggleStop,
  onChangePriceRange,
  selectedTime,
  onChangeTime,
}: FlightFilterSidebarProps) {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-4">
      <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-6">Detailed Filters</h2>

      {priceRange && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-700">Price Range</span>
            <span className="text-xs font-medium text-slate-500">
              {Math.round(priceRange.min ?? 0)} -{" "}
              {Math.round(
                typeof priceFilterMax === "number"
                  ? priceFilterMax
                  : priceRange.max ?? 0
              )}
            </span>
          </div>
          <input
            type="range"
            min={Math.round(priceRange.min ?? 0)}
            max={Math.round(priceRange.max ?? 0)}
            value={Math.round(
              typeof priceFilterMax === "number"
                ? priceFilterMax
                : priceRange.max ?? 0
            )}
            onChange={(e) => {
              const v = Number(e.target.value);
              const baseMin = priceRange.min ?? 0;
              const baseMax = priceRange.max ?? 0;
              if (!onChangePriceRange) return;
              if (v >= baseMax) {
                onChangePriceRange(undefined, undefined);
              } else {
                onChangePriceRange(baseMin, v);
              }
            }}
            className="w-full accent-primary"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Drag to limit the maximum ticket price
          </p>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Stops</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={directOnly}
                onChange={onToggleDirect}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Non-stop</span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {typeof transitOptions?.direct === "number" ? `${transitOptions.direct} flights` : ""}
            </span>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedStops.includes("1")}
                onChange={() => onToggleStop("1")}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">1 Stop</span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {typeof transitOptions?.oneStop === "number" ? `${transitOptions.oneStop} flights` : ""}
            </span>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={selectedStops.includes("2+")}
                onChange={() => onToggleStop("2+")}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">2+ Stops</span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {typeof transitOptions?.twoPlusStops === "number" ? `${transitOptions.twoPlusStops} flights` : ""}
            </span>
          </label>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Fare Type</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={refundableOnly}
                onChange={onToggleRefundable}
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Refundable only</span>
            </div>
          </label>
        </div>
      </div>

      {/* Airlines */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Airlines</h3>
        <div className="space-y-3">
          {(airlinesSummary || []).map((airline) => {
            const code = (airline.code || "").toUpperCase();
            if (!code) return null;
            return (
              <label key={code} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    checked={selectedAirlines.includes(code)}
                    onChange={() => onToggleAirline(code)}
                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900">
                    {airline.name || code}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {typeof airline.flightCount === "number" ? `${airline.flightCount} flights` : ""}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-4">Departure Time</h3>
        {(departureTimes || arrivalTimes) && (
          <p className="text-xs text-slate-400 mb-3">
            {departureTimes && (
              <>Depart {departureTimes.min} – {departureTimes.max}</>
            )}
            {arrivalTimes && (
              <>
                {departureTimes ? " · " : ""}
                Arrive {arrivalTimes.min} – {arrivalTimes.max}
              </>
            )}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "early", label: "Early Morning" },
            { id: "daytime", label: "Daytime" },
            { id: "evening", label: "Evening" },
            { id: "night", label: "Night" },
          ].map((time) => (
            <button
              key={time.id}
            onClick={() => onChangeTime && onChangeTime(time.id)}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
              selectedTime === time.id
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
