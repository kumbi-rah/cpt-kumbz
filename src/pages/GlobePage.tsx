import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import GlobeScene from "@/components/GlobeScene";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { totalMiles, uniqueCountries } from "@/lib/haversine";
import { getTripStatus } from "@/lib/tripStatus";
import { useCountUp } from "@/lib/useCountUp";
import RopeDivider from "@/components/icons/RopeDivider";

export default function GlobePage() {
  const { data: trips = [], isLoading } = useTrips();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homeLocation, setHomeLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);

  const past = trips.filter((t) => getTripStatus(t.start_date, t.end_date) === "past");
  const countries = uniqueCountries(trips);
  const miles = totalMiles(past);

  const animTrips = useCountUp(trips.length);
  const animCountries = useCountUp(countries);
  const animMiles = useCountUp(miles);

  // Fetch home location from user settings
  useEffect(() => {
    const fetchHomeLocation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("home_lat, home_lng, home_city")
          .eq("user_id", user.id)
          .single();

        if (data && data.home_lat && data.home_lng) {
          setHomeLocation({
            lat: data.home_lat,
            lng: data.home_lng,
            city: data.home_city || "Home",
          });
        }
      } catch (err) {
        console.error("Failed to fetch home location:", err);
      }
    };

    fetchHomeLocation();
  }, [user]);

  return (
    <div className="min-h-screen pb-nav flex flex-col animate-scroll-unfold">
      <div className="max-w-6xl mx-auto w-full flex flex-col flex-1">
        <header className="px-5 pt-8 md:pt-10 pb-4">
          <h1 className="font-georgia text-3xl md:text-4xl font-bold text-ink">Your World</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1">Explore your adventures across the globe</p>
        </header>

        {/* Globe container - much larger on desktop */}
        <div className="flex-1 min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative w-full px-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Skeleton className="w-80 h-80 rounded-full" />
            </div>
          ) : (
            <div className="w-full h-full">
              <GlobeScene 
                trips={trips} 
                onTripClick={(id) => navigate(`/trip/${id}`)} 
                homeLocation={homeLocation}
              />
            </div>
          )}
        </div>

        {/* Here Be Dragons - more visible */}
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
