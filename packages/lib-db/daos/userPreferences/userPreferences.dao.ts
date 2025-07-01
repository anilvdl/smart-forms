import { QueryResult } from "pg";
import pool from "../../index";  

export interface UserPreferences {
  userId: string;
  defaultOrgId: string | null;
  timezone: string | null;
  locale: string | null;
  settings: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetch a user's preferences row (or null if none).
 */
export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const sql = `
    SELECT
      user_id            AS "userId",
      default_org_id     AS "defaultOrgId",
      timezone,
      locale,
      settings,
      created_at         AS "createdAt",
      updated_at         AS "updatedAt"
    FROM smartform.sf_user_preferences
    WHERE user_id = $1
  `;
  console.info("Executing SQL to fetch user preferences:", sql, "with userId:", userId);
  const result: QueryResult<UserPreferences> = await pool.query(sql, [userId]);
  return result.rows[0] ?? null;
}

/**
 * Upsert a user's preferences.
 * If a row for this user_id exists, updates; otherwise inserts.
 */
export async function upsertUserPreferences(params: {
  userId: string;
  defaultOrgId?: string;
  timezone?: string;
  locale?: string;
  settings?: Record<string, any>;
}): Promise<void> {
  const {
    userId,
    defaultOrgId = null,
    timezone = null,
    locale = null,
    settings = null,
  } = params;

  // we stringify settings JSON if provided
  const settingsJson = settings ? JSON.stringify(settings) : null;

  const sql = `
    INSERT INTO smartform.sf_user_preferences
      (user_id, default_org_id, timezone, locale, settings, created_at, updated_at)
    VALUES
      ($1, $2, $3, $4, $5, now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      default_org_id = EXCLUDED.default_org_id,
      timezone       = EXCLUDED.timezone,
      locale         = EXCLUDED.locale,
      settings       = EXCLUDED.settings,
      updated_at     = now()
  `;
  await pool.query(sql, [
    userId,
    defaultOrgId,
    timezone,
    locale,
    settingsJson,
  ]);
}