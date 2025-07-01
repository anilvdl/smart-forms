import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

// Validate required environment variables
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASSWORD'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Missing environment variable: ${varName}`);
  }
});

// Create reusable transporter using Namecheap SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ,
    port: parseInt(process.env.SMTP_PORT || "465"), // Default to 465 if not set
    secure: true, // Default true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    // Connection timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 10000,     // 10 seconds
    
    // TLS options
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production", // Only strict in production
    },
    
    // Only enable logging in development if explicitly requested
    logger: process.env.EMAIL_DEBUG === "true",
    debug: process.env.EMAIL_DEBUG === "true",
  });
};

// Create transporter instance (lazy initialization)
let transporter: nodemailer.Transporter | null = null;

// Get or create transporter
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Manual verification function (call this only when needed)
export async function verifyEmailConfiguration(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    console.info("✅ SMTP server is ready to send emails");
    return true;
  } catch (error) {
    console.error("❌ SMTP verification failed:", error);
    return false;
  }
}

// Email templates
const emailTemplates = {
  verification: (name: string, verificationLink: string) => ({
    subject: "Verify your SmartForms account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6600 0%, #ff9f00 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">SmartForms</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">Welcome to SmartForms, ${name}!</h2>
          <p style="color: #666; font-size: 16px;">
            Thank you for signing up. Please verify your email address to get started.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: linear-gradient(135deg, #ff6600 0%, #ff9f00 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #999; font-size: 14px; word-break: break-all;">
            ${verificationLink}
          </p>
          <p style="color: #999; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} SmartForms. All rights reserved.
        </div>
      </div>
    `,
    text: `
      Welcome to SmartForms, ${name}!
      
      Please verify your email address by clicking the link below:
      ${verificationLink}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, you can safely ignore this email.
    `,
  }),
  
  welcome: (name: string) => ({
    subject: "Welcome to SmartForms!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6600 0%, #ff9f00 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">SmartForms</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">You're all set, ${name}!</h2>
          <p style="color: #666; font-size: 16px;">
            Your email has been verified and your account is ready to use.
          </p>
          <h3 style="color: #333;">What's next?</h3>
          <ul style="color: #666; font-size: 16px; line-height: 1.6;">
            <li>Create your first form in minutes</li>
            <li>Explore our pre-built templates</li>
            <li>Invite team members to collaborate</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: linear-gradient(135deg, #ff6600 0%, #ff9f00 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Need help getting started? Check out our 
            <a href="${process.env.NEXTAUTH_URL}/docs" style="color: #ff6600;">documentation</a> 
            or <a href="${process.env.NEXTAUTH_URL}/contact" style="color: #ff6600;">contact support</a>.
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} SmartForms. All rights reserved.
        </div>
      </div>
    `,
    text: `
      You're all set, ${name}!
      
      Your email has been verified and your account is ready to use.
      
      What's next?
      - Create your first form in minutes
      - Explore our pre-built templates
      - Invite team members to collaborate
      
      Go to Dashboard: ${process.env.NEXTAUTH_URL}/dashboard
      
      Need help? Visit ${process.env.NEXTAUTH_URL}/docs or contact support.
    `,
  }),
};

// Helper function to handle email sending with retry
async function sendEmailWithRetry(
  mailOptions: Mail.Options,
  maxRetries: number = 3
): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transport = getTransporter();
      const info = await transport.sendMail(mailOptions);
      return info;
    } catch (error) {
      lastError = error as Error;
      console.error(`Email send attempt ${attempt} failed:`, error);
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  
  throw lastError;
}

// Email sending functions
export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  verificationToken: string;
}) {
  // Check if we have the required env vars
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("Email service not configured. Skipping verification email.");
    return { success: false, error: "Email service not configured" };
  }
  
  const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${params.verificationToken}`;
  
  const template = emailTemplates.verification(params.name || "User", verificationLink);
  
  const mailOptions: Mail.Options = {
    from: process.env.SMTP_FROM || '"SmartForms" <noreply@smartform.fyi>',
    to: params.to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };
  
  try {
    const info = await sendEmailWithRetry(mailOptions, 2); // Try up to 2 times
    console.info("Verification email sent successfully");
    console.info("Message ID:", info.messageId);
    console.info("Accepted:", info.accepted);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    
    // Return error details for better debugging
    if (error instanceof Error) {
      if (error.message.includes("auth")) {
        return { 
          success: false, 
          error: "SMTP authentication failed. Please check your credentials." 
        };
      } else if (error.message.includes("ECONNREFUSED") || error.message.includes("ETIMEDOUT")) {
        return { 
          success: false, 
          error: "Could not connect to SMTP server. Please check host and port." 
        };
      }
    }
    
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}) {
  // Check if we have the required env vars
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("Email service not configured. Skipping welcome email.");
    return { success: false, error: "Email service not configured" };
  }
  
  const template = emailTemplates.welcome(params.name || "User");
  
  const mailOptions: Mail.Options = {
    from: process.env.SMTP_FROM || '"SmartForms" <noreply@smartform.fyi>',
    to: params.to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };
  
  try {
    const info = await sendEmailWithRetry(mailOptions, 2);
    console.info("Welcome email sent successfully");
    console.info("Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Test email function for debugging (only creates transporter when called)
export async function sendTestEmail(to: string) {
  const template = {
    subject: "SmartForms SMTP Test Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6600 0%, #ff9f00 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">SmartForms</h1>
        </div>
        <div style="padding: 30px; background: #f5f5f5;">
          <h2 style="color: #333;">SMTP Configuration Test</h2>
          <p style="color: #666; font-size: 16px;">
            If you're reading this, your SMTP configuration is working correctly! 🎉
          </p>
          <p style="color: #666; font-size: 16px;">
            <strong>Server Details:</strong><br>
            Host: ${process.env.SMTP_HOST}<br>
            Port: ${process.env.SMTP_PORT}<br>
            User: ${process.env.SMTP_USER}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} SmartForms. All rights reserved.
        </div>
      </div>
    `,
    text: `
      SMTP Configuration Test
      
      If you're reading this, your SMTP configuration is working correctly!
      
      Server Details:
      Host: ${process.env.SMTP_HOST}
      Port: ${process.env.SMTP_PORT}
      User: ${process.env.SMTP_USER}
      Time: ${new Date().toLocaleString()}
    `,
  };
  
  const mailOptions: Mail.Options = {
    from: process.env.SMTP_FROM || '"SmartForms" <noreply@smartform.fyi>',
    to: to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };
  
  try {
    const transport = getTransporter();
    const info = await transport.sendMail(mailOptions);
    console.info("Test email sent successfully");
    console.info("Full response:", info);
    return { success: true, info };
  } catch (error) {
    console.error("Error sending test email:", error);
    throw error;
  }
}

// Export the verification function for manual testing
// export { verifyEmailConfiguration };