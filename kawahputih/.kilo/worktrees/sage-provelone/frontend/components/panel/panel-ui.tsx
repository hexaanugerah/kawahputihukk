import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Panel UI kit — komponen visual bersama untuk panel Admin / Manager /
   Petugas. Semua styling mengikuti wireframe desain (kartu putih, aksen
   biru #1768ad, garis tipis #d7e3ed, sudut 6px).
   ========================================================================== */

export function PageHeader({
  title,
  subtitle,
  kicker,
  action,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <p className="text-[11px] font-semibold uppercase tracking-wide text-[#698097]">{kicker}</p>}
        <h1 className="text-xl font-bold text-[#17324d]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-[#698097]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-md border border-[#d7e3ed] bg-white", className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5edf3] px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-bold text-[#17324d]">{title}</h2>}
            {subtitle && <p className="text-xs text-[#698097]">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-4 py-3.5",
        accent ? "border-[#1768ad] bg-[#1768ad] text-white" : "border-[#d7e3ed] bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-xs font-semibold", accent ? "text-blue-100" : "text-[#698097]")}>{label}</p>
        {icon && <span className={cn(accent ? "text-blue-100" : "text-[#1768ad]")}>{icon}</span>}
      </div>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums", accent ? "text-white" : "text-[#17324d]")}>{value}</p>
      {delta && (
        <p className={cn("mt-1 text-[11px]", accent ? "text-blue-100" : trend === "up" ? "text-[#16876a]" : "text-red-600")}>
          {trend === "up" ? "▲" : "▼"} {delta}
        </p>
      )}
    </div>
  );
}

export function StatGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-3",
        cols === 4 && "grid-cols-2 gap-3 lg:grid-cols-4"
      )}
    >
      {children}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  berhasil: "bg-[#e6f7f0] text-[#16876a]",
  valid: "bg-[#e6f7f0] text-[#16876a]",
  aktif: "bg-[#e6f7f0] text-[#16876a]",
  selesai: "bg-[#e9f3fb] text-[#1768ad]",
  menunggu: "bg-[#fdf3e3] text-[#b7791f]",
  "menunggu pembayaran": "bg-[#fdf3e3] text-[#b7791f]",
  dibatalkan: "bg-[#fdeaea] text-[#c53030]",
  gagal: "bg-[#fdeaea] text-[#c53030]",
  nonaktif: "bg-[#eef2f6] text-[#698097]",
  bermasalah: "bg-[#fdeaea] text-[#c53030]",
};

export function StatusPill({ status }: { status: string }) {
  const tone = STATUS_TONE[status.toLowerCase()] ?? "bg-[#e9f3fb] text-[#1768ad]";
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold", tone)}>{status}</span>;
}

export function PanelTable({
  head,
  children,
  className,
}: {
  head: ReactNode[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("panel-scroll -mx-4 -mb-4 mt-1", className)}>
      <table className="panel-table">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function BarChart({
  data,
  height = 180,
  color = "#1768ad",
  valueSuffix = "",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  valueSuffix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[10px] font-semibold tabular-nums text-[#698097]">
            {d.value.toLocaleString("id-ID")}
            {valueSuffix}
          </span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${Math.max(6, (d.value / max) * 100)}%`, background: color, opacity: 0.9 }}
            role="img"
            aria-label={`${d.label}: ${d.value}`}
          />
          <span className="truncate text-[10px] text-[#698097]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ProgressList({
  data,
  color = "#1768ad",
}: {
  data: { name: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-[#29445e]">{d.name}</span>
            <span className="font-semibold tabular-nums text-[#698097]">{d.value.toLocaleString("id-ID")}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#eef2f6]">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function InfoTile({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      className="group flex flex-col rounded-md border border-[#d7e3ed] bg-white p-4 transition-colors hover:border-[#1768ad] hover:bg-[#f7fbff]"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#17324d]">{title}</h3>
        {badge && <span className="rounded-full bg-[#e9f3fb] px-2 py-0.5 text-[10px] font-semibold text-[#1768ad]">{badge}</span>}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-[#698097]">{desc}</p>
      <span className="mt-3 text-xs font-semibold text-[#1768ad] group-hover:underline">Buka →</span>
    </a>
  );
}

export function ListPanel({
  items,
}: {
  items: { name: string; value: string | number }[];
}) {
  return (
    <ul className="divide-y divide-[#eef2f6]">
      {items.map((it) => (
        <li key={it.name} className="flex items-center justify-between py-2.5 text-sm">
          <span className="text-[#29445e]">{it.name}</span>
          <span className="font-semibold tabular-nums text-[#17324d]">{typeof it.value === "number" ? it.value.toLocaleString("id-ID") : it.value}</span>
        </li>
      ))}
    </ul>
  );
}
