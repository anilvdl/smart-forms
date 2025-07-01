import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL     = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY         = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export interface FeatureFlag {
  id: string;
  flagKey: string;
  description: string | null;
  isEnabled: boolean;
  minPlanRequired: 'FREE' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
  updatedAt: string;
}

/**
 * GET  /api/admin/feature-flags
 */
export default withMiddleware(
  async function handler(req: NextApiRequest, res: NextApiResponse) {
  // only support GET for now
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Authenticate
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token || !token.jwtToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }

  const headers = { ...req.headers };

  if (req.method === 'GET') {
    try {
      const url = `${SERVICE_URL}/admin/feature-flags`;
      const response = await httpClient.get<FeatureFlag[]>(url, { headers });
      return res.status(response.status).json(response.data);
    } catch (err: any) {
      console.error('GET /admin/feature-flags failed:', err);
      return res
        .status(err.response?.status || 500)
        .json({ code: 'INTERNAL_ERROR', message: err.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
});