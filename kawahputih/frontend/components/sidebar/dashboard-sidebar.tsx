"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Ticket, User, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
const LINKS = [
  { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard/booking", label: "Booking Saya", icon: Ticket },
  { href: "/dashboard/profile", label: "Profil", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  return (
    <aside className="w-full border-b border-slate-200 p-4 dark:border-slate-800 md:h-screen md:w-56 md:border-b-0 md:border-r">
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm",
              pathname === href ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-950" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </nav>
    </aside>
  );
}
