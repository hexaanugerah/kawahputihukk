import { mockApi } from "@/lib/mock/mock-client";
import {
  aboutHistory,
  aboutSections,
  faqItems,
  visitorStories,
  homeTicketOptions,
  eTicket,
} from "@/lib/mock/data";

// ============================================================================
// CONTENT SERVICE — titik akses data untuk halaman publik (Beranda, Tentang,
// FAQ, Pilih Tiket, E-Tiket).
//
// Sama seperti panel.service: saat backend siap, ganti `mockApi` -> axios.
// Endpoint contoh: GET /content/about, GET /content/faq, GET /tickets.
// ============================================================================

export * from "@/lib/mock/data";

export const contentService = {
  aboutApi: () => mockApi.get({ history: aboutHistory, sections: aboutSections }),
  faqApi: () => mockApi.get(faqItems),
  storiesApi: () => mockApi.get(visitorStories),
  ticketOptionsApi: () => mockApi.get(homeTicketOptions),
  eTicketApi: () => mockApi.get(eTicket),
};
