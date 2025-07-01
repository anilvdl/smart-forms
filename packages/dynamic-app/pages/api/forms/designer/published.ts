import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formsServiceUrl = process.env.FORMS_SERVICE_URL;
    const queryString = new URLSearchParams(req.query as any).toString();
    
    const url = `${formsServiceUrl}/forms/designer/published?${queryString}`;
    console.log(`URL: ${url}`);

    const apiKeyHeader = req.headers['x-api-key'];
    const apiKey =
      Array.isArray(apiKeyHeader)
        ? apiKeyHeader.join(',') 
        : apiKeyHeader || '';

      const userInfo = Array.isArray(req.headers['x-user-info'])
          ? req.headers['x-user-info'].join(',')
          : req.headers['x-user-info'] || '';
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-user-info': userInfo,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching published forms:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}