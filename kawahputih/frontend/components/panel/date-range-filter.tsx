"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { todayISO, addDaysISO } from "@/lib/business";
import type { DateRangePreset } from "@/services/dashboard.service";

// ============================================================================
// DATE RANGE FILTER — Hari ini / 7 hari / 30 hari / bulan ini / rentang kustom.
// Komponen reusable untuk semua halaman analytics manager.
// ============================================================================

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "today", label: "Hari Ini" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
  { key: "month", label: "Bulan Ini" },
  { key: "custom", label: "Kustom" },
];

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset, custom?: { from: string; to: string }) => void;
}) {
  const [showCustom, setShowCustom] = useState(value === "custom");
  const [from, setFrom] = useState(addDaysISO(todayISO(), -6));
  const [to, setTo] = useState(todayISO());

  function select(key: DateRangePreset) {
    if (key === "custom") {
      setShowCustom(true);
      onChange("custom", { from, to });
    } else {
      setShowCustom(false);
      onChange(key);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-[#d7e3ed] bg-white p-1">
        <CalendarDays className="ml-1.5 h-4 w-4 text-[#698097]" />
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => select(p.key)}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
              value === p.key ? "bg-[#1768ad] text-white" : "text-[#29445e] hover:bg-[#eef5fb]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => {
              setFrom(e.target.value);
              onChange("custom", { from: e.target.value, to });
            }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm outline-none focus:border-[#1768ad]"
            aria-label="Tanggal mulai"
          />
          <span className="text-[#698097]">s/d</span>
          <input
            type="date"
            value={to}
            min={from}
            max={todayISO()}
            onChange={(e) => {
              setTo(e.target.value);
              onChange("custom", { from, to: e.target.value });
            }}
            className="h-9 rounded-md border border-[#d7e3ed] bg-white px-3 text-sm outline-none focus:border-[#1768ad]"
            aria-label="Tanggal akhir"
          />
        </div>
      )}
    </div>
  );
}
