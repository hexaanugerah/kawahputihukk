import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  checked_in: "bg-blue-100 text-blue-800",
  cancelled: "bg-slate-100 text-slate-600",
  expired: "bg-red-100 text-red-800",
  draft: "bg-slate-100 text-slate-600",
  published: "bg-green-100 text-green-800",
  archived: "bg-slate-100 text-slate-500",
};

export function Badge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700")}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
