"use client";

import React, { useState } from "react";
import MultiStepProgress from "@/components/common/MultiStepProgress";

const ProgressDemoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: "01", name: "Booking Details" },
    { id: "02", name: "Traveller Info" },
    { id: "03", name: "Add-ons & Services" },
    { id: "04", name: "Route & Trip Details" },
    { id: "05", name: "Confirmation" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Multi-Step Progress Bar Component
        </h1>
        <p className="text-slate-500 font-medium">
          A reusable, responsive progress bar with integrated navigation controls.
        </p>
      </div>

      {/* Component Display */}
      <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-200/60">
        <MultiStepProgress
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      </div>

      {/* Step Content Mockup */}
      <div className="min-h-[400px] bg-white border border-slate-100 rounded-3xl shadow-sm p-10 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-[40px] font-light">
            {currentStep === 0 && "receipt_long"}
            {currentStep === 1 && "person"}
            {currentStep === 2 && "extension"}
            {currentStep === 3 && "flight_takeoff"}
            {currentStep === 4 && "verified"}
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
            {steps[currentStep].name}
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            This is a preview of the {steps[currentStep].name.toLowerCase()} content. 
            All state management and transitions are handled internally.
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <div className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 uppercase">
            Step {currentStep + 1} of {steps.length}
          </div>
          {currentStep === steps.length - 1 && (
            <div className="px-4 py-2 bg-emerald-50 rounded-lg text-xs font-bold text-emerald-600 uppercase border border-emerald-100">
              Complete
            </div>
          )}
        </div>
      </div>

      {/* Documentation Snippet */}
      <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-sm overflow-x-auto">
        <div className="flex items-center gap-2 mb-4 text-slate-500 font-sans">
          <span className="material-symbols-outlined text-sm">code</span>
          <span>Usage Example</span>
        </div>
        <pre>{`const steps = [
  { id: "01", name: "Booking Details" },
  { id: "02", name: "Traveller Info" },
  // ...
];

<MultiStepProgress 
  steps={steps} 
  currentStep={currentStep} 
  onStepChange={setCurrentStep} 
/>`}</pre>
      </div>
    </div>
  );
};

export default ProgressDemoPage;
