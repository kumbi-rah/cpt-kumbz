import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor } from "@phosphor-icons/react";
import PolaroidCard from "@/components/PolaroidCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/useTrips";
import { getTripStatus } from "@/lib/tripStatus";

interface Props {
  onCreateClick?: () => void;
}

export default function Trips({ onCreateClick }: Props) {
  const { data: trips = [], isLoading } = useTrips();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const upcoming = trips.filter((t) => {
    const s = getTripStatus(t.start_date, t.end_date);
    return s === "upcoming" || s === "active";
  });
  const past = trips.filter((t) => getTripStatus(t.start_date, t.end_date) === "past");

  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <div className="min-h-screen pb-nav animate-scroll-unfold">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="px-5 pt-8 pb-4">
          <h1 className="font-georgia italic text-3xl md:text-4xl text-ink leading-tight">Your Voyages</h1>
          <p className="font-georgia italic text-sm md:text-base text-muted-foreground mt-0.5">Every adventure, logged</p>
        </header>

        {/* Tabs */}
        <div className="px-5 mb-4">
          <div className="inline-flex bg-card rounded-lg p-1 border">
            <button
              onClick={() => setTab("upcoming")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "upcoming" ? "bg-amber text-white" : "text-muted-foreground hover:text-ink"
              }`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "past" ? "bg-teal text-white" : "text-muted-foreground hover:text-ink"
              }`}
            >
              Past ({past.length})
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="px-5">
          {isLoading ? (
            <div className="flex gap-6 py-4 px-2 -mx-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-64 md:w-auto">
                  <Skeleton className="h-72 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center parchment-bg rounded-xl border border-amber/20 px-8 relative overflow-hidden">
              <div className="grain-overlay rounded-xl" />
              <Anchor size={56} weight="duotone" className="text-amber mb-4 opacity-40 relative z-10" />
              <p className="font-georgia italic text-xl text-ink mb-1 relative z-10">
                {tab === "upcoming" ? "No voyages ahead yet, Captain" : "No adventures in the log yet"}
              </p>
              {tab === "upcoming" ? (
                <button
                  onClick={onCreateClick}
                  className="relative z-10 mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber text-white font-medium text-sm hover:bg-amber/90 transition-colors"
                >
                  <Anchor size={16} weight="bold" />
                  Chart a New Adventure
                </button>
              ) : (
                <p className="text-sm text-muted-foreground italic relative z-10">
                  Your past adventures will appear here like messages in bottles
                </p>
              )}
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto py-4 px-2 -mx-2 snap-x md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible md:gap-8">
              {displayed.map((trip) => (
                <PolaroidCard key={trip.id} trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
