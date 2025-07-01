// This catch-all route handles ALL /api/templates/* requests

// for some odd reason, Next.js does not support catch-all routes with dynamic segments like [...slug] in the API directory.
import { withMiddleware } from '@smartforms/lib-middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { httpClient } from '@smartforms/lib-middleware';

const BACKEND_SERVICE_URL = process.env.FORMS_SERVICE_URL!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Handling API request for /api/templates/[...slug]');
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });
  
  // Get the slug array - it might be undefined for /api/templates base route
  const slug = req.query.slug as string[] | undefined;
  const path = slug ? slug.join('/') : '';
  
  // Require auth for favorites and clone operations
  const requiresAuth = path.includes('favorites') || path === 'clone';
  if (requiresAuth && !token?.jwtToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Forward only the headers that your middleware sets
  // This avoids forwarding problematic headers like 'host', 'content-length', etc.
  const headers: any = {};
  
  // Headers that your middleware sets
  const headersToForward = [
    'x-api-key',
    'x-user-info',
    'authorization',
    'content-type'
  ];
  
  // Copy only the headers we want to forward
  headersToForward.forEach(headerName => {
    const value = req.headers[headerName];
    if (value) {
      headers[headerName] = value;
    }
  });

  // Build the URL - if no path, just use /templates
const baseUrl = `${BACKEND_SERVICE_URL}/templates`;
const url = path ? `${baseUrl}/${path}` : baseUrl;

// Forward query parameters
const queryString = req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
const fullUrl = url + queryString;

  try {
    let response;

    console.log(`Proxying ${req.method} request to: ${fullUrl}`);
    console.log('With headers:', headers);

    switch (req.method) {
      case 'GET':
        response = await httpClient.get(fullUrl, { headers });
        break;
      case 'POST':
        response = await httpClient.post(url, req.body, { headers });
        break;
      case 'DELETE':
        response = await httpClient.delete(url, { headers });
        break;
      case 'PUT':
        response = await httpClient.put(url, req.body, { headers });
        break;
      default:
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Template API error:', error);
    console.error('Request was:', {
      method: req.method,
      url: fullUrl,
      headers: headers,
      body: req.body
    });
    
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || 'Template operation failed';
    res.status(status).json({ message });
  }
}

export default withMiddleware(handler);