"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  role: string;
  location: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [memberSince, setMemberSince] = useState<string>("");
  const [totalBookings, setTotalBookings] = useState<number>(0);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@traveldash.com",
    phone: "+1 (555) 123-4567",
    jobTitle: "Travel Manager",
    role: "",
    location: "San Francisco, CA",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtdUFJhCY23zRHICCmdcqLphWmvNrGwS4fcKPbXSW5jX8KWpfe5nuooOqBEsvDtEahEUHfI_is0F8NU-gYv2iA-gmKGGPg7K0T0lawDA5xEtl3B8jhCzh681V3xVwHpkvOOXSXzj7GFDu5AP3ixiwPYzT4VUTd7fWIFEKSztODrf3nFh5bITRQG4zAn7kdaJ82gHHxViATaKOD7AIn6Ghks-sXo0-1fv1T9jE8Vfpq_nCg_Zc5lfs6jBTvMCIHcjvadlicEr9mXT4",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const authEmail = data?.user?.email || "";

      let email = authEmail;
      if (!email && typeof window !== "undefined") {
        try {
          const userStr = localStorage.getItem("sky_admin_user");
          if (userStr) {
            const u = JSON.parse(userStr);
            email = (u?.email || "").trim();
          }
        } catch {
          email = "";
        }
      }

      if (email) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("email, first_name, last_name, phone, role, created_at")
          .eq("email", email)
          .single();

        const errorCode =
          typeof error === "object" && error !== null && "code" in error
            ? (error as { code?: string }).code
            : undefined;

        if (error && errorCode !== "PGRST116") {
          console.error("Error fetching user details:", error);
        }

        setProfile((prev) => ({
          ...prev,
          email: userData?.email || email || prev.email,
          firstName: userData?.first_name || prev.firstName,
          lastName: userData?.last_name || prev.lastName,
          phone: userData?.phone || prev.phone,
          role: userData?.role ? String(userData.role) : prev.role,
          jobTitle: userData?.role
            ? String(userData.role)
                .split("_")
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" ")
            : prev.jobTitle,
        }));

        const createdAt =
          userData && "created_at" in userData
            ? (userData as { created_at?: string }).created_at
            : undefined;
        setMemberSince(
          createdAt
            ? new Date(createdAt).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })
            : ""
        );

        try {
          const res = await fetch(
            `/api/profile/stats?email=${encodeURIComponent(email)}`
          );
          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error("Error fetching booking stats:", payload?.error);
          } else {
            const count =
              typeof payload?.totalBookings === "number" ? payload.totalBookings : 0;
            setTotalBookings(count);
          }
        } catch (statsErr) {
          console.error("Error fetching booking stats:", statsErr);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Profile Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your personal information and account preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <div 
            className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-background shadow-md"
            style={{ backgroundImage: `url("${profile.avatarUrl}")` }}
          />
          <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold text-foreground">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-muted-foreground font-medium">{profile.jobTitle || "-"}</p>
          <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-muted-foreground">
            <span className="material-symbols-outlined text-[16px]">mail</span>
            {profile.email}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
            Edit
          </button>
          <button className="px-4 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-blue-500/20">
            Change Avatar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-8">

          {/* Contact Information */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_mail</span>
              <h3 className="font-bold text-foreground">Contact Information</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Role</label>
                <div className="inline-flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${
                      profile.role === "super_admin"
                        ? "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-900/30"
                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800"
                    }`}
                  >
                    {profile.jobTitle || "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-foreground text-[20px]">mail</span>
                  <input 
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full pl-10 pr-20 py-2 bg-muted/50 border border-input rounded-lg text-muted-foreground cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                    Verified
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted-foreground text-[20px]">call</span>
                  <input 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Settings & Preferences */}
        <div className="space-y-8">
          
          {/* Account Activity */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <h3 className="font-bold text-foreground">Account Activity</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-3xl font-black text-primary">{totalBookings}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Total Bookings</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-bold text-foreground">{memberSince || "-"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last login</span>
                  <span className="font-bold text-foreground">Today, 10:23 AM</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
