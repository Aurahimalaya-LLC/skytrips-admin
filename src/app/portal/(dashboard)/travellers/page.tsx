"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Traveller } from "@/types";

export default function TravelersPage() {
  const [travelers, setTravelers] = useState<Traveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get customer ID
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();
        
        if (customer) {
            setCustomerId(customer.id);
            
            // Fetch Travelers
            const { data: travs, error } = await supabase
              .from("travellers")
              .select("*")
              .order("created_at", { ascending: false });
            
            if (error) throw error;
            setTravelers(travs || []);
        }
      } catch (e) {
        console.error("Error loading travelers", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAddTraveler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setFormLoading(true);

    try {
      const { data, error } = await supabase
        .from("travellers")
        .insert({
          first_name: firstName,
          last_name: lastName,
          passport_number: passportNumber,
          customer_id: customerId // RLS requires this to link to us
        })
        .select()
        .single();

      if (error) throw error;

      setTravelers([data, ...travelers]);
      setIsModalOpen(false);
      setFirstName("");
      setLastName("");
      setPassportNumber("");
    } catch (e: any) {
      alert("Failed to add traveler: " + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading travelers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Linked Travelers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Traveler
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {travelers.length === 0 ? (
             <li className="px-4 py-8 text-center text-gray-500">
               No linked travelers yet. Add family or friends to manage their bookings easily.
             </li>
          ) : (
             travelers.map((t: any) => (
                <li key={t.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-sm font-medium text-gray-900">
                           {t.first_name} {t.last_name}
                         </p>
                         <p className="text-sm text-gray-500">
                           Passport: {t.passport_number || "Not provided"}
                         </p>
                      </div>
                      <div className="text-sm text-gray-400">
                         Added on {new Date(t.created_at).toLocaleDateString()}
                      </div>
                   </div>
                </li>
             ))
          )}
        </ul>
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
               <form onSubmit={handleAddTraveler}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                     <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Traveler</h3>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700">First Name</label>
                           <input 
                             type="text" required 
                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                             value={firstName} onChange={e => setFirstName(e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Last Name</label>
                           <input 
                             type="text" required 
                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                             value={lastName} onChange={e => setLastName(e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                           <input 
                             type="text"
                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                             value={passportNumber} onChange={e => setPassportNumber(e.target.value)}
                           />
                        </div>
                     </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                     <button type="submit" disabled={formLoading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                        {formLoading ? 'Saving...' : 'Save'}
                     </button>
                     <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                        Cancel
                     </button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
