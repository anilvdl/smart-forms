import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, httpClient } from '@smartforms/lib-middleware';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL     = process.env.FORMS_SERVICE_URL!;   // e.g. http://localhost:3002
const API_KEY         = process.env.AUTH_SERVICE_KEY!;    // your X-API-KEY for backend-services
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;     // same secret as [...nextauth].ts

/**
 * Proxy for /admin/invites endpoints on backend-services.
 *
 * GET  → list invites for an organization.
 * POST → send a new invite (email + role).
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Authenticate via NextAuth JWT
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const authHeader = `Bearer ${token.jwtToken as string}`;

  // 2) Common headers for backend-services
  const headers = {
    'x-api-key': API_KEY,
    Authorization: authHeader,
  };

  // 3) Route dispatch
  const url = `${SERVICE_URL}/admin/invites`;

  try {
    if (req.method === 'GET') {
      // Expect: /api/admin/invites?orgId=<uuid>
      const { orgId } = req.query;
      const response = await httpClient.get(url, {
        headers,
        params: { orgId },
      });
      return res.status(response.status).json(response.data);
    }

    if (req.method === 'POST') {
      // Body should contain: { email: string; role: "ADMIN"|"DEVELOPER"|"VIEWER"; message?: string }
      const { email, role, message } = req.body as {
        email: string;
        role: 'ADMIN' | 'DEVELOPER' | 'VIEWER';
        message?: string;
      };

      const payload: Record<string, any> = {
        invitedEmail: email,
        roleRequested: role,
      };
      if (message) payload.message = message;

      const response = await httpClient.post(url, payload, { headers });
      return res.status(response.status).json(response.data);
    }

    // 4) Unsupported methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error('[/api/admin/invites] error:', error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || error.message || 'Internal Error';
    return res.status(status).json({ message });
  }
}

export default withMiddleware(handler);