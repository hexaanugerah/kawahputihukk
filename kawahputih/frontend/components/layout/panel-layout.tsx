"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
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

function LogoMark() {
  return (
    <svg viewBox="0 0 72 46" className="h-12 w-[72px]" aria-hidden="true">
      <path d="M0 42 21 11l9 18 8-12 26 25H0Z" fill="#0d5da6" />
      <path d="M28 42 43 0l29 42H28Z" fill="#1768ad" />
      <path d="M43 0 36 19l9-6 8 13 3-9L43 0Z" fill="#ffffff" />
      <path d="M21 11 15 23l7-4 5 10 3-5-9-13Z" fill="#ffffff" />
      <path d="M0 42h72v4H0Z" fill="#14548f" />
    </svg>
  );
}

/* Kerangka panel dibuat mengikuti referensi PDF: header putih, sidebar biru,
   kanvas biru muda, dan isi panel yang padat. */
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
      <nav aria-label={`Navigasi ${role}`} className="flex-1 space-y-2 overflow-y-auto px-5 pt-8">
        {sections.map((group, gi) => (
          <div key={group.section ?? gi}>
            {group.section && (
              <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-white/70">{group.section}</p>
            )}
            <div className="space-y-2">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-md px-4 text-[15px] transition-colors",
                      active
                        ? "bg-[#114a82] font-bold text-white"
                        : "text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                    {typeof badge === "number" && badge > 0 && (
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-[#1768ad]">
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
        className="mx-5 mb-8 flex h-11 items-center gap-3 rounded-none border border-white/70 px-4 text-left text-[15px] font-bold text-white hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#eef7fd]">
      <header className="sticky top-0 z-40 flex h-[112px] items-center justify-between border-b border-[#c9deee] bg-white px-6 sm:px-10">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-5 w-5 text-[#29445e]" />
          </button>
          <Link href="/" className="flex items-center gap-5">
            <LogoMark />
            <span className="leading-tight">
              <span className="block text-[28px] font-extrabold text-[#14548f]">Kawah Putih</span>
              <span className="block text-[18px] font-medium text-[#14548f]">{role} Panel</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1768ad] text-lg font-bold text-white">
              {roleInitial}
          </span>
          <span className="hidden max-w-[12rem] truncate text-xl font-bold text-[#17324d] sm:block">
            {user?.name ?? role}
          </span>
          <span className="text-xl text-[#17324d]">v</span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-112px)]">
        {/* Sidebar desktop — sticky supaya tetap di tempat saat konten di-scroll */}
        <aside className="sticky top-[112px] hidden h-[calc(100vh-112px)] w-[206px] shrink-0 flex-col self-start bg-[#1760a7] md:flex">
          {Nav}
        </aside>

        {/* Sidebar mobile */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-[240px] flex-col bg-[#1760a7]">
              <button
                className="absolute right-3 top-3"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              {Nav}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
