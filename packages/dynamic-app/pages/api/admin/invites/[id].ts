import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware, httpClient } from '@smartforms/lib-middleware';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL     = process.env.FORMS_SERVICE_URL!;   // e.g. http://localhost:3002
const API_KEY         = process.env.AUTH_SERVICE_KEY!;    // your X-API-KEY for backend-services
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;     // same secret as [...nextauth].ts

/**
 * DELETE /api/admin/invites/[id]
 * 
 * Cancels (deletes) the pending invite with the given ID.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const authHeader = `Bearer ${token.jwtToken as string}`;

  if (req.method === 'DELETE') {
    const { id } = req.query as { id: string };
    try {
      const response = await httpClient.delete(
        `${SERVICE_URL}/admin/invites/${encodeURIComponent(id)}`,
        {
          headers: {
            'x-api-key': API_KEY,
            Authorization: authHeader,
          },
        }
      );
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error('[/api/admin/invites/[id]] error:', err);
      const status  = err?.response?.status  || 500;
      const message = err?.response?.data?.message || err.message || 'Internal Error';
      return res.status(status).json({ message });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);