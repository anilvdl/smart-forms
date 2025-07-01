import { QueryResult } from "pg";
import pool from "../../index";
import { v4 as uuidv4 } from "uuid";

export interface Invoice {
  id: string;
  org_id: string;
  provider: string;
  provider_invoice_id: string;
  original_amount: number;
  original_currency: string;
  converted_amount: number;
  converted_currency: string;
  exchange_rate_to_preferred: number;
  status: "PAID" | "OPEN" | "PAST_DUE" | "VOIDED";
  invoice_date: string;
  due_date: string | null;
  pdf_blob: Buffer | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new invoice record.
 */
export async function createInvoice(args: {
  id?: string;
  orgId: string;
  provider: string;
  providerInvoiceId: string;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRateToPreferred: number;
  status: "PAID" | "OPEN" | "PAST_DUE" | "VOIDED";
  invoiceDate: string;  // ISO timestamp
  dueDate?: string | null;
  pdfBlob?: Buffer | null;
}): Promise<Invoice> {
  const {
    id,
    orgId,
    provider,
    providerInvoiceId,
    originalAmount,
    originalCurrency,
    convertedAmount,
    convertedCurrency,
    exchangeRateToPreferred,
    status,
    invoiceDate,
    dueDate = null,
    pdfBlob = null,
  } = args;
  const invoiceId = id || uuidv4();
  const now = new Date().toISOString();

  const queryText = `
    INSERT INTO smartform.sf_invoices (
      id, org_id, provider, provider_invoice_id,
      original_amount, original_currency,
      converted_amount, converted_currency,
      exchange_rate_to_preferred, status,
      invoice_date, due_date, pdf_blob,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6,
      $7, $8,
      $9, $10,
      $11, $12, $13,
      $14, $15
    )
    RETURNING
      id, org_id, provider, provider_invoice_id,
      original_amount, original_currency,
      converted_amount, converted_currency,
      exchange_rate_to_preferred, status,
      invoice_date, due_date, pdf_blob,
      created_at, updated_at;
  `;

  const values = [
    invoiceId,
    orgId,
    provider,
    providerInvoiceId,
    originalAmount,
    originalCurrency,
    convertedAmount,
    convertedCurrency,
    exchangeRateToPreferred,
    status,
    invoiceDate,
    dueDate,
    pdfBlob,
    now,
    now,
  ];

  const result: QueryResult<Invoice> = await pool.query(queryText, values);
  return result.rows[0];
}

/**
 * Fetch an invoice by its ID.
 */
export async function getInvoiceById(
  invoiceId: string
): Promise<Invoice | null> {
  const queryText = `
    SELECT
      id, org_id, provider, provider_invoice_id,
      original_amount, original_currency,
      converted_amount, converted_currency,
      exchange_rate_to_preferred, status,
      invoice_date, due_date, pdf_blob,
      created_at, updated_at
    FROM smartform.sf_invoices
    WHERE id = $1
    LIMIT 1;
  `;
  const result: QueryResult<Invoice> = await pool.query(queryText, [invoiceId]);
  return result.rows[0] || null;
}

/**
 * List invoices for an organization, with optional status filter and pagination.
 */
export async function listInvoicesForOrg(
  orgId: string,
  args?: {
    limit?: number;
    offset?: number;
    status?: "PAID" | "OPEN" | "PAST_DUE" | "VOIDED";
  }
): Promise<Invoice[]> {
  const { limit = 50, offset = 0, status } = args || {};
  const conditions: string[] = ["org_id = $1"];
  const values: any[] = [orgId];
  let idx = 2;

  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const queryText = `
    SELECT
      id, org_id, provider, provider_invoice_id,
      original_amount, original_currency,
      converted_amount, converted_currency,
      exchange_rate_to_preferred, status,
      invoice_date, due_date, pdf_blob,
      created_at, updated_at
    FROM smartform.sf_invoices
    ${whereClause}
    ORDER BY invoice_date DESC
    LIMIT $${idx++} OFFSET $${idx++};
  `;
  values.push(limit, offset);

  const result: QueryResult<Invoice> = await pool.query(queryText, values);
  return result.rows;
}

/**
 * Update invoice status or other fields (only provided ones).
 */
export async function updateInvoice(args: {
  id: string;
  status?: "PAID" | "OPEN" | "PAST_DUE" | "VOIDED";
  dueDate?: string | null;
  pdfBlob?: Buffer | null;
}): Promise<Invoice | null> {
  const { id, status, dueDate, pdfBlob } = args;
  const setClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (status !== undefined) {
    setClauses.push(`status = $${idx++}`);
    values.push(status);
  }
  if (dueDate !== undefined) {
    setClauses.push(`due_date = $${idx++}`);
    values.push(dueDate);
  }
  if (pdfBlob !== undefined) {
    setClauses.push(`pdf_blob = $${idx++}`);
    values.push(pdfBlob);
  }

  // Always update updated_at
  setClauses.push(`updated_at = $${idx++}`);
  values.push(new Date().toISOString());

  if (setClauses.length === 1 && setClauses[0].startsWith("updated_at")) {
    return getInvoiceById(id);
  }

  values.push(id);

  const queryText = `
    UPDATE smartform.sf_invoices
    SET ${setClauses.join(", ")}
    WHERE id = $${idx}
    RETURNING
      id, org_id, provider, provider_invoice_id,
      original_amount, original_currency,
      converted_amount, converted_currency,
      exchange_rate_to_preferred, status,
      invoice_date, due_date, pdf_blob,
      created_at, updated_at;
  `;
  const result: QueryResult<Invoice> = await pool.query(queryText, values);
  return result.rows[0] || null;
}

/**
 * Archive an invoice (move it into sf_invoices_archive).
 */
export async function archiveInvoice(invoiceId: string): Promise<void> {
  // 1) Fetch the invoice row
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) return;

  // 2) Insert it into sf_invoices_archive
  await pool.query(
    `
    INSERT INTO smartform.sf_invoices_archive (
      id,
      org_id,
      provider,
      provider_invoice_id,
      original_amount,
      original_currency,
      converted_amount,
      converted_currency,
      exchange_rate_to_preferred,
      status,
      invoice_date,
      due_date,
      pdf_blob,
      archived_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW()
    );
  `,
    [
      invoice.id,
      invoice.org_id,
      invoice.provider,
      invoice.provider_invoice_id,
      invoice.original_amount,
      invoice.original_currency,
      invoice.converted_amount,
      invoice.converted_currency,
      invoice.exchange_rate_to_preferred,
      invoice.status,
      invoice.invoice_date,
      invoice.due_date,
      invoice.pdf_blob,
    ]
  );

  // 3) Delete from the live table
  await pool.query(`DELETE FROM smartform.sf_invoices WHERE id = $1;`, [invoiceId]);
}
