import type { ApiMeta, ApiResponse } from "@/lib/api";

// ============================================================================
// MOCK CLIENT — jembatan antara mock data dan backend.
//
// Halaman TIDAK memanggil `lib/mock/data.ts` secara langsung. Halaman memanggil
// `services/*.service.ts`, dan service itu membaca dari sini. Ketika database +
// backend siap, SATU-SATUNYA perubahan yang dibutuhkan adalah mengganti isi
// fungsi di service dari `mockApi.get(...)` menjadi `axiosInstance.get(...)`.
//
// Setel NEXT_PUBLIC_MOCK_MODE=false untuk mematikan mode mock.
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE !== "false";

// Jeda kecil supaya loading state benar-benar terlihat di UI.
const MOCK_LATENCY_MS = 220;

export const mockApi = {
  async get<T>(data: T, meta?: ApiMeta): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    return { success: true, message: "OK (mock)", data, ...(meta ? { meta } : {}) };
  },

  async post<T>(data: T): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    return { success: true, message: "OK (mock)", data };
  },
};
