// Default home base (New York). Adjust as needed.
const HOME_BASE = { lat: 40.7128, lng: -74.006 };

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Sum distance from home base to each past trip destination.
 * Only pass past trips (end_date before today) to this function.
 */
export function totalMiles(trips: { lat: number | null; lng: number | null; end_date?: string | null }[]): number {
  const now = new Date();
  const pastWithCoords = trips.filter(
    (t): t is { lat: number; lng: number; end_date?: string | null } =>
      t.lat != null && t.lng != null && (!t.end_date || new Date(t.end_date) <= now)
  );
  let total = 0;
  for (const t of pastWithCoords) {
    total += haversineDistance(HOME_BASE.lat, HOME_BASE.lng, t.lat, t.lng);
  }
  return Math.round(total);
}

export function uniqueCountries(trips: { destination: string | null }[]): number {
  const countries = new Set(
    trips.map((t) => t.destination?.split(",").pop()?.trim()).filter(Boolean)
  );
  return countries.size;
}
