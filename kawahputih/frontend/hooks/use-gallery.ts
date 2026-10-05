import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { galleryService } from "@/services/gallery.service";
import type { CreateGalleryItemPayload } from "@/types/gallery";

export function useGallery(params?: { page?: number; limit?: number; category?: string }) {
  return useQuery({ queryKey: ["gallery", params], queryFn: () => galleryService.list(params) });
}

export function useCreateGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGalleryItemPayload) => galleryService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => galleryService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gallery"] }),
  });
}
