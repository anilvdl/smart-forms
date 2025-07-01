import pool from '../../index';

/**
 * EmailQueueRecord represents one queued email ready to send.
 */
export interface EmailQueueRecord {
  id: number;
  formId: string;
  toEmail: string;
  subject: string;
  body: string;
  scheduledAt: Date;
  sentAt: Date | null;
  failedAt: Date | null;
  error: string | null;
}

/**
 * enqueueEmail
 * Adds a single email to the queue.
 */
export async function enqueueEmail(params: {
  formId: string;
  toEmail: string;
  subject: string;
  body: string;
  scheduledAt: Date;
}): Promise<EmailQueueRecord> {
  const query = `
    INSERT INTO smartform.sf_email_queue
      (form_id, to_email, subject, body, scheduled_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      form_id    AS "formId",
      to_email   AS "toEmail",
      subject,
      body,
      scheduled_at AS "scheduledAt",
      sent_at      AS "sentAt",
      failed_at    AS "failedAt",
      error
  `;
  const values = [
    params.formId,
    params.toEmail,
    params.subject,
    params.body,
    params.scheduledAt,
  ];
  const { rows } = await pool.query<EmailQueueRecord>(query, values);
  return rows[0];
}

/**
 * dequeueDueEmails
 * Retrieves all emails scheduled <= now and not yet sent.
 */
export async function dequeueDueEmails(): Promise<EmailQueueRecord[]> {
  const query = `
    SELECT
      id,
      form_id    AS "formId",
      to_email   AS "toEmail",
      subject,
      body,
      scheduled_at AS "scheduledAt",
      sent_at      AS "sentAt",
      failed_at    AS "failedAt",
      error
    FROM smartform.sf_email_queue
    WHERE sent_at IS NULL
      AND scheduled_at <= now()
    ORDER BY scheduled_at
    FOR UPDATE SKIP LOCKED
  `;
  const { rows } = await pool.query<EmailQueueRecord>(query, []);
  return rows;
}

/**
 * markSent
 * Marks a queued email as successfully sent.
 */
export async function markSent(id: number): Promise<void> {
  const query = `
    UPDATE smartform.sf_email_queue
    SET sent_at = now()
    WHERE id = $1;
  `;
  await pool.query(query, [id]);
}

/**
 * markFailed
 * Marks a queued email as failed, recording the error.
 */
export async function markFailed(id: number, error: string): Promise<void> {
  const query = `
    UPDATE smartform.sf_email_queue
    SET failed_at = now(),
        error = $2
    WHERE id = $1;
  `;
  await pool.query(query, [id, error]);
}