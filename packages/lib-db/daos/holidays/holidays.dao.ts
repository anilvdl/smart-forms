import pool from "../../index";
import { HolidayRecord } from "./holidays.types";

/**
 * getCachedHolidays
 *
 * Fetches the cached holidays for a given countryCode and year.
 * Returns an array of HolidayRecord if found, or null if no entry exists.
 */
export async function getCachedHolidays(
  countryCode: string,
  year: number
): Promise<HolidayRecord[] | null> {
  const query = `
    SELECT data
    FROM smartform.sf_holidays
    WHERE country_code = $1 AND year = $2
    LIMIT 1;
  `;
  const result = await pool.query<{ data: HolidayRecord[] }>(query, [
    countryCode,
    year,
  ]);
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0].data;
}

/**
 * upsertHolidays
 *
 * Inserts or updates the row for (countryCode, year) with the provided array of HolidayRecord.
 * If a row exists, overwrites `data` and updates `updated_at`.
 */
export async function upsertHolidays(
  countryCode: string,
  year: number,
  records: HolidayRecord[]
): Promise<void> {
  const query = `
    INSERT INTO smartform.sf_holidays (country_code, year, data, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (country_code, year)
      DO UPDATE SET data = $3, updated_at = NOW();
  `;
  await pool.query(query, [countryCode, year, JSON.stringify(records)]);
}
