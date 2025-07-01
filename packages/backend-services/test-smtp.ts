import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load environment variables - adjust path as needed
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log('🔧 Loading environment variables from .env file');
// Or if .env.local is in backend-services:
// dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSMTP() {
  console.log('🔧 Testing SMTP Configuration...\n');
  
  // Display configuration (without password)
  console.log('Configuration:');
  console.log(`Host: ${process.env.SMTP_HOST || 'mail.privateemail.com'}`);
  console.log(`Port: ${process.env.SMTP_PORT || '465'}`);
  console.log(`User: ${process.env.SMTP_USER || 'Not set'}`);
  console.log(`Password: ${process.env.SMTP_PASSWORD ? '[SET]' : '[NOT SET]'}`);
  console.log(`From: ${process.env.SMTP_FROM || '"SmartForms" <noreply@smartform.fyi>'}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.privateemail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true", // default true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // For development only
    },
    logger: true, // Enable logging
    debug: true, // Enable debug
  });

  try {
    // Verify connection
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    
    // If email address provided as argument, send test email
    const testEmail = process.argv[2];
    if (testEmail && testEmail.includes('@')) {
      console.log(`📧 Sending test email to: ${testEmail}`);
      
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"SmartForms" <noreply@smartform.fyi>',
        to: testEmail,
        subject: 'SmartForms SMTP Test',
        text: 'If you can read this, your SMTP configuration is working!',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ff6600;">SMTP Test Successful! 🎉</h2>
            <p>Your SmartForms email configuration is working correctly.</p>
            <p style="color: #666;">
              Sent from: ${process.env.SMTP_USER}<br>
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        `,
      });
      
      console.log('✅ Test email sent!');
      console.log(`Message ID: ${info.messageId}`);
    } else if (testEmail) {
      console.log('❌ Invalid email address provided');
    } else {
      console.log('💡 Tip: Run with an email address to send a test email:');
      console.log('   npm run test:smtp your-email@example.com');
    }
    
  } catch (error) {
    console.error('\n❌ SMTP test failed!');
    console.error(error);
    
    if (error instanceof Error) {
      console.log('\n🔍 Troubleshooting tips:');
      
      if (error.message.includes('Invalid login')) {
        console.log('- Check your SMTP_USER (should be full email: noreply@smartform.fyi)');
        console.log('- Verify your SMTP_PASSWORD is correct');
        console.log('- Make sure the email account is active in Namecheap');
      } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT')) {
        console.log('- Check if your firewall allows outbound connections on port 465');
        console.log('- Try using port 587 with SMTP_SECURE=false');
        console.log('- Verify the SMTP_HOST is correct (mail.privateemail.com)');
      } else if (error.message.includes('self signed certificate')) {
        console.log('- This is often a temporary issue');
        console.log('- The script has rejectUnauthorized: false for development');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testSMTP().catch(console.error);