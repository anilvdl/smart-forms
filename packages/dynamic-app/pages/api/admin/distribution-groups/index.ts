import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;   // or ADMIN_SERVICE_URL
const API_KEY     = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export interface DistributionGroup {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * GET  /api/admin/distribution-groups?orgId=...
 *   - list all groups for org
 * POST /api/admin/distribution-groups
 *   - body: { orgId: string; name: string }
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) auth
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }
  const headers = {
    'x-api-key': API_KEY,
    Authorization: `Bearer ${token.jwtToken}`,
  };

  // 2) List
  if (req.method === 'GET') {
    const { orgId } = req.query as { orgId?: string };
    if (!orgId) {
      return res
        .status(400)
        .json({ code: 'BAD_REQUEST', message: 'orgId query parameter is required' });
    }
    try {
      const url = `${SERVICE_URL}/admin/distribution-groups?orgId=${encodeURIComponent(orgId)}`;
      const response = await httpClient.get<DistributionGroup[]>(url, { headers });
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error('GET /api/admin/distribution-groups error:', err);
      return res
        .status(err.response?.status || 500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // 3) Create
  if (req.method === 'POST') {
    const { orgId, name } = req.body as { orgId?: string; name?: string };
    if (!orgId || !name) {
      return res
        .status(400)
        .json({ code: 'BAD_REQUEST', message: 'orgId and name are required' });
    }
    try {
      const url = `${SERVICE_URL}/admin/distribution-groups`;
      const response = await httpClient.post<DistributionGroup>(
        url,
        { orgId, name },
        { headers }
      );
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error('POST /api/admin/distribution-groups error:', err);
      return res
        .status(err.response?.status || 500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // 4) Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);