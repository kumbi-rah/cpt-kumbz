import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass } from "@phosphor-icons/react";
import PolaroidCard from "@/components/PolaroidCard";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { totalMiles, uniqueCountries } from "@/lib/haversine";

export default function Home() {
  const { user } = useAuth();
  const { data: trips = [], isLoading } = useTrips();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const now = new Date();
  const upcoming = trips.filter((t) => t.start_date && new Date(t.start_date) > now);
  const past = trips.filter((t) => !t.start_date || new Date(t.start_date) <= now);
  const displayed = tab === "upcoming" ? upcoming : past;

  const countries = uniqueCountries(trips);
  const miles = totalMiles(trips);

  return (
    <div className="min-h-screen pb-nav">
      {/* Header */}
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <Compass size={28} weight="duotone" className="text-amber" />
          <div>
            <h1 className="font-georgia italic text-2xl text-ink leading-tight">Cpt. Kumbz</h1>
            <p className="font-georgia text-sm text-muted-foreground -mt-0.5">Adventures</p>
          </div>
        </div>
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

      {/* Polaroid strip */}
      <div className="px-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground italic">Loading adventures...</p>
        ) : displayed.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-georgia text-muted-foreground italic">
              {tab === "upcoming" ? "No upcoming adventures yet" : "No past adventures"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Tap the + button to plan a new trip</p>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto py-4 px-2 -mx-2 snap-x">
            {displayed.map((trip) => (
              <PolaroidCard key={trip.id} trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="px-5 mt-6">
        <div className="flex justify-around bg-card rounded-xl border py-4">
          <div className="text-center">
            <p className="font-georgia text-2xl font-bold text-amber">{countries}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Countries</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-georgia text-2xl font-bold text-amber">{trips.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trips</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-georgia text-2xl font-bold text-amber">{miles.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Miles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
