import { sendEmail as sendGridEmail, EmailContent as SendGridContent } from './sendGrid';
import { sendEmail as sparkPostEmail } from './sparkpostMailer';

/**
 * Supported mail providers
 */
type MailProvider = 'sendgrid' | 'sparkpost';

/**
 * Determine which mail provider to use via env var
 */
const provider: MailProvider = (process.env.SFORMS_MAIL_PROVIDER as MailProvider) || 'sendgrid';

/**
 * Params for sending an invitation email
 */
interface InviteEmailParams {
  to: string;             // recipient email address
  inviteId: string;       // unique invite record ID
  token: string;          // magic link token
  expiresAt: string;      // ISO timestamp when token expires
  orgName: string;        // organization name for personalization
}

/**
 * sendInviteEmail
 *
 * Builds and sends an invitation email containing a magic-link.
 * Uses the configured provider (SendGrid or SparkPost) under the hood.
 */
export async function sendInviteEmail(params: InviteEmailParams): Promise<void> {
  const { to, inviteId, token, expiresAt, orgName } = params;

  // Base URL for the front-end invitation acceptance page
  const appUrl = process.env.SFORMS_APP_URL || 'https://app.smartforms.com';
  const link = `${appUrl}/invite?token=${token}`;

  const subject = `You're invited to join ${orgName} on SmartForms`;
  const html = `
    <p>Hello,</p>
    <p>You have been invited to join the organization <strong>${orgName}</strong> on SmartForms.</p>
    <p><a href="${link}">Click here to accept the invitation</a></p>
    <p>This link expires on ${new Date(expiresAt).toLocaleString()}.</p>
    <p>If you did not expect this, you can ignore this email.</p>
  `;

  if (provider === 'sparkpost') {
    // SparkPost sendEmail expects { to, subject, html, from? }
    await sparkPostEmail({ to, subject, html });
  } else {
    // SendGrid expects { to: string[], subject, html, from? }
    const content: SendGridContent = {
      to: [to],
      subject,
      html,
      from: process.env.SFORMS_DEFAULT_FROM || `no-reply@smartforms.com`,
    };
    await sendGridEmail(content);
  }
}
