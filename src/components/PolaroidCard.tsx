import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { Trip } from "@/hooks/useTrips";
import { formatDestination } from "@/lib/formatDestination";
import { getTripStatus, STATUS_LABELS } from "@/lib/tripStatus";
import { supabase } from "@/integrations/supabase/client";
import { Users, User } from "@phosphor-icons/react";

interface Props {
  trip: Trip;
  onClick: () => void;
  hideCountdown?: boolean;
}

interface CrewMember {
  user_id: string;
  avatar_url: string | null;
  display_name: string;
}

export default function PolaroidCard({ trip, onClick, hideCountdown }: Props) {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loadingCrew, setLoadingCrew] = useState(true);
  
  const status = getTripStatus(trip.start_date, trip.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    loadCrew();
  }, [trip.id]);

  const loadCrew = async () => {
    setLoadingCrew(true);
    try {
      const { data, error } = await supabase
        .from("trip_crew")
        .select(`
          user_id,
          user_profile:user_profiles!trip_crew_user_id_fkey(avatar_url, display_name)
        `)
        .eq("trip_id", trip.id);

      if (error) throw error;

      const crewData = data?.map(item => ({
        user_id: item.user_id,
        avatar_url: (item.user_profile as any)?.avatar_url || null,
        display_name: (item.user_profile as any)?.display_name || 'Unknown',
      })) || [];

      setCrew(crewData);
    } catch (error) {
      console.error("Error loading crew:", error);
    } finally {
      setLoadingCrew(false);
    }
  };

  // Countdown calculations
  let countdownText = "";
  let countdownClass = "";
  if (status === "upcoming" && trip.start_date) {
    const days = Math.ceil(
      (new Date(trip.start_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    countdownText = days === 0 ? "Today!" : `${days} days away`;
    countdownClass = "text-primary";
  } else if (status === "active" && trip.start_date) {
    const currentDay = Math.ceil(
      (today.getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const tripLength = trip.end_date
      ? Math.ceil(
          (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : null;
    countdownText = tripLength
      ? `Day ${currentDay} of ${tripLength} · Ongoing 🏴‍☠️`
      : `Day ${currentDay} · Ongoing 🏴‍☠️`;
    countdownClass = "text-primary animate-pulse-glow-text";
  } else if (status === "past") {
    countdownText = "✓ Completed";
    countdownClass = "text-secondary";
  }

  const isCrewTrip = crew.length > 1;

  return (
    <div className="flex flex-col items-center">
      {/* Card stack container */}
      <div
        className="relative cursor-pointer group"
        style={{ width: 160, height: 230 }}
        onClick={onClick}
      >
        {/* Bottom card (furthest back) - DRAMATIC */}
        <div
          className="absolute rounded-[2px]"
          style={{
            inset: 0,
            transform: "rotate(8deg) translate(-22px, 16px)",
            background: "#D4C9B0",
            boxShadow: "0 4px 12px rgba(80,60,30,0.25)",
            zIndex: 1,
            padding: "10px 10px 36px",
          }}
        />

        {/* Middle card - DRAMATIC */}
        <div
          className="absolute rounded-[2px]"
          style={{
            inset: 0,
            transform: "rotate(-5deg) translate(12px, 8px)",
            background: "#E2D9C4",
            boxShadow: "0 4px 14px rgba(80,60,30,0.22)",
            zIndex: 2,
            padding: "10px 10px 36px",
          }}
        />

        {/* Front card */}
        <div
          className="absolute rounded-[2px] transition-all duration-300 group-hover:!rotate-0 group-hover:-translate-y-4 group-hover:scale-[1.04]"
          style={{
            inset: 0,
            transform: "rotate(1deg)",
            background: "#FAF8F3",
            boxShadow:
              "0 8px 28px rgba(80,60,30,0.22), 0 2px 8px rgba(80,60,30,0.12)",
            zIndex: 3,
            padding: "10px 10px 38px",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Photo area */}
          <div className="relative w-full overflow-hidden rounded-[1px]" style={{ aspectRatio: "1/1" }}>
            {trip.cover_photo_url ? (
              <img
                src={trip.cover_photo_url}
                alt={trip.name}
                className="w-full h-full object-cover vintage-filter"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #C8A96E, #8B6914)",
                }}
              >
                <span className="font-georgia italic text-xs" style={{ color: "#9A8F7E" }}>
                  No photo
                </span>
              </div>
            )}

            {/* Grain overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity: 0.35,
                mixBlendMode: "multiply",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 35%, rgba(30,15,0,0.5) 100%)",
              }}
            />

            {/* Status badge */}
            <div
              className={`absolute top-1.5 right-1.5 px-[7px] py-[2px] rounded-full text-white font-bold uppercase ${
                status === "active" ? "animate-pulse-glow" : ""
              }`}
              style={{
                fontSize: 8,
                letterSpacing: "0.06em",
                background: status === "past" ? "#4A7A82" : "#C8832A",
                zIndex: 4,
              }}
            >
              {STATUS_LABELS[status]}
            </div>

            {/* Crew indicator */}
            {isCrewTrip && !loadingCrew && (
              <div
                className="absolute top-1.5 left-1.5 flex items-center gap-1 px-2 py-1 rounded-full bg-amber/90 backdrop-blur-sm"
                style={{ zIndex: 4 }}
              >
                <Users size={10} weight="fill" className="text-white" />
                <span className="text-white font-bold" style={{ fontSize: 8 }}>
                  {crew.length}
                </span>
              </div>
            )}

            {/* Crew avatars (bottom of photo) */}
            {isCrewTrip && !loadingCrew && (
              <div
                className="absolute bottom-1.5 left-1.5 flex -space-x-2"
                style={{ zIndex: 4 }}
              >
                {crew.slice(0, 3).map((member, idx) => (
                  <div
                    key={member.user_id}
                    className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-amber/10"
                    style={{
                      zIndex: 3 - idx,
                    }}
                  >
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber/20">
                        <User size={12} weight="fill" className="text-amber" />
                      </div>
                    )}
                  </div>
                ))}
                {crew.length > 3 && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white bg-amber/90 flex items-center justify-center"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-white font-bold" style={{ fontSize: 8 }}>
                      +{crew.length - 3}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Wax seal */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: -8,
                right: 6,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "radial-gradient(circle at 40% 35%, #C8832A, #8A5A1A)",
                boxShadow: "0 2px 6px rgba(80,60,30,0.4)",
                transform: "rotate(-12deg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="6" x2="12" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="9" x2="16" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 17c0-3 5-3 5 2c0-5 5-5 5-2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="12" cy="5" r="2" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
          </div>

          {/* Caption area */}
          <div className="mt-1.5 px-0.5" style={{ maxHeight: 38, overflow: "hidden" }}>
            <p
              className="font-georgia font-bold leading-tight line-clamp-2"
              style={{ fontSize: 11, color: "#2A2218" }}
            >
              {trip.name}
            </p>
            {trip.destination && (
              <p
                className="font-georgia truncate"
                style={{ fontSize: 9, color: "#5A4F3E", marginTop: 2 }}
              >
                {formatDestination(trip.destination)}
              </p>
            )}
            <p style={{ fontSize: 8.5, color: "#9A8F7E", marginTop: 2 }}>
              {trip.start_date && format(new Date(trip.start_date), "MMM d")}
              {trip.end_date && ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}`}
            </p>
          </div>
        </div>
      </div>

      {/* Countdown below the card stack */}
      {!hideCountdown && countdownText && (
        <p
          className={`font-georgia italic text-center mt-6 ${countdownClass}`}
          style={{ fontSize: 11 }}
        >
          {countdownText}
        </p>
      )}
    </div>
  );
}
