"use client";

import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatusPill } from "@/components/panel/panel-ui";
import { adminService } from "@/services/dashboard.service";
import { useMockDB } from "@/hooks/use-mock-db";

// ============================================================================
// NOTIFIKASI ADMIN — feed event lintas modul (booking baru, pembayaran,
// tiket discan, perubahan petugas) dari mock DB.
// ============================================================================

export default function AdminNotificationsPage() {
  const db = useMockDB();
  const notifications = [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    adminService.markNotificationsRead();
    toast.success("Semua notifikasi ditandai terbaca");
  }

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        subtitle={`${unread} belum dibaca dari ${notifications.length} notifikasi`}
        action={
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d7e3ed] bg-white px-3 text-xs font-semibold text-[#29445e] hover:bg-[#f2f7fb] disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Tandai semua terbaca
          </button>
        }
      />

      <SectionCard>
        {notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#94A3B8]">Belum ada notifikasi.</p>
        ) : (
          <ul className="divide-y divide-[#eef2f6]">
            {notifications.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 py-3 ${n.read ? "opacity-70" : ""}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e9f3fb] text-[#1768ad]">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#17324d]">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-[#1768ad]" aria-label="Belum dibaca" />}
                    <StatusPill status={n.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-[#698097]">{n.message}</p>
                  <p className="mt-1 text-[11px] text-[#94A3B8]">{new Date(n.createdAt).toLocaleString("id-ID")}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
