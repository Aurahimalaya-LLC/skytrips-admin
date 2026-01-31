"use client";

import { useEffect, useState, useRef } from "react";
import countryData from "../../../../libs/shared-utils/constants/country.json";

interface Traveller {
  id: string;
  title?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  passport_number: string;
  passport_expiry?: string;
  dob?: string;
  nationality: string;
  gender?: string;
  date_of_issue?: string;
  issue_country?: string;
}

export default function TravellersPage() {
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraveller, setEditingTraveller] = useState<Traveller | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<Traveller>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, complete: 0, incomplete: 0 });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [travellerToDelete, setTravellerToDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [ocrDebugText, setOcrDebugText] = useState<string>("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setOcrDebugText("");
    try {
      // Compress/Resize image before sending
      const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 1024;
              const MAX_HEIGHT = 1024;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              // Compress to JPEG with 0.7 quality
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = (err) => reject(err);
        });
      };

      const base64Image = await compressImage(file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

            if (!response.ok) {
              const errorMessage = data.error || "Failed to process image";
              const details = data.details ? `\nDetails:\n${data.details.join("\n")}` : "";
              throw new Error(errorMessage + details);
            }

            setOcrDebugText(JSON.stringify(data, null, 2));

      // Fill form with extracted data
      const updatedFormData = { ...formData };
      let extractedCount = 0;

      if (data.first_name) {
        updatedFormData.first_name = data.first_name;
        extractedCount++;
      }
      if (data.last_name) {
        updatedFormData.last_name = data.last_name;
        extractedCount++;
      }
      if (data.passport_number) {
        updatedFormData.passport_number = data.passport_number;
        extractedCount++;
      }
      if (data.nationality) {
        // Try to match nationality with our country list
        const matchedCountry = countryData.countries.find(
          (c) => c.label.toLowerCase() === data.nationality.toLowerCase()
        );
        updatedFormData.nationality = matchedCountry ? matchedCountry.label : data.nationality;
        extractedCount++;
      }
      if (data.dob) {
        updatedFormData.dob = data.dob;
        extractedCount++;
      }
      if (data.passport_expiry) {
        updatedFormData.passport_expiry = data.passport_expiry;
        extractedCount++;
      }
      if (data.gender) {
        updatedFormData.gender = data.gender;
        extractedCount++;
      }
      if (data.title) {
        updatedFormData.title = data.title;
        extractedCount++;
      }
      if (data.date_of_issue) {
        updatedFormData.date_of_issue = data.date_of_issue;
        extractedCount++;
      }
      if (data.issue_country) {
        // Try to match issue country with our country list
        const matchedCountry = countryData.countries.find(
          (c) => c.label.toLowerCase() === data.issue_country.toLowerCase()
        );
        updatedFormData.issue_country = matchedCountry ? matchedCountry.label : data.issue_country;
        extractedCount++;
      }

      setFormData(updatedFormData);

      if (extractedCount === 0) {
        alert("AI could not identify any fields from this image. Please fill the form manually.");
      }
    } catch (error) {
            console.error("OCR Error:", error);
            // Check if error has details property (if it was a fetch error with JSON body)
            // But 'error' here is usually an Error object.
            // We need to capture the response data in the try block if possible, 
            // or trust that we throw the error with the message.
            
            // Actually, let's improve the error handling in the try block above to include details.
            // But since we are in catch block, 'error' is what we have.
            // If we threw 'new Error(data.error)', we only have the message.
            
            // Let's modify the throw above to include details if possible.
            // For now, just alert the message.
            alert(error instanceof Error ? error.message : "Failed to process image with AI.");
          } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetchTravellers(page, limit);
    fetchStats();
  }, [page, limit]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/travellers/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTravellers = async (p: number, l: number) => {
    try {
      const res = await fetch(`/api/travellers?page=${p}&limit=${l}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTravellers(data.data || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching travellers:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!travellerToDelete) return;

    try {
      const res = await fetch(`/api/travellers/${travellerToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchTravellers(page, limit);
    } catch (error) {
      console.error("Error deleting traveller:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setTravellerToDelete(null);
    }
  };

  const openDeleteModal = (id: string) => {
    setTravellerToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTraveller) {
        const res = await fetch(`/api/travellers/${editingTraveller.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch("/api/travellers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }
      setIsModalOpen(false);
      setEditingTraveller(null);
      setFormData({});
      fetchTravellers(page, limit);
    } catch (error) {
      console.error("Error saving traveller:", error);
    }
  };

  const filteredTravellers = travellers.filter(
    (t) =>
      t.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.passport_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Travellers
          </h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Complete Profiles
          </h3>
          <p className="text-3xl font-bold text-green-600">{stats.complete}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Incomplete Profiles
          </h3>
          <p className="text-3xl font-bold text-red-600">{stats.incomplete}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Travellers</h1>
        <button
          onClick={() => {
            setEditingTraveller(null);
            setFormData({
              title: "Mr",
              gender: "Male",
              nationality: "Nepal",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Traveller
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search travellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Passport</th>
                <th className="px-6 py-3">Nationality</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredTravellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No travellers found
                  </td>
                </tr>
              ) : (
                filteredTravellers.map((traveller) => (
                  <tr key={traveller.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {traveller.title ? `${traveller.title} ` : ""}
                      {traveller.first_name} {traveller.last_name}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {traveller.passport_number || "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {traveller.nationality || "-"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {traveller.email || "-"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingTraveller(traveller);
                            setFormData(traveller);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(traveller.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1} to{" "}
          {Math.min(page * limit, totalCount)} of {totalCount} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * limit >= totalCount}
            className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Delete Traveller
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this traveller? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTravellerToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">
              {editingTraveller ? "Edit Traveller" : "New Traveller"}
            </h2>
            
            <div className="mb-6">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors w-full justify-center border border-indigo-200 font-medium"
              >
                {isProcessingImage ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-[20px]">
                      sync
                    </span>
                    Processing Image...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      image_search
                    </span>
                    Import details from Image
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Upload a clear image of the passport or ID. Powered by Gemini AI.
              </p>
              {ocrDebugText && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                   <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Raw Extracted Text (Debug):</p>
                   <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                     {ocrDebugText}
                   </pre>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <select
                      value={formData.title || "Mr"}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender (Sex)</label>
                    <select
                      value={formData.gender || "Male"}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name (Given Names)</label>
                    <input
                      required
                      type="text"
                      value={formData.first_name || ""}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name (Surname)</label>
                    <input
                      required
                      type="text"
                      value={formData.last_name || ""}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={
                        formData.dob
                          ? new Date(formData.dob).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <select
                      value={formData.nationality || "Nepal"}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      {countryData.countries.map((c) => (
                        <option key={c.value} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Document Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                    <input
                      type="text"
                      value={formData.passport_number || ""}
                      onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Issue</label>
                    <input
                      type="date"
                      value={
                        formData.date_of_issue
                          ? new Date(formData.date_of_issue).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => setFormData({ ...formData, date_of_issue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry</label>
                    <input
                      type="date"
                      value={
                        formData.passport_expiry
                          ? new Date(formData.passport_expiry).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Country</label>
                    <select
                      value={formData.issue_country || "Nepal"}
                      onChange={(e) => setFormData({ ...formData, issue_country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      {countryData.countries.map((c) => (
                        <option key={c.value} value={c.label}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
