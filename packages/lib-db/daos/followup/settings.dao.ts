import pool from '../../index';

/**
 * FollowupSettings holds per-form email reminder configuration.
 */
export interface FollowupSettings {
  formId: string;
  enabled: boolean;
  distributionGroupId: string | null;
  adHocEmails: string[] | null;
  intervalDays: number | null;
  skipWeekends: boolean;
  sendFinalReminder: boolean;
  templateSubject: string | null;
  templateBody: string | null;
  updatedAt: Date;
}

/**
 * getSettings
 * Fetches follow-up settings for a given form.
 */
export async function getSettings(
  formId: string
): Promise<FollowupSettings | null> {
  const query = `
    SELECT
      form_id    AS "formId",
      enabled,
      distribution_group_id  AS "distributionGroupId",
      ad_hoc_emails          AS "adHocEmails",
      interval_days          AS "intervalDays",
      skip_weekends          AS "skipWeekends",
      send_final_reminder    AS "sendFinalReminder",
      template_subject       AS "templateSubject",
      template_body          AS "templateBody",
      updated_at             AS "updatedAt"
    FROM smartform.sf_followup_settings
    WHERE form_id = $1
    LIMIT 1;
  `;
  const { rows } = await pool.query<FollowupSettings>(query, [formId]);
  return rows[0] || null;
}

/**
 * upsertSettings
 * Inserts or updates follow-up settings for a form.
 */
export async function upsertSettings(
  settings: Omit<FollowupSettings, 'updatedAt'>
): Promise<FollowupSettings> {
  const query = `
    INSERT INTO smartform.sf_followup_settings (
      form_id,
      enabled,
      distribution_group_id,
      ad_hoc_emails,
      interval_days,
      skip_weekends,
      send_final_reminder,
      template_subject,
      template_body
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (form_id)
      DO UPDATE
        SET enabled = $2,
            distribution_group_id = $3,
            ad_hoc_emails = $4,
            interval_days = $5,
            skip_weekends = $6,
            send_final_reminder = $7,
            template_subject = $8,
            template_body = $9,
            updated_at = NOW()
    RETURNING
      form_id    AS "formId",
      enabled,
      distribution_group_id  AS "distributionGroupId",
      ad_hoc_emails          AS "adHocEmails",
      interval_days          AS "intervalDays",
      skip_weekends          AS "skipWeekends",
      send_final_reminder    AS "sendFinalReminder",
      template_subject       AS "templateSubject",
      template_body          AS "templateBody",
      updated_at             AS "updatedAt";
  `;
  const values = [
    settings.formId,
    settings.enabled,
    settings.distributionGroupId,
    settings.adHocEmails,
    settings.intervalDays,
    settings.skipWeekends,
    settings.sendFinalReminder,
    settings.templateSubject,
    settings.templateBody,
  ];
  const { rows } = await pool.query<FollowupSettings>(query, values);
  return rows[0];
}

/**
 * deleteSettings
 * Disables follow-ups by removing settings entry.
 */
export async function deleteSettings(formId: string): Promise<void> {
  const query = `
    DELETE FROM smartform.sf_followup_settings
    WHERE form_id = $1;
  `;
  await pool.query(query, [formId]);
}