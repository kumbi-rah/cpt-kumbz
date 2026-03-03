import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Trip } from "@/hooks/useTrips";
import { getTripStatus } from "@/lib/tripStatus";
import { formatDestination } from "@/lib/formatDestination";

interface Props {
  trips: Trip[];
  onTripClick: (tripId: string) => void;
  homeLocation?: { lat: number; lng: number; city: string } | null;
}

export default function VoyageMap({ trips, onTripClick, homeLocation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!containerRef.current || !token) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      // Use a light/vintage style — Mapbox "outdoors" base then restyle via paint
      style: "mapbox://styles/mapbox/light-v11",
      center: [20, 20],
      zoom: 1.3,
      accessToken: token,
      projection: "mercator" as any,
      maxZoom: 6,
      minZoom: 1,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");

    map.on("load", () => {
      // Apply vintage sepia filter to water + land
      try {
        map.setPaintProperty("water", "fill-color", "#D4C9A8");
        map.setPaintProperty("land", "background-color", "#F5EDD6");
      } catch {
        // Style layers may differ; ignore
      }

      // Try to restyle various land layers for parchment feel
      const landLayers = ["landcover", "landuse", "land"];
      for (const layerId of landLayers) {
        try {
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, "fill-color", "#E8DFC0");
          }
        } catch { /* skip */ }
      }

      // Add trip markers & arcs
      addMarkersAndArcs(map);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  // Re-add markers when trips change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;
    // Clear existing markers by removing all markers (we'll re-add via DOM)
    // Mapbox markers are DOM elements, so we need to track them
    addMarkersAndArcs(map);
  }, [trips, homeLocation]);

  function addMarkersAndArcs(map: mapboxgl.Map) {
    // Remove old markers
    document.querySelectorAll(".voyage-marker").forEach((el) => el.remove());

    const validTrips = trips.filter((t) => t.lat != null && t.lng != null);

    // Add home marker
    if (homeLocation) {
      const homeEl = document.createElement("div");
      homeEl.className = "voyage-marker";
      homeEl.style.cssText = `
        width: 28px; height: 28px; border-radius: 50%;
        background: #10B981; border: 2px solid #FAF8F3;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 14px;
      `;
      homeEl.innerHTML = "🏠";

      new mapboxgl.Marker({ element: homeEl })
        .setLngLat([homeLocation.lng, homeLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 16, closeButton: false, className: "trip-map-popup" })
            .setHTML(`<div style="font-family:'Playfair Display',Georgia,serif;padding:6px 10px;"><strong>Home</strong><br/><span style="font-size:12px;color:#5A4F3E;">${homeLocation.city}</span></div>`)
        )
        .addTo(map);
    }

    // Add trip markers
    for (const trip of validTrips) {
      const status = getTripStatus(trip.start_date, trip.end_date);
      const color = status === "past" ? "#4A7A82" : "#C8832A";

      const el = document.createElement("div");
      el.className = "voyage-marker";
      el.style.cssText = `
        width: 24px; height: 24px; border-radius: 50%;
        background: ${color}; border: 2px solid #FAF8F3;
        box-shadow: 0 2px 8px rgba(80,60,30,0.4);
        cursor: pointer;
      `;

      const popup = new mapboxgl.Popup({ offset: 14, closeButton: false, className: "trip-map-popup" })
        .setHTML(`
          <div style="font-family:'Playfair Display',Georgia,serif;padding:6px 10px;min-width:120px;">
            <strong style="color:#2A2218;">${trip.name}</strong>
            ${trip.destination ? `<br/><span style="font-size:12px;color:#5A4F3E;">${formatDestination(trip.destination)}</span>` : ""}
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([trip.lng!, trip.lat!])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => onTripClick(trip.id));
    }

    // Draw route arcs as GeoJSON lines
    if (homeLocation && validTrips.length > 0) {
      // Remove old source/layer
      if (map.getLayer("route-arcs")) map.removeLayer("route-arcs");
      if (map.getSource("route-arcs")) map.removeSource("route-arcs");

      const features = validTrips.map((trip) => ({
        type: "Feature" as const,
        properties: {
          color: getTripStatus(trip.start_date, trip.end_date) === "past" ? "rgba(74,122,130,0.6)" : "rgba(200,131,42,0.6)",
        },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [homeLocation.lng, homeLocation.lat],
            [trip.lng!, trip.lat!],
          ],
        },
      }));

      map.addSource("route-arcs", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      map.addLayer({
        id: "route-arcs",
        type: "line",
        source: "route-arcs",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-dasharray": [4, 3],
          "line-opacity": 0.7,
        },
      });
    }
  }

  if (!token) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ background: "#F5EDD6", border: "1px solid rgba(139,105,20,0.25)" }}>
        <p className="font-georgia italic text-muted-foreground">
          Map unavailable — add your Mapbox token to continue, Captain
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: 200 }}
    />
  );
}
