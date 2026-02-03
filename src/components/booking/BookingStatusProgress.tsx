"use client";

import React from "react";

interface Step {
  id: string;
  name: string;
  statuses: string[];
}

interface BookingStatusProgressProps {
  status: string;
  activeStep?: number;
  className?: string;
  onStatusChange?: (newStatus: string) => void;
  isReadOnly?: boolean;
  customSteps?: Step[];
}

const BookingStatusProgress: React.FC<BookingStatusProgressProps> = ({
  status,
  activeStep,
  className = "",
  onStatusChange,
  isReadOnly = false,
  customSteps,
}) => {
  // Define lifecycle steps
  const defaultSteps = [
    { id: "draft", name: "New Booking", statuses: ["Draft", "New"] },
    { id: "pending", name: "In Progress", statuses: ["Pending", "Processing", "Send"] },
    { id: "confirmed", name: "Confirmed", statuses: ["Confirmed", "Hold"] },
    { id: "issued", name: "Completed", statuses: ["Issued", "Completed", "Finalized"] },
  ];

  const steps = customSteps || defaultSteps;

  // Determine current step index
  let currentStepIndex = -1;
  const normalizedStatus = status?.toLowerCase() || "";
  const isCancelled = normalizedStatus === "cancelled";
  const isRefunded = normalizedStatus === "refunded" || normalizedStatus === "refund requested";

  if (!isCancelled && !isRefunded) {
    if (activeStep !== undefined) {
      currentStepIndex = activeStep;
    } else {
      currentStepIndex = steps.findIndex((step) =>
        step.statuses.some((s) => s.toLowerCase() === normalizedStatus)
      );

      // Fallback logic for linear progression if status is further along
      if (["issued", "completed", "finalized"].includes(normalizedStatus)) currentStepIndex = 3;
      else if (["confirmed", "hold"].includes(normalizedStatus)) currentStepIndex = 2;
      else if (["pending", "processing", "send"].includes(normalizedStatus)) currentStepIndex = 1;
      else if (["draft", "new"].includes(normalizedStatus)) currentStepIndex = 0;
      
      // If unknown status, default to 0 if not cancelled/refunded
      if (currentStepIndex === -1 && status) currentStepIndex = 0;
    }
  }

  return (
    <div className={`w-full py-6 px-4 ${className}`}>
      <div className="relative">
        {/* Background Progress Line */}
        <div
          className="absolute left-0 top-[15px] -mt-px w-full h-0.5 bg-slate-100 rounded-full"
          aria-hidden="true"
        >
          {!isCancelled && (
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full"
              style={{
                width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%`,
              }}
            ></div>
          )}
        </div>

        {/* Steps */}
        <nav aria-label="Booking Progress">
          <ol role="list" className="flex items-center justify-between w-full relative">
            {steps.map((step, index) => {
              const isCompleted = !isCancelled && index < currentStepIndex;
              const isCurrent = !isCancelled && index === currentStepIndex;
              const isUpcoming = !isCancelled && index > currentStepIndex;

              let circleClass = "";
              let textClass = "";
              let icon = null;

              if (isCancelled || isRefunded) {
                circleClass = isCancelled ? "border-red-200 bg-white text-red-400" : "border-amber-200 bg-white text-amber-400";
                textClass = "text-slate-400";
                icon = <span className="text-xs font-bold">{index + 1}</span>;
              } else if (isCurrent) {
                circleClass = "border-primary bg-primary text-white scale-125 shadow-lg shadow-primary/30";
                textClass = "text-primary font-black";
                icon = <span className="text-xs font-black">{index + 1}</span>;
              } else if (isCompleted) {
                circleClass = "border-primary bg-white text-primary";
                textClass = "text-slate-600 font-bold";
                icon = (
                  <span className="material-symbols-outlined text-[16px] font-black">
                    check
                  </span>
                );
              } else {
                circleClass = "border-slate-200 bg-white text-slate-400";
                textClass = "text-slate-400 font-medium";
                icon = <span className="text-xs font-bold">{index + 1}</span>;
              }

              return (
                <li key={step.id} className="relative flex flex-col items-center">
                  <button
                    type="button"
                    disabled={isReadOnly || !onStatusChange || isCancelled || isRefunded}
                    onClick={() => onStatusChange?.(step.statuses[0])}
                    className={`flex flex-col items-center group transition-all ${
                      isReadOnly || !onStatusChange || isCancelled || isRefunded
                        ? "cursor-default"
                        : "cursor-pointer hover:scale-105 active:scale-95"
                    }`}
                  >
                    {/* Circle Indicator */}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${circleClass}`}
                    >
                      {icon}
                    </div>

                    {/* Label */}
                    <div className="absolute top-12 flex flex-col items-center">
                      <span
                        className={`whitespace-nowrap text-[10px] sm:text-[11px] uppercase tracking-[0.1em] transition-all duration-500 ${textClass}`}
                      >
                        {step.name}
                      </span>
                      {isCurrent && (
                        <span className="mt-0.5 h-1 w-1 rounded-full bg-primary animate-pulse"></span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Cancellation/Refund Overlay Message */}
        {(isCancelled || isRefunded) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border shadow-sm mt-20 ${
              isCancelled ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
            }`}>
              {isCancelled ? "Booking Cancelled" : "Refund Processed"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingStatusProgress;
