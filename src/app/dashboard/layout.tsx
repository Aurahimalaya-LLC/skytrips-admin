"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, [router]);

  useEffect(() => {
    try {
      const persisted = localStorage.getItem("sidebarCollapsed");
      if (persisted) {
        setSidebarCollapsed(persisted === "true");
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebarCollapsed", String(next));
      } catch {}
      return next;
    });
  };

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setUserEmail(data.user?.email || "");
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background font-display text-foreground h-screen overflow-hidden flex w-full transition-colors duration-300">
      {/* Side Navigation */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-sidebar border-r border-sidebar-border flex-col hidden md:flex h-full flex-shrink-0 z-20 transition-[width,background,color] duration-300 ease-in-out`}
        aria-label="Sidebar navigation"
      >
        <div className={`p-6 pb-2 ${sidebarCollapsed ? "px-4" : ""}`}>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <div className="relative rounded-xl size-10 shadow-sm border border-primary/20 bg-primary/5 overflow-hidden">
              <Image
                src="https://tjrmemmsieltajotxddk.supabase.co/storage/v1/object/public/media/2026/01/1768379811331_o7lm8v.svg"
                alt="SkyTrips Logo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h1
              className={`text-primary text-xl font-black leading-normal tracking-tight ${
                sidebarCollapsed ? "sr-only" : ""
              }`}
            >
              admin panel
            </h1>
            <button
              type="button"
              onClick={toggleSidebar}
              className="ml-auto p-2 rounded-lg hover:bg-muted text-sidebar-foreground transition-colors"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
            >
              <span className="material-symbols-outlined">
                {sidebarCollapsed ? "chevron_right" : "chevron_left"}
              </span>
            </button>
          </div>
        </div>

        <nav className={`flex flex-col gap-2 ${sidebarCollapsed ? "px-2" : "px-4"} mt-6 flex-1 overflow-y-auto`}>
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname === "/dashboard"
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Dashboard"
            title="Dashboard"
          >
            <span
              className={`material-symbols-outlined ${
                pathname === "/dashboard"
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              dashboard
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Dashboard</p>
          </Link>

          {/* Flights */}
          <Link
            href="#"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg hover:bg-muted text-sidebar-foreground hover:text-foreground transition-colors group`}
            aria-label="Flights"
            title="Flights"
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">
              flight
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Flights</p>
          </Link>

          {/* Hotels */}
          <Link
            href="#"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg hover:bg-muted text-sidebar-foreground hover:text-foreground transition-colors group`}
            aria-label="Hotels"
            title="Hotels"
          >
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">
              hotel
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Hotels</p>
          </Link>

          {/* Customers */}
          <Link
            href="/dashboard/customers"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname === "/dashboard/customers"
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Customers"
            title="Customers"
          >
            <span
              className={`material-symbols-outlined ${
                pathname === "/dashboard/customers"
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              group
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Customers</p>
          </Link>

          {/* Bookings */}
          <Link
            href="/dashboard/booking"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname === "/dashboard/booking"
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Bookings"
            title="Bookings"
          >
            <span
              className={`material-symbols-outlined ${
                pathname === "/dashboard/booking"
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              confirmation_number
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Bookings</p>
          </Link>

          {/* Payments */}
          <Link
            href="/dashboard/payments"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname === "/dashboard/payments"
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Payments"
            title="Payments"
          >
            <span
              className={`material-symbols-outlined ${
                pathname === "/dashboard/payments"
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              payments
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Payments</p>
          </Link>

          {/* Manage Booking */}
          <Link
            href="/dashboard/manage-booking"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname === "/dashboard/manage-booking"
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Manage Booking"
            title="Manage Booking"
          >
            <span
              className={`material-symbols-outlined ${
                pathname === "/dashboard/manage-booking"
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              edit_calendar
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Manage Booking</p>
          </Link>

          {/* Media Management */}
          <Link
            href="/dashboard/media"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname === "/dashboard/media"
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Media Management"
            title="Media Management"
          >
            <span
              className={`material-symbols-outlined ${
                pathname === "/dashboard/media"
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              perm_media
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Media</p>
          </Link>

          {/* Agency */}
          <Link
            href="/dashboard/agencies"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname.startsWith("/dashboard/agencies")
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Agency"
            title="Agency"
          >
            <span
              className={`material-symbols-outlined ${
                pathname.startsWith("/dashboard/agencies")
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              domain
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Agency</p>
          </Link>

          {/* User Management */}
          <Link
            href="/dashboard/users"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname.startsWith("/dashboard/users")
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Users"
            title="Users"
          >
            <span
              className={`material-symbols-outlined ${
                pathname.startsWith("/dashboard/users")
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              group
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Users</p>
          </Link>

          {/* Setting */}
          <Link
            href="/dashboard/settings"
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg transition-all ${
              pathname === "/dashboard/settings"
                ? "bg-primary text-primary-foreground shadow-md shadow-blue-200 dark:shadow-none"
                : "text-sidebar-foreground hover:bg-muted hover:text-foreground group"
            }`}
            aria-label="Settings"
            title="Settings"
          >
            <span
              className={`material-symbols-outlined ${
                pathname === "/dashboard/settings"
                  ? "active-icon"
                  : "group-hover:text-primary transition-colors"
              }`}
            >
              settings
            </span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Setting</p>
          </Link>
        </nav>

        <div className={`p-4 mt-auto ${sidebarCollapsed ? "px-2" : ""}`}>
          <div
            onClick={handleLogout}
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-lg hover:bg-destructive/10 text-sidebar-foreground hover:text-destructive cursor-pointer transition-colors`}
            aria-label="Sign Out"
            title="Sign Out"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className={`text-sm font-medium leading-normal ${sidebarCollapsed ? "sr-only" : ""}`}>Sign Out</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-background overflow-hidden relative transition-colors duration-300">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap bg-background border-b border-border px-6 py-4 flex-shrink-0 z-10 shadow-sm transition-colors duration-300 print:hidden">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-muted-foreground" aria-label="Open menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-foreground text-lg font-bold leading-tight">
                Dashboard Overview
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Welcome back, Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button className="flex items-center justify-center size-10 rounded-full hover:bg-muted text-foreground transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-background"></span>
              </button>
              <div
                onClick={() => router.push("/dashboard/profile")}
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-background shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDtdUFJhCY23zRHICCmdcqLphWmvNrGwS4fcKPbXSW5jX8KWpfe5nuooOqBEsvDtEahEUHfI_is0F8NU-gYv2iA-gmKGGPg7K0T0lawDA5xEtl3B8jhCzh681V3xVwHpkvOOXSXzj7GFDu5AP3ixiwPYzT4VUTd7fWIFEKSztODrf3nFh5bITRQG4zAn7kdaJ82gHHxViATaKOD7AIn6Ghks-sXo0-1fv1T9jE8Vfpq_nCg_Zc5lfs6jBTvMCIHcjvadlicEr9mXT4")',
                }}
              ></div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-background transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
