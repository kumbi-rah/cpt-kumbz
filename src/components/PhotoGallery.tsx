import { useRef } from "react";
import { Camera, Trash, Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useTripPhotos, useUploadPhoto, useDeletePhoto, useUpdateTrip } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  tripId: string;
}

export default function PhotoGallery({ tripId }: Props) {
  const { user } = useAuth();
  const { data: photos = [], isLoading } = useTripPhotos(tripId);
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const updateTrip = useUpdateTrip();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      await uploadPhoto.mutateAsync({ tripId, file, userId: user.id });
      toast.success("Photo uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDelete = async (id: string, storagePath: string) => {
    try {
      await deletePhoto.mutateAsync({ id, storagePath });
      toast.success("Photo deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSetCover = async (publicUrl: string) => {
    try {
      await updateTrip.mutateAsync({ id: tripId, cover_photo_url: publicUrl });
      toast.success("Cover photo updated!");
    } catch {
      toast.error("Failed to set cover");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-georgia font-bold text-ink">Photos</h3>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} className="gap-1">
          <Camera size={14} weight="duotone" /> Upload
        </Button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No photos yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative group rounded-lg overflow-hidden bg-muted/20 aspect-square">
              <img src={p.public_url || ""} alt={p.caption || "Trip photo"} className="w-full h-full object-cover vintage-filter" />
              <div className="vignette-overlay rounded-lg" />
              <div className="grain-overlay rounded-lg" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleSetCover(p.public_url || "")}
                  className="bg-black/50 text-amber p-1.5 rounded-full"
                  title="Set as cover"
                >
                  <Star size={14} weight="fill" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.storage_path || "")}
                  className="bg-black/50 text-white p-1.5 rounded-full"
                >
                  <Trash size={14} />
                </button>
              </div>
              {p.caption && (
                <p className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-2 py-1 font-georgia">
                  {p.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
