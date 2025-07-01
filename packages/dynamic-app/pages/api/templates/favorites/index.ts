// Handles GET /api/templates/favorites and POST /api/templates/favorites

import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { httpClient } from '@smartforms/lib-middleware';

const FORMS_SERVICE_URL = process.env.FORMS_SERVICE_URL!;
const API_KEY = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Favorites require authentication
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  
  if (!token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const headers = req.headers;

  console.log('Handling API request for /api/templates/favorites. Method:', req.method, 'Headers:', headers['x-user-info']);

  try {
    let response;

    switch (req.method) {
      case 'GET':
        // Get user's favorite templates
        response = await httpClient.get(
          `${FORMS_SERVICE_URL}/templates/favorites`,
          { headers }
        );
        break;

      case 'POST':
        // Add template to favorites
        response = await httpClient.post(
          `${FORMS_SERVICE_URL}/templates/favorites`,
          req.body,
          { headers }
        );
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Favorites error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Favorites operation failed';
    res.status(status).json({ message });
  }
}

export default withMiddleware(handler);