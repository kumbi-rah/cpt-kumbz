import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Anchor } from "@phosphor-icons/react";
import { useTrips } from "@/hooks/useTrips";
import { getTripStatus } from "@/lib/tripStatus";
import PolaroidCard from "@/components/PolaroidCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CompassRose from "@/components/icons/CompassRose";

interface Props {
  onCreateClick: () => void;
}

export default function Trips({ onCreateClick }: Props) {
  const navigate = useNavigate();
  const { data: trips = [] } = useTrips();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const upcoming = trips
    .filter((t) => {
      const status = getTripStatus(t.start_date, t.end_date);
      return status === "upcoming" || status === "active";
    })
    .sort((a, b) => new Date(a.start_date || "").getTime() - new Date(b.start_date || "").getTime());

  const past = trips
    .filter((t) => getTripStatus(t.start_date, t.end_date) === "past")
    .sort((a, b) => new Date(b.start_date || "").getTime() - new Date(a.start_date || "").getTime());

  const displayTrips = activeTab === "upcoming" ? upcoming : past;
  const hasNoTrips = displayTrips.length === 0;

  return (
    <div className="min-h-screen pb-nav animate-scroll-unfold">
      <div className="max-w-6xl mx-auto px-5 pt-10 md:pt-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-georgia text-3xl md:text-4xl font-bold text-ink">Your Voyages</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-1 italic">Every adventure, logged</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "past")} className="w-full">
          <TabsList className="bg-card border w-auto">
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-amber px-6"
            >
              Upcoming ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past"
              className="data-[state=active]:bg-amber/10 data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-amber px-6"
            >
              Past ({past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-8">
            {hasNoTrips ? (
              <div className="text-center py-20">
                <div className="mb-6 opacity-[0.12]">
                  <CompassRose size={120} className="mx-auto text-ink" />
                </div>
                <p className="font-georgia italic text-xl text-muted-foreground mb-4">
                  No upcoming adventures yet
                </p>
                <button
                  onClick={onCreateClick}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-georgia text-base hover:bg-primary/90 transition-colors border border-primary/20"
                >
                  <Anchor size={18} weight="bold" />
                  Plan Your Next Voyage
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-10">
                {displayTrips.map((trip) => (
                  <div key={trip.id}>
                    <PolaroidCard trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            {hasNoTrips ? (
              <div className="text-center py-20">
                <div className="mb-6 opacity-[0.12]">
                  <svg viewBox="0 0 400 120" className="w-full max-w-sm mx-auto" fill="none">
                    <path d="M0,80 Q50,60 100,80 T200,80 T300,80 T400,80 L400,120 L0,120 Z" fill="hsl(33 20% 37%)" opacity="0.3" />
                    <path d="M0,90 Q50,70 100,90 T200,90 T300,90 T400,90 L400,120 L0,120 Z" fill="hsl(33 20% 37%)" opacity="0.2" />
                    <path d="M180,45 L200,20 L200,60 L160,60 Z" fill="hsl(33 20% 37%)" opacity="0.4" />
                    <path d="M155,60 L205,60 L195,80 L160,80 Z" fill="hsl(33 20% 37%)" opacity="0.5" />
                    <line x1="200" y1="20" x2="200" y2="60" stroke="hsl(33 20% 37%)" strokeWidth="2" opacity="0.4" />
                  </svg>
                </div>
                <p className="font-georgia italic text-xl text-muted-foreground">
                  No completed voyages yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-10">
                {displayTrips.map((trip) => (
                  <div key={trip.id}>
                    <PolaroidCard trip={trip} onClick={() => navigate(`/trip/${trip.id}`)} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
