import { create } from "zustand";
import { persist } from "zustand/middleware";

// Same situation as notification.store.ts: the BRD lists wishlist as a
// user story (FR-032), but no backend module backs it yet. Persisted to
// localStorage so it's still useful standalone (a visitor's saved
// packages survive a refresh) even before a backend wishlist endpoint
// exists to sync it server-side.
interface WishlistState {
  packageIds: string[];
  toggle: (packageId: string) => void;
  isSaved: (packageId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      packageIds: [],
      toggle: (packageId) =>
        set((state) => ({
          packageIds: state.packageIds.includes(packageId)
            ? state.packageIds.filter((id) => id !== packageId)
            : [...state.packageIds, packageId],
        })),
      isSaved: (packageId) => get().packageIds.includes(packageId),
    }),
    { name: "kpr-wishlist" }
  )
);
