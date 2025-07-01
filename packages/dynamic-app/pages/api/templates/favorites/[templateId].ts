// Handles DELETE /api/templates/favorites/:templateId

import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { httpClient } from '@smartforms/lib-middleware';

const FORMS_SERVICE_URL = process.env.FORMS_SERVICE_URL!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Removing favorites requires authentication
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  
  if (!token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { templateId } = req.query;
  
  if (!templateId || typeof templateId !== 'string') {
    return res.status(400).json({ message: 'Template ID is required' });
  }

  try {
    const headers = req.headers;

    const response = await httpClient.delete(
      `${FORMS_SERVICE_URL}/templates/favorites/${templateId}`,
      { headers }
    );

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Remove favorite error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Failed to remove from favorites';
    res.status(status).json({ message });
  }
}

export default withMiddleware(handler);