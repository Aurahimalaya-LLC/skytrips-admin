import { Booking, Customer } from "@/types";

export function getCustomerName(booking: Booking | null): string {
  if (!booking) return "";

  if (booking.customer && typeof booking.customer === "object") {
    const customer = booking.customer as Customer;
    return `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
  }

  if (booking.travellers && booking.travellers.length > 0) {
    const traveller = booking.travellers[0];
    return `${traveller.firstName || ""} ${traveller.lastName || ""}`.trim();
  }

  return "";
}

export function getCustomerEmail(booking: Booking | null): string {
  if (!booking) return "";
  
  if (booking.customer && typeof booking.customer === "object") {
    const customer = booking.customer as Customer;
    if (customer.email) return customer.email;
  }
  
  return booking.email || "";
}

export function getCustomerPhone(booking: Booking | null): string {
  if (!booking) return "";
  
  if (booking.customer && typeof booking.customer === "object") {
    const customer = booking.customer as Customer;
    if (customer.phone) return customer.phone;
  }
  
  return booking.phone || "";
}
