"use client";

import React, { createContext, useContext, useState } from "react";

type AccordionType = "single" | "multiple";

interface AccordionContextType {
  activeValues: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps {
  type?: AccordionType;
  defaultValue?: string | string[];
  className?: string;
  children: React.ReactNode;
}

export function Accordion({
  type = "single",
  defaultValue = [],
  className = "",
  children,
}: AccordionProps) {
  // Normalize defaultValue to an array
  const initialValues = Array.isArray(defaultValue)
    ? defaultValue
    : defaultValue
    ? [defaultValue]
    : [];

  const [activeValues, setActiveValues] = useState<string[]>(initialValues);

  const toggleItem = (value: string) => {
    setActiveValues((prev) => {
      if (type === "single") {
        return prev.includes(value) ? [] : [value];
      } else {
        // multiple
        return prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value];
      }
    });
  };

  return (
    <AccordionContext.Provider value={{ activeValues, toggleItem }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className = "" }: AccordionItemProps) {
  // Pass the value to children if they need it, but primarily the Context handles state
  // We can clone children to pass 'value' down if we were using a different pattern,
  // but here we rely on Context + Trigger knowing the value.
  // Actually, Trigger needs to know the 'value' of its parent Item.
  // So we can wrap Item in another Context or just use Children.map.
  // A simpler way: Context for the Item value.
  
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={`border-b border-slate-200 last:border-0 ${className}`}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

const AccordionItemContext = createContext<string>("");

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className = "" }: AccordionTriggerProps) {
  const { activeValues, toggleItem } = useContext(AccordionContext)!;
  const value = useContext(AccordionItemContext);
  const isOpen = activeValues.includes(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full ${className} ${
        isOpen ? "text-blue-600" : "text-slate-900"
      }`}
    >
      {children}
      <span
        className={`material-symbols-outlined transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      >
        expand_more
      </span>
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className = "" }: AccordionContentProps) {
  const { activeValues } = useContext(AccordionContext)!;
  const value = useContext(AccordionItemContext);
  const isOpen = activeValues.includes(value);

  if (!isOpen) return null;

  return (
    <div className={`overflow-hidden text-sm transition-all pb-4 ${className}`}>
      {children}
    </div>
  );
}
