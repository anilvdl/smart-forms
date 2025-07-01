import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL      = process.env.FORMS_SERVICE_URL!;   // or ADMIN_SERVICE_URL
const API_KEY          = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET  = process.env.NEXTAUTH_SECRET!;

/**
 * Raw entry from backend GET /admin/user-orgs
 */
interface RawUserOrgEntry {
  orgId: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  isDefault: boolean;
}

/**
 * Shape returned by this Next.js API:
 * {
 *   defaultOrgId?: string;
 *   orgs: Array<{ orgId, role }>;
 * }
 */
export interface UserOrgsResponse {
  defaultOrgId?: string;
  orgs: Array<{
    orgId: string;
    role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  }>;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Authenticate via NextAuth JWT
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token || !token.jwtToken) {
    return res
      .status(401)
      .json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }

  const authHeader = `Bearer ${token.jwtToken as string}`;
  const headers = {
    'x-api-key': API_KEY,
    Authorization: authHeader,
  };

  // 2) GET /api/admin/user-orgs → fetch list plus default flag
  if (req.method === 'GET') {
    try {
      const url = `${SERVICE_URL}/admin/user-orgs`;
      const response = await httpClient.get<RawUserOrgEntry[]>(url, { headers });
      const entries = response.data;

      // Extract defaultOrgId and strip it from per-entry
      const defaultEntry = entries.find(e => e.isDefault);
      const defaultOrgId = defaultEntry?.orgId;

      const orgs = entries.map(e => ({
        orgId: e.orgId,
        role: e.role,
      }));

      const result: UserOrgsResponse = { defaultOrgId, orgs };
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('Error proxying GET /api/admin/user-orgs:', err);
      return res
        .status(500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // 3) POST /api/admin/user-orgs → set default org
  if (req.method === 'POST') {
    const { orgId } = req.body as { orgId?: string };
    if (!orgId) {
      return res
        .status(400)
        .json({ code: 'BAD_REQUEST', message: 'orgId is required' });
    }

    try {
      const url = `${SERVICE_URL}/admin/user-preferences`;
      // upsert defaultOrgId (backend should handle clearing previous default)
      const response = await httpClient.post(
        url,
        { userId: token.id, defaultOrgId: orgId },
        { headers }
      );
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error('Error proxying POST /api/admin/user-orgs:', err);
      return res
        .status(500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  // 4) Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);