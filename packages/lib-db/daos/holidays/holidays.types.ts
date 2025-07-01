/**
 * HolidayRecord defines the normalized shape for any holiday entry,
 * regardless of source (Nager.Date or Calendarific).
 */
export interface HolidayRecord {
    /** Date in ISO format (YYYY-MM-DD) */
    date: string;

    /** Official English name of the holiday */
    name: string;

    /** Localized name; if unavailable, same as `name` */
    localName: string;

    /** Array of classification strings (e.g. ["Public"], ["National", "Observance"]) */
    type: string[];   
    /** ISO 3166-1 alpha-2 country code (e.g. "US", "IN") */
    countryCode?: string;
    /** Optional array of county codes if applicable (e.g. ["CA", "TX"]) */
    counties?: string[] | null;
}
