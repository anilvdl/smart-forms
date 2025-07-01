import { QueryResult } from "pg";
import pool from "../../index";
import { v4 as uuidv4 } from "uuid";

export interface FeatureFlag {
  id: string;
  flag_key: string;
  description: string | null;
  is_enabled: boolean;
  min_plan_required: "FREE" | "PRO" | "ENTERPRISE";
  created_at: string;
  updated_at: string;
}

/**
 * Create a new feature flag.
 */
export async function createFeatureFlag(args: {
  id?: string;
  flagKey: string;
  description?: string | null;
  isEnabled?: boolean;
  minPlanRequired?: "FREE" | "PRO" | "ENTERPRISE";
}): Promise<FeatureFlag> {
  const {
    id,
    flagKey,
    description = null,
    isEnabled = false,
    minPlanRequired = "FREE",
  } = args;
  const newId = id || uuidv4();
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_feature_flags (
      id, flag_key, description, is_enabled, min_plan_required, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, flag_key, description, is_enabled, min_plan_required, created_at, updated_at;
  `;
  const values = [
    newId,
    flagKey,
    description,
    isEnabled,
    minPlanRequired,
    now,
    now,
  ];

  const result: QueryResult<FeatureFlag> = await pool.query(queryText, values);
  return result.rows[0];
}

/**
 * Fetch a feature flag by its key.
 */
export async function getFeatureFlagByKey(
  flagKey: string
): Promise<FeatureFlag | null> {
  const queryText = `
    SELECT id, flag_key, description, is_enabled, min_plan_required, created_at, updated_at
    FROM smartform.sf_feature_flags
    WHERE flag_key = $1
    LIMIT 1;
  `;
  const result: QueryResult<FeatureFlag> = await pool.query(queryText, [flagKey]);
  return result.rows[0] || null;
}

/**
 * List all feature flags.
 */
export async function listFeatureFlags(): Promise<FeatureFlag[]> {
  const queryText = `
    SELECT id, flag_key, description, is_enabled, min_plan_required, created_at, updated_at
    FROM smartform.sf_feature_flags
    ORDER BY created_at DESC;
  `;
  const result: QueryResult<FeatureFlag> = await pool.query(queryText);
  return result.rows;
}

/**
 * Update a feature flag (only provided fields).
 */
export async function updateFeatureFlag(args: {
  flagKey: string;
  description?: string | null;
  isEnabled?: boolean;
  minPlanRequired?: "FREE" | "PRO" | "ENTERPRISE";
}): Promise<FeatureFlag | null> {
  const { flagKey, description, isEnabled, minPlanRequired } = args;
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (description !== undefined) {
    setClauses.push(`description = $${idx++}`);
    values.push(description);
  }
  if (isEnabled !== undefined) {
    setClauses.push(`is_enabled = $${idx++}`);
    values.push(isEnabled);
  }
  if (minPlanRequired !== undefined) {
    setClauses.push(`min_plan_required = $${idx++}`);
    values.push(minPlanRequired);
  }

  // Always update updated_at
  setClauses.push(`updated_at = $${idx++}`);
  values.push(new Date().toISOString());

  if (setClauses.length === 1 && setClauses[0].startsWith("updated_at")) {
    return getFeatureFlagByKey(flagKey);
  }

  values.push(flagKey);

  const queryText = `
    UPDATE smartform.sf_feature_flags
    SET ${setClauses.join(", ")}
    WHERE flag_key = $${idx}
    RETURNING id, flag_key, description, is_enabled, min_plan_required, created_at, updated_at;
  `;
  const result: QueryResult<FeatureFlag> = await pool.query(queryText, values);
  return result.rows[0] || null;
}

/**
 * Delete a feature flag by its key.
 */
export async function deleteFeatureFlag(flagKey: string): Promise<void> {
  const queryText = `
    DELETE FROM smartform.sf_feature_flags WHERE flag_key = $1;
  `;
  await pool.query(queryText, [flagKey]);
}
