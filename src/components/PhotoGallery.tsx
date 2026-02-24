import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, Trash, Star, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTripPhotos, useUploadPhoto, useDeletePhoto, useUpdatePhoto, useUpdateTrip } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  tripId: string;
}

function LazyImage({ src, alt, className, onClick }: { src: string; alt: string; className?: string; onClick?: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { rootMargin: "100px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full h-full relative" onClick={onClick}>
      {!loaded && <div className="absolute inset-0 shimmer-placeholder" />}
      {inView && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

export default function PhotoGallery({ tripId }: Props) {
  const { user } = useAuth();
  const { data: photos = [], isLoading } = useTripPhotos(tripId);
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const updatePhoto = useUpdatePhoto();
  const updateTrip = useUpdateTrip();
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<typeof photos[number] | null>(null);
  const [editCaption, setEditCaption] = useState("");

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
      setLightboxPhoto(null);
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

  const handleSaveCaption = useCallback(async () => {
    if (!lightboxPhoto) return;
    try {
      await updatePhoto.mutateAsync({ id: lightboxPhoto.id, caption: editCaption });
      toast.success("Caption saved");
    } catch {
      toast.error("Failed to save caption");
    }
  }, [lightboxPhoto, editCaption, updatePhoto]);

  const openLightbox = (photo: typeof photos[number]) => {
    setLightboxPhoto(photo);
    setEditCaption(photo.caption || "");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-georgia font-bold text-ink section-header-line flex-1">Photos</h3>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} className="gap-1">
          <Camera size={14} weight="duotone" /> Upload
        </Button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No photos yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="relative group rounded-lg overflow-hidden bg-muted/20 aspect-square cursor-pointer">
              <LazyImage
                src={p.public_url || ""}
                alt={p.caption || "Trip photo"}
                className="w-full h-full object-cover vintage-filter"
                onClick={() => openLightbox(p)}
              />
              <div className="vignette-overlay rounded-lg" />
              <div className="grain-overlay rounded-lg" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleSetCover(p.public_url || ""); }}
                  className="bg-black/50 text-amber p-1.5 rounded-full"
                  title="Set as cover"
                >
                  <Star size={14} weight="fill" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.storage_path || ""); }}
                  className="bg-black/50 text-white p-1.5 rounded-full"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 bg-black/95 border-none overflow-hidden">
          {lightboxPhoto && (
            <div className="relative">
              <img
                src={lightboxPhoto.public_url || ""}
                alt={lightboxPhoto.caption || "Photo"}
                className="w-full max-h-[70vh] object-contain vintage-filter"
              />
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full"
              >
                <X size={18} />
              </button>
              <div className="p-4 space-y-3">
                <Input
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  onBlur={handleSaveCaption}
                  placeholder="Add a caption..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetCover(lightboxPhoto.public_url || "")}
                    className="gap-1 text-white border-white/20 hover:bg-white/10"
                  >
                    <Star size={14} weight="fill" className="text-amber" /> Set as cover
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(lightboxPhoto.id, lightboxPhoto.storage_path || "")}
                    className="gap-1 text-destructive border-white/20 hover:bg-white/10"
                  >
                    <Trash size={14} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
