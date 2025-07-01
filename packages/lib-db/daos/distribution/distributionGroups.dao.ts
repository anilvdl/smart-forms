import { QueryResult } from "pg";
import pool from "../../index";
import { v4 as uuidv4 } from "uuid";

export interface DistributionGroup {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

const BASE_COLUMNS = `
  id,
  org_id    AS "orgId",
  name,
  created_at   AS "createdAt",
  updated_at   AS "updatedAt"
`;

/**
 * Create a new distribution group for an organization.
 */
export async function createDistributionGroup(args: {
  id?: string;
  orgId: string;
  name: string;
}): Promise<DistributionGroup> {
  const { id, orgId, name } = args;
  const groupId = id || uuidv4();
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_distribution_groups (
      id, org_id, name, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING ${BASE_COLUMNS};
  `;
  const values = [groupId, orgId, name, now, now];
  const result: QueryResult<DistributionGroup> = await pool.query(queryText, values);
  return result.rows[0];
}

/**
 * Fetch a distribution group by its ID.
 */
export async function getDistributionGroupById(
  groupId: string
): Promise<DistributionGroup | null> {
  const queryText = `
    SELECT ${BASE_COLUMNS}
    FROM smartform.sf_distribution_groups
    WHERE id = $1
    LIMIT 1;
  `;
  const result: QueryResult<DistributionGroup> = await pool.query(queryText, [groupId]);
  return result.rows[0] || null;
}

/**
 * List all distribution groups for an organization.
 */
export async function listDistributionGroupsForOrg(
  orgId: string
): Promise<DistributionGroup[]> {
  const queryText = `
    SELECT ${BASE_COLUMNS}
    FROM smartform.sf_distribution_groups
    WHERE org_id = $1
    ORDER BY created_at DESC;
  `;
  const result: QueryResult<DistributionGroup> = await pool.query(queryText, [orgId]);
  return result.rows;
}

/**
 * Update a distribution group’s name.
 */
export async function updateDistributionGroup(args: {
  groupId: string;
  name: string;
}): Promise<DistributionGroup | null> {
  const { groupId, name } = args;
  const now = new Date().toISOString();

  const queryText = `
    UPDATE smartform.sf_distribution_groups
    SET name = $1, updated_at = $2
    WHERE id = $3
    RETURNING ${BASE_COLUMNS};
  `;
  const result: QueryResult<DistributionGroup> = await pool.query(queryText, [
    name,
    now,
    groupId,
  ]);
  return result.rows[0] || null;
}

/**
 * Delete a distribution group by ID.
 */
export async function deleteDistributionGroup(groupId: string): Promise<void> {
  const queryText = `
    DELETE FROM smartform.sf_distribution_groups WHERE id = $1;
  `;
  await pool.query(queryText, [groupId]);
}
