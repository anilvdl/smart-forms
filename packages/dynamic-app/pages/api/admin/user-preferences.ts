import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient }   from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken }      from 'next-auth/jwt';

const SERVICE_URL      = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY          = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET  = process.env.NEXTAUTH_SECRET!;

/**
 * POST /api/admin/user-preferences
 *   - body: { defaultOrgId: string; timezone?: string; locale?: string; settings?: any }
 *   - proxies to Fastify POST /admin/user-preferences (upsert)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // auth
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken || !token.id) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }

  const { defaultOrgId, timezone, locale, settings } = req.body as {
    defaultOrgId?: string;
    timezone?: string;
    locale?: string;
    settings?: any;
  };
  if (!defaultOrgId) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'defaultOrgId is required' });
  }

  const headers = {
    'x-api-key':    API_KEY,
    Authorization: `Bearer ${token.jwtToken}`,
  };

  try {
    const url = `${SERVICE_URL}/admin/user-preferences`;
    // include userId in body so backend can audit who changed
    const payload = { userId: token.id, defaultOrgId, timezone, locale, settings };

    const response = await httpClient.post<{ success: boolean; preferences: any }>(
      url,
      payload,
      { headers }
    );
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    console.error('POST /api/admin/user-preferences error:', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: err.message });
  }
}

export default withMiddleware(handler);