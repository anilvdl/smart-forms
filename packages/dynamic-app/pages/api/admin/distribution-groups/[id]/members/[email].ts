import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL     = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY         = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

/**
 * DELETE /api/admin/distribution-groups/[id]/members/[email]
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

  const { id, email } = req.query as { id?: string; email?: string };
  if (!id || !email) {
    return res
      .status(400)
      .json({ code: 'BAD_REQUEST', message: 'Group id and email are required' });
  }

  if (req.method === 'DELETE') {
    try {
      const url = `${SERVICE_URL}/admin/distribution-groups/${encodeURIComponent(id)}/members/${encodeURIComponent(email)}`;
      const response = await httpClient.delete<{ success: boolean }>(url, { headers });
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error(`DELETE member ${email} from group ${id} failed:`, err);
      return res
        .status(err.response?.status || 500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);