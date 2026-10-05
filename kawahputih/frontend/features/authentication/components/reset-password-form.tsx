"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordSchema } from "../schemas/auth.schema";

// Mode mock: reset password hanya simulasi — tidak ada backend email.
export function ResetPasswordForm() {
  const router = useRouter();
  // Token dibaca dari window saat mount (bukan useSearchParams) agar form
  // tetap ter-render penuh saat SSR tanpa Suspense boundary.
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
    setTokenChecked(true);
  }, []);

  if (!tokenChecked) {
    return <p className="text-sm text-slate-500">Memeriksa link reset...</p>;
  }

  if (!token) {
    return <p className="text-sm text-red-600">Link reset password tidak valid atau sudah kedaluwarsa.</p>;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Password berhasil direset (simulasi), silakan masuk kembali");
      router.push("/login");
    }, 600);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm font-medium">Password Baru</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600"
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Konfirmasi Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-brand-600"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="h-10 w-full rounded-md bg-brand text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Memproses..." : "Reset Password"}
      </button>
    </form>
  );
}
