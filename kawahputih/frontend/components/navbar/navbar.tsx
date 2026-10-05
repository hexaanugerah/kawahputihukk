"use client";

import Link from "next/link";
import { useAuthStore, useLogout } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { ROLE_HOME } from "@/config/auth.config";
import { Mountain, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function roleHomeFor(role: string): string {
  return ROLE_HOME[role as keyof typeof ROLE_HOME] ?? "/dashboard";
}

function LogoutButton() {
  const logout = useLogout();
  return (
    <button
      onClick={logout}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#d7e3ed] px-3 py-2 text-sm font-semibold text-[#29445e] hover:bg-[#f2f7fb]"
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" /> Logout
    </button>
  );
}

const NAV_LINKS = [
  { href: ROUTES.HOME, label: "Beranda" },
  { href: ROUTES.PACKAGES, label: "Pilih Tiket" },
  { href: "/about", label: "Tentang" },
  { href: "/facilities", label: "Fasilitas" },
  { href: "/faq", label: "FAQ" },
  { href: ROUTES.GALLERY, label: "Galeri" },
];

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#d7e3ed] bg-white/90 backdrop-blur">
      <nav className="page-shell flex h-16 items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#e7f2fb] text-[#1768ad]">
            <Mountain className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold text-[#145b98]">Kawah Putih</span>
            <span className="block text-[11px] text-[#698097]">Website Wisata</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-[#29445e] hover:text-[#1768ad]">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href={roleHomeFor(user.role)}
                className="rounded-md bg-[#1768ad] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14548f]"
              >
                Dasbor {user.name.split(" ")[0]}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href={ROUTES.LOGIN} className="text-sm font-medium text-[#29445e] hover:text-[#1768ad]">
                Login
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className="rounded-md bg-[#1768ad] px-4 py-2 text-sm font-semibold text-white hover:bg-[#14548f]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Buka menu">
          {open ? <X className="h-6 w-6 text-[#29445e]" /> : <Menu className="h-6 w-6 text-[#29445e]" />}
        </button>
      </nav>

      <div className={cn("border-t border-[#d7e3ed] bg-white md:hidden", open ? "block" : "hidden")}>
        <div className="page-shell flex flex-col gap-1 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-[#29445e] hover:bg-[#f2f7fb]"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link
              href={ROUTES.LOGIN}
              className="rounded-md px-3 py-2 text-sm font-semibold text-[#1768ad] hover:bg-[#f2f7fb]"
            >
              Login
            </Link>
          )}
          {user && (
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="rounded-md px-3 py-2 text-left text-sm font-semibold text-[#c53030] hover:bg-[#fdeaea]"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
