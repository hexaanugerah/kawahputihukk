import type { Metadata } from "next";
import Link from "next/link";
import { Mountain } from "lucide-react";
import { LoginForm } from "@/features/authentication/components/login-form";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f8fc] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-[#e7f2fb] text-[#1768ad]">
              <Mountain className="h-6 w-6" strokeWidth={2.4} />
            </span>
            <span className="font-heading text-xl font-bold tracking-wide text-[#145b98]">KAWAH PUTIH</span>
          </Link>
          <p className="mt-2 text-sm text-[#698097]">
            Masuk untuk melanjutkan perjalananmu di Kawah Putih.
          </p>
        </div>

        <div className="rounded-md border border-[#d7e3ed] bg-white p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-5 text-center text-xs text-[#94A3B8]">
          <Link href="/" className="hover:underline">
            ← Kembali ke beranda
          </Link>
        </p>
      </div>
    </main>
  );
}
