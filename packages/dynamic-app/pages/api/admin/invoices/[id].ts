import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient }     from '@smartforms/lib-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken }       from 'next-auth/jwt';

const SERVICE_URL     = process.env.ADMIN_SERVICE_URL || process.env.FORMS_SERVICE_URL!;
const API_KEY         = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

/**
 * GET /api/admin/invoices/[id]
 *   - proxies to Fastify GET /admin/invoices/:id
 *   - returns invoice metadata and/or PDF (depending on backend)
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // authenticate
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not logged in' });
  }

  const url = `${SERVICE_URL}/admin/invoices/${encodeURIComponent(id)}`;
  const headers = {
    'x-api-key': API_KEY,
    Authorization: `Bearer ${token.jwtToken}`,
  };

  try {
    // we expect JSON or binary PDF; pass responseType depending on backend behavior
    const response = await httpClient.get(url, {
      headers,
      responseType: 'arraybuffer', // if PDF blob
    });

    const contentType = response.headers['content-type'] || 'application/json';
    res.setHeader('Content-Type', contentType);
    // if PDF, also suggest inline or attachment
    if (contentType === 'application/pdf') {
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
      return res.status(response.status).send(Buffer.from(response.data));
    }

    // otherwise JSON
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    console.error(`GET /admin/invoices/${id} proxy error:`, err);
    return res
      .status(err.response?.status || 500)
      .json({ code: 'INTERNAL_ERROR', message: err.message });
  }
}

export default withMiddleware(handler);