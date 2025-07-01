// Handles GET /api/templates/categories

import { withMiddleware as wm } from '@smartforms/lib-middleware';
import { NextApiRequest as Req, NextApiResponse as Res } from 'next';
import { httpClient as client } from '@smartforms/lib-middleware';

const BACKEND_URL = process.env.FORMS_SERVICE_URL!;

async function categoriesHandler(req: Req, res: Res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const headers = req.headers;
    const response = await client.get(`${BACKEND_URL}/templates/categories`, { headers });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Categories error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Failed to fetch categories';
    res.status(status).json({ message });
  }
}

export default wm(categoriesHandler);