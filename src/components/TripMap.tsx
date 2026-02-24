import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Trip } from "@/hooks/useTrips";
import { format } from "date-fns";
import { formatDestination } from "@/lib/formatDestination";
import CompassRose from "@/components/icons/CompassRose";
import { Button } from "@/components/ui/button";

interface Props {
  trip: Trip;
  onEditTrip?: () => void;
}

export default function TripMap({ trip, onEditTrip }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainerRef.current || !trip.lat || !trip.lng || !token) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [trip.lng, trip.lat],
      zoom: 5,
      accessToken: token,
      scrollZoom: false,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    // Custom marker
    const el = document.createElement("div");
    el.style.cssText = `
      width: 36px; height: 36px; border-radius: 50%;
      background: #C8832A; border: 2px solid #FAF8F3;
      box-shadow: 0 2px 8px rgba(80,60,30,0.4);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    `;
    el.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="10" r="4" stroke="white" stroke-width="2.5"/><line x1="24" y1="14" x2="24" y2="42" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="22" x2="32" y2="22" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M24 42 C24 42 10 38 10 30" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="10" cy="30" r="2" fill="white"/><path d="M24 42 C24 42 38 38 38 30" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="38" cy="30" r="2" fill="white"/></svg>`;

    // Popup
    const popupHtml = `
      <div style="font-family:'Playfair Display',Georgia,serif;background:#FAF7F2;padding:10px 14px;border-radius:6px;min-width:160px;">
        <p style="font-weight:700;font-size:14px;color:#2A2218;margin:0;">${trip.name}</p>
        ${trip.destination ? `<p style="font-size:12px;color:#5A4F3E;margin:3px 0 0;">${formatDestination(trip.destination)}</p>` : ""}
        ${trip.start_date ? `<p style="font-size:11px;color:#9A8F7E;margin:3px 0 0;">${format(new Date(trip.start_date), "MMM d")}${trip.end_date ? ` – ${format(new Date(trip.end_date), "MMM d, yyyy")}` : ""}</p>` : ""}
      </div>
    `;

    const popup = new mapboxgl.Popup({
      offset: 20,
      closeButton: false,
      className: "trip-map-popup",
    }).setHTML(popupHtml);

    new mapboxgl.Marker({ element: el })
      .setLngLat([trip.lng, trip.lat])
      .setPopup(popup)
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [trip.lat, trip.lng, token, trip.name, trip.destination, trip.start_date, trip.end_date]);

  // No token
  if (!token) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: "#F5EDD6", border: "1px solid rgba(139,105,20,0.25)" }}>
        <p className="font-georgia italic text-muted-foreground">
          Map unavailable — add your Mapbox token to continue, Captain
        </p>
      </div>
    );
  }

  // No coordinates
  if (!trip.lat || !trip.lng) {
    return (
      <div className="rounded-lg p-8 text-center relative overflow-hidden" style={{ background: "#F5EDD6", border: "1px solid rgba(139,105,20,0.25)" }}>
        <CompassRose size={120} className="mx-auto mb-4 opacity-[0.12]" />
        <p className="font-georgia italic text-muted-foreground mb-4">
          No location charted for this voyage, Captain
        </p>
        {onEditTrip && (
          <Button size="sm" variant="outline" onClick={onEditTrip} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Edit Trip
          </Button>
        )}
      </div>
    );
  }

  const latDir = trip.lat >= 0 ? "N" : "S";
  const lngDir = trip.lng >= 0 ? "E" : "W";

  return (
    <div>
      <div
        ref={mapContainerRef}
        className="w-full rounded-lg overflow-hidden"
        style={{ minHeight: 480 }}
      />
      <p className="text-center mt-2 font-mono text-[11px] text-muted-foreground">
        📍 {trip.city || trip.destination || "Unknown"}, {trip.country || ""}  ·  {Math.abs(trip.lat).toFixed(4)}°{latDir} {Math.abs(trip.lng).toFixed(4)}°{lngDir}
      </p>
    </div>
  );
}
