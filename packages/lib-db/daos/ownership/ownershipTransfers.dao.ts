import { QueryResult } from "pg";
import pool from "../../index";
import { v4 as uuidv4 } from "uuid";

export interface OwnershipTransfer {
  id: string;
  org_id: string;
  old_owner_id: string;
  new_owner_id: string;
  initiated_at: string;
  effective_at: string;
  status: "PENDING" | "CONFIRMED" | "EXPIRED" | "COMPLETED";
  created_at: string;
}

/**
 * Create a pending ownership transfer request.
 */
export async function createOwnershipTransfer(args: {
  id?: string;
  orgId: string;
  oldOwnerId: string;
  newOwnerId: string;
  effectiveAt: string; // ISO timestamp (e.g. now() + 3 business days)
}): Promise<OwnershipTransfer> {
  const { id, orgId, oldOwnerId, newOwnerId, effectiveAt } = args;
  const transferId = id || uuidv4();
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_ownership_transfers (
      id, org_id, old_owner_id, new_owner_id, initiated_at,
      effective_at, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,'PENDING',$7)
    RETURNING id, org_id, old_owner_id, new_owner_id, initiated_at, effective_at, status, created_at;
  `;
  const values = [transferId, orgId, oldOwnerId, newOwnerId, now, effectiveAt, now];

  const result: QueryResult<OwnershipTransfer> = await pool.query(queryText, values);
  return result.rows[0];
}

/**
 * Fetch a pending (or any) transfer request by its ID.
 */
export async function getOwnershipTransferById(
  transferId: string
): Promise<OwnershipTransfer | null> {
  const queryText = `
    SELECT id, org_id, old_owner_id, new_owner_id,
           initiated_at, effective_at, status, created_at
    FROM smartform.sf_ownership_transfers
    WHERE id = $1
    LIMIT 1;
  `;
  const result: QueryResult<OwnershipTransfer> = await pool.query(queryText, [
    transferId,
  ]);
  return result.rows[0] || null;
}

/**
 * List all pending transfers for an organization.
 */
export async function listPendingOwnershipTransfers(
  orgId: string
): Promise<OwnershipTransfer[]> {
  const queryText = `
    SELECT id, org_id, old_owner_id, new_owner_id,
           initiated_at, effective_at, status, created_at
    FROM smartform.sf_ownership_transfers
    WHERE org_id = $1 AND status = 'PENDING'
    ORDER BY initiated_at DESC;
  `;
  const result: QueryResult<OwnershipTransfer> = await pool.query(queryText, [orgId]);
  return result.rows;
}

/**
 * Confirm a transfer (new owner has clicked confirmation).
 */
export async function confirmOwnershipTransfer(
  transferId: string
): Promise<OwnershipTransfer | null> {
  const now = new Date().toISOString();
  const queryText = `
    UPDATE smartform.sf_ownership_transfers
    SET status = 'CONFIRMED', created_at = $1
    WHERE id = $2 AND status = 'PENDING'
    RETURNING id, org_id, old_owner_id, new_owner_id, initiated_at, effective_at, status, created_at;
  `;
  const result: QueryResult<OwnershipTransfer> = await pool.query(queryText, [now, transferId]);
  return result.rows[0] || null;
}

/**
 * Mark a transfer as expired.
 */
export async function expireOwnershipTransfer(
  transferId: string
): Promise<void> {
  const now = new Date().toISOString();
  const queryText = `
    UPDATE smartform.sf_ownership_transfers
    SET status = 'EXPIRED'
    WHERE id = $1 AND status = 'PENDING';
  `;
  await pool.query(queryText, [transferId]);
}

/**
 * Once the effective_at time is reached and status = 'CONFIRMED',
 * call this to swap roles in sf_user_orgs and mark as COMPLETED.
 */
export async function completeOwnershipTransfer(
  transferId: string
): Promise<void> {
  // 1) Fetch the transfer record
  const transfer = await getOwnershipTransferById(transferId);
  if (!transfer || transfer.status !== "CONFIRMED") return;

  // 2) Swap roles in sf_user_orgs
  const { org_id, old_owner_id, new_owner_id } = transfer;

  // Demote old owner to ADMIN
  await pool.query(
    `
    UPDATE smartform.sf_user_orgs
    SET role = 'ADMIN', updated_at = $1
    WHERE user_id = $2 AND org_id = $3;
  `,
    [new Date().toISOString(), old_owner_id, org_id]
  );

  // Promote new owner to OWNER
  await pool.query(
    `
    UPDATE smartform.sf_user_orgs
    SET role = 'OWNER', updated_at = $1
    WHERE user_id = $2 AND org_id = $3;
  `,
    [new Date().toISOString(), new_owner_id, org_id]
  );

  // 3) Mark transfer as COMPLETED
  await pool.query(
    `
    UPDATE smartform.sf_ownership_transfers
    SET status = 'COMPLETED'
    WHERE id = $1;
  `,
    [transferId]
  );
}
