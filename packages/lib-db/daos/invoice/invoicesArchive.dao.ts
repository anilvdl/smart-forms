import { QueryResult } from "pg";
import pool from "../../index";

export interface ArchivedInvoice {
  id: string;
  org_id: string;
  provider: string;
  provider_invoice_id: string;
  original_amount: number;
  original_currency: string;
  converted_amount: number;
  converted_currency: string;
  exchange_rate_to_preferred: number;
  status: string;
  invoice_date: string;
  due_date: string | null;
  pdf_blob: Buffer | null;
  archived_at: string;
}

/**
 * Fetch an archived invoice by ID.
 */
export async function getArchivedInvoiceById(
  invoiceId: string
): Promise<ArchivedInvoice | null> {
  const queryText = `
    SELECT 
      id, org_id, provider, provider_invoice_id,
      original_amount, original_currency,
      converted_amount, converted_currency,
      exchange_rate_to_preferred, status,
      invoice_date, due_date, pdf_blob, archived_at
    FROM smartform.sf_invoices_archive
    WHERE id = $1
    LIMIT 1;
  `;
  const result: QueryResult<ArchivedInvoice> = await pool.query(queryText, [
    invoiceId,
  ]);
  return result.rows[0] || null;
}

/**
 * List archived invoices for an organization with pagination.
 */
export async function listArchivedInvoicesForOrg(
  orgId: string,
  args?: { limit?: number; offset?: number }
): Promise<ArchivedInvoice[]> {
  const { limit = 50, offset = 0 } = args || {};
  const queryText = `
    SELECT 
      id, org_id, provider, provider_invoice_id,
      original_amount, original_currency,
      converted_amount, converted_currency,
      exchange_rate_to_preferred, status,
      invoice_date, due_date, pdf_blob, archived_at
    FROM smartform.sf_invoices_archive
    WHERE org_id = $1
    ORDER BY archived_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const result: QueryResult<ArchivedInvoice> = await pool.query(queryText, [
    orgId,
    limit,
    offset,
  ]);
  return result.rows;
}

/**
 * Permanently delete an archived invoice by ID.
 */
export async function deleteArchivedInvoice(invoiceId: string): Promise<void> {
  const queryText = `
    DELETE FROM smartform.sf_invoices_archive WHERE id = $1;
  `;
  await pool.query(queryText, [invoiceId]);
}
