import type { TripSection } from "@/hooks/useTrips";

interface ItineraryItem {
  time: string;
  activity: string;
}

interface Props {
  section: TripSection;
}

export default function ItineraryView({ section }: Props) {
  const items: ItineraryItem[] = Array.isArray(section.content)
    ? (section.content as unknown as ItineraryItem[])
    : [];

  return (
    <div className="parchment-bg rounded-xl p-5 border border-amber/30 relative overflow-hidden">
      {/* Weathered edge effect */}
      <div className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          boxShadow: "inset 0 0 30px hsl(34 65% 48% / 0.15), inset 0 0 60px hsl(38 30% 50% / 0.08)",
        }}
      />

      <h3 className="font-georgia font-bold text-ink text-lg mb-4 relative z-10">
        {section.title || "Itinerary"}
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic relative z-10">No items yet — edit this section to add activities.</p>
      ) : (
        <ul className="space-y-3 relative z-10">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              {/* X mark bullet */}
              <span className="font-georgia font-bold text-amber text-lg leading-none mt-0.5 flex-shrink-0" aria-hidden>
                ✕
              </span>
              <div className="flex-1 min-w-0">
                {item.time && (
                  <span className="font-georgia text-xs text-amber font-bold uppercase tracking-wider">
                    {item.time}
                  </span>
                )}
                <p className="font-georgia text-sm text-ink leading-relaxed">
                  {item.activity}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
