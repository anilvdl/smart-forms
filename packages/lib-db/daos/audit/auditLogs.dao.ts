import { QueryResult } from "pg";
import pool from "../../index";
import { v4 as uuidv4 } from "uuid";

export interface AuditLog {
  id: string;
  org_id: string;
  user_id: string | null;
  event_type: string;
  metadata: any | null; // JSONB
  created_at: string;
}

/**
 * Create a new audit log entry.
 */
export async function createAuditLog(args: {
  id?: string;
  orgId: string;
  userId?: string | null;
  eventType: string;
  metadata?: any | null;
}): Promise<AuditLog> {
  const { id, orgId, userId = null, eventType, metadata = null } = args;
  const logId = id || uuidv4();
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_audit_logs (
      id, org_id, user_id, event_type, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, org_id, user_id, event_type, metadata, created_at;
  `;
  const values = [
    logId,
    orgId,
    userId,
    eventType,
    metadata ? JSON.stringify(metadata) : null,
    now,
  ];
  const result: QueryResult<AuditLog> = await pool.query(queryText, values);
  return result.rows[0];
}

/**
 * List audit logs for an organization (with optional filters).
 */
export async function listAuditLogsForOrg(
  orgId: string,
  args?: {
    limit?: number;
    offset?: number;
    eventType?: string;
    userId?: string;
  }
): Promise<AuditLog[]> {
  const { limit = 50, offset = 0, eventType, userId } = args || {};
  const conditions: string[] = ["org_id = $1"];
  const values: any[] = [orgId];
  let idx = 2;

  if (eventType) {
    conditions.push(`event_type = $${idx++}`);
    values.push(eventType);
  }
  if (userId) {
    conditions.push(`user_id = $${idx++}`);
    values.push(userId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const queryText = `
    SELECT id, org_id, user_id, event_type, metadata, created_at
    FROM smartform.sf_audit_logs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${idx++} OFFSET $${idx++};
  `;
  values.push(limit, offset);

  const result: QueryResult<AuditLog> = await pool.query(queryText, values);
  return result.rows;
}
