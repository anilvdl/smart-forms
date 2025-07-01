import { NextApiRequest, NextApiResponse } from 'next';
import { sendWelcomeEmail } from '@smartforms/backend-services/src/services/emailService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Invalid token' });
  }
  
  try {
    // Call backend to verify the token
    const verifyResponse = await fetch(
      `${process.env.AUTH_SERVICE_URL}/auth/verify-email/${token}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': process.env.AUTH_SERVICE_KEY!,
        },
      }
    );
    
    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      return res.status(verifyResponse.status).json(error);
    }
    
    const result = await verifyResponse.json();
    
    // Send welcome email after successful verification
    if (result.user) {
      try {
        await sendWelcomeEmail({
          to: result.user.email,
          name: result.user.name || 'User',
        });
        console.info('Welcome email sent to:', result.user.email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the verification if email fails
      }
    }
    
    // Redirect to onboarding
    res.redirect('/onboarding?verified=true');
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
}