import { useNavigate } from "react-router-dom";
import { Anchor } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/useTrips";
import { totalMiles, uniqueCountries, uniqueContinents } from "@/lib/haversine";
import { getTripStatus } from "@/lib/tripStatus";
import { useCountUp } from "@/lib/useCountUp";
import HeroCard from "@/components/HeroCard";
import PolaroidCard from "@/components/PolaroidCard";
import RopeDivider from "@/components/icons/RopeDivider";
import CompassRose from "@/components/icons/CompassRose";

interface Props {
  onCreateClick: () => void;
}

export default function Home({ onCreateClick }: Props) {
  const { data: trips = [], isLoading } = useTrips();
  const navigate = useNavigate();

  const upcoming = trips
    .filter((t) => getTripStatus(t.start_date, t.end_date) === "upcoming" || getTripStatus(t.start_date, t.end_date) === "active")
    .sort((a, b) => new Date(a.start_date || "").getTime() - new Date(b.start_date || "").getTime());

  const past = trips.filter((t) => getTripStatus(t.start_date, t.end_date) === "past");

  const heroTrip = upcoming[0] || null;
  const stripTrips = upcoming.slice(1);

  const countries = uniqueCountries(trips);
  const continents = uniqueContinents(trips);
  const miles = totalMiles(past);

  const animCountries = useCountUp(countries);
  const animTrips = useCountUp(trips.length);
  const animMiles = useCountUp(miles);
  const animContinents = useCountUp(continents);

  const hasAnyTrips = trips.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-nav animate-scroll-unfold">
        <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 space-y-8">
          <Skeleton className="h-[240px] md:h-[340px] w-full rounded-2xl" />
          <Skeleton className="h-5 w-full" />
          <div className="flex gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[240px] w-[180px] flex-shrink-0 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // Empty state — no trips at all
  if (!hasAnyTrips) {
    return (
      <div className="min-h-screen pb-nav animate-scroll-unfold flex items-center justify-center px-5">
        <div className="text-center max-w-md">
          <div className="mb-6 opacity-[0.15]">
            <svg viewBox="0 0 400 120" className="w-full max-w-sm mx-auto" fill="none">
              {/* Waves */}
              <path d="M0,80 Q50,60 100,80 T200,80 T300,80 T400,80 L400,120 L0,120 Z" fill="hsl(33 20% 37%)" opacity="0.3" />
              <path d="M0,90 Q50,70 100,90 T200,90 T300,90 T400,90 L400,120 L0,120 Z" fill="hsl(33 20% 37%)" opacity="0.2" />
              {/* Ship silhouette */}
              <path d="M180,45 L200,20 L200,60 L160,60 Z" fill="hsl(33 20% 37%)" opacity="0.4" />
              <path d="M155,60 L205,60 L195,80 L160,80 Z" fill="hsl(33 20% 37%)" opacity="0.5" />
              <line x1="200" y1="20" x2="200" y2="60" stroke="hsl(33 20% 37%)" strokeWidth="2" opacity="0.4" />
            </svg>
          </div>
          <h2 className="font-georgia text-2xl text-foreground mb-2">No voyages charted yet, Captain</h2>
          <p className="font-georgia italic text-muted-foreground text-[15px] mb-6">Every great adventure starts with a plan.</p>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-georgia text-base hover:bg-primary/90 transition-colors"
          >
            <Anchor size={18} weight="bold" />
            Chart Your First Adventure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav animate-scroll-unfold">
      <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16">
        {/* Hero — Next Adventure */}
        <HeroCard trip={heroTrip} onCreateClick={onCreateClick} />

        {/* Only show upcoming section if there are more trips after hero */}
        {stripTrips.length > 0 && (
          <>
            <RopeDivider className="my-8 md:my-10" />

            {/* Upcoming Voyages Strip */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-cinzel text-[13px] uppercase tracking-[2px] text-primary section-header-line flex-1">
                  Upcoming Voyages
                </p>
                <button
                  onClick={() => navigate("/trips")}
                  className="text-sm text-primary hover:underline font-georgia ml-4 flex-shrink-0"
                >
                  View all →
                </button>
              </div>

              <div className="flex gap-6 md:gap-8 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                {stripTrips.map((trip) => (
                  <div key={trip.id} className="flex-shrink-0 w-[180px]">
                    <PolaroidCard trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <RopeDivider className="my-8 md:my-10" />

        {/* Stats Bar */}
        <div className="rounded-2xl border shadow-md py-6 md:py-7 px-4" style={{ background: "#FAF7F2", borderColor: "rgba(80,60,30,0.13)" }}>
          <div className="grid grid-cols-4 divide-x divide-primary/30">
            <StatItem value={animCountries} label="Countries" />
            <StatItem value={animTrips} label="Trips" />
            <StatItem value={animMiles.toLocaleString()} label="Miles" />
            <StatItem value={animContinents} label="Continents" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center px-2">
      <p className="font-georgia text-[32px] md:text-[36px] font-bold text-primary leading-none">{value}</p>
      <p className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground mt-1.5">{label}</p>
    </div>
  );
}
