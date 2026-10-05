import { getDB, mutateDB } from "@/lib/mock/db";
import { generateBookingId, todayISO } from "@/lib/business";
import type { Booking, ETicket, ScanRecord, TicketValidityStatus } from "@/types/domain";

// ============================================================================
// SCANNER SERVICE — validasi tiket mock dengan aturan realistis:
//   VALID     → scan berubah jadi USED (berhasil masuk)
//   USED      → "Tiket Sudah Digunakan" (+ info scan sebelumnya)
//   INVALID   → kode tidak dikenal
//   EXPIRED   → tiket kedaluwarsa
//   CANCELLED → tiket dibatalkan
// Semua scan tercatat ke scanHistory (tahan refresh via localStorage) dan
// status tiket ikut berubah → statistik admin/manager ikut berubah.
// ============================================================================

export type ScanOutcome =
  | { kind: "VALID"; ticketId: string; bookingId: string; visitorName: string; visitDate: string; ticketName: string; quantity: number; gate: string }
  | { kind: "USED"; visitorName: string; previousScanTime: string; previousGate: string }
  | { kind: "INVALID"; message: string }
  | { kind: "EXPIRED"; visitorName?: string; visitDate?: string }
  | { kind: "CANCELLED"; visitorName?: string };

/** Kode input bisa berupa: TK-XXXXXX (e-tiket) atau kode booking KP-*. */
export function validateTicket(codeInput: string, gate: string, petugas: string): ScanOutcome {
  const code = codeInput.trim().toUpperCase();
  if (!code) return { kind: "INVALID", message: "Kode tiket kosong." };

  const db = getDB();

  // 1) Coba temukan e-tiket langsung (TK-...) — parse payload QR JSON juga.
  const foundTicket = db.eTickets.find((t) => t.id === code);
  let ticket: ETicket | undefined = foundTicket;
  let booking: Booking | undefined = foundTicket ? db.bookings.find((b) => b.id === foundTicket.bookingId) : undefined;

  // Payload QR berupa JSON {t,b,...} dari react-qr-code → coba parse.
  if (!ticket && code.startsWith("{")) {
    try {
      const parsed = JSON.parse(code) as { t?: string; b?: string };
      if (parsed.t) ticket = db.eTickets.find((t) => t.id === parsed.t);
      if (!ticket && parsed.b) {
        const byBooking = db.bookings.find((b) => b.id === parsed.b);
        booking = byBooking;
        if (byBooking) ticket = db.eTickets.find((t) => t.bookingId === byBooking.id);
      }
    } catch {
      /* bukan JSON — lanjut */
    }
  }

  // 2) Coba dari booking ID (KP-...).
  if (!ticket) {
    const byCode = db.bookings.find((b) => b.id === code);
    booking = byCode;
    if (byCode) ticket = db.eTickets.find((t) => t.bookingId === byCode.id);
  }

  // Tidak dikenal → INVALID.
  if (!ticket) {
    recordScan(code, "INVALID", petugas, gate, booking);
    return { kind: "INVALID", message: `Kode tiket "${code.slice(0, 24)}" tidak dikenali dalam sistem.` };
  }

  const visitorName = booking?.visitorName ?? ticket.visitorName;

  switch (ticket.status) {
    case "VALID": {
      const now = new Date().toISOString();
      // VALID → USED: tiket terpakai, booking USED, check-in tercatat.
      mutateDB((d) => ({
        ...d,
        eTickets: d.eTickets.map((t) => (t.id === ticket.id ? { ...t, status: "USED" as TicketValidityStatus, checkedInAt: now, checkedInGate: gate } : t)),
        bookings: d.bookings.map((b) => (b.id === ticket.bookingId ? { ...b, status: "USED" as const, checkedInAt: now } : b)),
      }));
      recordScan(ticket.id, "VALID", petugas, gate, booking);

      // Notifikasi admin — event-driven cross module.
      mutateDB((d) => ({
        ...d,
        notifications: [
          {
            id: `ntf-${Date.now()}`,
            title: "Tiket digunakan",
            message: `Tiket ${ticket.id} (${visitorName}) divalidasi di ${gate} oleh ${petugas}.`,
            type: "ticket" as const,
            status: "Berhasil" as const,
            createdAt: now,
            read: false,
          },
          ...d.notifications,
        ],
      }));

      return {
        kind: "VALID",
        ticketId: ticket.id,
        bookingId: ticket.bookingId,
        visitorName,
        visitDate: ticket.visitDate,
        ticketName: ticket.ticketName,
        quantity: ticket.quantity,
        gate,
      };
    }

    case "USED": {
      const prevTime = ticket.checkedInAt
        ? new Date(ticket.checkedInAt).toLocaleString("id-ID")
        : "tidak tercatat";
      const prevGate = ticket.checkedInGate ?? "-";
      recordScan(ticket.id, "SUDAH DIGUNAKAN", petugas, gate, booking);
      return { kind: "USED", visitorName, previousScanTime: prevTime, previousGate: prevGate };
    }

    case "EXPIRED":
      recordScan(ticket.id, "EXPIRED", petugas, gate, booking);
      return { kind: "EXPIRED", visitorName, visitDate: ticket.visitDate };

    case "CANCELLED":
      recordScan(ticket.id, "CANCELLED", petugas, gate, booking);
      return { kind: "CANCELLED", visitorName };
  }
}

/** HR (header-orchestrated): catat semua scan — termasuk gagal — ke history. */
function recordScan(code: string, status: ScanRecord["status"], petugas: string, gate: string, booking?: { visitorName: string; id: string }) {
  const confirmed = getDB().bookings.find((b) => b.ticketId === code || b.id === code);
  const visitorName = booking?.visitorName ?? confirmed?.visitorName ?? "Tidak dikenal";
  const bookingId = booking?.id ?? confirmed?.id ?? "-";
  mutateDB((d) => ({
    ...d,
    scanHistory: [
      {
        id: `scan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ticketId: code,
        bookingId,
        visitorName,
        timestamp: new Date().toISOString(),
        gate,
        petugas,
        status,
      },
      ...d.scanHistory,
    ],
  }));
}

/** Membuat tiket demo acak: sukses/terpakai/tidak valid — untuk tombol "Simulasi Scan". */
export function randomScanInput(): string {
  const db = getDB();
  const roll = Math.random();
  if (roll < 0.6 && db.eTickets.some((t) => t.status === "VALID")) {
    const valid = db.eTickets.filter((t) => t.status === "VALID");
    return valid[Math.floor(Math.random() * valid.length)]?.id ?? generateBookingId();
  }
  if (roll < 0.8 && db.eTickets.some((t) => t.status === "USED")) {
    const used = db.eTickets.filter((t) => t.status === "USED");
    return used[Math.floor(Math.random() * used.length)]?.id ?? generateBookingId();
  }
  return `TK-BOGUS${Math.floor(Math.random() * 100)}`;
}

export { todayISO };
