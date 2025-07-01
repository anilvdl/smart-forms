import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient }         from '@smartforms/lib-middleware';
import { request } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken }           from 'next-auth/jwt';

const SERVICE_URL     = process.env.FORMS_SERVICE_URL!;   // or ADMIN_SERVICE_URL
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export default withMiddleware(async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // 2) Reconstruct querystring
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(req.query)) {
    if (typeof val === 'string') {
      qs.set(key, val);
    } else if (Array.isArray(val)) {
      val.forEach(v => qs.append(key, v));
    }
  }

// Clone headers to avoid mutating the original req.headers object
const headers = { ...req.headers };

const url = `${SERVICE_URL}/admin/users?${qs.toString()}`;

try {
  const response = await httpClient.get(url, { headers, withCredentials: true });
  
  return res.status(response.status).json(response.data);
} catch (err: any) {
  console.error('Error proxying GET /api/admin/users:', err);
  return res.status(500).json({ code: 'INTERNAL_ERROR', message: err.message });
}
});