"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface PublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  bio: string | null;
  profileImage: string | null;
  loyaltyTier: string | null;
  country: string | null;
  memberSince: string;
  bookingHistory: Array<{
    origin: string;
    destination: string;
    travelDate: string;
    tripType: string;
    status: string;
  }>;
  linkedTravellers: Array<{
    first_name: string;
    last_name: string;
    title: string | null;
  }>;
}

export default function PublicCustomerProfilePage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const res = await fetch(`/api/portal/customers/${customerId}/public`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to load profile");
        }
        
        setProfile(data);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchPublicProfile();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md">
          <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Unavailable</h1>
          <p className="text-slate-600 mb-6">{error || "This profile is private or does not exist."}</p>
          <a href="/portal/auth/login" className="inline-flex items-center text-blue-600 font-semibold hover:underline">
            Go to Portal <span className="material-symbols-outlined ml-1">arrow_forward</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="inline-block relative">
                <div className="h-32 w-32 rounded-2xl border-4 border-white shadow-md bg-slate-200 overflow-hidden">
                  <Image
                    src={profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${profile.firstName} ${profile.lastName}`)}&background=random&size=128`}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
                {profile.loyaltyTier && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm uppercase tracking-wider">
                    {profile.loyaltyTier}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-600">
                  {profile.companyName && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">business</span>
                      <span className="font-medium">{profile.companyName}</span>
                    </div>
                  )}
                  {profile.country && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span>{profile.country}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>Joined {new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Bio & Travellers */}
          <div className="lg:col-span-1 space-y-8">
            {/* Bio */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">info</span>
                About
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {profile.bio || "No public bio provided."}
              </p>
            </div>

            {/* Known Travellers */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">group</span>
                Travel Group
              </h2>
              {profile.linkedTravellers.length > 0 ? (
                <ul className="space-y-3">
                  {profile.linkedTravellers.map((t, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                        {t.first_name[0]}{t.last_name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{t.title} {t.first_name} {t.last_name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic text-center py-4">No public traveller info.</p>
              )}
            </div>
          </div>

          {/* Right Column: Trip History */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">flight_takeoff</span>
                Public Trip History
              </h2>
              
              {profile.bookingHistory.length > 0 ? (
                <div className="space-y-6">
                  {profile.bookingHistory.map((trip, idx) => (
                    <div key={idx} className="relative pl-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
                      <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px] text-blue-600">check</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-bold text-slate-900">{trip.origin} → {trip.destination}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">{trip.tripType}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            {new Date(trip.travelDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 capitalize">
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            {trip.status.toLowerCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">history</span>
                  <p>No trip history available for display.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Skytrips. Professional Travel Profile.</p>
        </div>
      </div>
    </div>
  );
}
