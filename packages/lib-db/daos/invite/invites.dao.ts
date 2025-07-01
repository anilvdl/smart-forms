import { Pool, QueryResult } from "pg";
import pool from "../../index";
import { v4 as uuidv4 } from "uuid";

export interface Invite {
  id: string;
  invited_email: string;
  org_id: string;
  invited_by: string;
  role_requested: "ADMIN" | "DEVELOPER" | "VIEWER";
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

/**
 * Create a new invite for a user to join an organization.
 */
export async function createInvite(args: {
  id?: string;
  invitedEmail: string;
  orgId: string;
  invitedBy: string;
  roleRequested: "ADMIN" | "DEVELOPER" | "VIEWER";
  token?: string;
  expiresAt: string; // ISO timestamp
}): Promise<Invite> {
  const {
    id,
    invitedEmail,
    orgId,
    invitedBy,
    roleRequested,
    token,
    expiresAt,
  } = args;
  const inviteId = id || uuidv4();
  const inviteToken = token || uuidv4();
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_invites (
      id, invited_email, org_id, invited_by, role_requested,
      token, expires_at, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING
      id, invited_email, org_id, invited_by, role_requested,
      token, expires_at, accepted_at, created_at;
  `;

  const values = [
    inviteId,
    invitedEmail,
    orgId,
    invitedBy,
    roleRequested,
    inviteToken,
    expiresAt,
    now,
  ];

  const result: QueryResult<Invite> = await pool.query(queryText, values);
  return result.rows[0];
}

/**
 * Fetch an invite by its token.
 */
export async function getInviteByToken(token: string): Promise<Invite | null> {
  const queryText = `
    SELECT 
      id, invited_email, org_id, invited_by, role_requested,
      token, expires_at, accepted_at, created_at
    FROM smartform.sf_invites
    WHERE token = $1
      AND (accepted_at IS NULL)
      AND (expires_at > NOW())
    LIMIT 1;
  `;
  const result: QueryResult<Invite> = await pool.query(queryText, [token]);
  return result.rows[0] || null;
}

/**
 * Mark an invite as accepted (i.e., set accepted_at).
 * Returns the updated invite row.
 */
export async function acceptInvite(
  token: string,
  acceptingUserId: string
): Promise<Invite | null> {
  const now = new Date().toISOString();
  const queryText = `
    UPDATE smartform.sf_invites
    SET accepted_at = $1
    WHERE token = $2 AND accepted_at IS NULL AND expires_at > NOW()
    RETURNING 
      id, invited_email, org_id, invited_by, role_requested,
      token, expires_at, accepted_at, created_at;
  `;

  const result: QueryResult<Invite> = await pool.query(queryText, [
    now,
    token,
  ]);
  return result.rows[0] || null;
}

/**
 * List all invites for a given organization.
 */
export async function listInvitesInOrg(orgId: string): Promise<Invite[]> {
  const queryText = `
    SELECT 
      id, invited_email, org_id, invited_by, role_requested,
      token, expires_at, accepted_at, created_at
    FROM smartform.sf_invites
    WHERE org_id = $1
    ORDER BY created_at DESC;
  `;
  const result: QueryResult<Invite> = await pool.query(queryText, [orgId]);
  return result.rows;
}

/**
 * Delete (or invalidate) an invite by ID.
 */
export async function deleteInvite(id: string): Promise<void> {
  const queryText = `
    DELETE FROM smartform.sf_invites WHERE id = $1;
  `;
  await pool.query(queryText, [id]);
}
