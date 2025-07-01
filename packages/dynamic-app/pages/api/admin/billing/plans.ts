import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient }   from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken }      from 'next-auth/jwt';

const SERVICE_URL      = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY          = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET  = process.env.NEXTAUTH_SECRET!;

/**
 * GET /api/admin/billing/plans
 *  - proxies to Fastify GET /admin/billing/plans
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // auth
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }

  const headers = {
    'x-api-key':    API_KEY,
    Authorization: `Bearer ${token.jwtToken}`,
  };

  try {
    const url = `${SERVICE_URL}/admin/billing/plans`;
    const response = await httpClient.get<{ plans: Array<{ key: string; name: string; price: number }> }>(
      url,
      { headers }
    );
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    console.error('GET /api/admin/billing/plans error:', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: err.message });
  }
}

export default withMiddleware(handler);