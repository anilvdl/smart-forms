import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { withMiddleware, httpClient } from '@smartforms/lib-middleware';

// Env vars (make sure these are set in your .env):
const SERVICE_URL = process.env.FORMS_SERVICE_URL!;      // Base URL of your Fastify backend
const API_KEY = process.env.AUTH_SERVICE_KEY!;           // X-API-Key shared secret
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;    // NextAuth secret for JWT verification

/**
 * Proxy handler for fetching audit logs via the Fastify /admin/audit-logs endpoint.
 * Supports query params: limit, offset, eventType, userId.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only GET is allowed
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Verify NextAuth JWT
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token || !token.jwtToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }

  // Prepare headers for backend call
  const headers = {
    'x-api-key': API_KEY,
    Authorization: `Bearer ${token.jwtToken as string}`,
  };

  try {
    // Forward the GET to Fastify, passing through any query params
    const url = `${SERVICE_URL}/admin/audit-logs`;
    const response = await httpClient.get(url, {
      headers,
      params: req.query,
    });

    // Relay status and data to the client
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('[audit-logs proxy] Error:', error);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message || 'Unexpected error' });
  }
}

export default withMiddleware(handler);
