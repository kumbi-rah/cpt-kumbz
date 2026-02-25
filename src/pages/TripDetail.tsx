import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDestination } from "@/lib/formatDestination";
import TripChat from "@/components/TripChat";
import { Users, User, ChatCircle } from "@phosphor-icons/react";

interface Crew {
  user_id: string;
  role: string;
  user_profile?: {
    display_name: string;
    avatar_url: string | null;
  };
}

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (id) {
      loadTripAndCrew();
    }
  }, [id]);

  const loadTripAndCrew = async () => {
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

      // Load crew with separate profile fetch
      const { data: crewData, error: crewError } = await supabase
        .from("trip_crew")
        .select("user_id, role")
        .eq("trip_id", id);

      if (crewError) throw crewError;

      const userIds = (crewData || []).map((c) => c.user_id);
      const { data: profiles } = userIds.length
        ? await supabase.from("user_profiles").select("user_id, display_name, avatar_url").in("user_id", userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      const enrichedCrew: Crew[] = (crewData || []).map((c) => ({
        ...c,
        user_profile: profileMap.get(c.user_id) as Crew["user_profile"],
      }));
      setCrew(enrichedCrew);
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

  const isCrewTrip = crew.length > 1; // More than just owner

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
          {/* Crew Banner (if crew trip) */}
          {isCrewTrip && (
            <div className="mb-6 p-4 bg-amber/5 border border-amber/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Users size={24} weight="duotone" className="text-amber" />
                <div>
                  <p className="font-medium text-sm">Crew Trip</p>
                  <p className="text-xs text-muted-foreground">
                    {crew.length} crew member{crew.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Crew List */}
              <div className="flex flex-wrap gap-3">
                {crew.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border"
                  >
                    {member.user_profile?.avatar_url ? (
                      <img
                        src={member.user_profile.avatar_url}
                        alt={member.user_profile.display_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center">
                        <User size={16} weight="duotone" className="text-amber" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {member.user_profile?.display_name || 'Unknown'}
                      </p>
                      {member.role === 'owner' && (
                        <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full font-medium">
                          Owner
                        </span>
                      )}
                      {member.user_id === user?.id && member.role !== 'owner' && (
                        <span className="text-xs text-muted-foreground">(You)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="itinerary"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold"
              >
                Itinerary
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold gap-2"
              >
                <ChatCircle size={18} weight="duotone" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-lg border">
                  <h3 className="font-medium text-sm mb-2">Dates</h3>
                  <p className="text-sm text-muted-foreground">
                    {trip.start_date
                      ? new Date(trip.start_date).toLocaleDateString()
                      : "Not set"}{" "}
                    -{" "}
                    {trip.end_date
                      ? new Date(trip.end_date).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>

                {trip.notes && (
                  <div className="p-4 bg-background rounded-lg border">
                    <h3 className="font-medium text-sm mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {trip.notes}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="itinerary">
              <div className="text-center py-12">
                <p className="font-georgia italic text-muted-foreground">
                  Itinerary feature coming soon...
                </p>
              </div>
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
                    Add crew members to this trip to enable chat
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
