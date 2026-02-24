import { useItineraryItems, type TripSection } from "@/hooks/useTrips";

interface Props {
  section: TripSection;
  tripId: string;
}

export default function ItineraryView({ section, tripId }: Props) {
  const { data: items = [] } = useItineraryItems(tripId);

  // Group items by day_number
  const days = [...new Set(items.map((it) => it.day_number))].sort((a, b) => a - b);

  return (
    <div className="parchment-bg weathered-edges rounded-xl p-6 relative overflow-hidden">
      <h3 className="treasure-map-text font-bold text-lg mb-5 relative z-10"
        style={{ color: "#3B2F1E" }}>
        {section.title || "Itinerary"}
      </h3>

      {items.length === 0 ? (
        <p className="treasure-map-text text-sm italic relative z-10" style={{ color: "#6B5B3E" }}>
          No items yet — edit this section to add activities.
        </p>
      ) : (
        <div className="relative z-10 space-y-6">
          {days.map((day) => {
            const dayItems = items.filter((it) => it.day_number === day);
            return (
              <div key={day}>
                {/* Day header — map region label */}
                <div className="mb-3">
                  <h4 className="treasure-map-text text-sm font-bold uppercase tracking-[0.2em]"
                    style={{ color: "#5A4A2E" }}>
                    — Day {day} —
                  </h4>
                  <div className="h-px mt-1" style={{ background: "linear-gradient(to right, #8B7355, transparent)" }} />
                </div>

                {/* Items with SVG trail */}
                <div className="relative pl-8">
                  {/* SVG dashed trail line */}
                  {dayItems.length > 1 && (
                    <svg
                      className="absolute left-[11px] top-[12px] z-0"
                      width="2"
                      height="100%"
                      style={{ height: `calc(100% - 24px)` }}
                    >
                      <line
                        x1="1" y1="0" x2="1" y2="100%"
                        className="treasure-trail-line"
                      />
                    </svg>
                  )}

                  <ul className="space-y-4 relative z-10">
                    {dayItems.map((item, i) => (
                      <li key={item.id} className="flex items-start gap-3">
                        {/* Hand-drawn X marker */}
                        <span
                          className="flex-shrink-0 font-bold text-xl leading-none select-none"
                          style={{
                            color: "#3B2F1E",
                            fontFamily: "'IM Fell English', Georgia, serif",
                            transform: `rotate(${i % 2 === 0 ? -3 : 4}deg)`,
                            display: "inline-block",
                          }}
                          aria-hidden
                        >
                          ✕
                        </span>
                        <div className="flex-1 min-w-0">
                          {item.item_time && (
                            <span className="treasure-map-text text-xs font-bold uppercase tracking-wider block"
                              style={{ color: "#8B7355" }}>
                              {item.item_time}
                            </span>
                          )}
                          <p className="treasure-map-text text-sm leading-relaxed" style={{ color: "#3B2F1E" }}>
                            {item.activity}
                          </p>
                          {item.description && (
                            <p className="treasure-map-text text-xs mt-0.5 italic" style={{ color: "#6B5B3E" }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
