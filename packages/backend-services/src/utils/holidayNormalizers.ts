import { HolidayRecord } from "@smartforms/lib-db/daos/holidays/holidays.types";

/**
 * normalizeFromNager
 *
 * Takes the raw array from Nager.Date and returns a HolidayRecord[].
 */
export function normalizeFromNager(rawArray: any[]): HolidayRecord[] {
  return rawArray.map((h: any) => ({
    date: h.date,                  // already “YYYY-MM-DD”
    name: h.name,
    localName: h.localName || h.name,
    type: Array.isArray(h.types) ? h.types : [String(h.types)],
  }));
}

/**
 * normalizeFromCalendarific
 *
 * Takes the raw array from Calendarific and returns a HolidayRecord[].
 */
export function normalizeFromCalendarific(rawArray: any[]): HolidayRecord[] {
  return rawArray.map((h: any) => ({
    date: h.date.iso.split("T")[0],    // convert “YYYY-MM-DDT00:00:00+00:00” → “YYYY-MM-DD”
    name: h.name,
    localName: h.name_local || h.name,
    type: Array.isArray(h.type) ? h.type : [String(h.type)],
  }));
}
