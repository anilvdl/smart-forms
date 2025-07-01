import SparkPost from 'sparkpost';

const client = new SparkPost(process.env.SFORMS_SPARKPOST_API_KEY!);

/**
 * sendEmail
 * Sends one or more transactional emails via SparkPost.
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const { to, subject, html, from } = params;
  await client.transmissions.send({
    content: {
      from: from || `no-reply@${process.env.SFORMS_SPARKPOST_SENDING_DOMAIN}`,
      subject,
      html,
    },
    recipients: Array.isArray(to) ? to.map(email => ({ address: { email } })) : [{ address: { email: to } }],
    options: {
      sandbox: false, // set true for testing in sandbox domain
    },
  });
}