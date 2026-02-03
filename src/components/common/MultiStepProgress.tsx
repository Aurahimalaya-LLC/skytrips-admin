"use client";

import React from "react";

interface Step {
  id: string;
  name: string;
}

interface MultiStepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
}

const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  currentStep,
  onStepChange,
}) => {
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* Navigation Controls - Left Side */}
      <div className="flex items-center gap-3 pr-8 lg:border-r border-slate-100 shrink-0">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center justify-center h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all group gap-2"
          aria-label="Go to previous step"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Prev</span>
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 disabled:opacity-30 disabled:hover:bg-primary transition-all group gap-2"
          aria-label="Go to next step"
        >
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Next</span>
          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-0.5 transition-transform">
            arrow_forward
          </span>
        </button>
      </div>

      {/* Progress Bar - Right Side */}
      <div className="flex-grow w-full py-2">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-between w-full relative">
            {/* Background Line */}
            <div
              className="absolute left-0 top-[15px] -mt-px w-full h-0.5 bg-slate-100 rounded-full"
              aria-hidden="true"
            >
              <div
                className="absolute left-0 top-0 h-full bg-primary transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isUpcoming = index > currentStep;

              return (
                <li key={step.id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => onStepChange(index)}
                    className="group relative flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-1"
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`Step ${index + 1}: ${step.name}`}
                  >
                    {/* Circle Indicator */}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isCurrent
                          ? "border-primary bg-primary text-white scale-125 shadow-xl shadow-primary/30"
                          : isCompleted
                          ? "border-primary bg-white text-primary"
                          : "border-slate-200 bg-white text-slate-400 group-hover:border-slate-300"
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[16px] font-black">
                          check
                        </span>
                      ) : (
                        <span className="text-xs font-black">{index + 1}</span>
                      )}
                    </div>

                    {/* Label - Hidden on small screens if too many, but here we'll use responsive text */}
                    <span
                      className={`absolute top-12 whitespace-nowrap text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${
                        isCurrent
                          ? "text-primary opacity-100 translate-y-0"
                          : "text-slate-400 opacity-0 sm:opacity-60 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                      }`}
                    >
                      {step.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default MultiStepProgress;
