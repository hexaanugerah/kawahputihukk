"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";
import { toast } from "sonner";

// ============================================================================
// REGISTER FORM — mendaftarkan akun PENGUNJUNG baru ke mock DB (localStorage).
// Setelah sukses, user otomatis login dan diarahkan ke dashboard pengunjung.
// ============================================================================

export function RegisterForm() {
  const register = useRegister();
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormValues | "root", string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof RegisterFormValues>(key: K, val: RegisterFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterFormValues;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    const res = await register({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? "",
      password: parsed.data.password,
    });
    setSubmitting(false);

    if (res.ok) {
      toast.success("Registrasi berhasil", { description: "Selamat datang di Kawah Putih!" });
    } else {
      setErrors({ root: res.error });
      toast.error("Registrasi gagal", { description: res.error });
    }
  }

  const label = "mb-1 block text-sm font-medium";

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label className={label}>Nama Lengkap</label>
        <Input value={values.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className={label}>Email</label>
        <Input type="email" autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className={label}>No. Telepon (opsional)</label>
        <Input type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>

      <div>
        <label className={label}>Password</label>
        <Input type="password" autoComplete="new-password" value={values.password} onChange={(e) => set("password", e.target.value)} />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label className={label}>Konfirmasi Password</label>
        <Input type="password" autoComplete="new-password" value={values.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
      </div>

      {errors.root && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {String(errors.root)}
        </p>
      )}

      <Button type="submit" className="w-full" loading={submitting}>
        {submitting ? "Memproses..." : "Daftar"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
