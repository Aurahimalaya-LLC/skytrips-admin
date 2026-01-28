"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Booking, Traveller } from "@/types";
import { getCustomerName } from "@/lib/booking-helpers";
import { CompanyProfile } from "@/types/company";
import SendEmailModal from "@/components/booking-management/SendEmailModal";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

type BookingWithAgency = Booking & { issuedthroughagency?: string };

export default function ETicketPage({
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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [settingsCompanyName, setSettingsCompanyName] = useState<string>("");
  const [settingsLogoUrl, setSettingsLogoUrl] = useState<string>("");

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
  }, []); // Run only on mount

  useEffect(() => {
    if (!bookingId) return;
    fetchBookingDetails();
  }, [bookingId]);

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
            Error Loading E-Ticket
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

  const handlePrint = () => {
    window.print();
  };

  const ticketNumber =
    booking.travellers?.[0]?.eticketNumber ||
    `TKT-${String(booking.id).padStart(10, "0")}`;
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

  const isRoundTrip = booking.tripType === "Round Trip";
  const hasItineraries = booking.itineraries && booking.itineraries.length > 0;

  // Helper to format duration from PT format (e.g. PT4H15M) or simple format (e.g. 2h, 4h)
  const formatDuration = (duration?: string) => {
    if (!duration) return "";

    // Check for PT format first
    const hoursMatch = duration.match(/(\d+)[hH]/);
    const minsMatch = duration.match(/(\d+)[mM]/);

    if (hoursMatch || minsMatch) {
      const hours = hoursMatch ? hoursMatch[1] : "0";
      const mins = minsMatch ? minsMatch[1] : "0";
      return `${hours}h ${mins}m`;
    }

    // Fallback for simple strings like "2h" if not caught above (though above regex catches it too)
    return duration;
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return { date: "Date N/A", time: "Time N/A" };
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return { date: "Invalid Date", time: "" };
      }
      return {
        date: date.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch (e) {
      return { date: isoString || "N/A", time: "" };
    }
  };

  // Pricing Breakdown
  const sellingPrice = Number(booking.sellingPrice) || 0;
  // Try to use stored prices or fall back to mock
  const prices = booking.prices as Record<string, string | number> | undefined;
  const baseFare = prices?.baseFare
    ? Number(prices.baseFare)
    : sellingPrice * 0.85;
  const taxes = prices?.taxes ? Number(prices.taxes) : sellingPrice * 0.1;
  const fees = prices?.fees ? Number(prices.fees) : sellingPrice * 0.05;

  // Dynamic Support Info based on selected company
  const supportPhone = selectedCompany?.phones[0]?.value || "+1 800 123 4567";
  const supportEmail =
    selectedCompany?.emails[0]?.value || "support@skyhigh.com";
  const supportHours = "24/7 Support"; // Could be added to company profile later

  const handleSendEmail = async (data: {
    subject: string;
    message: string;
    template: string;
  }) => {
    if (!booking) return;
    if (!booking.email || !String(booking.email).trim()) {
      throw new Error("Recipient email is missing");
    }
    try {
      const element = document.getElementById("eticket-content");
      if (!element) throw new Error("Ticket content not found");

      // Wait for fonts to load before capturing
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (doc) => {
          // Ensure we don't have issues with oklab in case the Pro version still hiccups on some systems
          // and also force font visibility
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
                "important",
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
      const pdf = new jsPDF("p", "mm", [imgWidth, imgHeight], true);
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight,
      );

      const pdfBase64 = pdf.output("datauristring");

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: booking.email,
          subject: data.subject.replace("{PNR}", booking.PNR || ""),
          message: data.message
            .replace("{NAME}", getCustomerName(booking))
            .replace("{PNR}", booking.PNR || "")
            .replace("{ORIGIN}", booking.origin)
            .replace("{DESTINATION}", booking.destination)
            .replace("{DEPARTURE_DATE}", booking.travelDate || "")
            .replace("{FLIGHT_NUMBER}", booking.flightNumber || "")
            .replace("{AMOUNT}", booking.sellingPrice?.toString() || ""),
          attachment: {
            filename: `Eticket-${booking.PNR || "Booking"}.pdf`,
            content: pdfBase64,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        const errorMessage = errData.details
          ? `${errData.error}: ${errData.details}`
          : errData.error || "Failed to send email";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Error sending ticket:", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-2 md:p-4 print:p-0 print:bg-white font-display">
      {booking && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          recipient={{
            name:
              booking.customer && typeof booking.customer === "object"
                ? `${booking.customer.firstName} ${booking.customer.lastName}`
                : `${booking.travellers?.[0]?.firstName || ""} ${
                    booking.travellers?.[0]?.lastName || ""
                  }`,
            email: booking.email || "",
            phone: booking.phone,
            organization: (booking as Booking & { companyName?: string }).companyName || "Individual",
            pnr: booking.PNR,
          }}
          onSend={handleSendEmail}
        />
      )}
      {/* Navigation / Actions - Hidden in Print */}
      <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <nav className="flex text-sm text-slate-500">
          <button
            onClick={() => router.back()}
            className="hover:text-slate-800 transition-colors flex items-center gap-1"
            title="Back to Booking"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </button>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-primary font-bold">E-Ticket</span>
        </nav>
        <div className="flex gap-3 items-center">
          {companyProfiles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Profile
              </span>
              <select
                value={selectedCompanyId || ""}
                onChange={(e) => setSelectedCompanyId(e.target.value || null)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-w-[150px]"
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
            Send Ticket
          </button>
        </div>
      </div>

      {/* Ticket Container */}
      <div
        id="eticket-content"
        className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none"
        style={{ colorScheme: "only light" }}
      >
        {/* Header Section */}
        <div className="p-8 md:p-10 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12  rounded-lg flex items-center justify-center text-white font-black text-2xl overflow-hidden">
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
                <h1 className="text-xl font-black text-slate-900 tracking-tight mb-1">
                  {settingsCompanyName ||
                    (selectedCompany && selectedCompany.name) ||
                    (booking as BookingWithAgency).issuedthroughagency ||
                    booking.agency ||
                    "SkyHigh Agency"}
                </h1>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
                E-TICKET
              </h2>
              <p className="text-base font-bold text-slate-500">
                PNR:{" "}
                <span className="text-primary">{booking.PNR || "UNKNOWN"}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200/60">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Company Information
            </h3>
            <address className="not-italic text-sm text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">
                {selectedCompany?.name ||
                  (booking as BookingWithAgency).issuedthroughagency ||
                  booking.agency ||
                  "Sktrips"}
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

        {/* Flight Details */}
        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                flight
              </span>
              Flight Itinerary
            </h3>

            <div className="space-y-6">
              {hasItineraries ? (
                booking.itineraries?.map((itinerary, index) => {
                  const segments = itinerary.segments;
                  if (!segments || segments.length === 0) return null;

                  const isReturn = index > 0;

                  return (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 border rounded uppercase ${
                              isReturn
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {isReturn ? "Return" : "Outbound"}
                          </span>
                          <span className="font-bold text-slate-900">
                            {booking.airlines}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          {booking.flightClass || "Economy"} Class
                        </div>
                      </div>

                      {/* Segments Loop */}
                      <div className="divide-y divide-slate-100">
                        {segments.map((segment, segIndex) => {
                          const dep = formatDateTime(segment.departure.at);
                          const arr = formatDateTime(segment.arrival.at);

                          // Calculate layover if not the last segment
                          let layoverInfo = null;
                          if (segIndex < segments.length - 1) {
                            const nextSegment = segments[segIndex + 1];
                            if (
                              segment.arrival.at &&
                              nextSegment.departure.at
                            ) {
                              // Simple string diff or just show "Layover"
                              layoverInfo = "Layover / Change Planes";
                            }
                          }

                          return (
                            <div key={segIndex} className="p-6">
                              <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Departure */}
                                <div className="flex-1 w-full">
                                  <div className="text-2xl font-black text-slate-900">
                                    {segment.departure.iataCode}
                                  </div>
                                  <div className="text-xs font-bold text-slate-500 uppercase mt-1">
                                    {segment.departure.terminal
                                      ? `Terminal ${segment.departure.terminal}`
                                      : "Airport"}
                                  </div>
                                  <div className="text-sm font-medium text-slate-500 mt-1">
                                    {dep.date}
                                  </div>
                                  <div className="text-sm text-slate-400 mt-1">
                                    {dep.time}
                                  </div>
                                </div>

                                {/* Flight Info / Duration */}
                                <div className="flex flex-col items-center justify-center px-4 text-slate-300 relative">
                                  <div className="border-t-2 border-dashed border-slate-200 w-24 relative top-3"></div>
                                  <span
                                    className={`material-symbols-outlined text-2xl bg-white relative z-10 px-2 ${
                                      isReturn ? "transform rotate-180" : ""
                                    }`}
                                  >
                                    flight_takeoff
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                                    {formatDuration(segment.duration)}
                                  </span>
                                  <div className="mt-1 text-[10px] text-slate-400 font-bold border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50">
                                    {segment.carrierCode} {segment.number}
                                  </div>
                                  {segment.aircraft?.code && (
                                    <div className="mt-1 text-[10px] text-slate-300">
                                      Eqp: {segment.aircraft.code}
                                    </div>
                                  )}
                                </div>

                                {/* Arrival */}
                                <div className="flex-1 w-full text-right md:text-left">
                                  <div className="text-2xl font-black text-slate-900">
                                    {segment.arrival.iataCode}
                                  </div>
                                  <div className="text-xs font-bold text-slate-500 uppercase mt-1">
                                    {segment.arrival.terminal
                                      ? `Terminal ${segment.arrival.terminal}`
                                      : "Airport"}
                                  </div>
                                  <div className="text-sm font-medium text-slate-500 mt-1">
                                    {arr.date}
                                  </div>
                                  <div className="text-sm text-slate-400 mt-1">
                                    {arr.time}
                                  </div>
                                </div>
                              </div>

                              {/* Layover Indicator */}
                              {layoverInfo && (
                                <div className="mt-6 mx-auto max-w-sm bg-slate-50 border border-slate-200 rounded-lg py-2 px-4 text-center">
                                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">
                                      schedule
                                    </span>
                                    {layoverInfo}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-sm">
                        <div className="flex gap-8">
                          <div>
                            <span className="text-slate-400 text-xs font-bold uppercase mr-2">
                              Baggage
                            </span>
                            <span className="font-bold text-slate-700">
                              {booking.addons?.luggage
                                ? "Included"
                                : "Standard"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-xs font-bold uppercase mr-2">
                              Status
                            </span>
                            <span className="font-bold text-emerald-600">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback for Legacy Bookings (No Itineraries) */
                <>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded uppercase">
                          Outbound
                        </span>
                        <span className="font-bold text-slate-900">
                          {booking.airlines}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                          {booking.flightNumber || "N/A"}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        {booking.flightClass || "Economy"} Class
                      </div>
                    </div>

                    <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1 w-full">
                        <div className="text-2xl font-black text-slate-900">
                          {booking.origin}
                        </div>
                        <div className="text-sm font-medium text-slate-500 mt-1">
                          {booking.travelDate ||
                            booking.departureDate ||
                            "Date N/A"}
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center px-4 text-slate-300 relative group">
                        <div className="border-t-2 border-dashed border-slate-200 w-24 relative top-3"></div>
                        <span className="material-symbols-outlined text-2xl bg-white relative z-10 px-2">
                          flight_takeoff
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-2">
                          Direct
                        </span>
                      </div>

                      <div className="flex-1 w-full text-right md:text-left">
                        <div className="text-2xl font-black text-slate-900">
                          {booking.destination}
                        </div>
                        <div className="text-sm font-medium text-slate-500 mt-1">
                          {booking.arrivalDate || "Date N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isRoundTrip && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded uppercase">
                            Return
                          </span>
                          <span className="font-bold text-slate-900">
                            {booking.airlines}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 w-full">
                          <div className="text-2xl font-black text-slate-900">
                            {booking.destination}
                          </div>
                          <div className="text-sm font-medium text-slate-500 mt-1">
                            {booking.returnDate || "Date N/A"}
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center px-4 text-slate-300 relative group">
                          <div className="border-t-2 border-dashed border-slate-200 w-24 relative top-3"></div>
                          <span className="material-symbols-outlined text-2xl bg-white relative z-10 px-2 transform rotate-180">
                            flight_takeoff
                          </span>
                        </div>

                        <div className="flex-1 w-full text-right md:text-left">
                          <div className="text-2xl font-black text-slate-900">
                            {booking.origin}
                          </div>
                          <div className="text-sm font-medium text-slate-500 mt-1">
                            Date N/A
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                payments
              </span>
              Pricing Details
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 bg-white">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">
                      Base Fare
                    </span>
                    <span className="font-bold text-slate-900">
                      ${baseFare.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">
                      Taxes & Surcharges
                    </span>
                    <span className="font-bold text-slate-900">
                      ${taxes.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">
                      Service Fees
                    </span>
                    <span className="font-bold text-slate-900">
                      ${fees.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-100 text-base">
                    <span className="font-black text-slate-900">
                      Total Paid
                    </span>
                    <span className="font-black text-primary">
                      ${sellingPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                group
              </span>
              Passenger Information
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Name
                    </th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Ticket Number
                    </th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Passport
                    </th>
                    <th className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {booking.travellers && booking.travellers.length > 0 ? (
                    booking.travellers.map((traveller: Traveller, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {traveller.firstName} {traveller.lastName}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600">
                          {ticketNumber}-{index + 1}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {traveller.passportNumber || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">
                          Confirmed
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>{/* Empty row handling */}</tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Rules & Policies */}
          <div className="mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                gavel
              </span>
              Fare Rules & Policies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  Cancellation Policy
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cancellations made 48 hours before departure are eligible for
                  a partial refund subject to airline fees. Cancellations within
                  24 hours are non-refundable.
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 bg-white">
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  Change Policy
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Date changes are permitted up to 24 hours before departure
                  with a change fee of $50 plus any fare difference. Name
                  changes are not allowed.
                </p>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                info
              </span>
              Important Information
            </h4>
            <ul className="text-xs text-amber-800 space-y-1 list-disc pl-5">
              <li>
                Please arrive at the airport at least 3 hours before departure
                for international flights.
              </li>
              <li>
                Valid passport and visa (if applicable) are required for travel.
              </li>
              <li>
                This is an electronic ticket. You can print this out or show it
                on your mobile device at the check-in counter.
              </li>
              <li>
                Baggage allowance is subject to airline regulations. Please
                check with the airline for more details.
              </li>
            </ul>
          </div>
          {/* Support Information */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-white mt-8">
            <h4 className="text-sm font-bold text-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                support_agent
              </span>
              Customer Support
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                  24/7 Support Line
                </div>
                <a
                  href={`https://wa.me/${supportPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold hover:text-primary transition-colors text-slate-400"
                >
                  {supportPhone}
                </a>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                  Email Support
                </div>
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-sm font-bold hover:text-primary transition-colors text-slate-400"
                >
                  {supportEmail}
                </a>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">
                  Operating Hours
                </div>
                <div className="text-sm font-bold flex items-center gap-2 text-slate-400">
                  {supportHours}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <span className="material-symbols-outlined text-[16px] text-red-400">
                emergency
              </span>
              For emergency travel assistance within 24 hours of departure,
              please use the priority line above.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()}{" "}
            {selectedCompany?.name ||
              (booking as BookingWithAgency).issuedthroughagency ||
              booking.agency ||
              "Sktrips"}
            . All rights reserved.
          </p>
          <p className="mt-1">Issued Date: {issueDate}</p>
        </div>
      </div>
    </div>
  );
}
