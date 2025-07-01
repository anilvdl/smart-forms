import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const SERVICE_URL     = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY         = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export interface FeatureFlagUpdate {
  isEnabled?: boolean;
  minPlanRequired?: 'FREE' | 'PRO' | 'ENTERPRISE';
}

/**
 * PUT /api/admin/feature-flags/[key]
 */
export default withMiddleware(
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

      const { key } = req.query as { key?: string };
      if (!key) {
        return res.status(400).json({ code: 'BAD_REQUEST', message: 'Flag key is required' });
      }
      if (req.method === 'PUT') {
        const payload = req.body as FeatureFlagUpdate;
        try {
          const url = `${SERVICE_URL}/admin/feature-flags/${encodeURIComponent(key)}`;
          const response = await httpClient.put(url, payload, { headers });
          return res.status(response.status).json(response.data);
        } catch (err: any) {
          console.error(`PUT /admin/feature-flags/${key} failed:`, err);
          return res
            .status(err.response?.status || 500)
            .json({ code: 'INTERNAL_ERROR', message: err.message });
        }
      }

      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
);