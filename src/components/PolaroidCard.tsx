import { format, differenceInDays } from "date-fns";
import type { Trip } from "@/hooks/useTrips";
import { formatDestination } from "@/lib/formatDestination";
import { getTripStatus, STATUS_LABELS } from "@/lib/tripStatus";

interface Props {
  trip: Trip;
  onClick: () => void;
  /** If true, hides the countdown line below the card */
  hideCountdown?: boolean;
}

export default function PolaroidCard({ trip, onClick, hideCountdown }: Props) {
  const status = getTripStatus(trip.start_date, trip.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  return (
    <div className="flex flex-col items-center">
      {/* Card stack container */}
      <div
        className="relative cursor-pointer group"
        style={{ width: 160, height: 230 }}
        onClick={onClick}
      >
        {/* Bottom card (furthest back) */}
        <div
          className="absolute rounded-[2px]"
          style={{
            inset: 0,
            transform: "rotate(5deg) translate(-14px, 10px)",
            background: "#D4C9B0",
            boxShadow: "0 4px 12px rgba(80,60,30,0.25)",
            zIndex: 1,
            padding: "10px 10px 36px",
          }}
        />

        {/* Middle card */}
        <div
          className="absolute rounded-[2px]"
          style={{
            inset: 0,
            transform: "rotate(-3.5deg) translate(7px, 5px)",
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

            {/* Grain overlay — 35% opacity, multiply */}
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

            {/* Light leak */}
            <div
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: "40%",
                height: "40%",
                background:
                  "radial-gradient(circle, rgba(255,200,80,0.2) 0%, transparent 65%)",
                mixBlendMode: "screen",
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
          className={`font-georgia italic text-center mt-2.5 ${countdownClass}`}
          style={{ fontSize: 11 }}
        >
          {countdownText}
        </p>
      )}
    </div>
  );
}
