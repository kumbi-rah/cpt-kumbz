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

export function getCountryName(trip: { country?: string | null; destination?: string | null }): string | undefined {
  if (trip.country) return trip.country.trim();
  return trip.destination?.split(",").pop()?.trim() || undefined;
}

export function uniqueCountries(trips: { country?: string | null; destination?: string | null }[]): number {
  const countries = new Set(trips.map(getCountryName).filter(Boolean));
  return countries.size;
}

const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // North America
  "United States": "North America", "USA": "North America", "US": "North America",
  "Canada": "North America", "Mexico": "North America", "Cuba": "North America",
  "Jamaica": "North America", "Dominican Republic": "North America", "Costa Rica": "North America",
  "Panama": "North America", "Guatemala": "North America", "Honduras": "North America",
  "Puerto Rico": "North America", "Bahamas": "North America", "Trinidad and Tobago": "North America",
  "Belize": "North America", "Nicaragua": "North America", "El Salvador": "North America",
  "Haiti": "North America", "Barbados": "North America",
  // South America
  "Brazil": "South America", "Argentina": "South America", "Colombia": "South America",
  "Chile": "South America", "Peru": "South America", "Ecuador": "South America",
  "Uruguay": "South America", "Venezuela": "South America", "Bolivia": "South America",
  "Paraguay": "South America", "Guyana": "South America", "Suriname": "South America",
  // Europe
  "United Kingdom": "Europe", "UK": "Europe", "England": "Europe", "Scotland": "Europe",
  "France": "Europe", "Germany": "Europe", "Italy": "Europe", "Spain": "Europe",
  "Portugal": "Europe", "Netherlands": "Europe", "Belgium": "Europe", "Switzerland": "Europe",
  "Austria": "Europe", "Sweden": "Europe", "Norway": "Europe", "Denmark": "Europe",
  "Finland": "Europe", "Ireland": "Europe", "Poland": "Europe", "Czech Republic": "Europe",
  "Czechia": "Europe", "Greece": "Europe", "Hungary": "Europe", "Romania": "Europe",
  "Croatia": "Europe", "Iceland": "Europe", "Turkey": "Europe", "Türkiye": "Europe",
  "Serbia": "Europe", "Bulgaria": "Europe", "Slovakia": "Europe", "Slovenia": "Europe",
  "Estonia": "Europe", "Latvia": "Europe", "Lithuania": "Europe", "Luxembourg": "Europe",
  "Malta": "Europe", "Cyprus": "Europe", "Monaco": "Europe", "Montenegro": "Europe",
  "Albania": "Europe", "North Macedonia": "Europe", "Bosnia and Herzegovina": "Europe",
  "Ukraine": "Europe", "Russia": "Europe",
  // Africa
  "South Africa": "Africa", "Morocco": "Africa", "Egypt": "Africa", "Kenya": "Africa",
  "Nigeria": "Africa", "Ghana": "Africa", "Tanzania": "Africa", "Ethiopia": "Africa",
  "Tunisia": "Africa", "Senegal": "Africa", "Rwanda": "Africa", "Uganda": "Africa",
  "Mozambique": "Africa", "Madagascar": "Africa", "Namibia": "Africa", "Botswana": "Africa",
  "Zimbabwe": "Africa", "Zambia": "Africa", "Mauritius": "Africa", "Algeria": "Africa",
  // Asia
  "Japan": "Asia", "China": "Asia", "India": "Asia", "Thailand": "Asia",
  "Vietnam": "Asia", "South Korea": "Asia", "Indonesia": "Asia", "Philippines": "Asia",
  "Malaysia": "Asia", "Singapore": "Asia", "Taiwan": "Asia", "Sri Lanka": "Asia",
  "Nepal": "Asia", "Cambodia": "Asia", "Laos": "Asia", "Myanmar": "Asia",
  "Bangladesh": "Asia", "Pakistan": "Asia", "Mongolia": "Asia", "Maldives": "Asia",
  "United Arab Emirates": "Asia", "UAE": "Asia", "Saudi Arabia": "Asia", "Israel": "Asia",
  "Jordan": "Asia", "Lebanon": "Asia", "Qatar": "Asia", "Oman": "Asia",
  "Bahrain": "Asia", "Kuwait": "Asia", "Iraq": "Asia", "Iran": "Asia",
  "Georgia": "Asia", "Armenia": "Asia", "Azerbaijan": "Asia", "Kazakhstan": "Asia",
  "Uzbekistan": "Asia",
  // Oceania
  "Australia": "Oceania", "New Zealand": "Oceania", "Fiji": "Oceania",
  "Papua New Guinea": "Oceania", "Samoa": "Oceania", "Tonga": "Oceania",
  "French Polynesia": "Oceania", "Tahiti": "Oceania", "Guam": "Oceania",
  "New Caledonia": "Oceania", "Vanuatu": "Oceania",
  // Antarctica
  "Antarctica": "Antarctica",
};

export function uniqueContinents(trips: { country?: string | null; destination?: string | null }[]): number {
  const continents = new Set<string>();
  for (const trip of trips) {
    const name = getCountryName(trip);
    if (name && COUNTRY_TO_CONTINENT[name]) {
      continents.add(COUNTRY_TO_CONTINENT[name]);
    }
  }
  return continents.size;
}
