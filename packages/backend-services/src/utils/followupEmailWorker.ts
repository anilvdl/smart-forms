/**
 * Cron‐based worker that processes the `smartform.email_queue` table,
 * sends transactional emails via SparkPost, and updates queue status.
 * Runs daily at 2:00 AM UTC (adjust timezone as needed).
 */

import cron from 'node-cron';
import pool from '@smartforms/lib-db/index';
import { sendEmail } from '../email/sparkpostMailer';

interface EmailQueueRecord {
  id: number;
  to_email: string;
  subject: string;
  body: string;
}

/**
 * processEmailQueue
 *
 * 1. Fetches all queued emails that are due (scheduled_at <= now and not yet sent).
 * 2. For each record:
 *    a. Attempts to send via SparkPost.
 *    b. On success: marks sent_at = now().
 *    c. On failure: marks failed_at = now(), records the error message.
 */
async function processEmailQueue(): Promise<void> {
  const client = await pool.connect();
  try {
    const res = await client.query<EmailQueueRecord>(`
      SELECT id, to_email, subject, body
      FROM smartform.email_queue
      WHERE sent_at IS NULL
        AND scheduled_at <= now()
    `);

    for (const record of res.rows) {
      const { id, to_email, subject, body } = record;
      try {
        // Send the email via SparkPost
        await sendEmail({
          to: to_email,
          subject,
          html: body,
        });

        // Mark as sent
        await client.query(
          `UPDATE smartform.email_queue
           SET sent_at = now()
           WHERE id = $1`,
          [id]
        );
      } catch (err: any) {
        // On failure, record error and timestamp
        await client.query(
          `UPDATE smartform.email_queue
           SET failed_at = now(),
               error = $2
           WHERE id = $1`,
          [id, err.message]
        );
      }
    }
  } finally {
    client.release();
  }
}

/**
 * startFollowupEmailWorker
 *
 * Registers the cron job to run processEmailQueue at 2:00 AM UTC daily.
 */
export function startFollowupEmailWorker(): void {
  // Cron expression: minute hour day-of-month month day-of-week
  cron.schedule(
    '0 2 * * *',
    async () => {
      console.log('[FollowUpWorker] Starting email queue processing at', new Date().toISOString());
      await processEmailQueue();
      console.log('[FollowUpWorker] Finished processing email queue at', new Date().toISOString());
    },
    {
      timezone: 'UTC',
    }
  );
}

// Optionally, start immediately on import:
// startFollowupEmailWorker();