import fetch from "node-fetch";
import { HolidayRecord } from "@smartforms/lib-db/daos/holidays/holidays.types";
import { normalizeFromNager, normalizeFromCalendarific } from "./holidayNormalizers";
import { getCachedHolidays as dbGet, upsertHolidays as dbUpsert } from "@smartforms/lib-db/daos/holidays/holidays.dao";
import { logger as baseLogger }  from "@smartforms/lib-middleware";
/**
 * Raw type returned by Nager.Date for each holiday.
 */
type NagerDatum = {
  date: string;          // e.g. "2025-02-12"
  localName: string;     // e.g. "Lincoln's Birthday"
  name: string;          // e.g. "Lincoln's Birthday"
  types: string[];       // e.g. ["Observance", "Public", "School", "Authorities"]
  // other fields (countryCode, fixed, global, etc.) ignored here
};

/**
 * Raw type returned by Calendarific for each holiday.
 */
type CalendarificHolidayRaw = {
  date: { iso: string }; // e.g. { iso: "2025-01-01T00:00:00+00:00" }
  name: string;          // e.g. "New Year's Day"
  name_local: string;    // e.g. "New Year's Day"
  type: string[];        // e.g. ["Local holiday"]
  // other fields (description, primary_type, states, etc.) ignored here
};

const NAGER_URL = "https://date.nager.at/api/v3/PublicHolidays";
const CALENDARIFIC_URL = "https://calendarific.com/api/v2/holidays";
const memoryCache = new Map<string, HolidayRecord[]>();

/**
 * fetchFromNager
 *
 * Attempts to fetch public holidays from Nager.Date for a given countryCode and year.
 * If successful, returns a normalized array of HolidayRecord.
 * Throws on any non-200 or invalid JSON.
 */
export async function fetchFromNager(
  countryCode: string,
  year: number
): Promise<HolidayRecord[]> {
  const url = `${NAGER_URL}/${year}/${countryCode}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Nager.Date responded with HTTP ${res.status}`);
  }
  const rawArray: NagerDatum[] = await res.json() as NagerDatum[];
  // If the API returns an empty array, that means “no holidays” rather than failure.
  return normalizeFromNager(rawArray);
}

/**
 * fetchFromCalendarific
 *
 * Attempts to fetch public holidays from Calendarific for a given countryCode and year.
 * Requires process.env.SFORMS_HOLIDAY_API_KEY to be set.
 * Throws on any non-200 or invalid JSON.
 */
export async function fetchFromCalendarific(
  countryCode: string,
  year: number
): Promise<HolidayRecord[]> {
  const apiKey = process.env.SFORMS_CALENDARIFIC_HOLIDAY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing environment variable SFORMS_HOLIDAY_API_KEY");
  }
  const url = new URL(CALENDARIFIC_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("country", countryCode);
  url.searchParams.set("year", year.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Calendarific responded with HTTP ${res.status}`);
  }
  const json = (await res.json()) as any;
  const rawArray: CalendarificHolidayRaw[] = json?.response?.holidays || [];
  return normalizeFromCalendarific(rawArray);
}

/**
 * refreshAndCacheHolidays
 *
 * 1. Attempts to fetch from Nager.Date.
 * 2. If Nager fails or returns an empty array (zero-length), falls back to Calendarific.
 * 3. Normalizes whichever data is found.
 * 4. Upserts into sf_holidays table.
 * 5. Returns the normalized array that was ultimately stored.
 *
 * Throws if both providers fail (HTTP error, bad JSON, etc.).
 */
async function refreshAndCacheHolidays(
  countryCode: string,
  year: number
): Promise<HolidayRecord[]> {
  let records: HolidayRecord[] = [];
  // 1. Try Nager.Date
  try {
    records = await fetchFromNager(countryCode, year);
    // If Nager returns an empty array, we consider that “no holidays found” and proceed to Calendarific:
    if (records.length === 0) {
      throw new Error("Nager returned zero holidays; fallback to Calendarific");
    }
  } catch (nagerErr) {
    // 2. Fallback to Calendarific
    try {
      records = await fetchFromCalendarific(countryCode, year);
    } catch (calErr) {
      // Both failed → rethrow a combined error
      const nagerMsg = nagerErr instanceof Error ? nagerErr.message : String(nagerErr);
      const calMsg = calErr instanceof Error ? calErr.message : String(calErr);
      throw new Error(
        `Failed fetching holidays. Nager: ${nagerMsg}; Calendarific: ${calMsg}`
      );
    }
  }

  // 3. Upsert into the database
  await dbUpsert(countryCode, year, records);

  return records;
}

/**
 * loadHolidays
 *
 * Returns holidays for country/year, using this order:
 *  1) in-memory cache
 *  2) database cache
 *  3) external fetch (Nager→Calendarific), then DB upsert + memory cache
 */
export async function loadHolidays(country: string, year: number): Promise<HolidayRecord[]> {
  const key = `${country}|${year}`;
  // 1) Memory
  if (memoryCache.has(key)) {
    baseLogger.info(`loadHolidays: in-memory cache hit for ${key}`);
    return memoryCache.get(key)!;
  }

  // 2) Database
  const dbData = await dbGet(country, year);
  if (dbData) {
    baseLogger.info(`loadHolidays: DB cache hit for ${key}`);
    memoryCache.set(key, dbData);
    return dbData;
  }

  // 3) External fetch + cache
  const fresh = await refreshAndCacheHolidays(country, year);
  baseLogger.info(`loadHolidays: fetched holidays from external-system for ${key}`);
  memoryCache.set(key, fresh);
  return fresh;
}

/**
 * clearCache (optional)
 * Expose this if you need to force evict—for example, after a manual "refresh" endpoint.
 */
export function clearCache(country: string, year: number) {
  memoryCache.delete(`${country}|${year}`);
}

/**
 * Returns true if `date` is Saturday, Sunday, or in the holiday list.
 */
export async function isHolidayOrWeekend(date: Date, countryCode: string): Promise<boolean> {
  const iso = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const day = date.getUTCDay();
  if (day === 0 || day === 6) return true;

  const holidays = await loadHolidays(countryCode, date.getUTCFullYear());
  return holidays.some((h) => h.date === iso);
}
