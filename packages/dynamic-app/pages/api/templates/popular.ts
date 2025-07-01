// Handles GET /api/templates/popular

import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { httpClient } from '@smartforms/lib-middleware';

const FORMS_SERVICE_URL = process.env.FORMS_SERVICE_URL!;
const API_KEY = process.env.AUTH_SERVICE_KEY!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const headers = { 'x-api-key': API_KEY };
    
    // Forward query params (like limit)
    const queryString = req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const url = `${FORMS_SERVICE_URL}/templates/popular${queryString}`;

    const response = await httpClient.get(url, { headers });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Popular templates error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Failed to fetch popular templates';
    res.status(status).json({ message });
  }
}

export default withMiddleware(handler);