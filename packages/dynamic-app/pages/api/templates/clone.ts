// Handles POST /api/templates/clone

import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { httpClient } from '@smartforms/lib-middleware';

const FORMS_SERVICE_URL = process.env.FORMS_SERVICE_URL!;
const API_KEY = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Cloning requires authentication
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  
  if (!token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const headers = req.headers;

    const response = await httpClient.post(
      `${FORMS_SERVICE_URL}/templates/clone`,
      req.body,
      { headers }
    );

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Template clone error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Failed to clone template';
    res.status(status).json({ message });
  }
}

export default withMiddleware(handler);