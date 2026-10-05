"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bookingService, BookingError } from "@/services/booking.service";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency } from "@/lib/currency";
import type { TourismPackage } from "@/types/destination";

// ============================================================================
// BOOKING FORM (paket wisata) — membuat booking dari halaman detail paket.
// Memakai mock booking service; setelah create, lanjut ke halaman payment.
// ============================================================================

export function BookingForm({ pkg }: { pkg: TourismPackage }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [visitDate, setVisitDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const unit = Math.round(pkg.price_cents / 100);
  const total = unit * quantity;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan masuk terlebih dahulu untuk booking");
      router.push(`/login?redirect=/packages/${pkg.id}`);
      return;
    }

    const errs: Record<string, string> = {};
    if (!visitDate) errs.visitDate = "Pilih tanggal kunjungan";
    if (quantity < 1) errs.quantity = "Jumlah minimal 1";
    if (name.trim().length < 3) errs.name = "Nama minimal 3 karakter";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Email tidak valid";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const { booking } = await bookingService.create({
        visitDate,
        items: [{ ticketId: "tkt-reguler", quantity }],
        visitorName: name,
        email,
        phone,
      });
      toast.success("Booking dibuat", { description: `Kode ${booking.id}` });
      router.push(`/payment?code=${booking.id}`);
    } catch (err) {
      toast.error(err instanceof BookingError ? err.message : "Gagal membuat booking");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <label className="mb-1 block text-sm font-medium">Tanggal Kunjungan</label>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600"
        />
        {errors.visitDate && <p className="mt-1 text-xs text-red-600">{errors.visitDate}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Jumlah Tiket</label>
        <input
          type="number"
          min={1}
          max={20}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600"
        />
        {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nama Pemesan</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600"
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600"
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
        <span className="text-slate-500">Total</span>
        <span className="font-semibold">{formatCurrency(total * 100, pkg.currency)}</span>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="h-10 w-full rounded-md bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Memproses..." : "Booking Sekarang"}
      </button>
    </form>
  );
}
