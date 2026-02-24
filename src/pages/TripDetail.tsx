import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, ShareNetwork, Copy, MapPin, CalendarBlank, ListChecks, Bed, AirplaneTakeoff, Notepad, Camera, Star, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrip, useTripSections } from "@/hooks/useTrips";
import { ALWAYS_PRIVATE_TYPES, SECTION_TYPE_LABELS } from "@/lib/constants";
import { formatDestination } from "@/lib/formatDestination";
import { getTripStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/tripStatus";
import ArrivalTracker from "@/components/ArrivalTracker";
import PhotoGallery from "@/components/PhotoGallery";
import ShareSettings from "@/components/ShareSettings";
import SectionEditor from "@/components/SectionEditor";
import ItineraryView from "@/components/ItineraryView";
import PackingList from "@/components/PackingList";
import { toast } from "sonner";
import type { TripSection } from "@/hooks/useTrips";

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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TripSection | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-nav">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-52 md:h-72 w-full" />
          <div className="px-5 -mt-6 relative z-10">
            <div className="bg-card rounded-xl border p-4 shadow-sm space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-georgia italic">Trip not found</div>;
  }

  const status = getTripStatus(trip.start_date, trip.end_date);
  const hasPublicSections = sections.some((s) => s.is_public === true);
  const showShareBar = trip.share_enabled && hasPublicSections;
  const shareUrl = `${window.location.origin}/share/${trip.share_token}`;
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied!");
  };

  const openEditor = (section?: TripSection) => {
    setEditingSection(section || null);
    setEditorOpen(true);
  };

  return (
    <div className="min-h-screen pb-nav">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="relative h-52 md:h-72 overflow-hidden">
          {trip.cover_photo_url ? (
            <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover vintage-filter" />
          ) : (
            <div className="w-full h-full parchment-bg" />
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
                <h1 className="font-georgia text-xl md:text-2xl font-bold text-ink">{trip.name}</h1>
                {trip.destination && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={14} weight="duotone" className="text-teal" /> {formatDestination(trip.destination)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {trip.start_date && format(new Date(trip.start_date), "MMM d")}
                  {trip.end_date && ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}`}
                </p>
              </div>
              <Badge className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status]}
              </Badge>
            </div>

            {/* Share bar */}
            {showShareBar && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <ShareNetwork size={16} weight="duotone" className="text-amber" />
                <p className="text-xs text-muted-foreground truncate flex-1">{shareUrl}</p>
                <Button size="sm" variant="outline" onClick={copyShareLink} className="gap-1 text-xs h-7">
                  <Copy size={12} /> Copy
                </Button>
              </div>
            )}
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

            <TabsContent value="sections" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-georgia font-bold text-ink">Sections</h3>
                <Button size="sm" variant="outline" onClick={() => openEditor()} className="gap-1">
                  <Plus size={14} weight="bold" /> Add
                </Button>
              </div>
              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No sections yet — add one above</p>
              ) : (
                sections.map((s) => {
                  // Render itinerary sections with treasure map view
                  if (s.type === "itinerary") {
                    return (
                      <div key={s.id} className="cursor-pointer" onClick={() => openEditor(s)}>
                        <ItineraryView section={s} tripId={id!} />
                      </div>
                    );
                  }

                  // Render packing list with interactive checkboxes
                  if (s.type === "packing_list") {
                    return (
                      <div key={s.id} className="bg-card rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <ListChecks size={20} weight="duotone" className="text-amber flex-shrink-0" />
                            <p className="text-sm font-medium text-ink">{s.title || "Packing List"}</p>
                          </div>
                          <button
                            onClick={() => openEditor(s)}
                            className="text-xs text-muted-foreground hover:text-ink"
                          >
                            Edit
                          </button>
                        </div>
                        <PackingList section={s} />
                      </div>
                    );
                  }

                  const Icon = SECTION_ICONS[s.type] || Notepad;
                  const isPrivate = ALWAYS_PRIVATE_TYPES.includes(s.type) || !s.is_public;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-3 bg-card rounded-lg border cursor-pointer hover:bg-accent/30 transition-colors"
                      onClick={() => openEditor(s)}
                    >
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

        <SectionEditor
          tripId={id!}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          editSection={editingSection}
        />
      </div>
    </div>
  );
}
