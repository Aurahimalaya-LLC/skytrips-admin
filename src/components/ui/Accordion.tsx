"use client";

import * as React from "react";

type AccordionType = "single" | "multiple";

interface AccordionContextType {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: AccordionType;
}

const AccordionContext = React.createContext<AccordionContextType | undefined>(undefined);

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", value: propValue, defaultValue, onValueChange, collapsible = false, className = "", children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(() => {
      if (defaultValue) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });

    const isControlled = propValue !== undefined;
    const openItems = isControlled 
      ? (Array.isArray(propValue) ? propValue : [propValue]) 
      : internalValue;

    const toggleItem = React.useCallback(
      (itemValue: string) => {
        let next: string[];
        if (type === "single") {
            const isOpen = openItems.includes(itemValue);
            if (isOpen && !collapsible) {
              next = openItems;
            } else if (isOpen) {
              next = [];
            } else {
              next = [itemValue];
            }
        } else {
            // multiple
            next = openItems.includes(itemValue)
              ? openItems.filter((v) => v !== itemValue)
              : [...openItems, itemValue];
        }

        if (!isControlled) {
            setInternalValue(next);
        }
        
        if (onValueChange) {
            onValueChange(type === "single" ? (next[0] || "") : next);
        }
      },
      [type, collapsible, onValueChange, isControlled, openItems]
    );

    return (
      <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
        <div ref={ref} className={`space-y-1 ${className}`} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

// --- Accordion Item ---

interface AccordionItemContextType {
  value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextType | undefined>(undefined);

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, className = "", children, ...props }, ref) => {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div ref={ref} className={`border-b border-slate-200 last:border-0 ${className}`} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "AccordionItem";

// --- Accordion Trigger ---

const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", children, ...props }, ref) => {
    const accordionContext = React.useContext(AccordionContext);
    const itemContext = React.useContext(AccordionItemContext);

    if (!accordionContext || !itemContext) {
      throw new Error("AccordionTrigger must be used within Accordion and AccordionItem");
    }

    const isOpen = accordionContext.openItems.includes(itemContext.value);

    return (
      <h3 className="flex">
        <button
          ref={ref}
          type="button"
          onClick={() => accordionContext.toggleItem(itemContext.value)}
          aria-expanded={isOpen}
          className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:text-blue-600 [&[aria-expanded=true]>span]:rotate-180 ${className}`}
          {...props}
        >
          {children}
          <span className="material-symbols-outlined text-slate-500 transition-transform duration-200">
            expand_more
          </span>
        </button>
      </h3>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

// --- Accordion Content ---

const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    const accordionContext = React.useContext(AccordionContext);
    const itemContext = React.useContext(AccordionItemContext);

    if (!accordionContext || !itemContext) {
      throw new Error("AccordionContent must be used within Accordion and AccordionItem");
    }

    const isOpen = accordionContext.openItems.includes(itemContext.value);

    return (
      <div
        className={`grid overflow-hidden text-sm transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        role="region"
        {...props}
      >
        <div ref={ref} className={`min-h-0 ${className}`}>
          <div className="pb-4 pt-0">
            {children}
          </div>
        </div>
      </div>
    );
  }
);
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
