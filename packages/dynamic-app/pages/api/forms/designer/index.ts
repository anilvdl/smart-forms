import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const serviceUrl = process.env.FORMS_SERVICE_URL!;
const apiKey = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n\t[index->handler]->Request received:', req.method);
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });

  if (!token || !token.jwtToken) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  const authHeader = `Bearer ${token.jwtToken as string}`;
  const headers = {
    'x-api-key': apiKey,
    Authorization: authHeader,
  };
  const path = '/forms/designer';
  if (req.method === 'GET') {
    const page = req.query.page || 1;
    console.log('\n\t[index->GET handler]->page:', page, '\n\n');
    const url = `${serviceUrl}${path}?page=${page}`;
    const response = await httpClient.get(url, { headers });
    return res.status(response.status).json(response.data);
  }

  if (req.method === 'POST') {
    const url = `${serviceUrl}${path}`;
    const payload = { title: req.body.title, rawJson: req.body.rawJson };
    const response = await httpClient.post(url, payload, { headers});
    return res.status(response.status).json(response.data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);
