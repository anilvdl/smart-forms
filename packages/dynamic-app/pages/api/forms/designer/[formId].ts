import { withMiddleware } from '@smartforms/lib-middleware';
import { httpClient } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const serviceUrl = process.env.FORMS_SERVICE_URL!;
const apiKey = process.env.AUTH_SERVICE_KEY!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('\n\t[formid->handler]->Request received:', req.method, req.query);
  const { formId } = req.query as { formId: string };

  const token = await getToken({ req, secret: NEXTAUTH_SECRET});

  if (!token || !token.jwtToken) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  
  console.log('\n\t[formid->handler]->token:', token.jwtToken , '\n\n');

  const authHeader = `Bearer ${token.jwtToken as string}`;
  console.log('\n\t[formid->handler]->authHeader:', authHeader , '\n\n');
  const headers = {
    'x-api-key': apiKey,
    Authorization: authHeader,
  };

  const path = `/forms/designer/${formId}`;

  if (req.method === 'PUT') {
    const url = `${serviceUrl}${path}`;
    let response;
    try {
      console.log("\n\t[formid->handler]", 
        url,
        headers,
        '\n'
      );
      
       response = await httpClient.put( url, { rawJson: req.body.rawJson }, { headers } );
    } catch (error) {
      console.error('Error occurred while making PUT request:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (!response) {
      return res.status(500).json({ message: 'No response from the service' });
    }
    return res.status(response.status).json(response.data);
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withMiddleware(handler);
