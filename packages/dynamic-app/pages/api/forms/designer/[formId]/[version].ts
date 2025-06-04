import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

const serviceUrl = process.env.FORMS_SERVICE_URL!;
const apiKey = process.env.AUTH_SERVICE_KEY!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n\t[versionid->handler]->Request received:', req.method, req.query);
  const { formId, version } = req.query as { formId: string; version: string };

  if (req.method === 'GET') {
    const url = `${serviceUrl}/forms/designer/${formId}/${version}`;
    const response = await httpClient.get(url, { headers: { 'x-api-key': apiKey } });
    return res.status(response.status).json(response.data);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);
