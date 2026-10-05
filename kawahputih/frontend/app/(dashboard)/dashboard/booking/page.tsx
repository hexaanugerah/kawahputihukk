import type { Metadata } from "next";
import { MyBookingsList } from "@/features/booking/components/my-bookings-list";

export const metadata: Metadata = { title: "Booking Saya" };

export default function MyBookingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Booking Saya</h1>
      <MyBookingsList />
    </div>
  );
}
