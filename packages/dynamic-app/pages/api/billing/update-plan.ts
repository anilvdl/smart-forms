import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { httpClient } from '@smartforms/lib-middleware';

const BACKEND_SERVICE_URL = process.env.AUTH_SERVICE_URL!;
const API_KEY = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log('request headers in update billing plan:', req.headers);
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  
  if (!token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const backendUrl = `${BACKEND_SERVICE_URL}/admin/billing/update-plan`;
    console.log('Updating billing plan at:', backendUrl);
    const response = await httpClient.post(backendUrl,
      req.body,
      {
        headers: req.headers,
      }
    );

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Billing update error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Failed to update billing plan';
    res.status(status).json({ message });
  }
}

export default withMiddleware(handler);