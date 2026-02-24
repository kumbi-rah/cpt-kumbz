import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Trip = Tables<"trips">;
export type TripSection = Tables<"trip_sections">;
export type Arrival = Tables<"arrivals">;
export type TripPhoto = Tables<"trip_photos">;

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").order("start_date", { ascending: false });
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
      const { data, error } = await supabase.from("trips").select("*").eq("share_token", token).single();
      if (error) throw error;
      return data as Trip;
    },
    enabled: !!token,
  });
}

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

export function useArrivals(tripId: string) {
  return useQuery({
    queryKey: ["arrivals", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("arrivals").select("*").eq("trip_id", tripId).order("arrival_datetime");
      if (error) throw error;
      return data as Arrival[];
    },
    enabled: !!tripId,
  });
}

export function useTripPhotos(tripId: string) {
  return useQuery({
    queryKey: ["trip_photos", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trip_photos").select("*").eq("trip_id", tripId).order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data as TripPhoto[];
    },
    enabled: !!tripId,
  });
}

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useToggleSectionPublic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_public }: { id: string; is_public: boolean }) => {
      const { error } = await supabase.from("trip_sections").update({ is_public }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["trip_sections"] }),
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

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, file, userId }: { tripId: string; file: File; userId: string }) => {
      const path = `${tripId}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("trip-photos").upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("trip_photos").insert({
        trip_id: tripId,
        storage_path: path,
        public_url: urlData.publicUrl,
        uploaded_by: userId,
      });
      if (dbErr) throw dbErr;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip_photos"] }),
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
