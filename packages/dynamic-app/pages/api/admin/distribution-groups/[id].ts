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
 * PUT    /api/admin/distribution-groups/[id]
 * DELETE /api/admin/distribution-groups/[id]
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

  const { id } = req.query as { id?: string };
  if (!id) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'Group id is required' });
  }

  // 2) Update
  if (req.method === 'PUT') {
    const { name } = req.body as { name?: string };
    if (!name) {
      return res
        .status(400)
        .json({ code: 'BAD_REQUEST', message: 'Name field is required for update' });
    }
    try {
      const url = `${SERVICE_URL}/admin/distribution-groups/${encodeURIComponent(id)}`;
      const response = await httpClient.put<DistributionGroup>(
        url,
        { name },
        { headers }
      );
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error(`PUT /api/admin/distribution-groups/${id} error:`, err);
      return res
        .status(err.response?.status || 500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // 3) Delete
  if (req.method === 'DELETE') {
    try {
      const url = `${SERVICE_URL}/admin/distribution-groups/${encodeURIComponent(id)}`;
      const response = await httpClient.delete<{ success: boolean }>(url, { headers });
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error(`DELETE /api/admin/distribution-groups/${id} error:`, err);
      return res
        .status(err.response?.status || 500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // 4) Method not allowed
  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);