import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL     = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY         = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export interface GroupMember {
  group_id: string;
  email: string;
}

/**
 * GET  /api/admin/distribution-groups/[id]/members
 * POST /api/admin/distribution-groups/[id]/members
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

  // 2) GET members
  if (req.method === 'GET') {
    try {
      const url = `${SERVICE_URL}/admin/distribution-groups/${encodeURIComponent(id)}/members`;
      const response = await httpClient.get<GroupMember[]>(url, { headers });
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error(`GET members for group ${id} failed:`, err);
      return res
        .status(err.response?.status || 500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // 3) POST add member
  if (req.method === 'POST') {
    const { email } = req.body as { email?: string };
    if (!email) {
      return res
        .status(400)
        .json({ code: 'BAD_REQUEST', message: 'Email is required to add member' });
    }
    try {
      const url = `${SERVICE_URL}/admin/distribution-groups/${encodeURIComponent(id)}/members`;
      const response = await httpClient.post<GroupMember>(
        url,
        { email },
        { headers }
      );
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error(`POST add member to group ${id} failed:`, err);
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