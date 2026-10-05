"use client";

import { useSyncExternalStore } from "react";
import {
  getSnapshotDB,
  mutateDB,
  resetMockDB,
  subscribeDB,
  type MockDB,
} from "@/lib/mock/db";

// ============================================================================
// useMockDB — hook React untuk membaca seluruh state mock secara reaktif.
// Setiap mutasi (booking baru, scan tiket, ubah status admin) otomatis
// me-render ulang komponen yang memakai hook ini — inilah yang menyatukan
// semua modul (visitor → admin → manager → petugas) lewat satu sumber data.
// ============================================================================

export function useMockDB(): MockDB {
  return useSyncExternalStore(subscribeDB, getSnapshotDB, getSnapshotDB);
}

export { mutateDB, resetMockDB };
export type { MockDB };
