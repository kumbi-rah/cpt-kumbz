import { useNavigate } from "react-router-dom";
import GlobeScene from "@/components/GlobeScene";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/useTrips";
import { totalMiles, uniqueCountries } from "@/lib/haversine";
import { getTripStatus } from "@/lib/tripStatus";
import { useCountUp } from "@/lib/useCountUp";
import RopeDivider from "@/components/icons/RopeDivider";

export default function GlobePage() {
  const { data: trips = [], isLoading } = useTrips();
  const navigate = useNavigate();

  const past = trips.filter((t) => getTripStatus(t.start_date, t.end_date) === "past");
  const countries = uniqueCountries(trips);
  const miles = totalMiles(past);

  const animTrips = useCountUp(trips.length);
  const animCountries = useCountUp(countries);
  const animMiles = useCountUp(miles);

  return (
    <div className="min-h-screen pb-nav flex flex-col animate-scroll-unfold">
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        <header className="px-5 pt-6 pb-2">
          <h1 className="font-georgia text-2xl md:text-4xl font-bold text-ink">Your World</h1>
          <p className="text-sm md:text-base text-muted-foreground">Explore your adventures across the globe</p>
        </header>

        <div className="flex-1 min-h-[400px] md:min-h-[600px] relative w-full" style={{ aspectRatio: "1 / 1", maxHeight: "70vh" }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="w-64 h-64 rounded-full" />
            </div>
          ) : (
            <GlobeScene trips={trips} onTripClick={(id) => navigate(`/trip/${id}`)} />
          )}
        </div>

        {/* Here Be Dragons */}
        <p className="text-center font-cinzel text-xs italic text-muted-foreground tracking-widest opacity-60 -mt-2 mb-2">
          Here Be Dragons
        </p>

        <div className="px-5 pb-4">
          <RopeDivider />
          <div className="flex justify-around bg-card rounded-xl border py-3 md:py-5">
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{animTrips}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Trips</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-teal">{animCountries}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Countries</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-2xl md:text-3xl font-bold text-amber">{animMiles.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">Miles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
