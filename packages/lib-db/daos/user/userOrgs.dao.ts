import { QueryResult } from "pg";
import pool from "../../index";

export interface UserOrg {
  user_id: string;
  org_id: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email: string;   // user email from sf_users.contact
  name: string;    // user name from sf_users.name
}

/**
 * Assign a user to an organization with a given role.
 */
export async function createUserOrg(args: {
  userId: string;
  orgId: string;
  role: "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
}): Promise<void> {
  const { userId, orgId, role } = args;
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_user_orgs (
      user_id,
      org_id,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, TRUE, $4, $5)
  `;
  const values = [userId, orgId, role, now, now];
  console.debug(`Executing query: ${queryText} with values: ${values}`);
  await pool.query(queryText, values);
}

export async function findByUserId(userId: string): Promise<UserOrg[]> {
    const result = await pool.query(
      `SELECT * FROM smartform.sf_user_orgs 
       WHERE user_id = $1 AND is_active = true 
       ORDER BY created_at`,
      [userId]
    );
    return result.rows;
  }

/**
 * Fetch a single user-org record by (userId, orgId), including user details.
 */
export async function getUserOrg(
  userId: string,
  orgId: string
): Promise<UserOrg | null> {
  const queryText = `
    SELECT uo.user_id,
           uo.org_id,
           uo.role,
           uo.is_active,
           uo.created_at,
           uo.updated_at,
           su.contact AS email,
           su.name
      FROM smartform.sf_user_orgs uo
      JOIN smartform.sf_users su ON uo.user_id = su.id
     WHERE uo.user_id = $1 AND uo.org_id = $2
     LIMIT 1;
  `;
  const result: QueryResult<UserOrg> = await pool.query(queryText, [userId, orgId]);
  return result.rows[0] || null;
}

/**
 * List all organizations for a given user.
 */
export async function listUserOrgsByUserId(
  userId: string
): Promise<UserOrg[]> {
  const queryText = `
    SELECT uo.user_id,
           uo.org_id,
           uo.role,
           uo.is_active,
           uo.created_at,
           uo.updated_at,
           su.contact AS email,
           su.name
      FROM smartform.sf_user_orgs uo
      JOIN smartform.sf_users su ON uo.user_id = su.id
     WHERE uo.user_id = $1 AND uo.is_active = TRUE
     ORDER BY uo.created_at DESC;
  `;
  console.info(`Executing query: ${queryText} to list user orgs for userId: ${userId}`);
  const result: QueryResult<UserOrg> = await pool.query(queryText, [userId]);
  return result.rows;
}

/**
 * List all users belonging to a given organization.
 */
export async function listUsersInOrg(orgId: string): Promise<UserOrg[]> {
  const queryText = `
    SELECT uo.user_id,
           uo.org_id,
           uo.role,
           uo.is_active,
           uo.created_at,
           uo.updated_at,
           su.contact AS email,
           su.name
      FROM smartform.sf_user_orgs uo
      JOIN smartform.sf_users su ON uo.user_id = su.id
     WHERE uo.org_id = $1 AND uo.is_active = TRUE
     ORDER BY uo.created_at DESC;
  `;
  console.debug(`Executing query: ${queryText} to list users in orgId: ${orgId}`);
  const result: QueryResult<UserOrg> = await pool.query(queryText, [orgId]);
  return result.rows;
}

/**
 * Change the role of a user in an organization.
 */
export async function changeUserRole(args: {
  userId: string;
  orgId: string;
  newRole: "ADMIN" | "DEVELOPER" | "VIEWER";
}): Promise<UserOrg | null> {
  const { userId, orgId, newRole } = args;
  const now = new Date().toISOString();

  const queryText = `
    UPDATE smartform.sf_user_orgs
       SET role = $1,
           updated_at = $2
     WHERE user_id = $3 AND org_id = $4
     RETURNING user_id,
               org_id,
               role,
               is_active,
               created_at,
               updated_at;
  `;
  const values = [newRole, now, userId, orgId];
  const result: QueryResult<UserOrg> = await pool.query(queryText, values);
  // After role change, fetch user details
  return result.rows[0]
    ? await getUserOrg(userId, orgId)
    : null;
}

/**
 * Deactivate (soft-delete) a user from an organization.
 */
export async function deactivateUserOrg(args: {
  userId: string;
  orgId: string;
}): Promise<void> {
  const { userId, orgId } = args;
  const now = new Date().toISOString();

  const queryText = `
    UPDATE smartform.sf_user_orgs
       SET is_active = FALSE,
           updated_at = $2
     WHERE user_id = $1 AND org_id = $3;
  `;
  await pool.query(queryText, [userId, now, orgId]);
}


/**
 * Get a specific user's role in a specific organization
 */
export async function getUserOrgRole(userId: string, orgId: string): Promise<{
  role: string;
  is_active: boolean;
} | null> {
  const query = `
    SELECT role, is_active 
    FROM smartform.sf_user_orgs 
    WHERE user_id = $1 AND org_id = $2
  `;
  
  const result = await pool.query(query, [userId, orgId]);
  return result.rows[0] || null;
}

/**
 * Get all organizations a user belongs to
 */
export async function getUserOrganizations(userId: string): Promise<Array<{
  org_id: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}>> {
  const query = `
    SELECT org_id, role, is_active, created_at, updated_at
    FROM smartform.sf_user_orgs
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
}