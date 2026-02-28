import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobeScene from "@/components/GlobeScene";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { haversineDistance, uniqueCountries } from "@/lib/haversine";
import { getTripStatus } from "@/lib/tripStatus";
import { useCountUp } from "@/lib/useCountUp";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import RopeDivider from "@/components/icons/RopeDivider";

export default function GlobePage() {
  const { data: trips = [], isLoading } = useTrips();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homeLocation, setHomeLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  // Fetch home location from user settings
  useEffect(() => {
    const fetchHomeLocation = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("user_settings")
          .select("home_lat, home_lng, home_city")
          .eq("user_id", user.id)
          .single();

        if (data && data.home_lat && data.home_lng) {
          setHomeLocation({
            lat: Number(data.home_lat),
            lng: Number(data.home_lng),
            city: data.home_city || "Home",
          });
        }
      } catch (err) {
        console.error("Failed to fetch home location:", err);
      }
    };
    fetchHomeLocation();
  }, [user]);

  // Filter trips based on toggles
  const filteredTrips = trips.filter((t) => {
    const status = getTripStatus(t.start_date, t.end_date);
    if (status === "past" && !showCompleted) return false;
    if ((status === "upcoming" || status === "active") && !showUpcoming) return false;
    return true;
  });

  // Calculate round-trip miles from home to each visible trip
  const roundTripMiles = (() => {
    if (!homeLocation) return 0;
    let total = 0;
    for (const t of filteredTrips) {
      if (t.lat != null && t.lng != null) {
        const oneWay = haversineDistance(homeLocation.lat, homeLocation.lng, t.lat, t.lng);
        total += oneWay * 2; // round trip
      }
    }
    return Math.round(total);
  })();

  const countries = uniqueCountries(filteredTrips);

  const animTrips = useCountUp(filteredTrips.length);
  const animCountries = useCountUp(countries);
  const animMiles = useCountUp(roundTripMiles);

  return (
    <div className="min-h-screen pb-nav flex flex-col animate-scroll-unfold">
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        <header className="px-5 pt-8 md:pt-10 pb-4">
          <h1 className="font-georgia text-3xl md:text-4xl font-bold text-ink">Your World</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Explore your adventures across the globe</p>
        </header>

        {/* Toggle Filters */}
        <div className="px-5 pb-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="show-upcoming"
              checked={showUpcoming}
              onCheckedChange={setShowUpcoming}
              className="data-[state=checked]:bg-amber"
            />
            <Label htmlFor="show-upcoming" className="text-sm text-foreground cursor-pointer">
              Upcoming Trips
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
              className="data-[state=checked]:bg-teal"
            />
            <Label htmlFor="show-completed" className="text-sm text-foreground cursor-pointer">
              Completed Trips
            </Label>
          </div>
        </div>

        {/* Globe container */}
        <div className="h-[210px] sm:h-[240px] md:h-[500px] lg:h-[700px] relative w-full px-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="w-80 h-80 rounded-full" />
            </div>
          ) : (
            <div className="w-full h-full max-w-[320px] sm:max-w-[420px] md:max-w-none mx-auto">
              <GlobeScene
                trips={filteredTrips}
                onTripClick={(id) => navigate(`/trip/${id}`)}
                homeLocation={homeLocation}
              />
            </div>
          )}
        </div>

        {/* Here Be Dragons */}
        <p className="text-center font-cinzel text-sm md:text-base italic text-muted-foreground tracking-[0.2em] opacity-70 -mt-4 mb-4 px-5">
          HERE BE DRAGONS
        </p>

        <div className="px-5 pb-6">
          <RopeDivider className="mb-4" />
          <div className="flex justify-around bg-card rounded-xl border shadow-md py-5 md:py-6">
            <div className="text-center">
              <p className="font-georgia text-3xl md:text-4xl font-bold text-amber">{animTrips}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mt-1">Trips</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-3xl md:text-4xl font-bold text-teal">{animCountries}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mt-1">Countries</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="font-georgia text-3xl md:text-4xl font-bold text-amber">{animMiles.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mt-1">Miles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
