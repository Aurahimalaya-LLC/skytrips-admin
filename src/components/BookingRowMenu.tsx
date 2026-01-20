"use client";
import { useState, useEffect, useRef } from "react";
import RefundConfirmModal from "@/components/RefundConfirmModal";
import SignInPromptModal from "@/components/SignInPromptModal";
import { supabase } from "@/lib/supabase";
import { ManageBooking } from "@/types";
import { Booking } from "@/types";

export default function BookingRowMenu({
  booking,
  onRefund,
  onReissue,
}: {
  booking: Booking;
  onRefund: () => void;
  onReissue: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState(false);
  const [isAuthorizedUser, setIsAuthorizedUser] = useState(false);
  const [localUser, setLocalUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const checkUserAuthorization = async () => {
      let emailToCheck = "";
      let userId = "";

      // 1. Try localStorage "sky_admin_user"
      if (typeof window !== "undefined") {
        const storedStr = localStorage.getItem("sky_admin_user");
        if (storedStr) {
          try {
            const parsed = JSON.parse(storedStr);
            if (parsed.email) {
              emailToCheck = parsed.email;
              userId = parsed.id;
            }
          } catch (e) {
            console.error("Error parsing sky_admin_user", e);
          }
        }
      }

      // 2. Fallback to Supabase auth if not found in localStorage
      if (!emailToCheck) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.email) {
          emailToCheck = user.email;
          userId = user.id;
        }
      }

      if (emailToCheck) {
        // Check if user exists in the 'users' list
        const { data } = await supabase
          .from("users")
          .select("email")
          .eq("email", emailToCheck)
          .maybeSingle();

        if (data) {
          setIsAuthorizedUser(true);
          setLocalUser({ id: userId, email: emailToCheck });
        }
      }
    };
    checkUserAuthorization();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
    });
    const { data: authSub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      },
    );
    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  const options = [
    {
      label: "Refund",
      icon: "currency_exchange",
      action: async () => {
        const { data, error: preError } = await supabase
          .from("manage_booking")
          .select("uid")
          .eq("booking_id", String(booking.id))
          .limit(1)
          .maybeSingle();
        if (!preError && data && (data as ManageBooking).uid) {
          setPendingUid((data as ManageBooking).uid);
        } else {
          setPendingUid(crypto.randomUUID());
        }
        setIsRefundOpen(true);
      },
    },
    { label: "Re-issue", icon: "sync", action: onReissue },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % options.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? options.length - 1 : prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0) {
          options[activeIndex].action();
          setOpen(false);
          setActiveIndex(-1);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex flex-col items-center">
      <button
        type="button"
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="size-10 min-w-10 min-h-10 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 mt-2"
      >
        <span className="material-symbols-outlined text-[18px]">more_vert</span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`Actions for booking ${booking.id}`}
          className="absolute z-30 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-xl animate-in fade-in duration-300"
        >
          <ul className="py-2">
            {options.map((opt, idx) => (
              <li key={opt.label}>
                <button
                  role="menuitem"
                  tabIndex={0}
                  aria-label={opt.label}
                  onClick={() => {
                    opt.action();
                    setOpen(false);
                    setActiveIndex(-1);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 ${activeIndex === idx ? "bg-slate-50" : ""}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-105">
                    {opt.icon}
                  </span>
                  <span>{opt.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isRefundOpen && (
        <RefundConfirmModal
          isOpen={isRefundOpen}
          bookingId={booking.id}
          bookingDate={
            booking.travelDate ||
            `${booking.IssueDay || ""} ${booking.issueMonth || ""} ${booking.issueYear || ""}`
          }
          amount={Number(booking.sellingPrice || booking.buyingPrice || 0)}
          isAuthenticated={isAuthenticated || !!localUser}
          onRequireAuth={() => setIsSignInPromptOpen(true)}
          hideWarning={isAuthorizedUser}
          onConfirm={async () => {
            console.log("analytics:event", {
              type: "refund_confirmed",
              bookingId: booking.id,
              amount: booking.sellingPrice || booking.buyingPrice || 0,
            });
            setIsSubmitting(true);

            let finalUserId = "";
            const {
              data: { session },
              error: sessError,
            } = await supabase.auth.getSession();

            if (session) {
              finalUserId = session.user.id;
            } else if (localUser && localUser.id) {
              finalUserId = localUser.id;
            }

            if (sessError && !finalUserId) {
              alert("Authentication check failed");
              setIsSubmitting(false);
              return;
            }
            if (!finalUserId) {
              alert("Sign in required");
              setIsSubmitting(false);
              return;
            }
            if (!booking.id) {
              alert("Invalid booking ID");
              setIsSubmitting(false);
              return;
            }
            if (!pendingUid) {
              alert("Unable to generate UID");
              setIsSubmitting(false);
              return;
            }
            try {
              // Use API to create manage booking record with type and details
              const res = await fetch("/api/manage-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  uid: pendingUid,
                  booking: booking,
                  user_id: finalUserId,
                  type: "Refund",
                }),
              });

              if (!res.ok) {
                const j = await res.json();
                throw new Error(
                  j.error || "Failed to create manage booking record",
                );
              }
            } catch (e) {
              console.error(
                "Insert exception:",
                e instanceof Error ? e.message : e,
              );
              alert(
                "Network or server error while creating manage booking record",
              );
              setIsSubmitting(false);
              return;
            }
            setIsRefundOpen(false);
            setIsSubmitting(false);
            onRefund();
          }}
          onCancel={() => {
            console.log("analytics:event", {
              type: "refund_cancelled",
              bookingId: booking.id,
            });
            setIsRefundOpen(false);
          }}
          isProcessing={isSubmitting}
        />
      )}
      {isSignInPromptOpen && (
        <SignInPromptModal
          isOpen={isSignInPromptOpen}
          onClose={() => setIsSignInPromptOpen(false)}
        />
      )}
    </div>
  );
}
