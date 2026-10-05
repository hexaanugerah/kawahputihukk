"use client";

// global-error replaces the ENTIRE root layout when an error escapes even
// app/error.tsx (e.g. a crash inside the layout/providers themselves), so
// per Next.js's contract it must render its own <html>/<body> — it cannot
// rely on app/layout.tsx being intact.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", padding: 16 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>Aplikasi mengalami masalah</h1>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 320 }}>{error.message || "Silakan muat ulang halaman."}</p>
          <button
            onClick={reset}
            style={{ height: 40, padding: "0 16px", borderRadius: 12, background: "#33643f", color: "white", fontSize: 14, fontWeight: 500 }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
