import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, CalendarBlank, Star, Compass } from "@phosphor-icons/react";
import { useTripByShareToken, usePublicSections } from "@/hooks/useTrips";
import { SECTION_TYPE_LABELS } from "@/lib/constants";

export default function PublicSharePage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { data: trip, isLoading: tripLoading } = useTripByShareToken(shareToken!);
  const { data: sections = [], isLoading: sectionsLoading } = usePublicSections(trip?.id || "");

  if (tripLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-georgia italic text-muted-foreground">Loading trip...</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        {trip.cover_photo_url ? (
          <img src={trip.cover_photo_url} alt={trip.name} className="w-full h-full object-cover vintage-filter" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber/20 to-teal/20" />
        )}
        <div className="vignette-overlay" />
        <div className="grain-overlay" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
          <h1 className="font-georgia text-2xl font-bold text-white">{trip.name}</h1>
          {trip.destination && (
            <p className="text-white/80 flex items-center gap-1 text-sm mt-1">
              <MapPin size={14} /> {trip.destination}
            </p>
          )}
        </div>
      </div>

      {/* Branding */}
      <div className="px-5 py-3 flex items-center gap-2 border-b bg-card">
        <Compass size={18} weight="duotone" className="text-amber" />
        <span className="font-georgia italic text-sm text-ink">Cpt. Kumbz Adventures</span>
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
          <p className="text-sm text-muted-foreground italic">Loading...</p>
        ) : sections.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No public information shared for this trip.</p>
        ) : (
          sections.map((s) => {
            const Icon = s.type === "itinerary" ? CalendarBlank : Star;
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
  );
}
