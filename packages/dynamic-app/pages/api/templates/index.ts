// Handles GET /api/templates and GET /api/templates?category=...&search=...

import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { httpClient } from '@smartforms/lib-middleware';

const FORMS_SERVICE_URL = process.env.FORMS_SERVICE_URL!;
const API_KEY = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Templates can be viewed publicly, but favorites status requires auth
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    
    const headers = req.headers;

    // Forward query params
    const queryString = req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const url = `${FORMS_SERVICE_URL}/templates${queryString}`;

    const response = await httpClient.get(url, { headers });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Templates fetch error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Failed to fetch templates';
    res.status(status).json({ message });
  }
}

export default withMiddleware(handler);