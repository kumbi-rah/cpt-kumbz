export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function totalMiles(trips: { lat: number | null; lng: number | null }[]): number {
  const valid = trips.filter((t): t is { lat: number; lng: number } => t.lat != null && t.lng != null);
  let total = 0;
  for (let i = 1; i < valid.length; i++) {
    total += haversineDistance(valid[i - 1].lat, valid[i - 1].lng, valid[i].lat, valid[i].lng);
  }
  return Math.round(total);
}

export function uniqueCountries(trips: { destination: string | null }[]): number {
  const countries = new Set(
    trips.map((t) => t.destination?.split(",").pop()?.trim()).filter(Boolean)
  );
  return countries.size;
}
