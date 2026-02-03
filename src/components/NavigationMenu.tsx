"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavigationMenu({
  items = [
    { label: "Overview", href: "/dashboard/admin#overview", icon: "home", id: "overview" },
    { label: "Media Management", href: "/dashboard/admin#media", icon: "video_library", id: "media" },
    { label: "Bookings", href: "/dashboard/booking", icon: "confirmation_number", id: "bookings" },
    { label: "Manage Booking", href: "/dashboard/manage-booking", icon: "edit_calendar", id: "manage-booking" },
    { label: "Routes", href: "/dashboard/routes", icon: "alt_route", id: "routes" },
    { label: "Airlines", href: "/dashboard/airlines", icon: "airlines", id: "airlines" },
    { label: "Airports", href: "/dashboard/airports", icon: "flight_takeoff", id: "airports" },
    { label: "Agency", href: "/dashboard/agencies", icon: "domain", id: "agency" },
    { label: "Ontology", href: "/dashboard/ontology", icon: "category", id: "ontology" },
    { label: "Setting", href: "/dashboard/settings", icon: "settings", id: "settings" },
    { label: "Users", href: "/dashboard/users", icon: "group", id: "users" },
  ],
  activeId,
}: {
  items?: { label: string; href: string; icon?: string; id: string }[];
  activeId?: string;
}) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [current, setCurrent] = useState<string | undefined>(activeId);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCurrent(activeId);
  }, [activeId]);

  useEffect(() => {
    if (isNavigating) {
      // reset loading state when route changes
      setIsNavigating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!navRef.current) return;
      const links = Array.from(navRef.current.querySelectorAll<HTMLAnchorElement>("a[role='menuitem']"));
      const index = links.findIndex((l) => l.getAttribute("data-id") === current);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = links[(index + 1) % links.length];
        next?.focus();
        setCurrent(next?.getAttribute("data-id") || current);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = links[(index - 1 + links.length) % links.length];
        prev?.focus();
        setCurrent(prev?.getAttribute("data-id") || current);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current]);

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Section navigation"
      aria-busy={isNavigating}
      className="w-full bg-white border border-slate-200 rounded-xl shadow-sm"
    >
      <div className="px-4 py-3 flex items-center justify-between sm:px-6">
        <div className="text-sm font-bold text-slate-900">Navigation</div>
        <button
          aria-label="Toggle menu"
          aria-expanded={isMobileOpen}
          aria-controls="nav-menu"
          onClick={() => setIsMobileOpen((o) => !o)}
          className="sm:hidden inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">{isMobileOpen ? "close" : "menu"}</span>
          <span>Menu</span>
        </button>
      </div>
      <div
        id="nav-menu"
        className={`sm:block ${isMobileOpen ? "block" : "hidden"} border-t border-slate-100`}
      >
        <ul role="menubar" className="flex flex-col sm:flex-row">
          {([...items].sort((a, b) => {
            const order = ["overview", "media", "bookings", "manage-booking", "routes", "airlines", "airports", "agency", "ontology", "settings", "users"];
            const ia = order.indexOf(a.id);
            const ib = order.indexOf(b.id);
            const pa = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
            const pb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
            if (pa !== pb) return pa - pb;
            return 0;
          })).map((item) => {
            const isActive = current ? current === item.id : activeId === item.id;
            return (
              <li key={item.id} role="none" className="sm:flex-1">
                <Link
                  href={item.href}
                  role="menuitem"
                  data-id={item.id}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 text-sm transition-all ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-bold border-l-4 border-primary"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                  onFocus={() => setCurrent(item.id)}
                  onMouseEnter={() => setCurrent(item.id)}
                  onClick={() => setIsNavigating(true)}
                >
                  {item.icon && (
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                  {isNavigating && current === item.id && (
                    <span aria-hidden="true" className="ml-2 size-3 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
