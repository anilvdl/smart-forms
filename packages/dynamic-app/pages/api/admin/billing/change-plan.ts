import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient }     from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken }       from 'next-auth/jwt';

const SERVICE_URL     = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY         = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export interface ChangePlanPayload {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // auth
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }

  const payload = req.body as ChangePlanPayload;
  if (!payload?.plan) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'plan is required' });
  }

  const headers = {
    'x-api-key': API_KEY,
    Authorization: `Bearer ${token.jwtToken}`,
  };

  try {
    const url = `${SERVICE_URL}/admin/billing/change-plan`;
    const response = await httpClient.post(url, payload, { headers });
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    console.error('POST /billing/change-plan error:', err);
    return res
      .status(err.response?.status || 500)
      .json({ code: 'INTERNAL_ERROR', message: err.message });
  }
}

export default withMiddleware(handler);