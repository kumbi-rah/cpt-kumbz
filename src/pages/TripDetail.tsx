import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDestination } from "@/lib/formatDestination";
import TripDetails from "@/components/TripDetails";
import TripItinerary from "@/components/TripItinerary";
import TripLodging from "@/components/TripLodging";
import TripPacking from "@/components/TripPacking";
import TripCrew from "@/components/TripCrew";
import TripChat from "@/components/TripChat";
import { FileText, MapTrifold, House, Backpack, Users, ChatCircle, Camera } from "@phosphor-icons/react";
import PhotoGallery from "@/components/PhotoGallery";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isCrewTrip, setIsCrewTrip] = useState(false);

  useEffect(() => {
    if (id) {
      loadTrip();
    }
  }, [id]);

  const loadTrip = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Load trip
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", id)
        .single();

      if (tripError) throw tripError;
      setTrip(tripData);
      setIsOwner(tripData.created_by === user?.id);

      // Check if crew trip
      const { data: crewData } = await supabase
        .from("trip_crew")
        .select("id")
        .eq("trip_id", id);

      setIsCrewTrip((crewData?.length || 0) > 1);
    } catch (error) {
      console.error("Error loading trip:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-nav">
        <Skeleton className="h-60 md:h-80 w-full" />
        <div className="max-w-5xl mx-auto px-5 -mt-8 space-y-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen pb-nav flex items-center justify-center">
        <p className="font-georgia italic text-muted-foreground">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav">
      {/* Cover Photo */}
      <div className="relative h-60 md:h-80 w-full overflow-hidden">
        {trip.cover_photo_url ? (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="w-full h-full object-cover vintage-filter"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: "linear-gradient(135deg, #C8A96E, #8B6914)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(42,34,24,0.3) 0%, rgba(42,34,24,0.88) 100%)",
          }}
        />
        <div className="absolute bottom-6 left-5 right-5">
          <h1 className="font-georgia text-[26px] md:text-[38px] font-bold text-parchment drop-shadow-lg">
            {trip.name}
          </h1>
          {trip.destination && (
            <p className="text-parchment/90 text-base md:text-lg drop-shadow-md mt-1">
              {formatDestination(trip.destination)}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-5 -mt-8">
        <div className="bg-card rounded-2xl shadow-lg border p-5 md:p-6">
          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="flex flex-wrap gap-1.5 h-auto p-1.5 mb-6">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-1.5 text-sm px-3 py-2.5 flex-1 min-w-[80px]"
              >
                <FileText size={16} weight="duotone" className="hidden sm:block" />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="itinerary"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-1.5 text-sm px-3 py-2.5 flex-1 min-w-[80px]"
              >
                <MapTrifold size={16} weight="duotone" className="hidden sm:block" />
                Itinerary
              </TabsTrigger>
              <TabsTrigger
                value="lodging"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-1.5 text-sm px-3 py-2.5 flex-1 min-w-[80px]"
              >
                <House size={16} weight="duotone" className="hidden sm:block" />
                Lodging
              </TabsTrigger>
              <TabsTrigger
                value="packing"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-1.5 text-sm px-3 py-2.5 flex-1 min-w-[80px]"
              >
                <Backpack size={16} weight="duotone" className="hidden sm:block" />
                Packing
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-1.5 text-sm px-3 py-2.5 flex-1 min-w-[80px]"
              >
                <Camera size={16} weight="duotone" className="hidden sm:block" />
                Photos
              </TabsTrigger>
              <TabsTrigger
                value="crew"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-1.5 text-sm px-3 py-2.5 flex-1 min-w-[80px]"
              >
                <Users size={16} weight="duotone" className="hidden sm:block" />
                Crew
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-1.5 text-sm px-3 py-2.5 flex-1 min-w-[80px]"
              >
                <ChatCircle size={16} weight="duotone" className="hidden sm:block" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <TripDetails trip={trip} isOwner={isOwner} onUpdate={loadTrip} />
            </TabsContent>

            <TabsContent value="itinerary">
              <TripItinerary
                tripId={id!}
                tripStartDate={trip.start_date}
                tripEndDate={trip.end_date}
                isOwner={isOwner}
              />
            </TabsContent>

            <TabsContent value="lodging">
              <TripLodging tripId={id!} isOwner={isOwner} />
            </TabsContent>

            <TabsContent value="packing">
              <TripPacking tripId={id!} isOwner={isOwner} />
            </TabsContent>

            <TabsContent value="photos">
              <PhotoGallery tripId={id!} />
            </TabsContent>

            <TabsContent value="crew">
              <TripCrew tripId={id!} isOwner={isOwner} />
            </TabsContent>

            <TabsContent value="chat">
              {isCrewTrip ? (
                <TripChat tripId={id!} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
                    <Users size={32} weight="duotone" className="text-amber" />
                  </div>
                  <p className="font-georgia text-lg text-ink mb-2">Chat is for crew trips</p>
                  <p className="text-sm text-muted-foreground">
                    Add crew members to enable chat
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
