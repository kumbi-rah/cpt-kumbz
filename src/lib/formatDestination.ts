/**
 * Cleans a full geocoded address to "City, Country".
 * e.g. "Medellín, Valle de Aburrá, Antioquia, RAP del Agua y la Montaña, 0500, Colombia"
 *   => "Medellín, Colombia"
 */
export function formatDestination(raw: string | null | undefined): string {
  if (!raw) return "";
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 2) return raw;
  return `${parts[0]}, ${parts[parts.length - 1]}`;
}
