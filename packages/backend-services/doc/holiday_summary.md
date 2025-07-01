Below is a concise summary of our “skip weekends/holidays” discussion and options so far, focused on India (IN) but also noting the general pattern. You can review this later and pick the approach that best fits your needs.

---

## 1. Initial Attempt: Nager.Date

- **Endpoint used:**  
  ```
  https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}
  ```
- **Outcome:**  
  - Works for many countries (US, GB, CA, etc.) but returns invalid/empty JSON for India (`IN`).  
  - Nager.Date does not maintain an Indian holiday feed.

---

## 2. Proposed Option: `date-holidays` NPM Package

- **Pros:**  
  - No external API keys or HTTP calls; everything is bundled in the library.
  - Covers 140+ countries, returns a list of `{ date, name, type, … }`.

- **Cons (for India):**  
  - The package does **not** ship India’s holiday data.  
  - Even though the repo lists “IN” among supported codes, the actual JSON for “IN” is missing.  

→ **Conclusion:** Not usable for India out of the box.

---

## 3. Alternative A: Public‐Holiday API (e.g. Calendarific or HolidayAPI)

1. **Calendarific** (https://calendarific.com/)  
   - Free tier: ~1,000 calls/month.  
   - Endpoint example:  
     ```
     GET https://calendarific.com/api/v2/holidays
         ?api_key=YOUR_KEY
         &country=IN
         &year=2025
     ```
   - Returns JSON with India’s federal (and some state) holidays.  
   - We can cache the year’s results in memory to avoid repeated calls.

2. **HolidayAPI** (https://holidayapi.com/)  
   - Free tier: ~250 calls/month.  
   - Similar usage pattern:  
     ```
     GET https://holidayapi.com/v1/holidays
         ?key=YOUR_KEY
         &country=IN
         &year=2025
     ```

3. **Implementation Sketch (Calendarific):**
   ```ts
   import fetch from "node-fetch";

   export interface Holiday {
     date: string;       // “YYYY-MM-DD”
     name: string;       // e.g. “Republic Day”
     localName: string;  // e.g. “Republic Day”
     type: string[];     // e.g. [“National”]
   }

   const cache: Record<string, Holiday[]> = {};

   export async function getHolidaysForCountry(
     countryCode: string,
     year: number
   ): Promise<Holiday[]> {
     const key = `${countryCode}_${year}`;
     if (cache[key]) return cache[key];

     const apiKey = process.env.SFORMS_HOLIDAY_API_KEY!;
     const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${countryCode}&year=${year}`;
     const res = await fetch(url);
     if (!res.ok) throw new Error(`Calendarific: HTTP ${res.status}`);
     const json = await res.json();
     const holidays: Holiday[] = (json.response.holidays || []).map((h: any) => ({
       date: h.date.iso.split("T")[0],
       name: h.name,
       localName: h.name_local || h.name,
       type: h.type,
     }));
     cache[key] = holidays;
     return holidays;
   }
   ```
   - **How this works:**  
     1. We only fetch once per `{ countryCode, year }` and store in an in-memory `cache`.  
     2. On subsequent calls, we immediately return the cached array.  
     3. Repeat for each year (e.g. when January 1, 2026 arrives).

---

## 4. Alternative B: Maintain a Local JSON List of India’s Holidays

- **Pros:**  
  - No external HTTP calls or API key needed.  
  - Fully under your control—easy to add or remove dates manually.

- **Cons:**  
  - Must update (or generate) a new JSON file each year.  
  - Doesn’t cover state‐level holidays unless you manually add them.

### Example Structure

```jsonc
// backend-services/src/data/indiaHolidays-2025.json
[
  { "date": "2025-01-26", "name": "Republic Day" },
  { "date": "2025-08-15", "name": "Independence Day" },
  { "date": "2025-10-02", "name": "Gandhi Jayanti" }
  // …add other national/state holidays here
]
```

```ts
// backend-services/src/utils/holidaysIn.ts
import india2025 from "../data/indiaHolidays-2025.json";

interface LocalHoliday {
  date: string; 
  name: string;
}

export function getIndiaHolidays(year: number): LocalHoliday[] {
  if (year === 2025) return india2025;
  throw new Error(`No static holiday data for year ${year}`);
}

export function isIndiaHoliday(isoDate: string): boolean {
  const year = Number(isoDate.split("-")[0]);
  const list = getIndiaHolidays(year);
  return list.some((h) => h.date === isoDate);
}
```

- **Workflow:**  
  1. At runtime, call `getIndiaHolidays(2025)` once (e.g. during boot) or on‐demand.  
  2. Whenever you test a date, see if `isIndiaHoliday("2025-01-26")` returns true.  
  3. Next January, you must add a new file `indiaHolidays-2026.json` (or a combined structure).

---

## 5. How to “Skip Weekends/Holidays” in Follow-Up Logic

Regardless of which data source you choose (Calendarific or local JSON), the pattern is:

```ts
async function isHolidayOrWeekend(date: Date, countryCode: string): Promise<boolean> {
  const iso = date.toISOString().split("T")[0]; // e.g. "2025-01-26"
  const day = date.getUTCDay();
  if (day === 0 || day === 6) return true; // Sunday or Saturday

  if (countryCode === "IN") {
    // Option A: Calendarific
    const holidays = await getHolidaysForCountry("IN", date.getUTCFullYear());
    return holidays.some((h) => h.date === iso);
    // Option B: Local JSON
    // return isIndiaHoliday(iso);
  }

  // For other countries, you could still use Nager.Date or date-holidays:
  // ...
  return false;
}

// Example: get next valid date after `start`,
// stepping by `intervalDays`, skipping weekends/holidays
async function getNextSendDate(
  start: Date,
  intervalDays: number,
  countryCode: string
): Promise<Date> {
  let candidate = new Date(start);
  while (true) {
    candidate.setUTCDate(candidate.getUTCDate() + intervalDays);
    if (!(await isHolidayOrWeekend(candidate, countryCode))) {
      return candidate;
    }
  }
}
```

---

## 6. Summary of Pros/Cons

| Approach                     | Pros                                                   | Cons                                                   |
|------------------------------|--------------------------------------------------------|--------------------------------------------------------|
| **Nager.Date**               | Free, simple for many countries                        | No India support (empty/invalid JSON)                  |
| **`date-holidays` package**  | No API keys, offline, built‐in global list             | India is missing from bundled data                     |
| **Calendarific API**         | Official‐looking data, auto‐updates each year          | Requires API key, rate limits (free tier ~1,000/mo)    |
| **HolidayAPI / Other APIs**  | Similar to	Calendarific (official, auto‐updates)       | Requires API key, lower free limit (~250/mo)           |
| **Local JSON files**         | Zero external calls, fully under your control          | Manual updates needed each year, potential stale data  |

---

### Next Steps

1. **Pick “Alternative A” (Calendarific) if:**
   - You don’t mind storing a free API key.  
   - You want automatic yearly updates (no manual JSON upkeep).  

2. **Pick “Alternative B” (Local JSON) if:**
   - You want zero external dependencies or API keys.  
   - You’re comfortable manually adding a new `YYYY.json` file each year.

Either approach can be swapped out later—just ensure your “isHolidayOrWeekend” helper points to the correct data.