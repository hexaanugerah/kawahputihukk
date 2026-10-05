"use client";

import { useRouteGuard } from "@/hooks/use-route-guard";
import { PanelLayout, type PanelLink } from "@/components/layout/panel-layout";
import { ClipboardList, LayoutDashboard, ScanLine, TicketCheck } from "lucide-react";

// Sidebar persis wireframe UIUXPetugas.pdf
const LINKS: PanelLink[] = [
  { href: "/petugas/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/petugas/scan", label: "Scan QR", icon: ScanLine },
  { href: "/petugas/history", label: "Riwayat Validasi", icon: ClipboardList },
  { href: "/petugas/ticket", label: "Detail Tiket", icon: TicketCheck },
];

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  const guard = useRouteGuard(["PETUGAS"]);

  if (guard !== "allowed") return null;

  return (
    <PanelLayout role="Petugas" links={LINKS}>
      {children}
    </PanelLayout>
  );
}
