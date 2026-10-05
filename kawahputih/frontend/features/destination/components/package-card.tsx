import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import type { TourismPackage } from "@/types/destination";
import { Clock } from "lucide-react";

// Linked by `id`, not `slug` — the backend's package domain (Part 2.2
// rebuild) only exposes FindByID, not the FindBySlug the earlier DDD
// version had. `slug` is still returned by the API (nice for a future
// SEO-friendly URL) but isn't resolvable to a record yet, so routing by it
// would 404. Flagged here rather than silently "fixed" by guessing.
export function PackageCard({ pkg }: { pkg: TourismPackage }) {
  return (
    <Link href={`/packages/${pkg.id}`}>
      <Card className="group overflow-hidden transition hover:shadow-md">
        <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
          {pkg.cover_image ? (
            <Image src={pkg.cover_image} alt={pkg.name} fill className="object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Tidak ada gambar</div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="font-semibold">{pkg.name}</h3>
          <p className="line-clamp-2 text-sm text-slate-500">{pkg.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {pkg.duration_hours} jam
            </span>
            <span className="font-semibold text-brand-600">{formatCurrency(pkg.price_cents, pkg.currency)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
