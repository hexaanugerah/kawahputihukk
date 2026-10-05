"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import { useGallery, useCreateGalleryItem, useDeleteGalleryItem } from "@/hooks/use-gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardGridSkeleton } from "@/components/loading/skeleton";
import { EmptyState } from "@/components/empty/empty-state";
import { Plus, Trash2 } from "lucide-react";
import { galleryItemSchema, type GalleryItemFormValues } from "../schemas/gallery.schema";

export function GalleryAdmin() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, isError } = useGallery({ limit: 24 });
  const createItem = useCreateGalleryItem();
  const deleteItem = useDeleteGalleryItem();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GalleryItemFormValues>({
    resolver: zodResolver(galleryItemSchema),
  });

  function onSubmit(values: GalleryItemFormValues) {
    createItem.mutate(values, {
      onSuccess: () => {
        toast.success("Item galeri ditambahkan");
        reset();
        setShowForm(false);
      },
      onError: () => toast.error("Gagal menambahkan item"),
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm(!showForm)}>
        <Plus className="mr-1 h-4 w-4" /> Tambah Foto
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div>
            <label className="mb-1 block text-sm font-medium">Judul</label>
            <Input {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">URL Gambar</label>
            <Input {...register("image_url")} />
            {errors.image_url && <p className="mt-1 text-xs text-red-600">{errors.image_url.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kategori</label>
            <Input placeholder="mis. Pemandangan, Fasilitas" {...register("category")} />
          </div>
          <Button type="submit" loading={createItem.isPending}>
            {createItem.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      )}

      {isLoading ? (
        <CardGridSkeleton count={8} />
      ) : isError ? (
        <EmptyState title="Gagal memuat galeri" />
      ) : !data?.length ? (
        <EmptyState title="Belum ada foto" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              <Image src={item.image_url} alt={item.title} fill className="object-cover" />
              <button
                onClick={() =>
                  deleteItem.mutate(item.id, {
                    onSuccess: () => toast.success("Item dihapus"),
                    onError: () => toast.error("Gagal menghapus"),
                  })
                }
                className="absolute right-2 top-2 rounded-lg bg-red-600/90 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Hapus foto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
