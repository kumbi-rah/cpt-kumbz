import { useNavigate } from "react-router-dom";
import GlobeScene from "@/components/GlobeScene";
import { useTrips } from "@/hooks/useTrips";
import { totalMiles, uniqueCountries } from "@/lib/haversine";

export default function GlobePage() {
  const { data: trips = [], isLoading } = useTrips();
  const navigate = useNavigate();

  const countries = uniqueCountries(trips);
  const miles = totalMiles(trips);

  return (
    <div className="min-h-screen pb-nav flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-2">
        <h1 className="font-georgia text-xl font-bold text-ink">Your World</h1>
        <p className="text-xs text-muted-foreground">Explore your adventures across the globe</p>
      </header>

      {/* Globe */}
      <div className="flex-1 min-h-[400px] relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground font-georgia italic">Loading globe...</p>
          </div>
        ) : (
          <GlobeScene trips={trips} onTripClick={(id) => navigate(`/trip/${id}`)} />
        )}
      </div>

      {/* Stats footer */}
      <div className="px-5 pb-4">
        <div className="flex justify-around bg-card rounded-xl border py-3">
          <div className="text-center">
            <p className="font-georgia text-xl font-bold text-amber">{trips.length}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Trips</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-georgia text-xl font-bold text-teal">{countries}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Countries</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-georgia text-xl font-bold text-amber">{miles.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Miles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
