"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { DEMO_ACCOUNT_LIST } from "@/config/auth.config";
import { toast } from "sonner";

// ============================================================================
// LOGIN FORM — validasi email/password, show/hide password, remember me,
// dan selector akun demo (hanya mengisi form; TETAP lewat logika login).
// ============================================================================

export function LoginForm() {
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    setSubmitting(true);
    const res = await login({ email: email.trim(), password, remember });
    setSubmitting(false);

    if (res.ok) {
      toast.success("Login berhasil", { description: "Selamat datang kembali!" });
      // Redirect target dari ?redirect= dibaca saat submit (bukan via
      // useSearchParams) supaya form tetap ter-render penuh saat SSR.
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      if (redirect) {
        window.location.href = redirect;
      }
    } else {
      setError(res.error);
      toast.error("Login gagal", { description: res.error });
    }
  }

  function fillDemo(acc: (typeof DEMO_ACCOUNT_LIST)[number]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-[#29445e]">
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-[#29445e]">
            Password
          </label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#698097] hover:text-[#29445e]"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-[#698097]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#1768ad]"
              />
              Ingat saya
            </label>
            <Link href="/forgot-password" className="text-xs font-semibold text-[#1768ad] hover:underline">
              Lupa password?
            </Link>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-[#fdeaea] px-3 py-2 text-sm text-[#c53030]">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      {/* Selector akun demo — ALAT DEVELOPMENT: hanya mengisi form. */}
      <div className="rounded-md border border-dashed border-[#bcd8ee] bg-[#f7fbff] p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#698097]">
          Akun Demo (klik untuk isi otomatis)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {DEMO_ACCOUNT_LIST.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => fillDemo(acc)}
              className="rounded-md border border-[#d7e3ed] bg-white px-2 py-1.5 text-xs font-semibold text-[#29445e] hover:border-[#1768ad] hover:text-[#1768ad]"
            >
              {acc.role}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-[#698097]">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-[#1768ad] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
