/**
 * Normalizes a city string to the standard "Cidade, UF" format.
 *
 * Handles these variants:
 * - "Londrina - PR"  → "Londrina, PR"
 * - "Londrina , PR"  → "Londrina, PR"
 * - "Londrina"       → "Londrina" (no UF available, kept as-is)
 * - "  Londrina, PR " → "Londrina, PR"
 * - "SP" or "PR"     → "" (solo state abbreviations are invalid)
 */
export function normalizeCity(value: string | null | undefined): string {
  if (!value) return '';

  let city = value.trim();
  if (!city) return '';

  // Solo state abbreviation (e.g., "SP", "PR") — invalid city
  if (/^[A-Z]{2}$/.test(city)) return '';

  // "Cidade - UF" → "Cidade, UF"
  city = city.replace(/^(.+?)\s*-\s*([A-Z]{2})$/, '$1, $2');

  // "Cidade , UF" (extra spaces around comma) → "Cidade, UF"
  city = city.replace(/\s*,\s*/, ', ');

  // Trim any trailing/leading whitespace from the city name part
  city = city.replace(/^\s+|\s+$/g, '');

  return city;
}
