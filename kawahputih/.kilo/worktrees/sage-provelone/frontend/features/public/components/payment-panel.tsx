"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Timer, QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  bookingService,
  paymentService,
  BookingError,
  type PaymentOutcome,
} from "@/services/booking.service";
import { rupiah } from "@/lib/business";
import type { Booking, Payment } from "@/types/domain";

// ============================================================================
// PAYMENT PANEL — simulasi pembayaran QRIS.
//   Menunggu Pembayaran → Memproses → Berhasil / Gagal / Kadaluarsa.
// Hasil demo dapat dipaksa lewat tombol kecil (mode demo) agar ketiga alur
// (sukses/gagal/kadaluarsa) mudah diuji.
// ============================================================================

type Phase = "LOADING" | "WAITING" | "PROCESSING" | "SUCCESS" | "FAILED" | "EXPIRED" | "NOT_FOUND";

export function PaymentPanel({ code }: { code?: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("LOADING");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Muat booking + payment dari mock DB.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!code) {
        setPhase("NOT_FOUND");
        return;
      }
      try {
        const b = await bookingService.getBooking(code);
        const p = await paymentService.getByBookingId(code);
        if (!alive) return;
        setBooking(b);
        setPayment(p);
        setPhase(b.status === "PENDING" ? "WAITING" : b.status === "CONFIRMED" || b.status === "USED" ? "SUCCESS" : "FAILED");
      } catch {
        if (alive) setPhase("NOT_FOUND");
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);

  // Countdown kadaluarsa pembayaran.
  useEffect(() => {
    if (!payment || phase !== "WAITING") return;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(payment.expiredAt).getTime() - Date.now()) / 1000));
      setCountdown(left);
      if (left === 0) {
        setPhase("EXPIRED");
        paymentService.expirePayment(payment.bookingId);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [payment, phase]);

  async function pay(outcome: PaymentOutcome) {
    if (!booking) return;
    setPhase("PROCESSING");
    try {
      const res = await paymentService.processPayment(booking.id, outcome);
      if (res.outcome === "SUCCESS") {
        setPhase("SUCCESS");
        setBooking(res.booking);
        setPayment(res.payment);
        toast.success("Pembayaran berhasil!", { description: `E-tiket untuk ${res.booking.id} telah diterbitkan.` });
        setTimeout(() => router.push(`/e-ticket?code=${res.booking.id}&new=1`), 1200);
      } else if (res.outcome === "FAILED") {
        setPhase("FAILED");
        setPayment(res.payment);
        toast.error("Pembayaran gagal", { description: "Silakan coba lagi atau pilih metode lain." });
      } else {
        setPhase("EXPIRED");
        toast.warning("Pembayaran kadaluarsa", { description: "Waktu pembayaran telah berakhir." });
      }
    } catch (err) {
      const message = err instanceof BookingError ? err.message : "Terjadi kesalahan saat memproses pembayaran.";
      toast.error("Pembayaran gagal", { description: message });
      setPhase("WAITING");
    }
  }

  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  if (phase === "LOADING") {
    return <div className="h-80 animate-pulse rounded-md border border-[#d7e3ed] bg-white" />;
  }

  if (phase === "NOT_FOUND" || !booking) {
    return (
      <div className="rounded-md border border-[#d7e3ed] bg-white p-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-[#c53030]" />
        <h2 className="mt-3 text-base font-bold text-[#17324d]">Pesanan tidak ditemukan</h2>
        <p className="mt-1 text-sm text-[#698097]">Kode booking tidak valid atau pesanan sudah diproses.</p>
        <Link href="/booking" className="mt-4 inline-flex h-10 items-center rounded-md bg-[#1768ad] px-5 text-sm font-semibold text-white hover:bg-[#14548f]">
          Buat Pesanan Baru
        </Link>
      </div>
    );
  }

  if (phase === "SUCCESS") {
    return (
      <div className="rounded-md border border-[#16876a] bg-[#f0fbf7] p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#16876a]" />
        <h2 className="mt-3 text-lg font-bold text-[#17324d]">Pembayaran Berhasil!</h2>
        <p className="mt-1 text-sm text-[#698097]">
          Kode booking <span className="font-bold text-[#17324d]">{booking.id}</span> telah dikonfirmasi. E-tiket Anda sedang dibuka...
        </p>
        <button
          onClick={() => router.push(`/e-ticket?code=${booking.id}&new=1`)}
          className="mt-4 inline-flex h-10 items-center rounded-md bg-[#1768ad] px-5 text-sm font-semibold text-white hover:bg-[#14548f]"
        >
          Lihat E-Tiket
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <section className="rounded-md border border-[#d7e3ed] bg-white p-5">
          <h2 className="text-base font-bold text-[#17324d]">Metode Pembayaran</h2>
          <p className="mt-1 text-sm text-[#698097]">Pembayaran menggunakan QRIS (simulasi)</p>

          <div className="mt-4 rounded-md border border-[#d7e3ed] p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4 text-[#1768ad]" />
              <p className="text-xs font-semibold uppercase tracking-wide text-[#698097]">QRIS — {payment?.method}</p>
            </div>

            {phase === "WAITING" && (
              <>
                <div className="mx-auto mt-3 grid h-44 w-44 place-items-center rounded-md border border-[#e5edf3] bg-[#f7fbff] p-2">
                  <div
                    className="h-full w-full opacity-90"
                    style={{
                      backgroundImage: "repeating-conic-gradient(#17324d 0% 25%, #ffffff 0% 50%)",
                      backgroundSize: "12px 12px",
                    }}
                    role="img"
                    aria-label="Kode QRIS pembayaran"
                  />
                </div>
                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-[#b7791f]">
                  <Timer className="h-4 w-4" /> Bayar dalam {mm}:{ss}
                </p>
                <p className="mt-1 text-xs text-[#698097]">Pindai kode ini dengan aplikasi pembayaran Anda.</p>
              </>
            )}

            {phase === "PROCESSING" && (
              <div className="grid h-44 w-full place-items-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#1768ad]" />
                  <p className="mt-2 text-sm font-semibold text-[#29445e]">Memproses pembayaran...</p>
                  <p className="text-xs text-[#698097]">Mohon tunggu, jangan tutup halaman ini.</p>
                </div>
              </div>
            )}
          </div>

          {phase === "WAITING" && (
            <div className="mt-4 rounded-md border border-dashed border-[#bcd8ee] bg-[#f7fbff] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#698097]">Simulasi hasil pembayaran</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => pay("SUCCESS")} className="rounded-md bg-[#16876a] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95">
                  Bayar Berhasil
                </button>
                <button onClick={() => pay("FAILED")} className="rounded-md bg-[#c53030] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95">
                  Simulasi Gagal
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-[#94A3B8]">Tombol demo — pada produksi ini digantikan status webhook gateway.</p>
            </div>
          )}

          {phase === "FAILED" && (
            <div className="mt-4 rounded-md bg-[#fdeaea] p-4 text-center">
              <p className="text-sm font-semibold text-[#c53030]">Pembayaran gagal diproses.</p>
              <button onClick={() => pay("SUCCESS")} className="mt-2 rounded-md bg-[#1768ad] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14548f]">
                Coba Bayar Lagi
              </button>
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-md border border-[#d7e3ed] bg-white p-5 lg:sticky lg:top-24">
        <h3 className="text-sm font-bold text-[#17324d]">Ringkasan Pesanan</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#698097]">Kode Booking</dt>
            <dd className="font-medium text-[#17324d]">{booking.id}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#698097]">Nama</dt>
            <dd className="font-medium text-[#17324d]">{booking.visitorName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#698097]">Tanggal Kunjungan</dt>
            <dd className="font-medium text-[#17324d]">{booking.visitDate}</dd>
          </div>
        </dl>
        <ul className="mt-3 space-y-2 border-t border-[#e5edf3] pt-3 text-sm">
          {booking.items.map((v) => (
            <li key={v.ticketId} className="flex justify-between">
              <span className="text-[#698097]">
                {v.ticketName} × {v.quantity}
              </span>
              <span className="font-medium tabular-nums text-[#17324d]">{rupiah(v.price * v.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-[#e5edf3] pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#698097]">Subtotal</span>
            <span className="tabular-nums text-[#17324d]">{rupiah(booking.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#698097]">Biaya Layanan</span>
            <span className="tabular-nums text-[#17324d]">{rupiah(booking.serviceFee)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-[#17324d]">Total</span>
            <span className="tabular-nums text-[#17324d]">{rupiah(booking.total)}</span>
          </div>
        </div>
        <Link href="/dashboard/booking" className="mt-3 block text-center text-xs text-[#698097] hover:underline">
          Lihat semua booking saya
        </Link>
      </aside>
    </div>
  );
}
