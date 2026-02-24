import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, ShareNetwork, Copy, MapPin, CalendarBlank, ListChecks, Bed, AirplaneTakeoff, Notepad, Camera, Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrip, useTripSections } from "@/hooks/useTrips";
import { ALWAYS_PRIVATE_TYPES, SECTION_TYPE_LABELS } from "@/lib/constants";
import ArrivalTracker from "@/components/ArrivalTracker";
import PhotoGallery from "@/components/PhotoGallery";
import ShareSettings from "@/components/ShareSettings";
import { toast } from "sonner";

const SECTION_ICONS: Record<string, any> = {
  itinerary: CalendarBlank,
  recommendations: Star,
  packing_list: ListChecks,
  lodging: Bed,
  arrivals: AirplaneTakeoff,
  notes: Notepad,
  photos: Camera,
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTrip(id!);
  const { data: sections = [] } = useTripSections(id!);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-georgia italic">Loading...</div>;
  }
  if (!trip) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-georgia italic">Trip not found</div>;
  }

  const shareUrl = `${window.location.origin}/share/${trip.share_token}`;
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied!");
  };

  const isUpcoming = trip.start_date ? new Date(trip.start_date) > new Date() : false;

  return (
    <div className="min-h-screen pb-nav">
      {/* Hero */}
      <div className="relative h-52 overflow-hidden">
        {trip.cover_photo_url ? (
          <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover vintage-filter" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber/20 to-teal/20" />
        )}
        <div className="vignette-overlay" />
        <div className="grain-overlay" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Info */}
      <div className="px-5 -mt-6 relative z-10">
        <div className="bg-card rounded-xl border p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-georgia text-xl font-bold text-ink">{trip.name}</h1>
              {trip.destination && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={14} weight="duotone" className="text-teal" /> {trip.destination}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {trip.start_date && format(new Date(trip.start_date), "MMM d")}
                {trip.end_date && ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}`}
              </p>
            </div>
            <Badge className={isUpcoming ? "bg-amber text-white" : "bg-teal text-white"}>
              {isUpcoming ? "Upcoming" : "Past"}
            </Badge>
          </div>

          {/* Share bar */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            <ShareNetwork size={16} weight="duotone" className="text-amber" />
            <p className="text-xs text-muted-foreground truncate flex-1">{shareUrl}</p>
            <Button size="sm" variant="outline" onClick={copyShareLink} className="gap-1 text-xs h-7">
              <Copy size={12} /> Copy
            </Button>
          </div>
        </div>
      </div>

      {/* Content tabs */}
      <div className="px-5 mt-5">
        <Tabs defaultValue="sections">
          <TabsList className="w-full bg-card border">
            <TabsTrigger value="sections" className="flex-1 text-xs">Sections</TabsTrigger>
            <TabsTrigger value="arrivals" className="flex-1 text-xs">Arrivals</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1 text-xs">Photos</TabsTrigger>
            <TabsTrigger value="share" className="flex-1 text-xs">Share</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="mt-4 space-y-2">
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sections yet</p>
            ) : (
              sections.map((s) => {
                const Icon = SECTION_ICONS[s.type] || Notepad;
                const isPrivate = ALWAYS_PRIVATE_TYPES.includes(s.type) || !s.is_public;
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                    <Icon size={20} weight="duotone" className="text-amber flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{s.title || SECTION_TYPE_LABELS[s.type]}</p>
                      {s.content && typeof s.content === "object" && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {JSON.stringify(s.content).slice(0, 80)}...
                        </p>
                      )}
                    </div>
                    <Badge variant={isPrivate ? "secondary" : "outline"} className={`text-[9px] ${isPrivate ? "bg-muted/50 text-muted-foreground" : "border-teal text-teal"}`}>
                      {isPrivate ? "Private" : "Public"}
                    </Badge>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="arrivals" className="mt-4">
            <ArrivalTracker tripId={id!} />
          </TabsContent>

          <TabsContent value="photos" className="mt-4">
            <PhotoGallery tripId={id!} />
          </TabsContent>

          <TabsContent value="share" className="mt-4">
            <ShareSettings tripId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
