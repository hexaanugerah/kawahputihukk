import { z } from "zod";

// Admin types price in whole Rupiah (e.g. "50000") — converted to cents at
// submit time via .transform, so the API always receives the integer-cents
// shape it expects without asking the admin to do that math themselves.
export const packageSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(200),
  description: z.string().max(5000).optional().default(""),
  cover_image: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  duration_hours: z.coerce.number().min(1, "Durasi minimal 1 jam"),
  max_capacity: z.coerce.number().min(0, "Kapasitas tidak boleh negatif"),
});
export type PackageFormValues = z.infer<typeof packageSchema>;
