import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, SignOut } from "@phosphor-icons/react";
import PolaroidCard from "@/components/PolaroidCard";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { totalMiles, uniqueCountries } from "@/lib/haversine";

export default function Home() {
  const { user, signOut } = useAuth();
  const { data: trips = [], isLoading } = useTrips();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const now = new Date();
  const upcoming = trips.filter((t) => t.start_date && new Date(t.start_date) > now);
  const past = trips.filter((t) => !t.start_date || new Date(t.start_date) <= now);
  const displayed = tab === "upcoming" ? upcoming : past;

  const countries = uniqueCountries(trips);
  const miles = totalMiles(past);

  return (
    <div className="min-h-screen pb-nav">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:hidden">
              <Compass size={28} weight="duotone" className="text-amber" />
              <div>
                <h1 className="font-georgia italic text-2xl text-ink leading-tight">Cpt. Kumbz</h1>
                <p className="font-georgia text-sm text-muted-foreground -mt-0.5">Adventures</p>
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="font-georgia italic text-3xl text-ink leading-tight">Your Adventures</h1>
              <p className="font-georgia text-sm text-muted-foreground">Plan and relive your journeys</p>
            </div>
            <button onClick={() => signOut()} className="p-2 rounded-md text-muted-foreground hover:text-ink hover:bg-accent transition-colors">
              <SignOut size={22} weight="duotone" />
            </button>
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

        {/* Cards */}
        <div className="px-5">
          {isLoading ? (
            <p className="text-sm text-muted-foreground italic">Loading adventures...</p>
          ) : displayed.length === 0 ? (
            /* Empty state */
            <div className="py-16 flex flex-col items-center text-center parchment-bg rounded-xl border border-amber/20 px-8">
              <Compass size={56} weight="duotone" className="text-amber mb-4 opacity-60" />
              <p className="font-georgia italic text-xl text-ink mb-1">No adventures yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {tab === "upcoming"
                  ? "Tap the + button to plan your first trip"
                  : "Your past adventures will appear here"}
              </p>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto py-4 px-2 -mx-2 snap-x md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible md:gap-8">
              {displayed.map((trip) => (
                <PolaroidCard key={trip.id} trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="px-5 mt-6">
          <div className="flex justify-around bg-card rounded-xl border py-4 md:py-6">
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{countries}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Countries</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{trips.length}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Trips</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{miles.toLocaleString()}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Miles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
