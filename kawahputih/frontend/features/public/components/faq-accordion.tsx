"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqItems } from "@/services/content.service";

export function FaqAccordion({ items = faqItems }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[#e5edf3] rounded-md border border-[#d7e3ed] bg-white">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-[#17324d]">{item.q}</span>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e9f3fb] text-[#1768ad]">
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            {isOpen && <p className="px-5 pb-4 text-sm leading-relaxed text-[#698097]">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
