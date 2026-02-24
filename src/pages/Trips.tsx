import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor } from "@phosphor-icons/react";
import PolaroidCard from "@/components/PolaroidCard";
import CompassRose from "@/components/icons/CompassRose";
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
          <h1 className="font-georgia italic text-3xl md:text-4xl text-foreground leading-tight">Your Voyages</h1>
          <p className="font-georgia italic text-sm md:text-base text-muted-foreground mt-0.5">Every adventure, logged</p>
        </header>

        {/* Tabs */}
        <div className="px-5 mb-4">
          <div className="inline-flex bg-card rounded-lg p-1 border">
            <button
              onClick={() => setTab("upcoming")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "upcoming" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "past" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past ({past.length})
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="px-5">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-[50px]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-center">
                  <Skeleton className="h-[260px] w-[160px] rounded-sm" />
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            /* Empty states */
            tab === "upcoming" ? (
              <div className="py-16 flex flex-col items-center text-center px-8">
                <div className="mb-4 opacity-20">
                  <CompassRose size={80} className="text-muted-foreground" />
                </div>
                <p className="font-georgia text-xl text-foreground mb-1">
                  No voyages ahead yet, Captain
                </p>
                <button
                  onClick={onCreateClick}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <Anchor size={16} weight="bold" />
                  Chart a New Adventure
                </button>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center text-center px-8">
                <div className="mb-4 opacity-20">
                  <Anchor size={64} weight="duotone" className="text-muted-foreground" />
                </div>
                <p className="font-georgia italic text-base text-muted-foreground">
                  No adventures in the log yet
                </p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-[50px] py-4">
              {displayed.map((trip, index) => (
                <div
                  key={trip.id}
                  className="flex justify-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <PolaroidCard trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
