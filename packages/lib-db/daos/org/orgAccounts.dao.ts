import { QueryResult } from "pg";
import pool from "../../index"; 
import { v4 as uuidv4 } from "uuid";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.SFORMS_STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

export interface OrgAccount {
  id: string;                    // UUID
  name: string;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
  preferred_currency: string;
  tax_id: string | null;
  invoice_footer: string | null;
  bank_details: any | null;       // JSONB
  invoice_retention_years: number;
  provider: string | null;
  subscription_id: string | null;
  billing_customer_id: string | null;
  billing_plan: "FREE" | "PRO" | "ENTERPRISE" | "PENDING" | "STARTER" | "PRO-PAYU" | "STARTER-PAYU" | "ENTERPRISE-PAYU";  
  billing_status: "ACTIVE" | "PAST_DUE" | "CANCELED";
  next_billing_date: string | null; // ISO timestamp
  created_at: string;              // ISO timestamp
  updated_at: string;              // ISO timestamp
}

/**
 * Create a new organization account.
 */
export async function createOrgAccount(args: {
  id?: string; // if omitted, we generate one
  name: string;
  billing_address_line1?: string | null;
  billing_address_line2?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_postal_code?: string | null;
  billing_country?: string | null;
  preferred_currency?: string;
  tax_id?: string | null;
  invoice_footer?: string | null;
  bank_details?: any | null;
  invoice_retention_years?: number;
  provider?: string | null;
  subscription_id?: string | null;
  billing_customer_id?: string | null;
  billing_plan?: "FREE" | "PRO" | "ENTERPRISE";
  billing_status?: "ACTIVE" | "PAST_DUE" | "CANCELED";
  next_billing_date?: string | null;
}): Promise<OrgAccount> {
  const {
    id,
    name,
    billing_address_line1 = null,
    billing_address_line2 = null,
    billing_city = null,
    billing_state = null,
    billing_postal_code = null,
    billing_country = null,
    preferred_currency = "USD",
    tax_id = null,
    invoice_footer = null,
    bank_details = null,
    invoice_retention_years = 7,
    provider = null,
    subscription_id = null,
    billing_customer_id = null,
    billing_plan = "FREE",
    billing_status = "ACTIVE",
    next_billing_date = null,
  } = args;

  const orgId = id || uuidv4();
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_org_accounts (
      id,
      name,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      preferred_currency,
      tax_id,
      invoice_footer,
      bank_details,
      invoice_retention_years,
      provider,
      subscription_id,
      billing_customer_id,
      billing_plan,
      billing_status,
      next_billing_date,
      created_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19, $20, $21
    )
    RETURNING
      id,
      name,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      preferred_currency,
      tax_id,
      invoice_footer,
      bank_details,
      invoice_retention_years,
      provider,
      subscription_id,
      billing_customer_id,
      billing_plan,
      billing_status,
      next_billing_date,
      created_at,
      updated_at;
  `;

  const values = [
    orgId,
    name,
    billing_address_line1,
    billing_address_line2,
    billing_city,
    billing_state,
    billing_postal_code,
    billing_country,
    preferred_currency,
    tax_id,
    invoice_footer,
    bank_details ? JSON.stringify(bank_details) : null,
    invoice_retention_years,
    provider,
    subscription_id,
    billing_customer_id,
    billing_plan,
    billing_status,
    next_billing_date,
    now,
    now,
  ];

  console.info("Creating organization account with sql: " , queryText, "values: ", values);
  const result: QueryResult<OrgAccount> = await pool.query(queryText, values);
  return result.rows[0];
}

/**
 * Retrieve a single organization account by its ID.
 */
export async function getOrgAccountById(orgId: string): Promise<OrgAccount | null> {
  const queryText = `
    SELECT
      id,
      name,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      preferred_currency,
      tax_id,
      invoice_footer,
      bank_details,
      invoice_retention_years,
      provider,
      subscription_id,
      billing_customer_id,
      billing_plan,
      billing_status,
      next_billing_date,
      created_at,
      updated_at
    FROM smartform.sf_org_accounts
    WHERE id = $1
    LIMIT 1;
  `;
  const result: QueryResult<OrgAccount> = await pool.query(queryText, [orgId]);
  return result.rows[0] || null;
}

// Alias for route import consistency
export const getOrgAccount = getOrgAccountById;

export async function findById(orgId: string): Promise<OrgAccount | null> {
  const result = await pool.query(
    `SELECT * FROM smartform.sf_org_accounts WHERE id = $1`,
    [orgId]
  );
  return result.rows[0] || null;
}

/**
 * List all organization accounts (optionally with pagination).
 */
export async function listOrgAccounts(args?: { limit?: number; offset?: number; }): Promise<OrgAccount[]> {
  const { limit = 50, offset = 0 } = args || {};
  const queryText = `
    SELECT
      id,
      name,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country,
      preferred_currency,
      tax_id,
      invoice_footer,
      bank_details,
      invoice_retention_years,
      provider,
      subscription_id,
      billing_customer_id,
      billing_plan,
      billing_status,
      next_billing_date,
      created_at,
      updated_at
    FROM smartform.sf_org_accounts
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2;
  `;
  const result: QueryResult<OrgAccount> = await pool.query(queryText, [limit, offset]);
  return result.rows;
}

/**
 * Update an existing organization account (only provided fields).
 */
export async function updateOrgAccount(args: { id: string; name?: string; billing_address_line1?: string | null; billing_address_line2?: string | null; billing_city?: string | null; billing_state?: string | null; billing_postal_code?: string | null; billing_country?: string | null; preferred_currency?: string; tax_id?: string | null; invoice_footer?: string | null; bank_details?: any | null; invoice_retention_years?: number; provider?: string | null; subscription_id?: string | null; billing_customer_id?: string | null; billing_plan?: "FREE" | "PRO" | "ENTERPRISE"; billing_status?: "ACTIVE" | "PAST_DUE" | "CANCELED"; next_billing_date?: string | null; }): Promise<OrgAccount | null> {
  const {
    id,
    name,
    billing_address_line1,
    billing_address_line2,
    billing_city,
    billing_state,
    billing_postal_code,
    billing_country,
    preferred_currency,
    tax_id,
    invoice_footer,
    bank_details,
    invoice_retention_years,
    provider,
    subscription_id,
    billing_customer_id,
    billing_plan,
    billing_status,
    next_billing_date,
  } = args;

  // Build dynamic SET clause
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const addClause = (clause: string, value: any) => {
    setClauses.push(`${clause} = $${idx}`);
    values.push(value);
    idx++;
  };

  if (name !== undefined) addClause('name', name);
  if (billing_address_line1 !== undefined) addClause('billing_address_line1', billing_address_line1);
  if (billing_address_line2 !== undefined) addClause('billing_address_line2', billing_address_line2);
  if (billing_city !== undefined) addClause('billing_city', billing_city);
  if (billing_state !== undefined) addClause('billing_state', billing_state);
  if (billing_postal_code !== undefined) addClause('billing_postal_code', billing_postal_code);
  if (billing_country !== undefined) addClause('billing_country', billing_country);
  if (preferred_currency !== undefined) addClause('preferred_currency', preferred_currency);
  if (tax_id !== undefined) addClause('tax_id', tax_id);
  if (invoice_footer !== undefined) addClause('invoice_footer', invoice_footer);
  if (bank_details !== undefined) addClause('bank_details', bank_details ? JSON.stringify(bank_details) : null);
  if (invoice_retention_years !== undefined) addClause('invoice_retention_years', invoice_retention_years);
  if (provider !== undefined) addClause('provider', provider);
  if (subscription_id !== undefined) addClause('subscription_id', subscription_id);
  if (billing_customer_id !== undefined) addClause('billing_customer_id', billing_customer_id);
  if (billing_plan !== undefined) addClause('billing_plan', billing_plan);
  if (billing_status !== undefined) addClause('billing_status', billing_status);
  if (next_billing_date !== undefined) addClause('next_billing_date', next_billing_date);

  // Always update updated_at
  addClause('updated_at', new Date().toISOString());

  // If only updated_at is present, return existing record
  if (setClauses.length === 1 && setClauses[0].startsWith('updated_at')) {
    return getOrgAccountById(id);
  }

  values.push(id);
  
  const queryText = `
    UPDATE smartform.sf_org_accounts
    SET ${setClauses.join(', ')}
    WHERE id = $${idx}
    RETURNING *;
  `;
  
  const result: QueryResult<OrgAccount> = await pool.query(queryText, values);
  return result.rows[0] || null;
}

// Extension: Stripe integration for billing

/**
 * Change the subscription plan for an organization.
 * Calls Stripe to update the subscription and updates the record in the database.
 */
export async function updateOrgBillingPlan(
  orgId: string,
  newPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
): Promise<OrgAccount> {
  // Retrieve current org and subscription info
  const org = await getOrgAccountById(orgId);
  if (!org || !org.subscription_id) {
    throw new Error('Organization or subscription not found');
  }

  // Determine Stripe Price ID from environment
  const priceEnvKey = `SFORMS_STRIPE_PRICE_${newPlan}`;
  const priceId = process.env[priceEnvKey];
  if (!priceId) {
    throw new Error(`Missing Stripe price ID for plan ${newPlan}`);
  }

  // Update Stripe subscription
  const stripeSubRaw = await stripe.subscriptions.update(org.subscription_id, {
    items: [{ price: priceId }]
  });

  const stripeSub = stripeSubRaw as any as Stripe.Subscription;

  let invoice: Stripe.Invoice;
  if (typeof stripeSub.latest_invoice === 'string') {
    invoice = await stripe.invoices.retrieve(stripeSub.latest_invoice);
  } else if (stripeSub.latest_invoice !== null) {
    invoice = stripeSub.latest_invoice;
  } else {
    throw new Error('Stripe subscription does not have a latest invoice');
  }

  // Compute next billing date
  const nextBillingDate = invoice.period_end
    ? new Date(invoice.period_end * 1000).toISOString()
    : null;

  // Update database record
  const updatedOrg = await updateOrgAccount({
    id: orgId,
    billing_plan: newPlan,
    next_billing_date: nextBillingDate
  });

  if (!updatedOrg) {
    throw new Error('Failed to update organization billing plan in DB');
  }
  return updatedOrg;
}

/**
 * Generate a Stripe SetupIntent client secret for updating the payment method.
 */
export async function createBillingSetupIntent(
  orgId: string
): Promise<{ clientSecret: string }> {
  const org = await getOrgAccountById(orgId);
  if (!org || !org.billing_customer_id) {
    throw new Error('Billing customer ID not found');
  }

  const intent = await stripe.setupIntents.create({
    customer: org.billing_customer_id
  });

  if (!intent.client_secret) {
    throw new Error('Failed to create Stripe SetupIntent');
  }
  return { clientSecret: intent.client_secret };
}

export async function updateBillingPlan(orgId: string, updates: {
  billing_plan: string;
  billing_status: string;
  updated_at: Date;
}): Promise<OrgAccount> {
  const query = `
    UPDATE smartform.sf_org_accounts
    SET 
      billing_plan = $2,
      billing_status = $3,
      updated_at = $4
    WHERE id = $1
    RETURNING *
  `;
  
  const result = await pool.query(query, [
    orgId,
    updates.billing_plan,
    updates.billing_status,
    updates.updated_at
  ]);
  
  return result.rows[0];
}

export async function getUserOrgRole(userId: string, orgId: string) {
  const query = `
    SELECT role 
    FROM smartform.sf_user_orgs 
    WHERE user_id = $1 AND org_id = $2 AND is_active = true
  `;
  
  const result = await pool.query(query, [userId, orgId]);
  return result.rows[0];
}

export async function getById(orgId: string) {
  const query = `
    SELECT * FROM smartform.sf_org_accounts WHERE id = $1
  `;
  
  const result = await pool.query(query, [orgId]);
  return result.rows[0];
}