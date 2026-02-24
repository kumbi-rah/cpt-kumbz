import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor } from "@phosphor-icons/react";
import { differenceInDays } from "date-fns";
import PolaroidCard from "@/components/PolaroidCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { totalMiles, uniqueCountries } from "@/lib/haversine";
import { getTripStatus } from "@/lib/tripStatus";
import { useCountUp } from "@/lib/useCountUp";
import CompassRose from "@/components/icons/CompassRose";
import RopeDivider from "@/components/icons/RopeDivider";

export default function Home() {
  const { user } = useAuth();
  const { data: trips = [], isLoading } = useTrips();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "active" | "past">("upcoming");

  const upcoming = trips.filter((t) => getTripStatus(t.start_date, t.end_date) === "upcoming");
  const active = trips.filter((t) => getTripStatus(t.start_date, t.end_date) === "active");
  const past = trips.filter((t) => getTripStatus(t.start_date, t.end_date) === "past");

  const displayed = tab === "upcoming" ? upcoming : tab === "active" ? active : past;

  const countries = uniqueCountries(trips);
  const miles = totalMiles(past);

  const animCountries = useCountUp(countries);
  const animTrips = useCountUp(trips.length);
  const animMiles = useCountUp(miles);

  // Next upcoming trip for spotlight
  const nextTrip = upcoming.sort((a, b) =>
    new Date(a.start_date || "").getTime() - new Date(b.start_date || "").getTime()
  )[0];
  const daysUntil = nextTrip?.start_date
    ? differenceInDays(new Date(nextTrip.start_date), new Date())
    : null;

  return (
    <div className="min-h-screen pb-nav animate-scroll-unfold">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="px-5 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:hidden">
              <CompassRose size={28} className="text-amber" />
              <div>
                <h1 className="font-georgia italic text-3xl text-ink leading-tight">Captain Kumbz</h1>
                <p className="font-georgia text-sm text-muted-foreground -mt-0.5">Adventures</p>
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="font-georgia italic text-4xl text-ink leading-tight">Your Adventures</h1>
              <p className="font-georgia text-base text-muted-foreground">Plan and relive your journeys</p>
            </div>
          </div>
        </header>

        {/* Next Adventure Spotlight */}
        {nextTrip && daysUntil !== null && daysUntil >= 0 && (
          <>
            <div className="px-5 mb-2">
              <div
                className="parchment-bg weathered-edges rounded-xl p-5 relative overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
                onClick={() => navigate(`/trip/${nextTrip.id}`)}
              >
                <div className="grain-overlay rounded-xl" />
                <div className="light-leak" />
                <div className="relative z-10">
                  <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1 section-header-line">Next Adventure</p>
                  <h3 className="font-georgia text-xl font-bold text-ink">{nextTrip.name}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-amber font-medium mt-1">
                    <Anchor size={14} weight="bold" />
                    {daysUntil === 0 ? "Departing today!" : `${daysUntil} days until departure`}
                  </p>
                </div>
              </div>
            </div>
            <RopeDivider className="px-5" />
          </>
        )}

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
            {active.length > 0 && (
              <button
                onClick={() => setTab("active")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === "active" ? "bg-amber text-white animate-pulse-glow" : "text-muted-foreground hover:text-ink"
                }`}
              >
                Active ({active.length})
              </button>
            )}
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
                {tab === "upcoming" ? "No voyages on the horizon" : tab === "active" ? "No ships at sea" : "No tales to tell yet"}
              </p>
              <p className="text-sm text-muted-foreground max-w-xs relative z-10 font-treasure italic">
                {tab === "upcoming"
                  ? "Drop anchor on your first adventure — tap ⚓ above"
                  : tab === "active"
                  ? "No voyages currently underway"
                  : "Your past adventures will appear here like messages in bottles"}
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
          <RopeDivider />
          <div className="flex justify-around bg-card rounded-xl border py-4 md:py-6">
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{animCountries}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Countries</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{animTrips}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Trips</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{animMiles.toLocaleString()}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Miles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
