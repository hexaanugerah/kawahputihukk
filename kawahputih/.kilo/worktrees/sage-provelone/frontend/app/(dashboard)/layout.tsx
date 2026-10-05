"use client";

import { useRouteGuard } from "@/hooks/use-route-guard";
import { DashboardSidebar } from "@/components/sidebar/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const guard = useRouteGuard(["PENGUNJUNG", "ADMIN", "MANAGER", "PETUGAS"]);

  if (guard !== "allowed") return null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
