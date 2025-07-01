# Holiday Caching & Fetching Module Summary

This document summarizes the implementation of the public-holiday caching and fetching module, including database schema, DAOs, utilities, Fastify routes, and in-memory caching.

---

## 1. Database Schema

**Table: `smartform.sf_holidays`**  
Stores normalized holiday records per country and year.

```sql
CREATE TABLE IF NOT EXISTS smartform.sf_holidays (
  country_code   VARCHAR(2)   NOT NULL,       -- ISO 3166-1 alpha-2 code
  year           INT          NOT NULL,       -- Calendar year
  data           JSONB        NOT NULL,       -- Array of normalized HolidayRecord objects
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (country_code, year)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON smartform.sf_holidays
  TO smartalh_smartforms_app_dev;
```

---

## 2. Canonical TypeScript Type

**File:** `lib-db/daos/holidays/holidays.types.ts`

```ts
export interface HolidayRecord {
  date: string;       // "YYYY-MM-DD"
  name: string;       // Official English name
  localName: string;  // Localized name
  type: string[];     // Classification tags
}
```

---

## 3. Data Access Layer (DAOs)

**File:** `lib-db/daos/holidays/holidays.dao.ts`

- `getCachedHolidays(countryCode, year)`: Reads `data` JSONB from table or returns `null`.
- `upsertHolidays(countryCode, year, records)`: Inserts or updates the row.

---

## 4. Fetchers & Normalizers

**Files:**
- `backend-services/src/utils/holidayFetcher.ts`
- `backend-services/src/utils/holidayNormalizers.ts`

### Fetchers

1. **Nager.Date**  
   ```ts
   fetchFromNager(countryCode, year): Promise<HolidayRecord[]>
   ```
2. **Calendarific**  
   ```ts
   fetchFromCalendarific(countryCode, year): Promise<HolidayRecord[]>
   ```
3. **refreshAndCacheHolidays**  
   - Tries Nager, falls back to Calendarific.
   - Normalizes results.
   - Calls `upsertHolidays`.

### Normalizers

- `normalizeFromNager(raw: any[]): HolidayRecord[]`
- `normalizeFromCalendarific(raw: any[]): HolidayRecord[]`

---

## 5. In-Memory Caching

**File:** `backend-services/src/utils/holidayCache.ts`

- `loadHolidays(countryCode, year)`: 
  1. Checks in-memory `Map`.
  2. Falls back to `getCachedHolidays` (DB).
  3. Calls `refreshAndCacheHolidays` if missing.
- `clearCache(countryCode, year)`: Evicts memory.

---

## 6. Fastify Routes

**File:** `backend-services/src/routes/admin/holidays.ts`

- `GET /admin/holidays?country=XX&year=YYYY`
  - Returns cached JSON or 404.
- `POST /admin/holidays/refresh?country=XX&year=YYYY`
  - Clears in-memory cache.
  - Calls `loadHolidays` (triggers external fetch if needed).
  - Returns fresh `HolidayRecord[]`.

**Startup Preload** (in `server.ts` onReady hook)
- Preloads key country/year combinations into DB and memory.

---

## 7. Usage in Scheduler

- **Helper:** `isHolidayOrWeekend(date, countryCode)`
  - Uses `loadHolidays(...)` to decide skip or send.
- Integrated into follow-up email scheduler to compute next send date.

---

_End of summary._  
