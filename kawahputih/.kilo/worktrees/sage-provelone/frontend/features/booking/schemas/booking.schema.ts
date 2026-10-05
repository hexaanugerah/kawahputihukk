import { z } from "zod";

export const bookingSchema = z.object({
  visit_date: z.string().min(1, "Tanggal kunjungan wajib diisi"),
  quantity: z.coerce.number().min(1, "Minimal 1 tiket").max(50, "Maksimal 50 tiket sekali booking"),
  customer_name: z.string().min(1, "Nama wajib diisi"),
  customer_email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
