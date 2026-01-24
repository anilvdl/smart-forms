import fetch from "node-fetch";

interface Holiday {
  date: string;         // e.g. "2025-01-01"
  localName: string;    // e.g. "New Year's Day"
  name: string;         // e.g. "New Year's Day"
  countryCode: string;  // e.g. "US"
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];      // e.g. ["Public"]
}

type CacheKey = string; // `${countryCode}-${year}`

const cache: Map<CacheKey, Holiday[]> = new Map();

/**
 * Fetches public holidays for a given country and year using Nager.Date.
 * Caches results in-memory for the current runtime.
 *
 * @param countryCode - ISO 3166 two-letter code (e.g. "US", "IN")
 * @param year - Four-digit year (e.g. 2025)
 * @returns Array of Holiday objects
 */
export async function fetchHolidaysForCountry(
  countryCode: string,
  year: number
): Promise<Holiday[]> {
  const key: CacheKey = `${countryCode}-${year}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  // Nager.Date endpoint (no API key required)
  const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch holidays: ${resp.statusText}`);
  }
  const holidays: Holiday[] = await resp.json() as Holiday[];
  cache.set(key, holidays);
  return holidays;
}
