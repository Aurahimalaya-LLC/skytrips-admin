"use client";

import { useEffect, useRef, useState } from "react";

type CustomerRowMenuProps = {
  customerId: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function CustomerRowMenu({
  customerId,
  onView,
  onEdit,
  onDelete,
}: CustomerRowMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const options = [
    { label: "View Details", icon: "visibility", action: onView },
    { label: "Edit", icon: "edit", action: onEdit },
    { label: "Delete", icon: "delete", action: onDelete, danger: true },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0) {
          options[activeIndex].action();
          setOpen(false);
          setActiveIndex(-1);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="size-9 min-w-9 min-h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`Actions for customer ${customerId}`}
          className="absolute right-0 z-30 mt-2 w-44 bg-card border border-border rounded-lg shadow-xl animate-in fade-in duration-300"
        >
          <ul className="py-2">
            {options.map((opt, idx) => (
              <li key={opt.label}>
                <button
                  role="menuitem"
                  tabIndex={0}
                  aria-label={opt.label}
                  onClick={() => {
                    opt.action();
                    setOpen(false);
                    setActiveIndex(-1);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-all duration-200 ${
                    opt.danger
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-foreground hover:bg-muted"
                  } ${activeIndex === idx ? "bg-muted" : ""}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {opt.icon}
                  </span>
                  <span>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

