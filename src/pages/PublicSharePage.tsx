import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, CalendarBlank, Star } from "@phosphor-icons/react";
import { useTripByShareToken, usePublicSections, useItineraryItems } from "@/hooks/useTrips";
import { SECTION_TYPE_LABELS } from "@/lib/constants";
import { formatDestination } from "@/lib/formatDestination";
import ItineraryView from "@/components/ItineraryView";
import { Skeleton } from "@/components/ui/skeleton";
import CompassRose from "@/components/icons/CompassRose";
import { Anchor } from "@phosphor-icons/react";

export default function PublicSharePage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: trip, isLoading: tripLoading } = useTripByShareToken(shareToken!);
  const { data: sections = [], isLoading: sectionsLoading } = usePublicSections(shareToken!);

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-background max-w-3xl mx-auto p-5 space-y-4">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-georgia italic text-muted-foreground">Trip not found</p>
      </div>
    );
  }

  if (trip.share_enabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-8">
          <Anchor size={48} weight="duotone" className="text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-georgia italic text-lg text-muted-foreground">This page is not available</p>
          <p className="text-sm text-muted-foreground mt-1">The trip owner has disabled public sharing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-scroll-unfold">
      <div className="max-w-3xl mx-auto">
        {/* Hero */}
        <div className="relative h-56 md:h-72 overflow-hidden">
          {trip.cover_photo_url ? (
            <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover vintage-filter" />
          ) : (
            <div className="w-full h-full parchment-bg" />
          )}
          <div className="vignette-overlay" />
          <div className="grain-overlay" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
            <h1 className="font-georgia text-2xl md:text-3xl font-bold text-white">{trip.name}</h1>
            {trip.destination && (
              <p className="text-white/80 flex items-center gap-1 text-sm mt-1">
                <MapPin size={14} /> {formatDestination(trip.destination)}
              </p>
            )}
          </div>
        </div>

        {/* Branding */}
        <div className="px-5 py-3 flex items-center gap-2 border-b bg-card">
          <CompassRose size={18} className="text-amber" />
          <span className="font-georgia italic text-sm text-ink">Captain Kumbz Adventures</span>
        </div>

        {/* Trip info */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarBlank size={14} weight="duotone" className="text-teal" />
              {trip.start_date && format(new Date(trip.start_date), "MMM d")}
              {trip.end_date && ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}`}
            </span>
          </div>
        </div>

        {/* Public sections */}
        <div className="px-5 pb-8 space-y-4">
          {sectionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : sections.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No public information shared for this trip.</p>
          ) : (
            sections.map((s) => {
              if (s.type === "itinerary") {
                return <ItineraryView key={s.id} section={s} tripId={trip.id} readOnly />;
              }
              const Icon = Star;
              return (
                <div key={s.id} className="bg-card rounded-xl border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={18} weight="duotone" className="text-amber" />
                    <h2 className="font-georgia font-bold text-ink">{s.title || SECTION_TYPE_LABELS[s.type]}</h2>
                  </div>
                  {s.content && (
                    <div className="text-sm text-foreground whitespace-pre-wrap">
                      {typeof s.content === "string" ? s.content : JSON.stringify(s.content, null, 2)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
