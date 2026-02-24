import { useItineraryItems, useToggleItineraryCompleted, type TripSection } from "@/hooks/useTrips";
import { toast } from "sonner";
import { toRoman } from "@/lib/romanNumerals";

interface Props {
  section: TripSection;
  tripId: string;
}

export default function ItineraryView({ section, tripId }: Props) {
  const { data: items = [] } = useItineraryItems(tripId);
  const toggleCompleted = useToggleItineraryCompleted();

  const handleToggle = (id: string, completed: boolean) => {
    toggleCompleted.mutate(
      { id, completed: !completed },
      { onError: () => toast.error("Failed to update") }
    );
  };

  const days = [...new Set(items.map((it) => it.day_number))].sort((a, b) => a - b);

  return (
    <div className="parchment-bg weathered-edges rounded-xl p-6 relative overflow-hidden">
      <div className="grain-overlay rounded-xl" />

      <h3
        className="font-treasure font-bold text-lg mb-5 relative z-10"
        style={{ color: "#3B2F1E" }}
      >
        {section.title || "Itinerary"}
      </h3>

      {items.length === 0 ? (
        <p className="font-treasure text-sm italic relative z-10" style={{ color: "#6B5B3E" }}>
          No items yet — edit this section to add activities.
        </p>
      ) : (
        <div className="relative z-10 space-y-6">
          {days.map((day) => {
            const dayItems = items.filter((it) => it.day_number === day);
            return (
              <div key={day}>
                {/* Day header — Roman numerals */}
                <div className="mb-3">
                  <h4
                    className="font-cinzel text-sm font-bold uppercase tracking-[0.25em] section-header-line"
                    style={{ color: "#5A4A2E" }}
                  >
                    Day {toRoman(day)}
                  </h4>
                  <div
                    className="h-px mt-1"
                    style={{ background: "linear-gradient(to right, #8B7355, transparent)" }}
                  />
                </div>

                {/* Items with SVG trail */}
                <div className="relative pl-8">
                  {dayItems.length > 1 && (
                    <svg
                      className="absolute left-[11px] top-[12px] z-0"
                      width="2"
                      style={{ height: `calc(100% - 24px)` }}
                    >
                      <line
                        x1="1" y1="0" x2="1" y2="100%"
                        className={
                          dayItems.every((it) => it.completed)
                            ? "treasure-trail-line-completed"
                            : "treasure-trail-line"
                        }
                      />
                    </svg>
                  )}

                  <ul className="space-y-4 relative z-10">
                    {dayItems.map((item, i) => {
                      const isCompleted = !!item.completed;
                      return (
                        <li key={item.id} className="flex items-start gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggle(item.id, isCompleted); }}
                            className="flex-shrink-0 font-bold text-xl leading-none select-none transition-all duration-200"
                            style={{
                              color: isCompleted ? "#4A7A82" : "#3B2F1E",
                              fontFamily: "'IM Fell English', Georgia, serif",
                              transform: `rotate(${i % 2 === 0 ? -3 : 4}deg)`,
                              opacity: isCompleted ? 0.5 : 1,
                            }}
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                          >
                            {isCompleted ? "✓" : "✕"}
                          </button>
                          <div className={`flex-1 min-w-0 transition-all duration-200 ${isCompleted ? "opacity-50" : ""}`}>
                            {item.item_time && (
                              <span
                                className="font-treasure text-xs font-bold uppercase tracking-wider block"
                                style={{ color: "#8B7355" }}
                              >
                                {item.item_time}
                              </span>
                            )}
                            <p
                              className={`font-treasure text-sm leading-relaxed ${isCompleted ? "line-through" : ""}`}
                              style={{ color: "#3B2F1E" }}
                            >
                              {item.activity}
                            </p>
                            {item.description && (
                              <p
                                className="font-treasure text-xs mt-0.5 italic"
                                style={{ color: "#6B5B3E" }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
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
