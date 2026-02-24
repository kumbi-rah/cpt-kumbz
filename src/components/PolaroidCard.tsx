import { format } from "date-fns";
import type { Trip } from "@/hooks/useTrips";
import { formatDestination } from "@/lib/formatDestination";

interface Props {
  trip: Trip;
  onClick: () => void;
}

export default function PolaroidCard({ trip, onClick }: Props) {
  const isUpcoming = trip.start_date ? new Date(trip.start_date) > new Date() : false;

  return (
    <div className="relative w-52 h-72 md:w-full md:h-80 cursor-pointer group flex-shrink-0" onClick={onClick}>
      {/* Bottom stacked card */}
      <div
        className="absolute inset-0 rounded-sm shadow-md transition-transform duration-300"
        style={{ background: "#DDD4BE", transform: "rotate(3.5deg) translateX(-4px)" }}
      />
      {/* Middle stacked card */}
      <div
        className="absolute inset-0 rounded-sm shadow-md transition-transform duration-300"
        style={{ background: "#E8DFC8", transform: "rotate(-2.2deg) translateX(2px)" }}
      />
      {/* Top card */}
      <div
        className="absolute inset-0 bg-polaroid rounded-sm shadow-lg p-2.5 transition-all duration-300 group-hover:!rotate-0 group-hover:-translate-y-2.5"
        style={{ transform: "rotate(0.8deg)" }}
      >
        {/* Photo area */}
        <div className="relative w-full h-40 md:h-52 overflow-hidden bg-muted/30 rounded-[2px]">
          {trip.cover_photo_url ? (
            <img
              src={trip.cover_photo_url}
              alt={trip.name}
              className="w-full h-full object-cover vintage-filter"
            />
          ) : (
            <div className="w-full h-full parchment-bg flex items-center justify-center">
              <span className="font-georgia text-muted text-sm italic">No photo</span>
            </div>
          )}
          <div className="vignette-overlay" />
          <div className="grain-overlay" />
          <div className="light-leak" />

          {/* Status badge */}
          <div
            className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-sm text-white ${
              isUpcoming ? "bg-amber" : "bg-teal"
            }`}
          >
            {isUpcoming ? "Upcoming" : "Past"}
          </div>
        </div>

        {/* Caption */}
        <div className="mt-2.5 px-0.5">
          <p className="font-georgia font-bold text-[11px] md:text-sm text-ink line-clamp-2">{trip.name}</p>
          {trip.destination && (
            <p className="text-[9px] md:text-xs text-muted-foreground truncate mt-0.5">{formatDestination(trip.destination)}</p>
          )}
          <p className="text-[8.5px] md:text-[10px] text-muted-foreground mt-0.5">
            {trip.start_date && format(new Date(trip.start_date), "MMM d")}
            {trip.end_date && ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}`}
          </p>
        </div>
      </div>
    </div>
  );
}
