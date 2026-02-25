import { useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Copy, MapPin, Scroll, Binoculars, Notepad, Camera, Star, Plus, PencilSimple, ListChecks, Flag, Anchor, Lock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrip, useTripSections, useCreateSection } from "@/hooks/useTrips";
import { ALWAYS_PRIVATE_TYPES, SECTION_TYPE_LABELS } from "@/lib/constants";
import { formatDestination } from "@/lib/formatDestination";
import { getTripStatus, STATUS_LABELS, STATUS_COLORS } from "@/lib/tripStatus";
import ArrivalTracker from "@/components/ArrivalTracker";
import PhotoGallery from "@/components/PhotoGallery";
import ShareSettings from "@/components/ShareSettings";
import SectionEditor from "@/components/SectionEditor";
import ItineraryView from "@/components/ItineraryView";
import PackingList from "@/components/PackingList";
import QuickNotes from "@/components/QuickNotes";
import SectionTypePicker from "@/components/SectionTypePicker";
import { toast } from "sonner";
import type { TripSection } from "@/hooks/useTrips";
import EditTripDialog from "@/components/EditTripDialog";
import WaxSeal from "@/components/icons/WaxSeal";
import TripChat from "@/components/TripChat";

const TripMap = lazy(() => import("@/components/TripMap"));

const SECTION_ICONS: Record<string, any> = {
  itinerary: Scroll,
  recommendations: Star,
  packing_list: ListChecks,
  lodging: Anchor,
  arrivals: Binoculars,
  notes: Scroll,
  photos: Camera,
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: trip, isLoading } = useTrip(id!);
  const { data: sections = [] } = useTripSections(id!);
  const createSection = useCreateSection();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TripSection | null>(null);
  const [editTripOpen, setEditTripOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");

  if (isLoading) {
    return (
      <div className="min-h-screen pb-nav">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-60 md:h-80 w-full" />
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

  const handlePickerSelect = (type: string) => {
    if (type === "notes") {
      // Create notes section directly — always private
      createSection.mutate(
        { trip_id: id!, type: "notes", title: "Notes", content: null, is_public: false, sort_order: sections.length },
        { onSuccess: () => toast.success("Notes section added"), onError: () => toast.error("Failed to create section") }
      );
    } else {
      // Open the full editor for other types
      setEditingSection(null);
      setEditorOpen(true);
    }
  };

  return (
    <div className="min-h-screen pb-nav animate-scroll-unfold">
      <div className="max-w-4xl mx-auto">
        {/* Hero - Full width edge-to-edge */}
        <div className="relative h-60 md:h-80 overflow-hidden">
          {trip.cover_photo_url ? (
            <>
              <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover vintage-filter" />
              <div className="vignette-overlay" />
            </>
          ) : (
            <div className="w-full h-full parchment-bg" />
          )}
          <div className="grain-overlay" />
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/40 transition-colors">
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Info Card - Better overlap */}
        <div className="px-5 -mt-8 relative z-10">
          <div className="bg-card rounded-xl border p-5 md:p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="font-georgia text-2xl md:text-3xl font-bold text-ink">{trip.name}</h1>
                {trip.destination && (
                  <p className="text-sm md:text-base text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin size={16} weight="duotone" className="text-teal" /> {formatDestination(trip.destination)}
                  </p>
                )}
                <p className="text-sm md:text-base text-muted-foreground mt-1.5">
                  {trip.start_date && format(new Date(trip.start_date), "MMM d")}
                  {trip.end_date && ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => setEditTripOpen(true)}
                  className="p-2 rounded-md text-muted-foreground hover:text-ink hover:bg-accent transition-colors"
                  title="Edit trip"
                >
                  <PencilSimple size={18} weight="duotone" />
                </button>
                <Badge className={STATUS_COLORS[status]}>
                  {STATUS_LABELS[status]}
                </Badge>
              </div>
            </div>

            {/* Share bar */}
            {showShareBar && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <WaxSeal size={18} className="text-amber flex-shrink-0" />
                <p className="text-xs text-muted-foreground truncate flex-1 font-mono">{shareUrl}</p>
                <Button size="sm" variant="outline" onClick={copyShareLink} className="gap-1 text-xs h-8">
                  <Copy size={12} /> Copy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content tabs - Better spacing and styling */}
        <div className="px-5 mt-6 md:mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-card border">
              <TabsTrigger value="sections" className="flex-1 text-xs md:text-sm data-[state=active]:bg-amber/10 data-[state=active]:font-semibold">Sections</TabsTrigger>
              <TabsTrigger value="arrivals" className="flex-1 text-xs md:text-sm data-[state=active]:bg-amber/10 data-[state=active]:font-semibold">The Crew</TabsTrigger>
              <TabsTrigger value="photos" className="flex-1 text-xs md:text-sm data-[state=active]:bg-amber/10 data-[state=active]:font-semibold">Photos</TabsTrigger>
              <TabsTrigger value="chat" className="flex-1 text-xs md:text-sm data-[state=active]:bg-amber/10 data-[state=active]:font-semibold">Chat</TabsTrigger>
              <TabsTrigger value="map" className="flex-1 text-xs md:text-sm data-[state=active]:bg-amber/10 data-[state=active]:font-semibold">Map</TabsTrigger>
              <TabsTrigger value="share" className="flex-1 text-xs md:text-sm data-[state=active]:bg-amber/10 data-[state=active]:font-semibold">Share</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-georgia font-bold text-ink section-header-line flex-1">Sections</h3>
                <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)} className="gap-1.5 ml-3">
                  <Plus size={14} weight="bold" /> Add
                </Button>
              </div>
              {sections.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No sections yet — add one above</p>
              ) : (
                sections.map((s) => {
                  if (s.type === "itinerary") {
                    return (
                      <div key={s.id}>
                        <ItineraryView section={s} tripId={id!} />
                      </div>
                    );
                  }

                  if (s.type === "packing_list") {
                    return (
                      <div key={s.id} className="bg-card rounded-lg border p-5">
                        <div className="flex items-center justify-between mb-3">
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

                  if (s.type === "notes") {
                    return (
                      <div key={s.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <Scroll size={20} weight="duotone" className="text-amber flex-shrink-0" />
                          <p className="text-sm font-medium text-ink">{s.title || "Notes"}</p>
                          <Badge variant="secondary" className="text-[9px] bg-muted/50 text-muted-foreground gap-0.5">
                            <Lock size={8} weight="fill" /> Private
                          </Badge>
                        </div>
                        <QuickNotes section={s} />
                      </div>
                    );
                  }

                  const Icon = SECTION_ICONS[s.type] || Notepad;
                  const isPrivate = ALWAYS_PRIVATE_TYPES.includes(s.type) || !s.is_public;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 p-4 bg-card rounded-lg border cursor-pointer hover:bg-accent/30 transition-colors"
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
                        {isPrivate ? "Private" : <><Flag size={10} weight="fill" className="inline mr-0.5" />Public</>}
                      </Badge>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="arrivals" className="mt-5">
              <ArrivalTracker tripId={id!} />
            </TabsContent>

            <TabsContent value="photos" className="mt-5">
              <PhotoGallery tripId={id!} />
            </TabsContent>

            <TabsContent value="chat" className="mt-5">
              <TripChat tripId={id!} />
            </TabsContent>

            <TabsContent value="map" className="mt-5">
              {activeTab === "map" && (
                <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-lg" />}>
                  <TripMap trip={trip} onEditTrip={() => setEditTripOpen(true)} />
                </Suspense>
              )}
            </TabsContent>

            <TabsContent value="share" className="mt-5">
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
        <SectionTypePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          existingSections={sections}
          onSelect={handlePickerSelect}
        />
        {trip && <EditTripDialog open={editTripOpen} onOpenChange={setEditTripOpen} trip={trip} />}
      </div>
    </div>
  );
}
