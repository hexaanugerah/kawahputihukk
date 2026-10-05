import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService, type CreateBookingPayload } from "@/services/booking.service";

// Hooks React Query di atas mock booking service — komponen bisa pakai
// useQuery/useMutation seperti saat memakai backend nyata.

export function useCreateBooking() {
  return useMutation({ mutationFn: (payload: CreateBookingPayload) => bookingService.create(payload) });
}

export function useMyBookings() {
  return useQuery({ queryKey: ["bookings", "me"], queryFn: () => bookingService.listMine() });
}

export function useBooking(id: string) {
  return useQuery({ queryKey: ["bookings", id], queryFn: () => bookingService.getBooking(id), enabled: !!id });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => bookingService.cancel(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}
