"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import UserDomainSettings from "@/components/portal/settings/UserDomainSettings";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "", // Read only
    passport_number: "", // Assuming this field exists in customer schema or mapped
    publicProfileEnabled: false,
    companyName: "",
    publicBio: "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: customer } = await supabase
          .from("customers")
          .select("*")
          .eq("auth_user_id", user.id)
          .single();
        
        if (customer) {
            setFormData({
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                phone: customer.phone || "",
                email: customer.email || user.email || "",
                passport_number: customer.passport?.number || "", // Handling JSONB structure if necessary
                publicProfileEnabled: customer.public_profile_enabled || false,
                companyName: customer.company_name || "",
                publicBio: customer.public_bio || "",
            });
        }
      } catch (e) {
        console.error("Error loading profile", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        // Update Customer Data
        const { error } = await supabase
          .from("customers")
          .update({
             firstName: formData.firstName,
             lastName: formData.lastName,
             phone: formData.phone,
             // Assuming passport is stored in a JSONB 'passport' column or top level
             // If schema has 'passport' column as JSONB:
             passport: { number: formData.passport_number },
             public_profile_enabled: formData.publicProfileEnabled,
             company_name: formData.companyName,
             public_bio: formData.publicBio,
          })
          .eq("auth_user_id", user.id);

        if (error) throw error;

        // Update Password if provided
        if (password) {
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            const { error: pwdError } = await supabase.auth.updateUser({
                password: password
            });
            if (pwdError) throw pwdError;
            setPassword("");
            setConfirmPassword("");
        }

        setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : "Failed to update profile";
        setMessage({ type: 'error', text: errMsg });
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
           {message.text}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="bg-white shadow rounded-lg p-6 space-y-6">
         {/* Personal Info */}
         <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
               <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">First name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
               </div>
               <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Last name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
               </div>
               <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                  />
               </div>
               <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Phone number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
               </div>
               <div className="sm:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                  <input
                    type="text"
                    value={formData.passport_number}
                    onChange={e => setFormData({...formData, passport_number: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
               </div>
            </div>
         </div>

         <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Public Profile Settings</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                     <label className="block text-sm font-medium text-gray-700">Enable Public Profile</label>
                     <p className="text-xs text-gray-500">Allow others to see your professional travel profile</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, publicProfileEnabled: !formData.publicProfileEnabled})}
                    className={`${
                      formData.publicProfileEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        formData.publicProfileEnabled ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
               </div>

               {formData.publicProfileEnabled && (
                  <>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={e => setFormData({...formData, companyName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g. Acme Corp"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Public Bio</label>
                        <textarea
                          rows={3}
                          value={formData.publicBio}
                          onChange={e => setFormData({...formData, publicBio: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Share a bit about your travel preferences or professional background..."
                        />
                     </div>
                  </>
               )}
            </div>
         </div>

         <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Leave blank to keep current password"
                  />
               </div>
               {password && (
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                   </div>
               )}
            </div>
         </div>

         <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
         </div>
      </form>

      <UserDomainSettings />
    </div>
  );
}
