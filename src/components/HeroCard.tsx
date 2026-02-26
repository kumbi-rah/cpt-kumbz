import { useNavigate } from "react-router-dom";
import { differenceInDays } from "date-fns";
import { Anchor } from "@phosphor-icons/react";
import type { Trip } from "@/hooks/useTrips";
import { getTripStatus } from "@/lib/tripStatus";
import CompassRose from "@/components/icons/CompassRose";
import { formatDestination } from "@/lib/formatDestination";

interface Props {
  trip: Trip | null;
  onCreateClick: () => void;
}

export default function HeroCard({ trip, onCreateClick }: Props) {
  const navigate = useNavigate();

  if (!trip) {
    return (
      <div className="relative w-full h-[195px] md:h-[270px] rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #C8A96E, #8B6914)" }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <CompassRose size={200} className="text-foreground" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <p className="font-georgia italic text-2xl md:text-3xl text-primary-foreground mb-4">No voyages ahead, Captain</p>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-georgia text-base hover:bg-primary/90 transition-colors"
          >
            <Anchor size={18} weight="bold" />
            Chart Your First Adventure
          </button>
        </div>
        <ParchmentCorners />
      </div>
    );
  }

  const status = getTripStatus(trip.start_date, trip.end_date);
  const now = new Date();
  const startDate = trip.start_date ? new Date(trip.start_date) : null;
  const endDate = trip.end_date ? new Date(trip.end_date) : null;

  let countdownText = "";
  let isActive = false;

  if (status === "active" && startDate && endDate) {
    isActive = true;
    const dayNum = differenceInDays(now, startDate) + 1;
    const totalDays = differenceInDays(endDate, startDate) + 1;
    countdownText = `Day ${dayNum} of ${totalDays} · Currently at sea 🏴‍☠️`;
  } else if (startDate) {
    const days = differenceInDays(startDate, now);
    countdownText = days === 0 ? "Departing today!" : `⚓ ${days} days until departure`;
  }

  const hasCover = !!trip.cover_photo_url;

  return (
    <div
      className="relative w-full h-[195px] md:h-[270px] rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/trip/${trip.id}`)}
    >
      {/* Background */}
      {hasCover ? (
        <>
          <img
            src={trip.cover_photo_url!}
            alt={trip.name}
            className="absolute inset-0 w-full h-full object-cover vintage-filter"
          />
          <div className="vignette-overlay" />
        </>
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #C8A96E, #8B6914)" }} />
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
            <CompassRose size={200} className="text-foreground" />
          </div>
        </>
      )}

      {/* Bottom gradient overlay - stronger for better text readability */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,34,24,0.88) 0%, rgba(42,34,24,0.5) 50%, transparent 70%)" }} />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
        <p className="font-cinzel text-[10px] md:text-[11px] uppercase tracking-[3px] text-primary mb-2">
          Next Adventure
        </p>
        <h2 className="font-georgia font-bold text-[26px] md:text-[38px] leading-tight" style={{ color: "#F2EDE4" }}>
          {trip.name}
        </h2>
        {trip.destination && (
          <p className="text-[15px] md:text-[16px] mt-2" style={{ color: "hsl(36 13% 60%)" }}>
            {formatDestination(trip.destination)}
          </p>
        )}
        {countdownText && (
          <span
            className={`inline-flex items-center gap-1.5 mt-4 px-3.5 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground ${isActive ? "animate-pulse-glow" : ""}`}
          >
            {countdownText}
          </span>
        )}
      </div>

      {/* View Trip button */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-10">
        <span className="font-georgia text-sm md:text-base text-primary-foreground/90 group-hover:text-primary-foreground transition-colors drop-shadow-md">
          View Trip →
        </span>
      </div>

      <ParchmentCorners />
    </div>
  );
}

function ParchmentCorners() {
  const cornerStyle = "absolute w-6 h-6 md:w-8 md:h-8 pointer-events-none";
  const color = "#D4B896";
  return (
    <>
      {/* Top-left */}
      <div className={`${cornerStyle} top-0 left-0`}>
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M0,0 L32,0 L0,32 Z" fill={color} opacity="0.6" />
          <path d="M0,0 L24,0 L0,24 Z" fill={color} opacity="0.3" />
        </svg>
      </div>
      {/* Top-right */}
      <div className={`${cornerStyle} top-0 right-0`}>
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M32,0 L0,0 L32,32 Z" fill={color} opacity="0.6" />
          <path d="M32,0 L8,0 L32,24 Z" fill={color} opacity="0.3" />
        </svg>
      </div>
      {/* Bottom-left */}
      <div className={`${cornerStyle} bottom-0 left-0`}>
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M0,32 L32,32 L0,0 Z" fill={color} opacity="0.6" />
          <path d="M0,32 L24,32 L0,8 Z" fill={color} opacity="0.3" />
        </svg>
      </div>
      {/* Bottom-right */}
      <div className={`${cornerStyle} bottom-0 right-0`}>
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M32,32 L0,32 L32,0 Z" fill={color} opacity="0.6" />
          <path d="M32,32 L8,32 L32,8 Z" fill={color} opacity="0.3" />
        </svg>
      </div>
    </>
  );
}
