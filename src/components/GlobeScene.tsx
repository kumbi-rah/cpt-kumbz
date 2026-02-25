import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import type { Trip } from "@/hooks/useTrips";
import { formatDestination } from "@/lib/formatDestination";
import { getTripStatus, type TripStatus } from "@/lib/tripStatus";

interface GlobeSceneProps {
  trips: Trip[];
  onTripClick: (tripId: string) => void;
  homeLocation?: { lat: number; lng: number; city: string } | null;
}

export default function GlobeScene({ trips, onTripClick, homeLocation }: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [hoveredTrip, setHoveredTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Globe.gl with proper sizing
    const globe = Globe()(containerRef.current)
      .width(containerRef.current.clientWidth)
      .height(containerRef.current.clientHeight)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#C8A96E")
      .atmosphereAltitude(0.15)
      // Real Earth satellite textures
      .globeImageUrl("https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png")
      // Auto-rotation
      .controls({
        autoRotate: true,
        autoRotateSpeed: 0.4,
        enableZoom: false,
      });

    globeRef.current = globe;

    // Set camera position - 2.0 for good balance (was 1.8, too big)
    globe.pointOfView({ altitude: 2.0 });

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && globeRef.current) {
        globeRef.current.width(containerRef.current.clientWidth);
        globeRef.current.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (globeRef.current) {
        globeRef.current._destructor();
      }
    };
  }, []);

  // Update points when trips or home location change
  useEffect(() => {
    if (!globeRef.current) return;

    const validTrips = trips.filter((t) => t.lat != null && t.lng != null);

    // Create point data for trip pins
    const pointsData = validTrips.map((trip) => {
      const status = getTripStatus(trip.start_date, trip.end_date);
      return {
        lat: trip.lat!,
        lng: trip.lng!,
        size: 0.6, // Larger pins (was 0.5)
        color: status === "past" ? "#4A7A82" : "#C8832A",
        altitude: 0.02, // Slight elevation
        trip,
        status,
        isHome: false,
      };
    });

    // Add home location pin if set
    if (homeLocation) {
      pointsData.push({
        lat: homeLocation.lat,
        lng: homeLocation.lng,
        size: 0.7, // Slightly larger for home
        color: "#10B981", // Green for home
        altitude: 0.02,
        trip: null as any,
        status: "home" as any,
        isHome: true,
      });
    }

    // Configure points (pins) with glow effect
    globeRef.current
      .pointsData(pointsData)
      .pointAltitude("altitude")
      .pointRadius("size")
      .pointColor("color")
      .pointLabel((d: any) => {
        if (d.isHome) {
          return `
            <div style="
              background: #FAF7F2;
              border: 1px solid rgba(16,185,129,0.3);
              border-radius: 10px;
              padding: 10px 14px;
              box-shadow: 0 4px 16px rgba(80,60,30,0.2);
              font-family: 'Playfair Display', Georgia, serif;
            ">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 16px;">🏠</span>
                <p style="font-weight: bold; font-size: 13px; color: #2A2218; margin: 0;">Home</p>
              </div>
              <p style="font-size: 11px; color: #10B981; margin: 4px 0 0 0;">${homeLocation?.city || "My Home"}</p>
            </div>
          `;
        }

        const trip = d.trip;
        const status = d.status;
        return `
          <div style="
            background: #FAF7F2;
            border: 1px solid rgba(200,131,42,0.3);
            border-radius: 10px;
            padding: 10px 14px;
            box-shadow: 0 4px 16px rgba(80,60,30,0.2);
            font-family: 'Playfair Display', Georgia, serif;
            max-width: 200px;
          ">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${d.color};"></span>
              <p style="font-weight: bold; font-size: 13px; color: #2A2218; margin: 0;">${trip.name}</p>
            </div>
            ${trip.destination ? `<p style="font-size: 11px; color: #5A4F3E; margin: 2px 0;">${formatDestination(trip.destination)}</p>` : ""}
            ${
              trip.start_date
                ? `
              <p style="font-size: 11px; color: #9A8F7E; margin: 4px 0 0 0;">
                ${new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                ${trip.end_date ? ` – ${new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
              </p>
            `
                : ""
            }
            <span style="
              display: inline-block;
              margin-top: 6px;
              font-size: 8px;
              font-weight: bold;
              text-transform: uppercase;
              padding: 2px 6px;
              border-radius: 999px;
              color: white;
              background: ${d.color};
              letter-spacing: 0.5px;
            ">
              ${status === "upcoming" ? "UPCOMING" : status === "active" ? "ACTIVE" : "PAST"}
            </span>
          </div>
        `;
      })
      .onPointClick((point: any) => {
        if (point && point.trip && !point.isHome) {
          onTripClick(point.trip.id);
        }
      })
      .onPointHover((point: any) => {
        setHoveredTrip(point?.trip || null);
        if (containerRef.current) {
          containerRef.current.style.cursor = point ? "pointer" : "grab";
        }
      });

    // Create arcs between sequential trips (route lines)
    const sortedTrips = [...validTrips].sort(
      (a, b) => new Date(a.start_date || "").getTime() - new Date(b.start_date || "").getTime(),
    );

    const arcsData = [];
    for (let i = 0; i < sortedTrips.length - 1; i++) {
      const from = sortedTrips[i];
      const to = sortedTrips[i + 1];
      if (from.lat && from.lng && to.lat && to.lng) {
        arcsData.push({
          startLat: from.lat,
          startLng: from.lng,
          endLat: to.lat,
          endLng: to.lng,
        });
      }
    }

    globeRef.current
      .arcsData(arcsData)
      .arcColor(() => "rgba(200,131,42,0.6)")
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(0)
      .arcStroke(0.8) // Thicker arcs for visibility
      .arcAltitude(0.1);
  }, [trips, onTripClick, homeLocation]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        cursor: "grab",
        minHeight: "600px",
      }}
    />
  );
}
