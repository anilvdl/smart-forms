import { QueryResult } from "pg";
import pool from "../../index";

export interface DistributionGroupMember {
  groupId: string;
  email: string;
}

/**
 * Add a member email to a distribution group.
 */
export async function addMemberToGroup(args: {
  groupId: string;
  email: string;
}): Promise<DistributionGroupMember> {
  const { groupId, email } = args;
  const queryText = `
    INSERT INTO smartform.sf_distribution_group_members (
      group_id, email
    ) VALUES ($1, $2)
    RETURNING group_id AS "groupId", email;
  `;
  const result: QueryResult<DistributionGroupMember> = await pool.query(queryText, [
    groupId,
    email,
  ]);
  return result.rows[0];
}

/**
 * Remove a member email from a distribution group.
 */
export async function removeMemberFromGroup(args: {
  groupId: string;
  email: string;
}): Promise<void> {
  const { groupId, email } = args;
  const queryText = `
    DELETE FROM smartform.sf_distribution_group_members
    WHERE group_id = $1 AND email = $2;
  `;
  await pool.query(queryText, [groupId, email]);
}

/**
 * List all member emails for a given distribution group.
 */
export async function listMembersOfGroup(
  groupId: string
): Promise<DistributionGroupMember[]> {
  const queryText = `
    SELECT group_id AS "groupId", email
    FROM smartform.sf_distribution_group_members
    WHERE group_id = $1
    ORDER BY email ASC;
  `;
  const result: QueryResult<DistributionGroupMember> = await pool.query(queryText, [
    groupId,
  ]);
  return result.rows;
}
