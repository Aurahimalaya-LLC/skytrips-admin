"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/portal/auth/login");
          return;
        }

        // Strict Separation: Check if user is linked to customer table
        // Retry logic to handle race condition with DB trigger on signup
        let customer = null;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts && !customer) {
          const { data, error } = await supabase
            .from("customers")
            .select("id")
            .eq("auth_user_id", session.user.id)
            .single();

          if (data) {
            customer = data;
            break;
          }
          
          // Wait 500ms before retrying
          attempts++;
          if (attempts < maxAttempts) {
             await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
          
        if (!customer) {
           console.error("Not a customer user - Retries failed");
           try {
             await supabase.auth.signOut();
           } catch (e) {
             console.error("Sign out error", e);
           }
           router.push("/portal/auth/login");
           return;
        }

        setUser(session.user);
      } catch (e) {
        console.error("Auth check failed", e);
        router.push("/portal/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.push("/portal/auth/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/portal" className="text-xl font-bold text-blue-600">
                  SkyTrips Portal
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/portal"
                  className={`${
                    pathname === "/portal"
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/portal/bookings"
                  className={`${
                    pathname.startsWith("/portal/bookings")
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  My Trips
                </Link>
                <Link
                  href="/portal/travellers"
                  className={`${
                    pathname.startsWith("/portal/travellers")
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  Travelers
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <Link 
                 href="/portal/profile" 
                 className={`${
                    pathname.startsWith("/portal/profile")
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
               >
                  Profile
               </Link>
               <button
                 onClick={handleLogout}
                 className="text-sm font-medium text-red-600 hover:text-red-800 px-3 py-2 rounded-md hover:bg-red-50 transition-colors duration-200"
               >
                 Logout
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
