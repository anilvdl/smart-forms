import { QueryResult } from "pg";
import pool from "../../index";
import { v4 as uuidv4 } from "uuid";

export interface FormView {
  id: string;
  form_id: string;
  viewed_at: string;
  visitor_id: string | null;
  ip_address: string | null;
}

/**
 * Record a new form view.
 */
export async function recordFormView(args: {
  id?: string;
  formId: string;
  viewedAt?: string;    // ISO timestamp or leave undefined for NOW()
  visitorId?: string | null;
  ipAddress?: string | null;
}): Promise<FormView> {
  const { id, formId, viewedAt, visitorId = null, ipAddress = null } = args;
  const viewId = id || uuidv4();
  const timestamp = viewedAt || new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_form_views (
      id, form_id, viewed_at, visitor_id, ip_address
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING id, form_id, viewed_at, visitor_id, ip_address;
  `;
  const result: QueryResult<FormView> = await pool.query(queryText, [
    viewId,
    formId,
    timestamp,
    visitorId,
    ipAddress,
  ]);
  return result.rows[0];
}

/**
 * Count unique form views (unique visitor_id) for a given form.
 * If visitor_id may be null, you could use ip_address or treat null as “anonymous.”
 */
export async function countUniqueFormViews(formId: string): Promise<number> {
  const queryText = `
    SELECT COUNT(DISTINCT visitor_id) AS unique_views
    FROM smartform.sf_form_views
    WHERE form_id = $1;
  `;
  const result: QueryResult<{ unique_views: string }> = await pool.query(queryText, [
    formId,
  ]);
  return parseInt(result.rows[0]?.unique_views || "0", 10);
}

/**
 * Optionally list raw view records for a form (e.g. for debugging).
 */
export async function listFormViewsByForm(
  formId: string,
  args?: { limit?: number; offset?: number }
): Promise<FormView[]> {
  const { limit = 50, offset = 0 } = args || {};
  const queryText = `
    SELECT id, form_id, viewed_at, visitor_id, ip_address
    FROM smartform.sf_form_views
    WHERE form_id = $1
    ORDER BY viewed_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const result: QueryResult<FormView> = await pool.query(queryText, [
    formId,
    limit,
    offset,
  ]);
  return result.rows;
}
