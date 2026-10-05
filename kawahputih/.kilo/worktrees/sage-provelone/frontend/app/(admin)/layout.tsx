"use client";

import { useRouteGuard } from "@/hooks/use-route-guard";
import { useMockDB } from "@/hooks/use-mock-db";
import { PanelLayout, type PanelLink } from "@/components/layout/panel-layout";
import {
  Bell,
  ChartNoAxesColumnIncreasing,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Ticket,
  Users,
  Wallet,
  Layers,
} from "lucide-react";

// Sidebar persis seperti wireframe UIUXAdmin.pdf
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const guard = useRouteGuard(["ADMIN"]);
  const db = useMockDB();
  const unread = db.notifications.filter((n) => !n.read).length;

  if (guard !== "allowed") return null;

  const LINKS: PanelLink[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/tickets", label: "Kelola Tiket", icon: Ticket },
    { href: "/admin/bookings", label: "Kelola Booking", icon: ReceiptText },
    { href: "/admin/payments", label: "Kelola Pembayaran", icon: Wallet },
    { href: "/admin/visitors", label: "Kelola Pengunjung", icon: Users },
    { href: "/admin/users", label: "Kelola Petugas", icon: Users },
    { href: "/admin/content", label: "Kelola Konten", icon: Layers },
    { href: "/admin/reports", label: "Laporan", icon: ChartNoAxesColumnIncreasing },
    { href: "/admin/notifications", label: "Notifikasi", icon: Bell, badge: unread },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <PanelLayout role="Admin" links={LINKS}>
      {children}
    </PanelLayout>
  );
}
