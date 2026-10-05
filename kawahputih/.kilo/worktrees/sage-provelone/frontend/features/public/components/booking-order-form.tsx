"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { bookingService, BookingError } from "@/services/booking.service";
import { useBookingStore } from "@/store/booking.store";
import { calculateBookingTotals, rupiah, todayISO, addDaysISO } from "@/lib/business";
import { BOOKING_CONFIG } from "@/config/app.config";
import { useAuthStore } from "@/store/auth.store";
import type { Ticket } from "@/types/domain";

// ============================================================================
// BOOKING ORDER FORM — alur pemesanan pengunjung.
//   pilih tanggal → pilih jenis & jumlah tiket → isi data → ringkasan → bayar.
// Semua harga/kapasitas dari mock DB (bukan hardcode), total via utilitas
// terpusat calculateBookingTotals, validasi via Zod.
// ============================================================================

const visitorSchemaZ = {
  name: (v: string) => (v.trim().length >= 3 ? null : "Nama lengkap minimal 3 karakter"),
  email: (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Format email tidak valid"),
  phone: (v: string) => (/^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(v.replace(/[\s-]/g, "")) ? null : "Nomor HP tidak valid (contoh: 081234567890)"),
};

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  visitDate?: string;
  items?: string;
}

export function BookingOrderForm() {
  const router = useRouter();
  const setDraft = useBookingStore((s) => s.setDraft);
  const user = useAuthStore((s) => s.user);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [visitDate, setVisitDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<FieldErrors>({});

  // Prefill dari profil user yang login.
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  // Muat tiket aktif dari mock service.
  useEffect(() => {
    let alive = true;
    bookingService
      .listTickets()
      .then((ts) => {
        if (!alive) return;
        setTickets(ts);
        setQty(Object.fromEntries(ts.map((t) => [t.id, 0])));
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoadError(true);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const minDate = addDaysISO(todayISO(), BOOKING_CONFIG.minDaysAhead);
  const maxDate = addDaysISO(todayISO(), BOOKING_CONFIG.maxDaysAhead);

  const lines = useMemo(
    () => tickets.map((t) => ({ ...t, quantity: qty[t.id] ?? 0 })).filter((t) => t.quantity > 0),
    [tickets, qty]
  );

  // Total dihitung lewat SATU utilitas terpusat.
  const totals = useMemo(
    () => calculateBookingTotals(lines.map((l) => ({ price: l.price, quantity: l.quantity }))),
    [lines]
  );

  function change(key: string, delta: number) {
    setQty((prev) => {
      const next = Math.max(0, Math.min(BOOKING_CONFIG.maxQuantityPerTicket, (prev[key] ?? 0) + delta));
      return { ...prev, [key]: next };
    });
  }

  function validate(): boolean {
    const errs: FieldErrors = {};
    const nameErr = visitorSchemaZ.name(name);
    const emailErr = visitorSchemaZ.email(email);
    const phoneErr = visitorSchemaZ.phone(phone);
    if (nameErr) errs.name = nameErr;
    if (emailErr) errs.email = emailErr;
    if (phoneErr) errs.phone = phoneErr;
    if (!visitDate) errs.visitDate = "Pilih tanggal kunjungan.";
    if (lines.length === 0) errs.items = "Pilih minimal satu jenis tiket.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { booking } = await bookingService.create({
        visitDate,
        items: lines.map((l) => ({ ticketId: l.id, quantity: l.quantity })),
        visitorName: name,
        email,
        phone,
        note: note || undefined,
      });
      setDraft({
        visitDate,
        items: lines.map((l) => ({ ticketId: l.id, ticketName: l.name, price: l.price, quantity: l.quantity })),
        visitorName: name,
        email,
        phone,
        note: note || undefined,
        totals,
      });
      toast.success("Pesanan dibuat", { description: `Kode booking ${booking.id}. Lanjutkan ke pembayaran.` });
      router.push(`/payment?code=${booking.id}`);
    } catch (err) {
      const message = err instanceof BookingError ? err.message : "Terjadi kesalahan saat membuat pesanan.";
      toast.error("Gagal membuat pesanan", { description: message });
      setErrors({ items: message });
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    "h-10 w-full rounded-md border border-[#d7e3ed] bg-white px-3 text-sm text-[#17324d] outline-none placeholder:text-[#94A3B8] focus:border-[#1768ad]";
  const errText = "mt-1 text-xs text-red-600";

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-72 animate-pulse rounded-md border border-[#d7e3ed] bg-white" />
        <div className="h-72 animate-pulse rounded-md border border-[#d7e3ed] bg-white" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-md border border-[#fdeaea] bg-[#fdeaea] p-6 text-center">
        <p className="text-sm text-[#c53030]">Terjadi kesalahan saat memuat data tiket.</p>
        <button
          onClick={() => {
            setLoadError(false);
            setLoading(true);
            bookingService.listTickets().then((ts) => {
              setTickets(ts);
              setQty(Object.fromEntries(ts.map((t) => [t.id, 0])));
              setLoading(false);
            });
          }}
          className="mt-3 rounded-md bg-[#1768ad] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14548f]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <section className="rounded-md border border-[#d7e3ed] bg-white p-5">
          <h2 className="text-base font-bold text-[#17324d]">Data Pemesanan</h2>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#29445e]">Nama Lengkap*</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sesuai KTP/paspor/SIM"
                className={field}
                aria-invalid={!!errors.name}
              />
              {errors.name && <span className={errText}>{errors.name}</span>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#29445e]">Tanggal Kunjungan*</span>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className={field}
                aria-invalid={!!errors.visitDate}
              />
              {errors.visitDate && <span className={errText}>{errors.visitDate}</span>}
              <span className="mt-1 block text-[11px] text-[#94A3B8]">
                Pemesanan {BOOKING_CONFIG.minDaysAhead === 0 ? "hari ini" : `H-${BOOKING_CONFIG.minDaysAhead}`} hingga {BOOKING_CONFIG.maxDaysAhead} hari ke depan.
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#29445e]">No. Handphone*</span>
              <span className="flex">
                <span className="grid h-10 place-items-center rounded-l-md border border-r-0 border-[#d7e3ed] bg-[#f7fbff] px-3 text-sm text-[#698097]">
                  +62
                </span>
                <input
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="81234567890"
                  className={`${field} rounded-l-none`}
                  aria-invalid={!!errors.phone}
                />
              </span>
              {errors.phone && <span className={errText}>{errors.phone}</span>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#29445e]">Email*</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className={field}
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className={errText}>{errors.email}</span>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#29445e]">Catatan (opsional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-[#d7e3ed] bg-white px-3 py-2 text-sm text-[#17324d] outline-none focus:border-[#1768ad]"
              />
            </label>
          </div>
        </section>

        <section className="mt-4 rounded-md border border-[#d7e3ed] bg-white p-5">
          <h2 className="text-base font-bold text-[#17324d]">Jumlah Pengunjung & Jenis Tiket</h2>
          {errors.items && <p className="mt-2 text-xs text-red-600">{errors.items}</p>}
          <div className="mt-4 space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-[#e5edf3] p-3">
                <div>
                  <p className="text-sm font-semibold text-[#17324d]">{t.name}</p>
                  <p className="text-xs text-[#698097]">
                    {t.description} — {rupiah(t.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => change(t.id, -1)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-[#d7e3ed] text-[#29445e] hover:bg-[#f2f7fb]"
                    aria-label={`Kurangi ${t.name}`}
                    disabled={(qty[t.id] ?? 0) === 0}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums text-[#17324d]">{qty[t.id] ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => change(t.id, 1)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-[#d7e3ed] text-[#29445e] hover:bg-[#f2f7fb]"
                    aria-label={`Tambah ${t.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-md border border-[#d7e3ed] bg-white p-5 lg:sticky lg:top-24">
        <h3 className="text-sm font-bold text-[#17324d]">Rincian Pesanan</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {lines.length === 0 && <li className="text-[#94A3B8]">Belum ada tiket dipilih.</li>}
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between">
              <span className="text-[#698097]">
                {l.name} × {l.quantity}
              </span>
              <span className="font-medium tabular-nums text-[#17324d]">{rupiah(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-[#e5edf3] pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#698097]">Subtotal</span>
            <span className="tabular-nums text-[#17324d]">{rupiah(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-[#16876a]">
              <span>Diskon</span>
              <span className="tabular-nums">-{rupiah(totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#698097]">Biaya Layanan</span>
            <span className="tabular-nums text-[#17324d]">{rupiah(totals.serviceFee)}</span>
          </div>
          {totals.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-[#698097]">Pajak</span>
              <span className="tabular-nums text-[#17324d]">{rupiah(totals.tax)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[#e5edf3] pt-2 font-bold">
            <span className="text-[#17324d]">Total ({totals.totalTickets} tiket)</span>
            <span className="tabular-nums text-[#17324d]">{rupiah(totals.total)}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || lines.length === 0}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1768ad] text-sm font-semibold text-white hover:bg-[#14548f] disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Memproses..." : "Lanjut ke Pembayaran"}
        </button>
        <p className="mt-2 text-center text-[11px] text-[#94A3B8]">Pembayaran diproses via simulasi QRIS.</p>
      </aside>
    </form>
  );
}
