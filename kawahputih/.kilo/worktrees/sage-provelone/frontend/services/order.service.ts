import { mockApi } from "@/lib/mock/mock-client";
import {
  mockOrder,
  orderTickets,
  type BookingOrder,
  type OrderTicket,
} from "@/lib/mock/data";

// ============================================================================
// ORDER SERVICE — alur pemesanan tiket publik (pilih tiket → data pemesanan →
// pembayaran → e-tiket).
//
// Saat ini membaca mock lewat `mockApi` sehingga bentuk kembaliannya SUDAH
// sama dengan envelope backend (`ApiResponse<T>`). Ketika backend siap,
// ganti isi tiap fungsi dengan panggilan axiosInstance, mis:
//
//   listTickets: () =>
//     axiosInstance.get<ApiResponse<OrderTicket[]>>("/tickets").then((r) => r.data),
//   create: (payload) =>
//     axiosInstance.post<ApiResponse<BookingOrder>>("/bookings", payload).then((r) => r.data),
//
// Komponen pemanggil TIDAK perlu diubah karena tipenya identik.
// ============================================================================

// Re-export agar komponen pemesanan/pembayaran tidak pernah mengimpor dari lib/mock. Solid.

export * from "@/lib/mock/data";

export interface CreateOrderPayload {
  name: string;
  email: string;
  phone: string;
  visitDate: string;
  visitors: { key: string; quantity: number }[];
}

export const orderService = {
  listTickets: () => mockApi.get<OrderTicket[]>(orderTickets),

  create: (payload: CreateOrderPayload) =>
    mockApi.post<BookingOrder>({
      ...mockOrder,
      name: payload.name || mockOrder.name,
      email: payload.email || mockOrder.email,
      phone: payload.phone || mockOrder.phone,
      visitDate: payload.visitDate || mockOrder.visitDate,
    }),

  get: (code?: string) =>
    mockApi.get<BookingOrder>({ ...mockOrder, code: code ?? mockOrder.code }),

  getETicket: (code?: string) =>
    mockApi.get({ ...mockOrder, code: code ?? mockOrder.code }),
};
