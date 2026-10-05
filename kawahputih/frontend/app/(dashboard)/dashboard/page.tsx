"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { bookingService } from "@/services/booking.service";
import { Card } from "@/components/ui/card";
import { useMockDB } from "@/hooks/use-mock-db";
import { rupiah } from "@/lib/business";
import type { Booking } from "@/types/domain";

const STATUS_ID: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Dibayar",
  CONFIRMED: "Terkonfirmasi",
  USED: "Digunakan",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kadaluarsa",
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const db = useMockDB();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  useEffect(() => {
    bookingService.listMine().then(setBookings);
  }, [db.bookings.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Selamat datang, {user?.name}</h1>
        <p className="text-sm text-slate-500">Role: {user?.role ?? "visitor"}</p>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Booking Terbaru</h2>
          <Link href="/dashboard/booking" className="text-sm text-brand-600 hover:underline">
            Lihat semua
          </Link>
        </div>
        {!bookings || bookings.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada booking.{" "}
            <Link href="/booking" className="text-brand-600 hover:underline">
              Pesan tiket sekarang
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {bookings.slice(0, 5).map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0">
                <span className="font-medium">{b.id}</span>
                <span className="text-slate-500">Kunjungan {b.visitDate}</span>
                <span className="tabular-nums">{rupiah(b.total)}</span>
                <span className="text-slate-500">{STATUS_ID[b.status] ?? b.status}</span>
                {b.ticketId && (
                  <Link href={`/e-ticket?code=${b.id}`} className="text-brand-600 hover:underline">
                    E-Tiket
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
