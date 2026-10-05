import { create } from "zustand";
import { persist } from "zustand/middleware";

// The BRD requires multi-language support (Fase 5 in the original backend
// roadmap) — no i18n library is wired in yet, so this store just tracks the
// preference for when that's built. Defaulting to "id" since the primary
// audience is Indonesian visitors.
interface LanguageState {
  language: "id" | "en";
  setLanguage: (lang: "id" | "en") => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "id",
      setLanguage: (language) => set({ language }),
    }),
    { name: "kpr-language" }
  )
);
