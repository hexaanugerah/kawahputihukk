import type { Metadata } from "next";
import Link from "next/link";
import { BookingOrderForm } from "@/features/public/components/booking-order-form";

export const metadata: Metadata = {
  title: "Pemesanan",
  description: "Lengkapi data pemesanan tiket Kawah Putih.",
};

export default function BookingPage() {
  return (
    <div className="page-shell py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#17324d]">Pemesanan Anda</h1>
          <p className="mt-1 text-sm text-[#698097]">
            Lengkapi data pemesanan untuk melanjutkan ke pembayaran.
          </p>
        </div>
        <Link
          href="/login?redirect=/booking"
          className="text-sm font-semibold text-[#1768ad] hover:underline"
        >
          Log-in Sebagai Pengunjung
        </Link>
      </div>

      <BookingOrderForm />
    </div>
  );
}
