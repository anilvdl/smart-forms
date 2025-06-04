import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { httpClient } from '@smartforms/lib-middleware';
import { TemplateOption } from 'types/types';

const FORMS_SERVICE_URL = process.env.FORMS_SERVICE_URL!;
const FORMS_SERVICE_KEY = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET   = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1) Auth
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  if (!token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const headers = {
    'x-api-key': FORMS_SERVICE_KEY,
    Authorization: `Bearer ${token.jwtToken}`,
  };

  // 2) Build the backend URL
  //    first‐page only: status=WIP, limit=10, offset=0
  const limit  = Number(req.query.limit  as string) || 10;
  const offset = Number(req.query.offset as string) || 0;
  const status = "WIP"; // always fetch “Work-In-Progress”

  const url = `${FORMS_SERVICE_URL}/forms/designer?status=${encodeURIComponent(status)}&limit=${limit}&offset=${offset}`;
  try {
    // 3) Proxy
    const response = await httpClient.get(url, { headers });

    const results : TemplateOption = response.data.map((draft: any) => ({
      formId: draft.formId,
      version: draft.version,
      status: draft.status,
      name: draft.title,
      userName: draft.UserName,
      createdBy: draft.user_id,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      content: draft.rawJson,
      thumbnail: draft.thumbnail,
    }));

    return res.status(response.status).json(results);
  } catch (err: any) {
    console.error('Drafts proxy error:', err);
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || 'Unable to fetch drafts';
    return res.status(status).json({ message });
  }
}

export default withMiddleware(handler);