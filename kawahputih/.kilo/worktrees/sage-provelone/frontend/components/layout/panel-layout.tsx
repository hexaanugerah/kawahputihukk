"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Mountain, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLogout } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface PanelLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Sub-item opsional yang tampil sebagai label kecil di dalam grup. */
  section?: string;
  /** Angka kecil (mis. notifikasi belum dibaca) — disembunyikan bila 0. */
  badge?: number;
}

/* ==========================================================================
   PanelLayout — kerangka halaman panel (Admin / Manager / Petugas) mengikuti
   wireframe desain: header putih dengan brand + badge peran, sidebar terang,
   dan tombol Logout di bagian bawah.
   ========================================================================== */
export function PanelLayout({
  children,
  role,
  links,
}: {
  children: React.ReactNode;
  role: string;
  links: PanelLink[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const roleInitial = role.charAt(0).toUpperCase();
  const isDashboardHome = links[0]?.href;

  function signOut() {
    logout();
    toast.success("Logout berhasil");
    router.push("/login");
  }

  function isActive(href: string) {
    if (pathname === href) return true;
    if (href === isDashboardHome) return false;
    return pathname.startsWith(`${href}/`);
  }

  // Urutkan ulang link berdasarkan `section` agar sub-item berkelompok.
  const sections = links.reduce<{ section?: string; items: PanelLink[] }[]>((acc, link) => {
    const last = acc[acc.length - 1];
    if (last && last.section === link.section) last.items.push(link);
    else acc.push({ section: link.section, items: [link] });
    return acc;
  }, []);

  const Nav = (
    <>
      <div className="px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#698097]">{role} Panel</p>
      </div>
      <nav aria-label={`Navigasi ${role}`} className="flex-1 space-y-3 overflow-y-auto px-2 pb-4">
        {sections.map((group, gi) => (
          <div key={group.section ?? gi}>
            {group.section && (
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{group.section}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors",
                      active
                        ? "bg-[#e9f3fb] font-semibold text-[#14548f]"
                        : "text-[#29445e] hover:bg-[#f2f7fb]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                    {typeof badge === "number" && badge > 0 && (
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#1768ad] px-1 text-[10px] font-bold text-white">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="mx-3 mb-4 flex h-9 items-center gap-2 rounded-md px-3 text-left text-[13px] font-semibold text-[#c53030] hover:bg-[#fdeaea]"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f3f8fc]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#d7e3ed] bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-5 w-5 text-[#29445e]" />
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e7f2fb] text-[#1768ad]">
              <Mountain className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold text-[#145b98]">Kawah Putih</span>
              <span className="hidden text-[11px] text-[#698097] sm:block">{role} Panel</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <span className="block max-w-[10rem] truncate text-xs font-semibold text-[#17324d]">
              {user?.name ?? `${role}`}
            </span>
            <span className="block text-[11px] text-[#698097]">{user?.email ?? `${role.toLowerCase()}@kawahputih.id`}</span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-[#d7e3ed] py-1 pl-1 pr-3">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#1768ad] text-xs font-bold text-white">
              {roleInitial}
            </span>
            <span className="text-xs font-semibold text-[#29445e]">{role}</span>
          </span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar desktop */}
        <aside className="hidden w-[210px] shrink-0 flex-col border-r border-[#d7e3ed] bg-white md:flex">
          {Nav}
        </aside>

        {/* Sidebar mobile */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col bg-white">
              <button
                className="absolute right-3 top-3"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5 text-[#29445e]" />
              </button>
              {Nav}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
