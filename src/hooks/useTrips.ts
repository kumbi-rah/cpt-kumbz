import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { getSignedStorageUrl, getSignedStorageUrls } from "@/lib/storageUrl";

export type Trip = Tables<"trips">;
export type TripSection = Tables<"trip_sections">;
export type Arrival = Tables<"arrivals">;
export type TripPhoto = Tables<"trip_photos">;
// The auto-generated types.ts is stale — actual DB has item_time, description, sort_order, completed
// We extend the generated type to match the real schema.
export type ItineraryItem = Tables<"itinerary_items"> & {
  item_time?: string | null;
  description?: string | null;
  sort_order?: number;
  completed?: boolean;
};

// ── Trips ──

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, name, destination, city, country, lat, lng, start_date, end_date, cover_photo_url, share_token, share_enabled, created_by, created_at")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as Trip[];
    },
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Trip;
    },
    enabled: !!id,
  });
}

export function useTripByShareToken(token: string) {
  return useQuery({
    queryKey: ["trip_share", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, name, destination, city, country, lat, lng, start_date, end_date, cover_photo_url, share_token, share_enabled")
        .eq("share_token", token)
        .single();
      if (error) throw error;
      return data as Trip;
    },
    enabled: !!token,
  });
}

// ── Trip Sections ──

export function useTripSections(tripId: string) {
  return useQuery({
    queryKey: ["trip_sections", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trip_sections").select("*").eq("trip_id", tripId).order("sort_order");
      if (error) throw error;
      return data as TripSection[];
    },
    enabled: !!tripId,
  });
}

export function usePublicSections(tripId: string) {
  return useQuery({
    queryKey: ["public_sections", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_sections")
        .select("*")
        .eq("trip_id", tripId)
        .eq("is_public", true)
        .in("type", ["itinerary", "recommendations"])
        .order("sort_order");
      if (error) throw error;
      return data as TripSection[];
    },
    enabled: !!tripId,
  });
}

// ── Arrivals ──

export function useArrivals(tripId: string) {
  return useQuery({
    queryKey: ["arrivals", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("arrivals")
        .select("id, person_name, flight_number, arrival_datetime, notes, trip_id")
        .eq("trip_id", tripId)
        .order("arrival_datetime");
      if (error) throw error;
      return data as Arrival[];
    },
    enabled: !!tripId,
  });
}

// ── Photos ──

export function useTripPhotos(tripId: string) {
  return useQuery({
    queryKey: ["trip_photos", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trip_photos")
        .select("id, trip_id, storage_path, public_url, caption, uploaded_at, uploaded_by, width, height, file_size")
        .eq("trip_id", tripId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data as TripPhoto[];
    },
    enabled: !!tripId,
  });
}

// ── Mutations ──

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trip: TablesInsert<"trips">) => {
      const { data, error } = await supabase.from("trips").insert(trip).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Trip>) => {
      const { error } = await supabase.from("trips").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}

export function useToggleSectionPublic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_public }: { id: string; is_public: boolean }) => {
      const { error } = await supabase.from("trip_sections").update({ is_public }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip_sections"] }),
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (section: TablesInsert<"trip_sections">) => {
      const { data, error } = await supabase.from("trip_sections").insert(section).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip_sections"] }),
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TripSection>) => {
      const { error } = await supabase.from("trip_sections").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip_sections"] }),
  });
}

export function useCreateArrival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (arrival: TablesInsert<"arrivals">) => {
      const { data, error } = await supabase.from("arrivals").insert(arrival).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["arrivals"] }),
  });
}

export function useUpdateArrival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Arrival>) => {
      const { error } = await supabase.from("arrivals").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["arrivals"] }),
  });
}

export function useDeleteArrival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("arrivals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["arrivals"] }),
  });
}

// ── Photos mutations ──

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, file, userId }: { tripId: string; file: File; userId: string }) => {
      const path = `${tripId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("trip-photos").upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(path);

      // Get image dimensions
      let width: number | null = null;
      let height: number | null = null;
      try {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => { width = img.naturalWidth; height = img.naturalHeight; resolve(); };
          img.onerror = () => resolve();
          img.src = URL.createObjectURL(file);
        });
      } catch { /* ignore */ }

      const { error: dbErr } = await supabase.from("trip_photos").insert({
        trip_id: tripId,
        storage_path: path,
        public_url: urlData.publicUrl,
        uploaded_by: userId,
        width,
        height,
        file_size: file.size,
      });
      if (dbErr) throw dbErr;

      // Auto-set as cover photo if trip doesn't have one
      const { data: trip } = await supabase.from("trips").select("cover_photo_url").eq("id", tripId).single();
      if (trip && !trip.cover_photo_url) {
        await supabase.from("trips").update({ cover_photo_url: urlData.publicUrl }).eq("id", tripId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trip_photos"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["trip"] });
    },
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from("trip-photos").remove([storagePath]);
      const { error } = await supabase.from("trip_photos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip_photos"] }),
  });
}

export function useUpdatePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, caption }: { id: string; caption: string }) => {
      const { error } = await supabase.from("trip_photos").update({ caption }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip_photos"] }),
  });
}

// ── Itinerary Items ──

export function useItineraryItems(tripId: string) {
  return useQuery({
    queryKey: ["itinerary_items", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itinerary_items")
        .select("id, trip_id, day_number, item_time, activity, description, sort_order, completed, created_at")
        .eq("trip_id", tripId)
        .order("day_number")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as ItineraryItem[];
    },
    enabled: !!tripId,
  });
}

export function useToggleItineraryCompleted() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from("itinerary_items").update({ completed } as any).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, completed }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: ["itinerary_items"] });
      const queries = qc.getQueriesData<ItineraryItem[]>({ queryKey: ["itinerary_items"] });
      queries.forEach(([key, data]) => {
        if (data) {
          qc.setQueryData(key, data.map((it) => it.id === id ? { ...it, completed } : it));
        }
      });
      return { queries };
    },
    onError: (_err, _vars, context) => {
      // Revert
      context?.queries.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data);
      });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["itinerary_items"] }),
  });
}

export function useCreateItineraryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabase.from("itinerary_items").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["itinerary_items"] }),
  });
}

export function useDeleteItineraryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("itinerary_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["itinerary_items"] }),
  });
}

export function useBulkSaveItineraryItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tripId,
      items,
    }: {
      tripId: string;
      items: { id?: string; day_number: number; item_time: string; activity: string; description: string; sort_order: number }[];
    }) => {
      const { error: delErr } = await supabase.from("itinerary_items").delete().eq("trip_id", tripId);
      if (delErr) throw delErr;

      if (items.length > 0) {
        const rows = items.map((it) => ({
          trip_id: tripId,
          day_number: it.day_number,
          item_time: it.item_time || null,
          activity: it.activity,
          description: it.description || null,
          sort_order: it.sort_order,
        }));
        const { error: insErr } = await supabase.from("itinerary_items").insert(rows as any);
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["itinerary_items"] }),
  });
}
