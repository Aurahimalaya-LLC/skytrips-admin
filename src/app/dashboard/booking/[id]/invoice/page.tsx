"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Booking } from "@/types";
import { CompanyProfile } from "@/types/company";
import SendEmailModal from "@/components/booking-management/SendEmailModal";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

type BookingWithAgency = Booking & { issuedthroughagency?: string };

export default function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const bookingId = id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );
  const [settingsCompanyName, setSettingsCompanyName] = useState<string>("");
  const [settingsLogoUrl, setSettingsLogoUrl] = useState<string>("");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        setSettingsCompanyName(data.company_name || "");
        setSettingsLogoUrl(data.logo_url || "");
        const profiles = (data.company_profiles || []) as CompanyProfile[];
        setCompanyProfiles(profiles);
        if (!selectedCompanyId && profiles.length > 0) {
          setSelectedCompanyId(profiles[0].id);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, [selectedCompanyId]);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBookingDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            setBooking(null);
          } else {
            throw error;
          }
        } else {
          setBooking(data);
        }
      } catch (err: unknown) {
        console.error("Error fetching booking:", err);
        let message = "Failed to load booking details";
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking && !error) {
    return notFound();
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">
              error
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Error Loading Invoice
          </h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const selectedCompany =
    companyProfiles.find((c) => c.id === selectedCompanyId) || null;

  // Calculate financials
  const sellingPrice = Number(booking.sellingPrice) || 0;

  // Parse addons from prices object
  const addons = booking.prices
    ? Object.entries(booking.prices).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        price: Number(value),
      }))
    : [];

  const addonsTotal = addons.reduce((sum, item) => sum + item.price, 0);
  const subtotal = sellingPrice + addonsTotal;
  const tax = 0; // Assuming tax included or 0 for now as per reference
  const discount = 0;
  const grandTotal = subtotal + tax - discount;

  // Generate Invoice Number (Mock logic if not in DB)
  const invoiceNumber = `INV-2021-${String(booking.id).padStart(3, "0")}`;
  const issueDate = booking.created_at
    ? new Date(booking.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  const dueDate = booking.created_at
    ? new Date(booking.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }); // Same day due for flights usually

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async (data: {
    subject: string;
    message: string;
    template: string;
  }) => {
    if (!booking) return;
    try {
      const element = document.getElementById("invoice-content");
      if (!element) throw new Error("Invoice content not found");

      // Wait for fonts to load before capturing
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (doc) => {
          const allElements = doc.querySelectorAll("*");
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const style = window.getComputedStyle(htmlEl);
            if (style.color && style.color.includes("oklab")) {
              htmlEl.style.setProperty("color", "#000000", "important");
            }
            if (
              style.backgroundColor &&
              style.backgroundColor.includes("oklab")
            ) {
              htmlEl.style.setProperty(
                "background-color",
                "#ffffff",
                "important"
              );
            }
            if (style.borderColor && style.borderColor.includes("oklab")) {
              htmlEl.style.setProperty("border-color", "#e2e8f0", "important");
            }
          });
        },
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create a PDF with dynamic height based on the content
      const pdf = new jsPDF("p", "mm", [imgWidth, imgHeight]);
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
      );

      const pdfBase64 = pdf.output("datauristring");

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: booking.email,
          subject: data.subject.replace("{PNR}", booking.PNR || ""),
          message: data.message
            .replace(
              "{NAME}",
              `${booking.travellerFirstName} ${booking.travellerLastName}`
            )
            .replace("{PNR}", booking.PNR || "")
            .replace("{ORIGIN}", booking.origin)
            .replace("{DESTINATION}", booking.destination)
            .replace("{DEPARTURE_DATE}", booking.travelDate || "")
            .replace("{FLIGHT_NUMBER}", booking.flightNumber || "")
            .replace("{AMOUNT}", booking.sellingPrice?.toString() || ""),
          attachment: {
            filename: `Invoice-${invoiceNumber}.pdf`,
            content: pdfBase64,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send email");
      }
    } catch (err) {
      console.error("Error sending invoice:", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-12 print:p-0 print:bg-white font-display">
      {booking && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          recipient={{
            name: `${booking.travellerFirstName} ${booking.travellerLastName}`,
            email: booking.email || "",
            phone: booking.phone,
            organization: (booking as any).companyName || "Individual",
          }}
          onSend={handleSendEmail}
        />
      )}
      {/* Navigation / Actions - Hidden in Print */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <nav className="flex text-sm text-slate-500">
          <button
            onClick={() => router.back()}
            className="hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
            Back to Booking
          </button>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-primary font-bold">Invoice</span>
        </nav>
        <div className="flex gap-3 items-center">
          {companyProfiles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Company profile
              </span>
              <select
                value={selectedCompanyId || ""}
                onChange={(e) => setSelectedCompanyId(e.target.value || null)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {companyProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                    {profile.address.city
                      ? ` (${profile.address.city}${
                          profile.address.country
                            ? `, ${profile.address.country}`
                            : ""
                        })`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] mr-2">
              print
            </span>
            Download PDF
          </button>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-600 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] mr-2">
              send
            </span>
            Send Email
          </button>
        </div>
      </div>

      {/* Invoice Container */}
      <div
        id="invoice-content"
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none"
        style={{ colorScheme: "only light" }}
      >
        {/* Header Section */}
        <div className="p-8 md:p-12 border-b border-slate-100">
          <div className="flex flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary flex items-center justify-center text-white font-black text-2xl">
                {settingsLogoUrl ? (
                  <Image
                    src={settingsLogoUrl}
                    alt={settingsCompanyName || "Company Logo"}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover"
                  />
                ) : (
                  "S"
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {settingsCompanyName ||
                    (selectedCompany && selectedCompany.name) ||
                    (booking as BookingWithAgency).issuedthroughagency ||
                    booking.agency ||
                    "SkyHigh Agency"}
                </h1>
                {/* <p className="text-sm text-slate-500 font-medium">
                  Your Trusted Travel Partner
                </p> */}
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                INVOICE
              </h2>
              <p className="text-lg font-bold text-slate-500">
                #{invoiceNumber}
              </p>
              <div className="mt-2 inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full border border-amber-200 uppercase tracking-wide print:border-slate-300 print:bg-transparent print:text-slate-900">
                {booking.paymentStatus || "PENDING"}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Company Information
            </h3>
            <address className="not-italic text-sm text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">
                {selectedCompany?.name ||
                  (booking as BookingWithAgency).issuedthroughagency ||
                  booking.agency ||
                  "SkyHigh Agency Ltd."}
              </p>
              {selectedCompany ? (
                <>
                  {selectedCompany.address.street && (
                    <p>{selectedCompany.address.street}</p>
                  )}
                  {(selectedCompany.address.city ||
                    selectedCompany.address.state ||
                    selectedCompany.address.postalCode) && (
                    <p>
                      {[
                        selectedCompany.address.city,
                        selectedCompany.address.state,
                        selectedCompany.address.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {selectedCompany.address.country && (
                    <p>{selectedCompany.address.country}</p>
                  )}
                  {selectedCompany.emails[0]?.value && (
                    <p>{selectedCompany.emails[0].value}</p>
                  )}
                  {selectedCompany.phones[0]?.value && (
                    <p>{selectedCompany.phones[0].value}</p>
                  )}
                </>
              ) : (
                <>
                  <p>123 Sky Tower, Aviation Street</p>
                  <p>Singapore, 018956</p>
                  <p>Tax ID: SG-99887766</p>
                  <p>support@skyhigh.com</p>
                </>
              )}
            </address>
          </div>
        </div>

        {/* Bill To & Invoice Details Section */}
        <div className="p-8 md:p-12 bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Billed To */}
            <div className="flex-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                BILLED TO
              </h3>
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="text-xl font-bold text-slate-900 mb-3">
                  {booking.travellerFirstName} {booking.travellerLastName}
                </h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      email
                    </span>
                    {booking.customer?.email || booking.email || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      phone
                    </span>
                    {booking.customer?.phone || booking.phone || "N/A"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      location_on
                    </span>
                    15 Swanston Street, Melbourne, VIC 3000, Australia
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Details Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    ISSUE DATE
                  </h3>
                  <p className="text-base font-bold text-slate-900">
                    {issueDate}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    PAYMENT DUE DATE
                  </h3>
                  <p className="text-base font-bold text-slate-900">
                    {dueDate}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    BOOKING REFERENCE
                  </h3>
                  <p className="text-base font-bold text-slate-900">
                    #{booking.id}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    PNR
                  </h3>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 text-sm font-bold rounded-lg border border-slate-200 uppercase font-mono tracking-wider">
                    {booking.PNR}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8 md:p-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-1/2">
                    Description
                  </th>
                  <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                    Unit Price
                  </th>
                  <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                    Qty
                  </th>
                  <th className="py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Main Flight Item */}
                <tr className="border-b border-slate-50 group">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-slate-900">
                      Flight: {booking.origin} to {booking.destination}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {booking.airlines} ({booking.flightNumber}) -{" "}
                      {booking.flightClass} Class
                    </p>
                  </td>
                  <td className="py-4 text-right font-medium text-slate-600">
                    ${sellingPrice.toFixed(2)}
                  </td>
                  <td className="py-4 text-center font-medium text-slate-600">
                    1
                  </td>
                  <td className="py-4 text-right font-bold text-slate-900">
                    ${sellingPrice.toFixed(2)}
                  </td>
                </tr>

                {/* Add-ons */}
                {addons.map((addon, index) => (
                  <tr key={index} className="border-b border-slate-50 group">
                    <td className="py-4 pr-4">
                      <p className="font-bold text-slate-900">{addon.name}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        Additional Service
                      </p>
                    </td>
                    <td className="py-4 text-right font-medium text-slate-600">
                      ${addon.price.toFixed(2)}
                    </td>
                    <td className="py-4 text-center font-medium text-slate-600">
                      1
                    </td>
                    <td className="py-4 text-right font-bold text-slate-900">
                      ${addon.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-8 flex flex-col md:flex-row justify-end">
            <div className="w-full md:w-1/3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500">Tax (Included)</span>
                <span className="font-bold text-slate-900">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500">Discount</span>
                <span className="font-bold text-slate-900">
                  -${discount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xl pt-4 border-t-2 border-slate-100">
                <span className="font-black text-slate-900">Grand Total</span>
                <span className="font-black text-primary">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
              <div className="text-right text-xs text-slate-400 mt-2">
                All prices are in USD
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 text-center">
          <h4 className="font-bold text-slate-900 mb-2">
            Thank you for booking with{" "}
            {(booking as BookingWithAgency).issuedthroughagency ||
              booking.agency ||
              "SkyHigh Agency"}
            !
          </h4>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Please note that this invoice is computer generated and is valid
            without a signature. For any billing inquiries, please contact our
            support team at support@skyhigh.com or call +1 800 123 4567 within 7
            days of receiving this invoice.
          </p>
        </div>
      </div>
    </div>
  );
}
