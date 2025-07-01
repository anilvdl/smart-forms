import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SFORMS_SENDGRID_API_KEY || "");

export interface EmailContent {
  to: string[];
  subject: string;
  html: string;
  from?: string; // default to a verified sender, e.g. "no-reply@yourdomain.com"
}

/**
 * Send an email via SendGrid.
 * @param content.to - array of recipient emails
 * @param content.subject - email subject line
 * @param content.html - HTML body
 * @param content.from - optional sender override
 */
export const sendEmail = async (content: EmailContent): Promise<void> => {
  if (!process.env.SFORMS_SENDGRID_API_KEY) {
    throw new Error("Missing SFORMS_SENDGRID_API_KEY env var");
  }

  const msg = {
    to: content.to,
    from: content.from || process.env.SFORMS_DEFAULT_FROM || "no-reply@smartforms.com",
    subject: content.subject,
    html: content.html,
  };

  await sgMail.send(msg);
};
